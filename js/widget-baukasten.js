// js/widget-baukasten.js – OPT-14: Modulbaukasten (Widget Dashboard)
// Konfigurierbares Widget-Grid für die Übersichtsseite (A-02/B-02)
// Folgt ARCH-01 Unified Module Pattern mit modes[]-Arrays

(function() {
    'use strict';

    // ========================================
    // WIDGET REGISTRY
    // ========================================

    var WIDGET_REGISTRY = {

        aufgaben: {
            label: 'Offene Aufgaben',
            description: 'Follow-ups, Wiedervorlagen, Fristen',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            defaultActive: false,
            size: 'normal',
            modes: ['versicherung', 'banking'],
            render: renderAufgabenWidget
        },

        stornoRadar: {
            label: 'Storno-Radar',
            description: 'Gefährdete Verträge mit Frühwarnung',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            defaultActive: false,
            size: 'normal',
            modes: ['versicherung'],
            render: renderStornoRadar
        },

        ngTrend: {
            label: 'Neugeschäft-Trend',
            description: 'Sparkline der letzten 6 Monate',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
            defaultActive: false,
            size: 'normal',
            modes: ['versicherung', 'banking'],
            render: renderNGTrend
        },

        topPotentiale: {
            label: 'Top-Potentiale',
            description: 'Die 5 besten Vertriebschancen',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
            defaultActive: false,
            size: 'wide',
            modes: ['versicherung', 'banking'],
            render: renderTopPotentiale
        },

        provisionProgress: {
            label: 'Provisions-Fortschritt',
            description: 'Zielerreichung Provision/Ertrag YTD',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
            defaultActive: false,
            size: 'normal',
            modes: ['versicherung', 'banking'],
            render: renderProvisionProgress
        },

        fidaStatus: {
            label: 'FIDA/Open Finance',
            description: 'Consent-Status und Datenqualität',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            defaultActive: false,
            size: 'normal',
            modes: ['versicherung', 'banking'],
            render: renderFidaStatusWidget
        },

        kommFeed: {
            label: 'Kommunikations-Feed',
            description: 'Letzte Kontakte & Nachrichten',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
            defaultActive: false,
            size: 'normal',
            modes: ['versicherung', 'banking'],
            render: renderKommFeed
        },

        kalender: {
            label: 'Kalender-Widget',
            description: 'Heutige & morgige Termine',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
            defaultActive: false,
            size: 'normal',
            modes: ['versicherung', 'banking'],
            render: renderKalenderWidget
        },

        abwanderung: {
            label: 'Abwanderungsrisiko',
            description: 'Kunden mit erhöhtem Abwanderungsrisiko',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>',
            defaultActive: false,
            size: 'normal',
            modes: ['banking'],
            render: renderAbwanderungWidget
        },

        crossSelling: {
            label: 'Cross-Selling',
            description: 'Verbundpartner-Potentiale (R+V, Union)',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
            defaultActive: false,
            size: 'normal',
            modes: ['banking'],
            render: renderCrossSellingWidget
        },

        spartenMix: {
            label: 'Sparten-Mix',
            description: 'Verteilung nach Versicherungssparten',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>',
            defaultActive: false,
            size: 'normal',
            modes: ['versicherung'],
            render: renderSpartenMixWidget
        },

        benchmark: {
            label: 'Benchmark',
            description: 'Vergleich mit Durchschnitt der Region',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
            defaultActive: false,
            size: 'wide',
            modes: ['versicherung', 'banking'],
            render: renderBenchmarkWidget
        }
    };

    // ========================================
    // PERSISTENCE (localStorage)
    // ========================================

    var STORAGE_KEY = 'widgetBaukasten_active';

    function getActiveWidgets() {
        var mode = (typeof getModeConfig === 'function') ? getModeConfig().id : 'versicherung';
        var key = STORAGE_KEY + '_' + mode;
        var saved = (typeof safeLocalGet === 'function') ? safeLocalGet(key, null) : null;
        if (saved) {
            try { return JSON.parse(saved); } catch(e) {}
        }
        // Default: all widgets where defaultActive===true and mode matches
        var defaults = [];
        Object.keys(WIDGET_REGISTRY).forEach(function(id) {
            var w = WIDGET_REGISTRY[id];
            if (w.defaultActive && w.modes.indexOf(mode) !== -1) {
                defaults.push(id);
            }
        });
        return defaults;
    }

    function saveActiveWidgets(ids) {
        var mode = (typeof getModeConfig === 'function') ? getModeConfig().id : 'versicherung';
        var key = STORAGE_KEY + '_' + mode;
        if (typeof safeLocalSet === 'function') {
            safeLocalSet(key, JSON.stringify(ids));
        }
    }

    // ========================================
    // MAIN RENDER FUNCTION
    // ========================================

    function renderDashboardWidgets(targetId) {
        var container = document.getElementById(targetId || 'widgetGrid');
        if (!container) return;

        var mode = (typeof getModeConfig === 'function') ? getModeConfig().id : 'versicherung';
        var activeIds = getActiveWidgets();

        // Filter to only mode-compatible active widgets
        var widgets = activeIds.filter(function(id) {
            var w = WIDGET_REGISTRY[id];
            return w && w.modes.indexOf(mode) !== -1;
        });

        // Build HTML
        var html = '<div class="widget-grid-header">' +
            '<button class="widget-config-btn" onclick="openWidgetConfigurator()" title="Dashboard konfigurieren">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>' +
                ' Konfigurieren' +
            '</button>' +
        '</div>';

        html += '<div class="widget-grid">';

        widgets.forEach(function(id) {
            var w = WIDGET_REGISTRY[id];
            if (!w) return;
            var sizeClass = w.size === 'wide' ? 'widget-card-wide' : '';
            html += '<div class="widget-card ' + sizeClass + '" data-widget-id="' + id + '">' +
                '<div class="widget-card-header">' +
                    '<span class="widget-card-icon">' + w.icon + '</span>' +
                    '<span class="widget-card-title">' + w.label + '</span>' +
                '</div>' +
                '<div class="widget-card-body" id="widgetBody_' + id + '"></div>' +
            '</div>';
        });

        html += '</div>';
        container.innerHTML = html;

        // Render each widget body
        widgets.forEach(function(id) {
            var w = WIDGET_REGISTRY[id];
            if (!w || typeof w.render !== 'function') return;
            try { w.render('widgetBody_' + id); } catch(e) {
                console.warn('[Widget] Render-Fehler für', id, e);
            }
        });
    }

    // ========================================
    // CONFIGURATOR MODAL
    // ========================================

    function openWidgetConfigurator() {
        var modal = document.getElementById('widgetConfigModal');
        if (!modal) return;

        var mode = (typeof getModeConfig === 'function') ? getModeConfig().id : 'versicherung';
        var activeIds = getActiveWidgets();

        var html = '<div class="widget-config-overlay" onclick="closeWidgetConfigurator()">' +
            '<div class="widget-config-dialog" onclick="event.stopPropagation()">' +
                '<div class="widget-config-title">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>' +
                    ' Dashboard konfigurieren' +
                '</div>' +
                '<p class="widget-config-desc">Wählen Sie die Module für Ihr Dashboard. Änderungen werden sofort gespeichert.</p>' +
                '<div class="widget-config-list">';

        Object.keys(WIDGET_REGISTRY).forEach(function(id) {
            var w = WIDGET_REGISTRY[id];
            if (w.modes.indexOf(mode) === -1) return; // skip widgets not for this mode
            var checked = activeIds.indexOf(id) !== -1;
            html += '<label class="widget-config-item' + (checked ? ' active' : '') + '">' +
                '<input type="checkbox" value="' + id + '"' + (checked ? ' checked' : '') + ' onchange="toggleWidgetConfig(this)">' +
                '<span class="widget-config-item-icon">' + w.icon + '</span>' +
                '<div class="widget-config-item-text">' +
                    '<div class="widget-config-item-label">' + w.label + '</div>' +
                    '<div class="widget-config-item-desc">' + w.description + '</div>' +
                '</div>' +
                '<span class="widget-config-size-badge">' + (w.size === 'wide' ? 'Breit' : 'Normal') + '</span>' +
            '</label>';
        });

        html += '</div>' +
                '<div class="widget-config-actions">' +
                    '<button class="widget-config-reset" onclick="resetWidgetConfig()">Zurücksetzen</button>' +
                    '<button class="widget-config-close" onclick="closeWidgetConfigurator()">Schließen</button>' +
                '</div>' +
            '</div>' +
        '</div>';

        modal.innerHTML = html;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeWidgetConfigurator() {
        var modal = document.getElementById('widgetConfigModal');
        if (modal) {
            modal.style.display = 'none';
            modal.innerHTML = '';
        }
        document.body.style.overflow = '';
    }

    function toggleWidgetConfig(checkbox) {
        var id = checkbox.value;
        var activeIds = getActiveWidgets();
        var label = checkbox.closest('.widget-config-item');

        if (checkbox.checked) {
            if (activeIds.indexOf(id) === -1) activeIds.push(id);
            if (label) label.classList.add('active');
        } else {
            activeIds = activeIds.filter(function(a) { return a !== id; });
            if (label) label.classList.remove('active');
        }

        saveActiveWidgets(activeIds);
        // Re-render dashboard in background
        renderDashboardWidgets('widgetGrid');
        // Also re-render banking widget grid if exists
        renderDashboardWidgets('widgetGridB02');
    }

    function resetWidgetConfig() {
        var mode = (typeof getModeConfig === 'function') ? getModeConfig().id : 'versicherung';
        var key = STORAGE_KEY + '_' + mode;
        try { localStorage.removeItem(key); } catch(e) {}
        closeWidgetConfigurator();
        renderDashboardWidgets('widgetGrid');
        renderDashboardWidgets('widgetGridB02');
    }

    // ========================================
    // WIDGET RENDER FUNCTIONS
    // ========================================

    function renderAufgabenWidget(targetId) {
        var el = document.getElementById(targetId);
        if (!el) return;

        var now = new Date();
        var tasks = [
            { text: 'Angebot nachfassen: Peter Schmidt', due: 'Heute', prio: 'hoch', type: 'followup' },
            { text: 'Termin bestätigen: Amira König', due: 'Heute', prio: 'mittel', type: 'termin' },
            { text: 'BU-Unterlagen prüfen: Michael Braun', due: 'Morgen', prio: 'hoch', type: 'dokument' },
            { text: 'Kfz-Wechsel Angebot: Dirk Hoffmann', due: 'Morgen', prio: 'mittel', type: 'angebot' },
            { text: 'FIDA-Consent erneuern: Eva Hartmann', due: getDueLabel(2), prio: 'niedrig', type: 'fida' }
        ];

        var isBanking = (typeof getModeConfig === 'function') && getModeConfig().id === 'banking';
        if (isBanking) {
            tasks = [
                { text: 'VR-FinanzPlan erstellen: Klaus Fischer', due: 'Heute', prio: 'hoch', type: 'finanzplan' },
                { text: 'Anschlussfinanzierung: Sandra Müller', due: 'Heute', prio: 'hoch', type: 'kredit' },
                { text: 'Depot-Review: Markus Wagner', due: 'Morgen', prio: 'mittel', type: 'depot' },
                { text: 'R+V Rückruf: Thomas Lehmann', due: 'Morgen', prio: 'mittel', type: 'verbund' },
                { text: 'FIDA-Consent einholen: Petra Klein', due: getDueLabel(3), prio: 'niedrig', type: 'fida' }
            ];
        }

        var html = '<div class="widget-aufgaben-count">' + tasks.length + ' offen</div>';
        html += '<div class="widget-aufgaben-list">';
        tasks.forEach(function(t) {
            var prioClass = 'prio-' + t.prio;
            html += '<div class="widget-aufgabe-item ' + prioClass + '">' +
                '<span class="widget-aufgabe-prio"></span>' +
                '<div class="widget-aufgabe-text">' + t.text + '</div>' +
                '<span class="widget-aufgabe-due">' + t.due + '</span>' +
            '</div>';
        });
        html += '</div>';
        el.innerHTML = html;
    }

    function renderStornoRadar(targetId) {
        var el = document.getElementById(targetId);
        if (!el) return;

        var gefaehrdet = [
            { kunde: 'Herbert Lange', vertrag: 'Kfz-Haftpflicht', risiko: 87, grund: 'Prämienerhöhung +18%' },
            { kunde: 'Werner Krüger', vertrag: 'Rechtsschutz', risiko: 72, grund: 'Kein Schaden, Preisvergleich aktiv' },
            { kunde: 'Frank Zimmermann', vertrag: 'Unfallversicherung', risiko: 65, grund: 'Beitragsmahnung offen' }
        ];

        var html = '<div class="widget-storno-summary">' +
            '<span class="widget-storno-count">' + gefaehrdet.length + '</span> gefährdete Verträge' +
        '</div>';
        gefaehrdet.forEach(function(g) {
            var riskColor = g.risiko >= 80 ? '#dc2626' : (g.risiko >= 60 ? '#f59e0b' : '#94a3b8');
            html += '<div class="widget-storno-item">' +
                '<div class="widget-storno-item-top">' +
                    '<strong>' + g.kunde + '</strong>' +
                    '<span class="widget-storno-risk" style="color:' + riskColor + '">' + g.risiko + '%</span>' +
                '</div>' +
                '<div class="widget-storno-item-detail">' + g.vertrag + ' — ' + g.grund + '</div>' +
                '<div class="widget-storno-bar"><div class="widget-storno-bar-fill" style="width:' + g.risiko + '%;background:' + riskColor + '"></div></div>' +
            '</div>';
        });
        el.innerHTML = html;
    }

    function renderNGTrend(targetId) {
        var el = document.getElementById(targetId);
        if (!el) return;

        var now = new Date();
        var monate = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
        var data = [];
        for (var i = 5; i >= 0; i--) {
            var m = new Date(now.getFullYear(), now.getMonth() - i, 1);
            var val = Math.floor(8000 + Math.random() * 15000);
            data.push({ label: monate[m.getMonth()], value: val });
        }

        var isBanking = (typeof getModeConfig === 'function') && getModeConfig().id === 'banking';
        if (isBanking) {
            data = [];
            for (var j = 5; j >= 0; j--) {
                var bm = new Date(now.getFullYear(), now.getMonth() - j, 1);
                var bval = Math.floor(3000 + Math.random() * 8000);
                data.push({ label: monate[bm.getMonth()], value: bval });
            }
        }

        var maxVal = Math.max.apply(null, data.map(function(d) { return d.value; }));
        var total = data.reduce(function(s, d) { return s + d.value; }, 0);
        var current = data[data.length - 1].value;
        var prev = data[data.length - 2].value;
        var trend = prev > 0 ? ((current - prev) / prev * 100).toFixed(1) : '0.0';

        var html = '<div class="widget-ng-summary">' +
            '<span class="widget-ng-current">€' + (current / 1000).toFixed(1) + 'k</span>' +
            '<span class="widget-ng-trend ' + (parseFloat(trend) >= 0 ? 'positive' : 'negative') + '">' +
                (parseFloat(trend) >= 0 ? '+' : '') + trend + '%' +
            '</span>' +
        '</div>';
        html += '<div class="widget-ng-chart">';
        data.forEach(function(d) {
            var h = Math.max(8, Math.round(d.value / maxVal * 60));
            html += '<div class="widget-ng-bar-group">' +
                '<div class="widget-ng-bar" style="height:' + h + 'px"></div>' +
                '<span class="widget-ng-bar-label">' + d.label + '</span>' +
            '</div>';
        });
        html += '</div>';
        el.innerHTML = html;
    }

    function renderTopPotentiale(targetId) {
        var el = document.getElementById(targetId);
        if (!el) return;

        var isBanking = (typeof getModeConfig === 'function') && getModeConfig().id === 'banking';
        var potentiale;

        if (isBanking) {
            potentiale = [
                { kunde: 'Klaus Fischer', produkt: 'Anschlussfinanzierung', wert: 12500, prio: 'hoch' },
                { kunde: 'Sandra Müller', produkt: 'VR-FinanzPlan', wert: 4200, prio: 'hoch' },
                { kunde: 'Markus Wagner', produkt: 'Depot-Eröffnung', wert: 3800, prio: 'mittel' },
                { kunde: 'Thomas Lehmann', produkt: 'R+V Risikoleben', wert: 2100, prio: 'mittel' },
                { kunde: 'Petra Klein', produkt: 'Wero-Aktivierung', wert: 850, prio: 'niedrig' }
            ];
        } else {
            potentiale = [
                { kunde: 'Peter Schmidt', produkt: 'BU-Nachversicherung', wert: 1680, prio: 'hoch' },
                { kunde: 'Amira König', produkt: 'Risikolebensversicherung', wert: 1440, prio: 'hoch' },
                { kunde: 'Michael Braun', produkt: 'Kfz-Wechsel', wert: 980, prio: 'mittel' },
                { kunde: 'Anna Hoffmann', produkt: 'Zahnzusatz', wert: 540, prio: 'mittel' },
                { kunde: 'Eva Hartmann', produkt: 'BU-Erhöhung', wert: 420, prio: 'niedrig' }
            ];
        }

        var html = '<div class="widget-potentiale-list">';
        potentiale.forEach(function(p, i) {
            html += '<div class="widget-potential-item">' +
                '<span class="widget-potential-rank">' + (i + 1) + '</span>' +
                '<div class="widget-potential-info">' +
                    '<div class="widget-potential-kunde">' + p.kunde + '</div>' +
                    '<div class="widget-potential-produkt">' + p.produkt + '</div>' +
                '</div>' +
                '<span class="widget-potential-wert">€' + p.wert.toLocaleString('de-DE') + '</span>' +
                '<span class="widget-potential-prio prio-' + p.prio + '">' + capitalize(p.prio) + '</span>' +
            '</div>';
        });
        html += '</div>';
        el.innerHTML = html;
    }

    function renderProvisionProgress(targetId) {
        var el = document.getElementById(targetId);
        if (!el) return;

        var isBanking = (typeof getModeConfig === 'function') && getModeConfig().id === 'banking';
        var now = new Date();
        var monthProgress = (now.getDate() / 30 * 100).toFixed(0);

        var actual, target, label;
        if (isBanking) {
            actual = 8450;
            target = 10800;
            label = 'Ertrag YTD';
        } else {
            actual = 42300;
            target = 65000;
            label = 'Provision YTD';
        }

        var pct = Math.min(100, Math.round(actual / target * 100));
        var barColor = pct >= 80 ? '#16a34a' : (pct >= 50 ? '#f59e0b' : '#dc2626');

        var html = '<div class="widget-prov-label">' + label + '</div>' +
            '<div class="widget-prov-numbers">' +
                '<span class="widget-prov-actual">€' + (actual / 1000).toFixed(1) + 'k</span>' +
                '<span class="widget-prov-target">/ €' + (target / 1000).toFixed(1) + 'k Ziel</span>' +
            '</div>' +
            '<div class="widget-prov-bar-track">' +
                '<div class="widget-prov-bar-fill" style="width:' + pct + '%;background:' + barColor + '"></div>' +
                '<div class="widget-prov-bar-marker" style="left:' + monthProgress + '%" title="Zeitfortschritt ' + monthProgress + '%"></div>' +
            '</div>' +
            '<div class="widget-prov-footer">' +
                '<span>' + pct + '% erreicht</span>' +
                '<span>Noch €' + ((target - actual) / 1000).toFixed(1) + 'k</span>' +
            '</div>';
        el.innerHTML = html;
    }

    function renderFidaStatusWidget(targetId) {
        var el = document.getElementById(targetId);
        if (!el) return;

        var consentKunden = 127;
        var totalKunden = 340;
        var pct = Math.round(consentKunden / totalKunden * 100);
        var isBanking = (typeof getModeConfig === 'function') && getModeConfig().id === 'banking';

        if (isBanking) {
            consentKunden = 89;
            totalKunden = 215;
            pct = Math.round(consentKunden / totalKunden * 100);
        }

        var html = '<div class="widget-fida-ring">' +
            '<svg viewBox="0 0 80 80" width="80" height="80">' +
                '<circle cx="40" cy="40" r="32" fill="none" stroke="#e2e8f0" stroke-width="8"/>' +
                '<circle cx="40" cy="40" r="32" fill="none" stroke="#86BC25" stroke-width="8" ' +
                    'stroke-dasharray="' + (pct * 2.01) + ' ' + (201 - pct * 2.01) + '" ' +
                    'stroke-dashoffset="50" stroke-linecap="round" transform="rotate(-90 40 40)"/>' +
                '<text x="40" y="43" text-anchor="middle" font-size="16" font-weight="700" fill="#1e293b">' + pct + '%</text>' +
            '</svg>' +
            '<div class="widget-fida-stats">' +
                '<div><strong>' + consentKunden + '</strong> mit Consent</div>' +
                '<div>' + totalKunden + ' Kunden gesamt</div>' +
                '<div class="widget-fida-hint">' + (totalKunden - consentKunden) + ' ohne Consent</div>' +
            '</div>' +
        '</div>';
        el.innerHTML = html;
    }

    function renderKommFeed(targetId) {
        var el = document.getElementById(targetId);
        if (!el) return;

        var now = new Date();
        var isBanking = (typeof getModeConfig === 'function') && getModeConfig().id === 'banking';

        var feed;
        if (isBanking) {
            feed = [
                { kunde: 'Klaus Fischer', kanal: 'Telefon', text: 'Anschlussfinanzierung besprochen', zeit: 'Vor 2h' },
                { kunde: 'Sandra Müller', kanal: 'E-Mail', text: 'Depotauszug angefordert', zeit: 'Vor 4h' },
                { kunde: 'Petra Klein', kanal: 'Chat', text: 'Frage zur Wero-App', zeit: 'Gestern' },
                { kunde: 'Markus Wagner', kanal: 'Vor Ort', text: 'Beratungsgespräch VR-FinanzPlan', zeit: 'Gestern' }
            ];
        } else {
            feed = [
                { kunde: 'Peter Schmidt', kanal: 'Telefon', text: 'BU-Angebot besprochen', zeit: 'Vor 1h' },
                { kunde: 'Amira König', kanal: 'E-Mail', text: 'RLV-Unterlagen gesendet', zeit: 'Vor 3h' },
                { kunde: 'Michael Braun', kanal: 'Portal', text: 'Schadenmeldung eingereicht', zeit: 'Gestern' },
                { kunde: 'Anna Hoffmann', kanal: 'Telefon', text: 'Terminvereinbarung', zeit: 'Gestern' }
            ];
        }

        var kanalIcons = {
            'Telefon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
            'E-Mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
            'Chat': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
            'Portal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
            'Vor Ort': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
        };

        var html = '<div class="widget-komm-list">';
        feed.forEach(function(f) {
            var icon = kanalIcons[f.kanal] || '';
            html += '<div class="widget-komm-item">' +
                '<div class="widget-komm-icon">' + icon + '</div>' +
                '<div class="widget-komm-content">' +
                    '<div class="widget-komm-top"><strong>' + f.kunde + '</strong><span class="widget-komm-zeit">' + f.zeit + '</span></div>' +
                    '<div class="widget-komm-text">' + f.text + '</div>' +
                '</div>' +
            '</div>';
        });
        html += '</div>';
        el.innerHTML = html;
    }

    function renderKalenderWidget(targetId) {
        var el = document.getElementById(targetId);
        if (!el) return;

        var now = new Date();
        var tage = ['So','Mo','Di','Mi','Do','Fr','Sa'];

        var isBanking = (typeof getModeConfig === 'function') && getModeConfig().id === 'banking';
        var termine;
        if (isBanking) {
            termine = [
                { zeit: '10:00', kunde: 'Klaus Fischer', thema: 'Anschlussfinanzierung', tag: 'Heute' },
                { zeit: '14:00', kunde: 'Sandra Müller', thema: 'VR-FinanzPlan', tag: 'Heute' },
                { zeit: '16:30', kunde: 'Markus Wagner', thema: 'Depot-Review', tag: 'Heute' },
                { zeit: '09:00', kunde: 'Petra Klein', thema: 'Kontoeröffnung', tag: 'Morgen' }
            ];
        } else {
            termine = [
                { zeit: '09:30', kunde: 'Peter Schmidt', thema: 'BU-Beratung', tag: 'Heute' },
                { zeit: '11:00', kunde: 'Amira König', thema: 'Risikoleben-Abschluss', tag: 'Heute' },
                { zeit: '14:00', kunde: 'Michael Braun', thema: 'Jahresgespräch', tag: 'Heute' },
                { zeit: '10:00', kunde: 'Anna Hoffmann', thema: 'Kfz-Wechsel', tag: 'Morgen' }
            ];
        }

        var html = '<div class="widget-kalender-list">';
        var lastTag = '';
        termine.forEach(function(t) {
            if (t.tag !== lastTag) {
                html += '<div class="widget-kalender-tag">' + t.tag + '</div>';
                lastTag = t.tag;
            }
            html += '<div class="widget-kalender-item">' +
                '<span class="widget-kalender-zeit">' + t.zeit + '</span>' +
                '<div class="widget-kalender-info">' +
                    '<div class="widget-kalender-kunde">' + t.kunde + '</div>' +
                    '<div class="widget-kalender-thema">' + t.thema + '</div>' +
                '</div>' +
            '</div>';
        });
        html += '</div>';
        el.innerHTML = html;
    }

    function renderAbwanderungWidget(targetId) {
        var el = document.getElementById(targetId);
        if (!el) return;

        var kunden = [
            { name: 'Thomas Lehmann', risiko: 78, grund: 'Kein Kontakt seit 8 Monaten' },
            { name: 'Markus Wagner', risiko: 62, grund: 'Nur Girokonto, kein Cross-Selling' },
            { name: 'Petra Klein', risiko: 55, grund: 'Wettbewerber-App installiert' }
        ];

        var html = '<div class="widget-abwanderung-list">';
        kunden.forEach(function(k) {
            var color = k.risiko >= 70 ? '#dc2626' : (k.risiko >= 50 ? '#f59e0b' : '#94a3b8');
            html += '<div class="widget-abwanderung-item">' +
                '<div class="widget-abwanderung-top">' +
                    '<strong>' + k.name + '</strong>' +
                    '<span style="color:' + color + ';font-weight:600">' + k.risiko + '%</span>' +
                '</div>' +
                '<div class="widget-abwanderung-grund">' + k.grund + '</div>' +
                '<div class="widget-storno-bar"><div class="widget-storno-bar-fill" style="width:' + k.risiko + '%;background:' + color + '"></div></div>' +
            '</div>';
        });
        html += '</div>';
        el.innerHTML = html;
    }

    function renderCrossSellingWidget(targetId) {
        var el = document.getElementById(targetId);
        if (!el) return;

        var verbund = [
            { partner: 'R+V Versicherung', potentiale: 12, ertrag: 4200 },
            { partner: 'Union Investment', potentiale: 8, ertrag: 3100 },
            { partner: 'Schwäbisch Hall', potentiale: 5, ertrag: 6800 },
            { partner: 'DZ PRIVATBANK', potentiale: 3, ertrag: 2400 }
        ];

        var html = '<div class="widget-cross-list">';
        verbund.forEach(function(v) {
            html += '<div class="widget-cross-item">' +
                '<div class="widget-cross-partner">' + v.partner + '</div>' +
                '<div class="widget-cross-stats">' +
                    '<span>' + v.potentiale + ' Potentiale</span>' +
                    '<span class="widget-cross-ertrag">€' + v.ertrag.toLocaleString('de-DE') + '</span>' +
                '</div>' +
            '</div>';
        });
        html += '</div>';
        el.innerHTML = html;
    }

    function renderSpartenMixWidget(targetId) {
        var el = document.getElementById(targetId);
        if (!el) return;

        var sparten = [
            { name: 'Leben', pct: 35, color: '#2563eb' },
            { name: 'Kranken', pct: 22, color: '#16a34a' },
            { name: 'Schaden', pct: 28, color: '#9333ea' },
            { name: 'Kfz', pct: 15, color: '#f59e0b' }
        ];

        var html = '<div class="widget-sparten-bars">';
        sparten.forEach(function(s) {
            html += '<div class="widget-sparten-row">' +
                '<span class="widget-sparten-name">' + s.name + '</span>' +
                '<div class="widget-sparten-bar-track">' +
                    '<div class="widget-sparten-bar-fill" style="width:' + s.pct + '%;background:' + s.color + '"></div>' +
                '</div>' +
                '<span class="widget-sparten-pct">' + s.pct + '%</span>' +
            '</div>';
        });
        html += '</div>';
        el.innerHTML = html;
    }

    function renderBenchmarkWidget(targetId) {
        var el = document.getElementById(targetId);
        if (!el) return;

        var isBanking = (typeof getModeConfig === 'function') && getModeConfig().id === 'banking';
        var metrics;

        if (isBanking) {
            metrics = [
                { label: 'Ertrag/Kunde', own: 245, avg: 198, unit: '€' },
                { label: 'Produktbreite', own: 3.2, avg: 2.8, unit: '' },
                { label: 'Cross-Selling-Rate', own: 28, avg: 22, unit: '%' },
                { label: 'NPS', own: 52, avg: 45, unit: '' }
            ];
        } else {
            metrics = [
                { label: 'Neugeschäft/Monat', own: 18450, avg: 14200, unit: '€' },
                { label: 'Stornoquote', own: 5.2, avg: 7.8, unit: '%', invert: true },
                { label: 'Abschlussquote', own: 68, avg: 55, unit: '%' },
                { label: 'NPS', own: 42, avg: 38, unit: '' }
            ];
        }

        var html = '<div class="widget-bench-grid">';
        metrics.forEach(function(m) {
            var better = m.invert ? (m.own < m.avg) : (m.own > m.avg);
            var diff;
            if (m.unit === '€') {
                diff = (m.own > m.avg ? '+' : '') + '€' + Math.abs(m.own - m.avg).toLocaleString('de-DE');
            } else {
                diff = (m.own > m.avg ? '+' : '') + (m.own - m.avg).toFixed(m.own % 1 === 0 ? 0 : 1) + m.unit;
            }
            var displayOwn = m.unit === '€' ? '€' + m.own.toLocaleString('de-DE') : m.own + m.unit;
            var displayAvg = m.unit === '€' ? '€' + m.avg.toLocaleString('de-DE') : m.avg + m.unit;

            html += '<div class="widget-bench-item">' +
                '<div class="widget-bench-label">' + m.label + '</div>' +
                '<div class="widget-bench-values">' +
                    '<span class="widget-bench-own">' + displayOwn + '</span>' +
                    '<span class="widget-bench-vs">vs.</span>' +
                    '<span class="widget-bench-avg">' + displayAvg + '</span>' +
                '</div>' +
                '<span class="widget-bench-diff ' + (better ? 'positive' : 'negative') + '">' + diff + '</span>' +
            '</div>';
        });
        html += '</div>';
        el.innerHTML = html;
    }

    // ========================================
    // HELPERS
    // ========================================

    function getDueLabel(daysAhead) {
        var d = new Date();
        d.setDate(d.getDate() + daysAhead);
        var tage = ['So','Mo','Di','Mi','Do','Fr','Sa'];
        return tage[d.getDay()] + ', ' + d.getDate() + '.' + (d.getMonth() + 1) + '.';
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ========================================
    // WINDOW EXPORTS
    // ========================================

    window.WIDGET_REGISTRY = WIDGET_REGISTRY;
    window.renderDashboardWidgets = renderDashboardWidgets;
    window.openWidgetConfigurator = openWidgetConfigurator;
    window.closeWidgetConfigurator = closeWidgetConfigurator;
    window.toggleWidgetConfig = toggleWidgetConfig;
    window.resetWidgetConfig = resetWidgetConfig;
    window.getActiveWidgets = getActiveWidgets;
    window.saveActiveWidgets = saveActiveWidgets;

    window.__registerModule('widget-baukasten.js');

})();
