// js/potentiale.js - Potentiale/Impulse Display Options
// Extracted from landing.js for modularity

// IMPULSE DISPLAY OPTIONS (3 Options)
// ========================================
var currentImpulseOption = 0;
var impulseOptions = ['Option 1: Kartenansicht', 'Option 2: Kanban-Board', 'Option 3: Kompakte Tabelle'];

var impulseData = [
    { id: 'kb-risiko', title: 'Risikolebensversicherung anbieten', desc: 'Hypothek \u20AC285.000 bei Sparkasse ohne Restschuldversicherung', kategorie: 'whitespots', prioritaet: 'high', source: 'Open Finance', abschlussvolumen: 6000, provision: 540,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Open Finance - Kreditdaten (Sparkasse)' },
        { label: 'Erkannte Situation', value: 'Baufinanzierung \u20AC285.000 ohne Absicherung' },
        { label: 'Familiensituation', value: 'Verheiratet, 2 Kinder (8 + 5 Jahre)' },
        { label: 'Empfehlung', value: 'Risikoleben \u20AC300.000, Laufzeit 20 Jahre, ca. \u20AC25/Monat' }
      ]
    },
    { id: 'kb-fonds', title: 'Fondspolice anbieten', desc: 'Depot \u20AC85.000 bei DWS, Sparrate \u20AC800/Mon. ohne Steueroptimierung', kategorie: 'whitespots', prioritaet: 'high', source: 'Open Finance', abschlussvolumen: 85000, provision: 3400,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Open Finance - Investmentdaten (DWS)' },
        { label: 'Erkannte Situation', value: 'Hohe Sparrate \u20AC800/Mon., Depot \u20AC85.000 ohne Steueroptimierung' },
        { label: 'Empfehlung', value: 'Fondsgebundene Rentenversicherung mit Steuervorteil + Todesfallschutz' }
      ]
    },
    { id: 'kb-kfz', title: 'Kfz-Wechsel anbieten', desc: 'Kfz bei Allianz l\u00E4uft aus, Ersparnis ca. \u20AC180/Jahr m\u00F6glich', kategorie: 'anpassung', prioritaet: 'high', source: 'Open Finance', abschlussvolumen: 540, provision: 95,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-3-5H7L4 10l-2.5 1.1C.7 11.3 0 12.1 0 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Open Finance - Versicherungsdaten (Allianz)' },
        { label: 'Erkannte Situation', value: 'Kfz-Vertrag endet 30.11.2025, Wechselm\u00F6glichkeit' },
        { label: 'Aktueller Tarif', value: 'Allianz Premium, SF12, \u20AC720/Jahr' },
        { label: 'Empfehlung', value: 'Vergleichsangebot mit ca. \u20AC180/Jahr Ersparnis' }
      ],
      vergleich: {
        title: 'Vergleich: Bestehend vs. Angebot',
        cols: ['Merkmal', 'Allianz (aktuell)', 'Unser Angebot'],
        rows: [
          ['Jahrespr\u00E4mie', '\u20AC720', { text: '\u20AC540', highlight: true }],
          ['Vollkasko SB', '\u20AC300', '\u20AC300'],
          ['GAP-Deckung', 'Ja', 'Ja'],
          ['Mardersch\u00E4den', 'Ja', 'Ja'],
          ['Auslandsschutz', 'EU', { text: 'Weltweit', highlight: true }]
        ]
      }
    },
    { id: 'kb-bu', title: 'BU-Absicherung pr\u00FCfen', desc: 'Einkommensst\u00E4rke vs. BU-Rente pr\u00FCfen, ggf. erh\u00F6hen', kategorie: 'anpassung', prioritaet: 'medium', source: 'Bestandsdaten', abschlussvolumen: 1800, provision: 2160,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'PSD2 (Gehaltsdaten) + Eigener Vertrag (BU)' },
        { label: 'Netto-Gehalt', value: '\u20AC3.680/Monat (aus Zahlungsverkehrsdaten)' },
        { label: 'Aktuelle BU-Absicherung', value: '\u20AC1.500/Monat (eigener Vertrag)' },
        { label: 'Deckungsl\u00FCcke', value: '\u20AC2.180/Monat (nur 41% abgesichert)', warn: true }
      ],
      deckungslueckeBar: { pct: 41, label: '41% abgesichert' },
      empfehlung: 'Empfohlene Aufstockung: \u20AC2.200/Monat zus\u00E4tzlich. Gesch\u00E4tzte Mehrpr\u00E4mie: ca. \u20AC120\u2013150/Monat.'
    },
    { id: 'kb-rs', title: 'Rechtsschutz Cross-Sell', desc: 'Kein Rechtsschutz vorhanden, Familie mit Immobilienbesitz', kategorie: 'whitespots', prioritaet: 'medium', source: 'Bestandsdaten', abschlussvolumen: 300, provision: 45,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Bestandsdaten' },
        { label: 'Erkannte Situation', value: 'Kein Rechtsschutz, aber Immobilie + Familie' },
        { label: 'Empfehlung', value: 'Privat- und Immobilienrechtsschutz, ca. \u20AC25/Monat' }
      ]
    },
    { id: 'kb-tier', title: 'Tierhalter-Haftpflicht pr\u00FCfen', desc: 'Hinweise auf Tierhaltung aus Kontoumsätzen (Fressnapf, Tierarzt)', kategorie: 'whitespots', prioritaet: 'low', source: 'PSD2', abschlussvolumen: 60, provision: 9,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M10 5.172C10 3.782 8.884 2.5 7.5 2.5S5 3.782 5 5.172c0 1.39 2.5 4.328 2.5 4.328S10 6.562 10 5.172z"/><path d="M19 5.172C19 3.782 17.884 2.5 16.5 2.5S14 3.782 14 5.172c0 1.39 2.5 4.328 2.5 4.328S19 6.562 19 5.172z"/><path d="M12 22c-4-3-8-6.58-8-10.5a4 4 0 018 0 4 4 0 018 0c0 3.92-4 7.5-8 10.5z"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Open Finance - Kontoumsätze (Sparkasse)' },
        { label: 'Erkannte Transaktionen', value: 'Fressnapf (\u20AC45/Mon.), Tierarztpraxis Dr. M\u00FCller (\u20AC120, Sep. 2025)' },
        { label: 'Erkannte Situation', value: 'Regelm\u00E4\u00DFige Tierhaltungsausgaben, kein Tierhalterhaftpflicht-Vertrag bekannt' },
        { label: 'Empfehlung', value: 'Tierhalterhaftpflicht (Hund) ab ca. \u20AC5/Monat' }
      ]
    },
    { id: 'kb-hausrat', title: 'Hausratversicherung pr\u00FCfen', desc: 'Wohnfl\u00E4che und Wertgegenst\u00E4nde ggf. unterversichert', kategorie: 'anpassung', prioritaet: 'low', source: 'Bestandsdaten', abschlussvolumen: 120, provision: 18,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Bestandsdaten' },
        { label: 'Erkannte Situation', value: 'Letzte Anpassung vor 5 Jahren, Wohnfl\u00E4che 120m\u00B2' },
        { label: 'Empfehlung', value: 'Deckungssumme pr\u00FCfen, ggf. Fahrraddiebstahl erg\u00E4nzen' }
      ]
    },
    { id: 'kb-umschuldung', title: 'Umschuldung Konsumentenkredit', desc: 'Targobank Kredit 9,0% p.a. \u2013 Umschuldung zu 4,9% m\u00F6glich', kategorie: 'anpassung', prioritaet: 'low', source: 'Open Finance', abschlussvolumen: 12500, provision: 375,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Open Finance - Kreditdaten (Targobank)' },
        { label: 'Aktueller Kredit', value: 'Targobank Konsumentenkredit, \u20AC12.500 Restschuld' },
        { label: 'Aktueller Zinssatz', value: '9,0% p.a. (\u00FCberdurchschnittlich hoch)', warn: true },
        { label: 'Monatliche Rate', value: '\u20AC405/Monat, noch 36 Monate Laufzeit' },
        { label: 'Bonit\u00E4t', value: 'Sehr gut (regelm\u00E4\u00DFiges Gehalt, keine Zahlungsausf\u00E4lle)' }
      ],
      vergleich: {
        title: 'Vergleich: Bestehend vs. Umschuldungsangebot',
        cols: ['Merkmal', 'Targobank (aktuell)', 'Santander (Angebot)'],
        rows: [
          ['Restschuld', '\u20AC12.500', '\u20AC12.500'],
          ['Zinssatz p.a.', { text: '9,0%', warn: true }, { text: '4,9%', highlight: true }],
          ['Monatliche Rate', '\u20AC405', { text: '\u20AC384', highlight: true }],
          ['Restlaufzeit', '36 Monate', '36 Monate'],
          ['Gesamtkosten', '\u20AC14.580', { text: '\u20AC13.824', highlight: true }],
          ['Ersparnis', '\u2013', { text: '\u20AC756', highlight: true, bold: true }]
        ]
      },
      empfehlung: 'Santander BestCredit \u2013 ERGO Kooperationspartner mit Sonderkonditionen: 4,9% p.a., Ersparnis \u20AC756, kostenlose Sondertilgungen m\u00F6glich.'
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
                // Herleitung rows
                var hRows = i.herleitung.map(function(h) {
                    var valStyle = h.warn ? ' style="color:#dc2626;"' : '';
                    var val = h.value;
                    // Inject logos for company names in parentheses e.g. "(Allianz)"
                    if (typeof versichererLogoImg === 'function') {
                        val = val.replace(/\(([^)]+)\)/g, function(m, name) {
                            var logo = versichererLogoImg(name, 14);
                            return logo ? '(' + logo + ' ' + name + ')' : m;
                        });
                        // Also inject logo at start for lines like "Allianz Premium, ..."
                        for (var key in versichererLogoDomains) {
                            if (val.indexOf(key) === 0) {
                                val = versichererLogoImg(key, 14) + ' ' + val;
                                break;
                            }
                        }
                    }
                    return '<div class="kanban-detail-row"><span class="kanban-detail-label">' + h.label + '</span><span class="kanban-detail-value"' + valStyle + '>' + val + '</span></div>';
                }).join('');

                // Deckungslücke-Bar
                var barHtml = '';
                if (i.deckungslueckeBar) {
                    barHtml = '<div class="deckungsluecke-bar" style="margin:8px 0;"><div class="deckungsluecke-bar-filled" style="width:' + i.deckungslueckeBar.pct + '%;"></div><span class="deckungsluecke-bar-label">' + i.deckungslueckeBar.label + '</span></div>';
                }

                // Vergleichstabelle
                var vergleichHtml = '';
                if (i.vergleich) {
                    var vRows = i.vergleich.rows.map(function(row) {
                        return '<tr>' + row.map(function(cell, idx) {
                            if (typeof cell === 'object') {
                                var st = cell.highlight ? ' style="color:#16a34a;"' : (cell.warn ? ' style="color:#dc2626;"' : '');
                                return '<td' + st + '><strong>' + cell.text + '</strong></td>';
                            }
                            return idx === 0 ? '<td>' + cell + '</td>' : '<td>' + cell + '</td>';
                        }).join('') + '</tr>';
                    }).join('');
                    vergleichHtml = '<div style="margin-top:10px;"><div class="kanban-detail-title">' + i.vergleich.title + '</div>' +
                        '<table class="comparison-table" style="margin-top:6px;font-size:14px;"><thead><tr>' +
                        i.vergleich.cols.map(function(c) {
                            var col = c;
                            if (typeof versichererLogoImg === 'function') {
                                for (var key in versichererLogoDomains) {
                                    if (c.indexOf(key) !== -1) {
                                        col = versichererLogoImg(key, 14) + ' ' + c;
                                        break;
                                    }
                                }
                            }
                            return '<th>' + col + '</th>';
                        }).join('') +
                        '</tr></thead><tbody>' + vRows + '</tbody></table></div>';
                }

                // Empfehlung
                var empfHtml = '';
                if (i.empfehlung) {
                    empfHtml = '<div style="margin-top:8px;"><div class="kanban-detail-title">Empfehlung</div><p style="margin:4px 0 0;font-size:14px;color:#334155;">' + i.empfehlung + '</p></div>';
                }

                herleitungHtml = '<div class="kanban-detail" id="kanban-detail-' + i.id + '" style="display:none;">' +
                    '<div class="kanban-detail-title">Herleitung</div>' +
                    hRows + barHtml + vergleichHtml + empfHtml +
                    '<div class="kanban-detail-actions">' +
                    '<button class="action-btn primary small icon-only" onclick="event.stopPropagation()" title="Angebot erstellen">' + actionIcons.angebot + '</button>' +
                    '<button class="action-btn secondary small icon-only" onclick="event.stopPropagation()" title="Termin vereinbaren">' + actionIcons.termin + '</button></div></div>';
            }
            var ofClass = (i.source === 'Open Finance') ? ' open-finance-only' : '';
            return '<div class="impulse-kanban-card' + ofClass + '" onclick="toggleKanbanDetail(\'' + i.id + '\')">' +
                '<div class="impulse-kanban-card-header">' +
                '<span class="impulse-kanban-card-icon">' + i.icon + '</span>' +
                '<div class="impulse-kanban-card-title">' + i.title + '</div>' +
                '<span class="impulse-kanban-card-expand" id="kanban-arrow-' + i.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg></span></div>' +
                '<div class="impulse-kanban-card-desc">' + i.desc + '</div>' +
                '<div class="impulse-kanban-card-badges">' +
                (i.abschlussvolumen ? '<span class="impuls-volumen-badge small"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> ' + Number(i.abschlussvolumen).toLocaleString('de-DE') + ' \u20AC</span>' : '') +
                (i.provision ? '<span class="impuls-provision-badge small"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> ' + Number(i.provision).toLocaleString('de-DE') + ' \u20AC</span>' : '') +
                '</div>' +
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

        // Detail-Zeile mit Herleitung + Vergleich + Empfehlung + Actions
        var detailHtml = '';
        if (i.herleitung && i.herleitung.length > 0) {
            // Herleitung
            var herleitungHtml = '<div class="impulse-table-herleitung">' +
                '<div class="kanban-detail-title">Herleitung</div>' +
                i.herleitung.map(function(h) {
                    var valStyle = h.warn ? ' style="color:#dc2626;"' : '';
                    return '<div class="kanban-detail-row"><span class="kanban-detail-label">' + h.label + '</span><span class="kanban-detail-value"' + valStyle + '>' + h.value + '</span></div>';
                }).join('') +
                '</div>';

            // Deckungslücke-Bar (z.B. BU)
            var barHtml = '';
            if (i.deckungslueckeBar) {
                barHtml = '<div class="deckungsluecke-bar" style="margin:12px 0;"><div class="deckungsluecke-bar-filled" style="width:' + i.deckungslueckeBar.pct + '%;"></div><span class="deckungsluecke-bar-label">' + i.deckungslueckeBar.label + '</span></div>';
            }

            // Vergleichstabelle (z.B. KFZ, Umschuldung)
            var vergleichHtml = '';
            if (i.vergleich) {
                var vRows = i.vergleich.rows.map(function(row) {
                    var cells = row.map(function(cell, idx) {
                        if (idx === 0) return '<td>' + (typeof cell === 'object' && cell.bold ? '<strong>' + cell.text + '</strong>' : cell) + '</td>';
                        if (typeof cell === 'object') {
                            var style = cell.highlight ? ' style="color:#16a34a;"' : (cell.warn ? ' style="color:#dc2626;"' : '');
                            return '<td' + style + '>' + (cell.bold ? '<strong>' + cell.text + '</strong>' : '<strong>' + cell.text + '</strong>') + '</td>';
                        }
                        return '<td>' + cell + '</td>';
                    }).join('');
                    return '<tr>' + cells + '</tr>';
                }).join('');
                vergleichHtml = '<div style="margin-top:16px;"><div class="kanban-detail-title">' + i.vergleich.title + '</div>' +
                    '<table class="comparison-table" style="margin-top:8px;">' +
                    '<thead><tr>' + i.vergleich.cols.map(function(c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead>' +
                    '<tbody>' + vRows + '</tbody></table></div>';
            }

            // Empfehlung
            var empfehlungHtml = '';
            if (i.empfehlung) {
                empfehlungHtml = '<div style="margin-top:12px;"><div class="kanban-detail-title">Empfehlung</div><p style="margin:6px 0 0;color:#334155;">' + i.empfehlung + '</p></div>';
            }

            detailHtml = '<tr class="impulse-table-detail" id="table-detail-' + i.id + '">' +
                '<td colspan="7"><div class="impulse-table-detail-inner">' +
                herleitungHtml + barHtml + vergleichHtml + empfehlungHtml +
                '<div class="impulse-table-actions">' +
                '<button class="action-btn primary small" onclick="event.stopPropagation()">' + actionIcons.angebot + ' Angebot erstellen</button>' +
                '<button class="action-btn secondary small" onclick="event.stopPropagation()">' + actionIcons.termin + ' Termin vereinbaren</button>' +
                '</div></div></td></tr>';
        }

        var ofClass = (i.source === 'Open Finance') ? ' open-finance-only' : '';
        return '<tr class="impulse-table-row' + ofClass + '" onclick="toggleTableDetail(\'' + i.id + '\')">' +
            '<td><span class="impulse-table-icon">' + i.icon + '</span></td>' +
            '<td><strong>' + i.title + '</strong><div class="impulse-table-desc">' + i.desc + '</div></td>' +
            '<td><span class="impulse-kat-badge ' + i.kategorie + '">' + katLabel + '</span></td>' +
            '<td><span class="impulse-prio-badge ' + i.prioritaet + '">' + prioLabel + '</span></td>' +
            '<td>' + i.source + '</td>' +
            '<td class="impulse-table-badges">' +
            (i.abschlussvolumen ? '<span class="impuls-volumen-badge small">' + Number(i.abschlussvolumen).toLocaleString('de-DE') + ' \u20AC</span>' : '') +
            (i.provision ? '<span class="impuls-provision-badge small">' + Number(i.provision).toLocaleString('de-DE') + ' \u20AC</span>' : '') +
            '</td>' +
            '<td class="impulse-table-expand-cell"><span class="impulse-table-expand" id="table-arrow-' + i.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg></span></td>' +
            '</tr>' + detailHtml;
    }).join('');

    return '<table class="impulse-table"><thead><tr><th style="width:36px"></th><th>Impuls</th><th>Kategorie</th><th>Priorit\u00E4t</th><th>Quelle</th><th>Volumen / Provision</th><th style="width:30px"></th></tr></thead><tbody>' + rows + '</tbody></table>';
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
window.__registerModule('potentiale.js');
