// ========================================
// BGAV VERTRAGSUMSTELLUNG - Simulationsergebnisse Tool
// Page ID: M-01 (erweiterbar)
// ========================================

(function() {
    'use strict';

    // ========================================
    // SCREEN SIZE DETECTION & ADAPTIVE ZOOM
    // ========================================
    const BgavScreenDetect = {
        DESIGN_WIDTH: 2560,    // 27 Zoll = 2560px native (1440p) oder 1920px scaled
        DESIGN_REF: 1920,      // Referenzbreite für 27" bei 100%
        MIN_ZOOM: 0.52,
        hasShownPopup: false,

        init() {
            // Nur anzeigen wenn das BGAV Tool geöffnet ist
            if (!document.getElementById('bgavUmstellungPage')) return;
            if (sessionStorage.getItem('bgav_zoom_accepted')) {
                this.applyZoom();
                return;
            }
            this.detectAndShow();
        },

        getScreenCategory() {
            const w = window.screen.width;
            const dpr = window.devicePixelRatio || 1;
            const effectiveWidth = w;
            const physicalWidth = w * dpr;

            // Schätzung Bildschirmgröße in Zoll basierend auf Auflösung
            if (physicalWidth >= 3800) return { size: 27, label: '27 Zoll (4K)', zoom: 100 };
            if (physicalWidth >= 2500 || effectiveWidth >= 2500) return { size: 27, label: '27 Zoll', zoom: 100 };
            if (effectiveWidth >= 1900) return { size: 24, label: '24 Zoll / 27 Zoll skaliert', zoom: 100 };
            if (effectiveWidth >= 1700) return { size: 22, label: '~22 Zoll', zoom: 88 };
            if (effectiveWidth >= 1500) return { size: 17, label: '~17 Zoll Laptop', zoom: 78 };
            if (effectiveWidth >= 1350) return { size: 15, label: '15,6 Zoll Laptop', zoom: 70 };
            if (effectiveWidth >= 1200) return { size: 14, label: '14 Zoll Laptop', zoom: 62 };
            if (effectiveWidth >= 1024) return { size: 13, label: '13 Zoll Laptop', zoom: 55 };
            return { size: 12, label: 'Kleiner Bildschirm', zoom: 52 };
        },

        applyZoom() {
            const cat = this.getScreenCategory();
            const vw = window.innerWidth;
            if (vw >= this.DESIGN_REF) {
                document.documentElement.style.zoom = '1';
            } else {
                const zoom = Math.max(vw / this.DESIGN_REF, this.MIN_ZOOM);
                document.documentElement.style.zoom = String(zoom);
            }
        },

        detectAndShow() {
            if (this.hasShownPopup) return;
            this.hasShownPopup = true;

            const cat = this.getScreenCategory();
            if (cat.zoom >= 100) {
                // Kein Popup nötig bei 27"
                this.applyZoom();
                sessionStorage.setItem('bgav_zoom_accepted', '1');
                return;
            }

            this.showPopup(cat);
        },

        showPopup(cat) {
            const overlay = document.createElement('div');
            overlay.className = 'screen-size-overlay';
            overlay.id = 'bgavScreenOverlay';

            overlay.innerHTML = `
                <div class="screen-size-popup">
                    <div class="popup-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                    </div>
                    <h3>Bildschirm erkannt: ${cat.label}</h3>
                    <p>Dieses Dashboard ist für <strong>27 Zoll Monitore</strong> optimiert. Ihr Bildschirm wird als <strong>ca. ${cat.size} Zoll</strong> erkannt.</p>
                    <div class="zoom-info">
                        <div class="zoom-value">${cat.zoom}%</div>
                        <div class="zoom-desc">
                            <strong>Empfohlene Skalierung</strong><br>
                            Die Ansicht wird automatisch auf ${cat.zoom}% angepasst, damit alle Inhalte optimal dargestellt werden.
                        </div>
                    </div>
                    <div class="zoom-progress-bar">
                        <div class="zoom-progress-fill" id="bgavZoomProgress"></div>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8;">Auflösung: ${window.screen.width}x${window.screen.height} | DPR: ${(window.devicePixelRatio || 1).toFixed(1)} | Fenster: ${window.innerWidth}x${window.innerHeight}</p>
                    <button class="popup-btn" onclick="BgavScreenDetect.acceptZoom()">
                        Ansicht anpassen & fortfahren
                    </button>
                </div>
            `;

            document.body.appendChild(overlay);

            // Animate progress bar
            setTimeout(() => {
                const progressBar = document.getElementById('bgavZoomProgress');
                if (progressBar) progressBar.style.width = cat.zoom + '%';
            }, 200);
        },

        acceptZoom() {
            sessionStorage.setItem('bgav_zoom_accepted', '1');
            this.applyZoom();

            const overlay = document.getElementById('bgavScreenOverlay');
            if (overlay) {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.4s ease';
                setTimeout(() => overlay.remove(), 400);
            }
        }
    };

    // Global verfügbar machen
    window.BgavScreenDetect = BgavScreenDetect;

    // ========================================
    // BGAV SIMULATION STATE
    // ========================================
    const bgavState = {
        currentTab: 'simulation',
        vermittler: {
            name: 'Dila Yorulmaz',
            id: 'BD-VM 0055/0310',
            vpt: 'VPT9957912',
            allis: '0123456',
            status: 'Aktiv',
            region: 'VD Wuppertal',
            karrierestufe: 'Bezirksdirektor',
            seit: '2018',
            neugeschaeft: 285000,
            bestand: 1240000,
            provision: 42800,
            storno: 6.2
        },
        // Simulation parameters
        simulation: {
            produktionLeben: 150000,
            produktionKranken: 80000,
            produktionSchaden: 120000,
            bestandLeben: 450000,
            bestandKranken: 220000,
            bestandSchaden: 380000,
            karrierestufe: 'premium', // basis, standard, premium, top
        },
        chatOpen: false,
        chatMessages: []
    };

    // ========================================
    // COMMISSION RATES (BGAV Model)
    // ========================================
    const bgavRates = {
        altModell: {
            leben: { ap: 2.0, bp: 0.3 },
            kranken: { ap: 5.0, bp: 0.5 },
            schaden: { ap: 15.0, bp: 2.0 }
        },
        bgav: {
            leben: { ap: 1.8, bp: 0.45 },
            kranken: { ap: 4.5, bp: 0.7 },
            schaden: { ap: 13.0, bp: 3.0 }
        }
    };

    const karriereStufen = [
        { key: 'basis', label: 'Basis', min: 0, max: 100000, factor: 0.85 },
        { key: 'standard', label: 'Standard', min: 100000, max: 250000, factor: 0.95 },
        { key: 'premium', label: 'Premium', min: 250000, max: 500000, factor: 1.0 },
        { key: 'top', label: 'Top', min: 500000, max: Infinity, factor: 1.10 }
    ];

    // Per-Sparte Leistungsstufen (multiple tiers per segment)
    const sparteLevels = {
        leben: [
            { key: 'LS1', label: 'LS 1', min: 2000,  color: '#94a3b8' },
            { key: 'LS2', label: 'LS 2', min: 4000,  color: '#3b82f6' },
            { key: 'LS3', label: 'LS 3', min: 6000,  color: '#8b5cf6' },
            { key: 'LS4', label: 'LS 4', min: 8000,  color: '#f59e0b' }
        ],
        kranken: [
            { key: 'LS1', label: 'LS 1', min: 3000,  color: '#94a3b8' },
            { key: 'LS2', label: 'LS 2', min: 5500,  color: '#3b82f6' },
            { key: 'LS3', label: 'LS 3', min: 8000,  color: '#8b5cf6' },
            { key: 'LS4', label: 'LS 4', min: 12000, color: '#f59e0b' }
        ],
        schaden: [
            { key: 'LS1', label: 'LS 1', min: 10000, color: '#94a3b8' },
            { key: 'LS2', label: 'LS 2', min: 20000, color: '#3b82f6' },
            { key: 'LS3', label: 'LS 3', min: 30000, color: '#8b5cf6' },
            { key: 'LS4', label: 'LS 4', min: 45000, color: '#f59e0b' }
        ]
    };

    // ========================================
    // INIT
    // ========================================
    function initBgavUmstellung() {
        const page = document.getElementById('bgavUmstellungPage');
        if (!page || page.style.display === 'none') return;

        console.log('BGAV Umstellung Tool initialisiert');

        // Copy photo from A-02 if available
        copyVermittlerPhoto();

        // Screen detection
        BgavScreenDetect.init();

        // Setup tabs
        setupBgavTabs();

        // Load initial data
        updateSimulationResults();
        setupSliders();
        renderLeistungsstufen();
        initBgavChat();

        // Default to Provisionssimulation tab
        switchBgavTab('simulation');

        // Render Übersicht charts lazily (when user switches to that tab)
        setTimeout(renderUebersichtTab, 200);

        // Page ID update
        if (typeof PageIDTracker !== 'undefined') {
            PageIDTracker.setPageId('A-11');
        }
    }

    // ========================================
    // VERMITTLER PHOTO COPY
    // ========================================
    function copyVermittlerPhoto() {
        const photoSrc = 'AdobeStock_624564221.jpeg';

        // Copy to header bar
        const targetImg = document.getElementById('bgavVermittlerPhoto');
        const targetPlaceholder = document.getElementById('bgavVermittlerPhotoPlaceholder');

        if (targetImg) {
            targetImg.src = photoSrc;
            targetImg.style.display = 'block';
        }
        if (targetPlaceholder) {
            targetPlaceholder.style.display = 'none';
        }

        // Copy to simulation Stammdaten sidebar
        const simPhoto = document.getElementById('bgavSimPhoto');
        const simPlaceholder = document.getElementById('bgavSimPhotoPlaceholder');

        if (simPhoto) {
            simPhoto.src = photoSrc;
            simPhoto.style.display = 'block';
        }
        if (simPlaceholder) {
            simPlaceholder.style.display = 'none';
        }
    }

    // ========================================
    // TAB NAVIGATION
    // ========================================
    let bgavTabsInitialized = false;
    function setupBgavTabs() {
        if (bgavTabsInitialized) return;
        bgavTabsInitialized = true;
        document.querySelectorAll('.bgav-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const target = this.dataset.tab;
                switchBgavTab(target);
            });
        });
    }

    function switchBgavTab(tabName) {
        bgavState.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.bgav-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.bgav-tab[data-tab="${tabName}"]`);
        if (activeTab) activeTab.classList.add('active');

        // Update content panels
        document.querySelectorAll('.bgav-tab-content').forEach(c => c.classList.remove('active'));
        const activeContent = document.getElementById('bgavContent_' + tabName);
        if (activeContent) activeContent.classList.add('active');

        // Update URL hash & page ID when switching tabs manually
        if (tabName === 'uebersicht') {
            if (window.AppRouter) AppRouter.navigate('/bgav-uebersicht');
            if (typeof PageIDTracker !== 'undefined') PageIDTracker.setPageId('A-11');
        } else if (tabName === 'simulation') {
            if (window.AppRouter) AppRouter.navigate('/bgav-umstellung');
            if (typeof PageIDTracker !== 'undefined') PageIDTracker.setPageId('A-12');
        }

        // Render Übersicht charts only once (on first visit), not on every tab switch
        if (tabName === 'uebersicht' && !window._bgavUbVzChart) {
            setTimeout(renderUebersichtTab, 50);
        }
        if (tabName === 'simulation') {
            setTimeout(() => updateSimulationResults(), 50);
        }
    }

    window.switchBgavTab = switchBgavTab;

    // ========================================
    // SIMULATION CALCULATIONS
    // ========================================
    function getTotalProduction() {
        const s = bgavState.simulation;
        return s.produktionLeben + s.produktionKranken + s.produktionSchaden +
               s.bestandLeben + s.bestandKranken + s.bestandSchaden;
    }

    function getKarriereFactor() {
        const total = getTotalProduction();
        const stufe = karriereStufen.find(s => total >= s.min && total < s.max) || karriereStufen[karriereStufen.length - 1];
        return stufe;
    }

    function calculateProvisions() {
        const s = bgavState.simulation;
        const factor = getKarriereFactor().factor;
        const results = { alt: {}, bgav: {} };

        ['alt', 'bgav'].forEach(model => {
            const rates = model === 'alt' ? bgavRates.altModell : bgavRates.bgav;
            let totalAP = 0, totalBP = 0;

            const segments = {
                leben: { ng: s.produktionLeben, best: s.bestandLeben },
                kranken: { ng: s.produktionKranken, best: s.bestandKranken },
                schaden: { ng: s.produktionSchaden, best: s.bestandSchaden }
            };

            Object.keys(segments).forEach(seg => {
                const segData = segments[seg];
                const r = rates[seg];
                const ap = (segData.ng * r.ap / 100) * factor;
                const bp = (segData.best * r.bp / 100);
                totalAP += ap;
                totalBP += bp;
                results[model][seg] = { ap, bp, total: ap + bp };
            });

            results[model].totalAP = totalAP;
            results[model].totalBP = totalBP;
            results[model].total = totalAP + totalBP;
        });

        results.delta = {
            totalAP: results.bgav.totalAP - results.alt.totalAP,
            totalBP: results.bgav.totalBP - results.alt.totalBP,
            total: results.bgav.total - results.alt.total,
            percent: results.alt.total > 0 ? ((results.bgav.total - results.alt.total) / results.alt.total * 100) : 0
        };

        return results;
    }

    function updateSimulationResults() {
        const results = calculateProvisions();

        // Update KPI cards
        setText('bgavKpi_altGesamt', formatEuro(results.alt.total));
        setText('bgavKpi_bgavGesamt', formatEuro(results.bgav.total));

        const delta = results.delta.total;
        setText('bgavKpi_delta', (delta >= 0 ? '+' : '') + formatEuro(delta));
        setText('bgavKpi_deltaPercent', (results.delta.percent >= 0 ? '+' : '') + results.delta.percent.toFixed(1) + '%');

        const deltaCard = document.getElementById('bgavKpiDeltaCard');
        if (deltaCard) {
            deltaCard.className = 'bgav-kpi-card ' + (delta >= 0 ? 'status-success' : 'status-danger');
        }

        // Update Karrierestufe
        const stufe = getKarriereFactor();
        setText('bgavKpi_karriere', stufe.label);
        setText('bgavKpi_karriereFactor', 'Faktor ' + stufe.factor.toFixed(2) + 'x');

        // Update simulation tab KPI cards (tab 2)
        setText('bgavKpi_altGesamt2', formatEuro(results.alt.total));
        setText('bgavKpi_bgavGesamt2', formatEuro(results.bgav.total));
        setText('bgavKpi_delta2', (delta >= 0 ? '+' : '') + formatEuro(delta));
        setText('bgavKpi_karriere2', stufe.label);
        const deltaCard2 = document.getElementById('bgavKpiDeltaCard2');
        if (deltaCard2) {
            deltaCard2.className = 'bgav-kpi-card ' + (delta >= 0 ? 'status-success' : 'status-danger');
        }

        // Update Stammdaten sidebar mini bar chart
        updateStammdatenChart(results);

        // Update detail table
        updateSimDetailTable(results);

        // Update chart
        renderSimChart(results);

        // Update provision rates table
        renderRatesTable();

        // Update Leistungsstufen
        renderLeistungsstufen();

        // Update 5-year projection
        render5YearChart(results);
    }

    function updateStammdatenChart(results) {
        const canvas = document.getElementById('bgavStammCompareChart');
        const valAlt = document.getElementById('bgavStammValAlt');
        const valNeu = document.getElementById('bgavStammValNeu');
        const deltaVal = document.getElementById('bgavStammDeltaVal');
        const deltaPct = document.getElementById('bgavStammDeltaPct');
        const deltaWrap = document.getElementById('bgavStammDelta');

        // Update values
        if (valAlt) valAlt.textContent = formatEuro(results.alt.total);
        if (valNeu) valNeu.textContent = formatEuro(results.bgav.total);

        // Update delta
        const delta = results.bgav.total - results.alt.total;
        const pct = results.alt.total > 0 ? ((delta / results.alt.total) * 100) : 0;
        if (deltaVal) deltaVal.textContent = (delta >= 0 ? '+' : '') + formatEuro(delta);
        if (deltaPct) deltaPct.textContent = '(' + (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%)';
        if (deltaWrap) {
            deltaWrap.classList.toggle('negative', delta < 0);
        }

        // Render Chart.js bar chart
        if (!canvas) return;
        if (window._bgavStammChart) window._bgavStammChart.destroy();
        resetCanvas(canvas);

        window._bgavStammChart = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Leben', 'Kranken', 'S/U'],
                datasets: [
                    {
                        label: 'Alt',
                        data: [results.alt.leben.total, results.alt.kranken.total, results.alt.schaden.total],
                        backgroundColor: 'rgba(148, 163, 184, 0.5)',
                        borderRadius: 4,
                        barPercentage: 0.5,
                        categoryPercentage: 0.7
                    },
                    {
                        label: 'Neu',
                        data: [results.bgav.leben.total, results.bgav.kranken.total, results.bgav.schaden.total],
                        backgroundColor: 'rgba(0, 163, 224, 0.8)',
                        borderRadius: 4,
                        barPercentage: 0.5,
                        categoryPercentage: 0.7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: 'rgba(255,255,255,0.6)',
                            font: { size: 10, weight: '600' },
                            usePointStyle: true,
                            padding: 8,
                            boxWidth: 8
                        }
                    },
                    tooltip: {
                        ...bgavTooltipStyle,
                        callbacks: {
                            label: function(c) { return ' ' + c.dataset.label + ':  ' + formatEuro(c.raw); }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255,255,255,0.4)',
                            font: { size: 9 },
                            callback: function(v) { return (v / 1000) + 'k'; }
                        },
                        grid: { color: 'rgba(255,255,255,0.06)' }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255,255,255,0.5)',
                            font: { size: 10, weight: '600' }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    function updateSimDetailTable(results) {
        const tbody = document.getElementById('bgavSimTableBody');
        if (!tbody) return;

        const segments = ['leben', 'kranken', 'schaden'];
        const labels = { leben: 'Leben', kranken: 'Kranken', schaden: 'Schaden/Unfall' };
        const icons = { leben: '&#x1F6E1;', kranken: '&#x2764;', schaden: '&#x1F3E0;' };

        let html = '';
        segments.forEach(seg => {
            const alt = results.alt[seg];
            const bgav = results.bgav[seg];
            const d = bgav.total - alt.total;

            html += `<tr>
                <td><strong>${labels[seg]}</strong></td>
                <td>${formatEuro(alt.ap)}</td>
                <td>${formatEuro(alt.bp)}</td>
                <td><strong>${formatEuro(alt.total)}</strong></td>
                <td>${formatEuro(bgav.ap)}</td>
                <td>${formatEuro(bgav.bp)}</td>
                <td><strong>${formatEuro(bgav.total)}</strong></td>
                <td class="${d >= 0 ? 'positive' : 'negative'}" style="font-weight:700; color: ${d >= 0 ? '#16a34a' : '#dc2626'}">
                    ${d >= 0 ? '+' : ''}${formatEuro(d)}
                </td>
            </tr>`;
        });

        // Total row
        const td = results.delta.total;
        html += `<tr style="font-weight: 800; background: #f8fafc;">
            <td>Gesamt</td>
            <td>${formatEuro(results.alt.totalAP)}</td>
            <td>${formatEuro(results.alt.totalBP)}</td>
            <td style="color: #0C2340;">${formatEuro(results.alt.total)}</td>
            <td>${formatEuro(results.bgav.totalAP)}</td>
            <td>${formatEuro(results.bgav.totalBP)}</td>
            <td style="color: #0C2340;">${formatEuro(results.bgav.total)}</td>
            <td style="color: ${td >= 0 ? '#16a34a' : '#dc2626'};">${td >= 0 ? '+' : ''}${formatEuro(td)}</td>
        </tr>`;

        tbody.innerHTML = html;
    }

    // ========================================
    // SLIDER SETUP
    // ========================================
    function setupSliders() {
        const sliders = document.querySelectorAll('.bgav-sim-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', function() {
                const field = this.dataset.field;
                const value = parseInt(this.value);
                const defaultVal = parseInt(this.dataset.default);
                bgavState.simulation[field] = value;

                // Update display – show ref value when slider differs from default
                const display = document.getElementById('bgavSliderVal_' + field);
                if (display) {
                    if (value !== defaultVal) {
                        display.innerHTML = formatEuro(value) + ' <span class="bgav-slider-ref">(Ref: ' + formatEuro(defaultVal) + ')</span>';
                    } else {
                        display.textContent = formatEuro(value);
                    }
                }

                updateSimulationResults();
            });
        });
    }

    // ========================================
    // CHART RENDERING
    // ========================================
    // Helper: Reset canvas to original dimensions before Chart.js re-creates
    function resetCanvas(canvas) {
        // Remove inline styles that Chart.js adds (width/height)
        canvas.style.width = '';
        canvas.style.height = '';
        // Restore original attribute dimensions
        const origW = canvas.getAttribute('width');
        const origH = canvas.getAttribute('height');
        if (origW) canvas.width = parseInt(origW);
        if (origH) canvas.height = parseInt(origH);
    }

    // Multi-level Leistungsstufen plugin – draws multiple LS lines per chart
    const lsLinesPlugin = {
        id: 'lsLines',
        beforeDatasetsDraw(chart) {
            const cfg = chart.options.plugins.lsLines;
            if (!cfg || !cfg.levels) return;

            const { ctx, chartArea: { left, right, top, bottom }, scales: { y } } = chart;
            ctx.save();

            cfg.levels.forEach(level => {
                const yPos = y.getPixelForValue(level.min);
                if (yPos < top - 5 || yPos > bottom + 5) return;

                const reached = cfg.currentValue >= level.min;

                // Dashed LS line
                ctx.beginPath();
                ctx.setLineDash([6, 3]);
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = reached ? level.color : '#cbd5e1';
                ctx.moveTo(left, yPos);
                ctx.lineTo(right, yPos);
                ctx.stroke();
                ctx.setLineDash([]);

                // LS label on right side above line
                ctx.font = 'bold 11px system-ui, sans-serif';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                ctx.fillStyle = reached ? level.color : '#94a3b8';
                ctx.fillText(level.label + ' ' + formatEuro(level.min), right - 4, yPos - 5);
            });

            ctx.restore();
        }
    };

    // Store chart instances
    const _sparteCharts = {};

    function renderSimChart(results) {
        const sparten = [
            { key: 'leben',   canvasId: 'bgavSimChartLeben',   badgeId: 'bgavSparteBadgeLeben' },
            { key: 'kranken', canvasId: 'bgavSimChartKranken', badgeId: 'bgavSparteBadgeKranken' },
            { key: 'schaden', canvasId: 'bgavSimChartSchaden', badgeId: 'bgavSparteBadgeSchaden' }
        ];

        sparten.forEach(sp => {
            const canvas = document.getElementById(sp.canvasId);
            if (!canvas) return;

            // Destroy existing chart
            if (_sparteCharts[sp.key]) {
                _sparteCharts[sp.key].destroy();
            }
            resetCanvas(canvas);

            const altVal  = results.alt[sp.key].total;
            const bgavVal = results.bgav[sp.key].total;
            const levels  = sparteLevels[sp.key];
            const highestReached = [...levels].reverse().find(l => bgavVal >= l.min);
            const highestLevel = levels[levels.length - 1];

            // Update badge – show which LS level was reached
            const badge = document.getElementById(sp.badgeId);
            if (badge) {
                if (highestReached) {
                    badge.className = 'bgav-sparte-badge reached';
                    badge.textContent = highestReached.label;
                } else {
                    badge.className = 'bgav-sparte-badge open';
                    badge.textContent = 'unter LS 1';
                }
            }

            // Y-axis max: at least 115% of highest level or max value
            const yMax = Math.max(highestLevel.min * 1.15, altVal * 1.15, bgavVal * 1.15);

            // BGAV bar color based on highest reached level
            const bgavBorderColor = highestReached ? highestReached.color : '#00A3E0';
            const bgavBg = highestReached ? highestReached.color + 'b3' : 'rgba(0, 163, 224, 0.7)';

            const ctx = canvas.getContext('2d');
            _sparteCharts[sp.key] = new Chart(ctx, {
                type: 'bar',
                plugins: [lsLinesPlugin],
                data: {
                    labels: ['Alt-Modell', 'BGAV'],
                    datasets: [{
                        data: [altVal, bgavVal],
                        backgroundColor: [
                            'rgba(148, 163, 184, 0.65)',
                            bgavBg
                        ],
                        borderColor: [
                            '#94a3b8',
                            bgavBorderColor
                        ],
                        borderWidth: [1, 2],
                        borderRadius: 6,
                        barPercentage: 0.55,
                        categoryPercentage: 0.7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 0 },
                    layout: { padding: { left: 14, right: 4, top: 4 } },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            ...bgavTooltipStyle,
                            callbacks: {
                                title: function(items) {
                                    return items[0].label;
                                },
                                label: function(context) {
                                    return ' Provision:  ' + formatEuro(context.raw);
                                }
                            }
                        },
                        lsLines: {
                            levels: levels,
                            currentValue: bgavVal
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: Math.ceil(yMax / 1000) * 1000,
                            ticks: {
                                callback: function(value) { return formatEuro(value); },
                                font: { size: 10 }
                            },
                            grid: { color: '#f1f5f9' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 11, weight: '600' } }
                        }
                    }
                }
            });
        });
    }

    // ========================================
    // PROVISIONSSÄTZE TABLE
    // ========================================
    function renderRatesTable() {
        const tbody = document.getElementById('bgavRatesTableBody');
        const note = document.getElementById('bgavRatesNote');
        if (!tbody) return;

        const stufe = getKarriereFactor();
        const sparten = [
            { key: 'leben',   label: 'Leben' },
            { key: 'kranken', label: 'Kranken' },
            { key: 'schaden', label: 'Schaden/Unfall' }
        ];

        let html = '';
        sparten.forEach(sp => {
            const alt = bgavRates.altModell[sp.key];
            const bgav = bgavRates.bgav[sp.key];
            const dAP = bgav.ap - alt.ap;
            const dBP = bgav.bp - alt.bp;

            html += `<tr>
                <td>${sp.label}</td>
                <td>${alt.ap.toFixed(1)} %</td>
                <td>${alt.bp.toFixed(2)} %</td>
                <td style="font-weight:700">${bgav.ap.toFixed(1)} %</td>
                <td style="font-weight:700">${bgav.bp.toFixed(2)} %</td>
                <td style="color:${dAP >= 0 ? '#16a34a' : '#dc2626'}">${dAP >= 0 ? '+' : ''}${dAP.toFixed(1)} %</td>
                <td style="color:${dBP >= 0 ? '#16a34a' : '#dc2626'}">${dBP >= 0 ? '+' : ''}${dBP.toFixed(2)} %</td>
            </tr>`;
        });

        tbody.innerHTML = html;

        if (note) {
            note.innerHTML = 'AP = Abschlussprovision auf Neugesch\u00E4ft \u00B7 BP = Bestandsprovision \u00B7 ' +
                'Karrierestufe <strong>' + stufe.label + '</strong> (' + stufe.factor.toFixed(2) + 'x) wird auf AP angerechnet';
        }
    }

    // ========================================
    // GANTT CHART RENDERING
    // ========================================
    // ========================================
    // LEISTUNGSSTUFEN RENDERING
    // ========================================
    function renderLeistungsstufen() {
        const grid = document.getElementById('bgavLeistungsstufenGrid');
        if (!grid) return;

        const stufe = getKarriereFactor();
        const results = calculateProvisions();
        let html = '';

        karriereStufen.forEach(s => {
            const reached = getTotalProduction() >= s.min;
            const isCurrent = s.key === stufe.key;
            const maxLabel = s.max === Infinity ? '+' : formatEuro(s.max);

            html += `<div class="bgav-ls-card ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}">
                <div class="ls-check">&#10003;</div>
                <div class="ls-name">${s.label}</div>
                <div class="ls-range">${formatEuro(s.min)} &ndash; ${maxLabel}</div>
                <div class="ls-factor">${s.factor.toFixed(2)}x</div>
                <div class="ls-rates">Provisionsfaktor auf AP</div>
            </div>`;
        });

        // Per-Sparte Leistungsstufen section
        const sparteLabels = { leben: 'Leben', kranken: 'Kranken', schaden: 'Schaden/Unfall' };
        html += `<div class="bgav-ls-sparte-goals">`;

        Object.keys(sparteLevels).forEach(key => {
            const levels = sparteLevels[key];
            const current = results.bgav[key].total;
            const highestReached = [...levels].reverse().find(l => current >= l.min);
            const topLevel = levels[levels.length - 1];
            const pct = Math.min((current / topLevel.min) * 100, 100);

            html += `<div class="bgav-ls-sparte-card ${highestReached ? 'reached' : ''}">
                <div class="sparte-goal-header">
                    <span class="sparte-goal-name">${sparteLabels[key]}</span>
                    <span class="sparte-goal-badge ${highestReached ? 'reached' : ''}">${highestReached ? highestReached.label : 'unter LS 1'}</span>
                </div>
                <div class="sparte-goal-bar-track">
                    <div class="sparte-goal-bar-fill ${highestReached ? 'reached' : ''}" style="width: ${pct}%; background: ${highestReached ? highestReached.color : '#e2e8f0'}"></div>
                </div>
                <div class="sparte-goal-values">
                    <span>${formatEuro(current)}</span>
                    <span>N&auml;chste: ${highestReached && highestReached.key !== topLevel.key
                        ? formatEuro(levels[levels.indexOf(highestReached) + 1].min)
                        : highestReached ? 'Max erreicht' : formatEuro(levels[0].min)}</span>
                </div>
                <div class="sparte-ls-steps">${levels.map(l =>
                    `<span class="sparte-ls-step ${current >= l.min ? 'active' : ''}" style="${current >= l.min ? 'color:' + l.color : ''}">${l.label}</span>`
                ).join('')}</div>
            </div>`;
        });
        html += `</div>`;

        grid.innerHTML = html;
    }

    // ========================================
    // 5-JAHRES PERSPEKTIVE CHART
    // ========================================
    function render5YearChart(results) {
        const canvas = document.getElementById('bgavSim5YearChart');
        if (!canvas) return;

        if (window._bgav5YearChart) window._bgav5YearChart.destroy();
        resetCanvas(canvas);

        const altTotal = results.alt.total;
        const bgavTotal = results.bgav.total;
        // Simulate 5-year growth: Alt flat, BGAV grows with compounding bestand
        const years = ['2026', '2027', '2028', '2029', '2030'];
        const altData = years.map((_, i) => Math.round(altTotal * (1 + i * 0.01)));
        const bgavData = years.map((_, i) => Math.round(bgavTotal * (1 + i * 0.035)));

        window._bgav5YearChart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Alt-Modell',
                        data: altData,
                        borderColor: '#94a3b8',
                        backgroundColor: 'rgba(148,163,184,0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: '#94a3b8'
                    },
                    {
                        label: 'BGAV-Modell',
                        data: bgavData,
                        borderColor: '#00A3E0',
                        backgroundColor: 'rgba(0,163,224,0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 5,
                        pointBackgroundColor: '#00A3E0'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 },
                plugins: {
                    legend: { position: 'top', labels: { font: { size: 12, weight: '600' }, usePointStyle: true, padding: 16 } },
                    tooltip: { ...bgavTooltipStyle, callbacks: { label: function(c) { return ' ' + c.dataset.label + ':  ' + formatEuro(c.raw); } } }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: { callback: function(v) { return formatEuro(v); }, font: { size: 11 } },
                        grid: { color: 'rgba(0,0,0,0.04)' }
                    },
                    x: { grid: { display: false }, ticks: { font: { size: 12, weight: '600' } } }
                }
            }
        });
    }

    // ========================================
    // ÜBERSICHT TAB (PDF Page 2)
    // ========================================
    const mockVermittler = [
        { nr: '00601257', name: 'Alexander Schreibling', status: 'Vertrag unterz./nicht eingegangen', apAlt: null, apNeu: null, fpAlt: null, fpNeu: null, sonst: null, zusch: null, zusatz: null, vergAlt: null, vergSim: null, diff: 0 },
        { nr: '00601013', name: 'Ali Haydar Koc', status: 'Vertrag unterz./nicht eingegangen', apAlt: 17815, apNeu: 21561, fpAlt: 54565, fpNeu: 56431, sonst: null, zusch: 1500, zusatz: 1500, vergAlt: 73879, vergSim: 79492, diff: 5613 },
        { nr: '00601167', name: 'Amira Harrami', status: 'Austritt', apAlt: 4502, apNeu: 3723, fpAlt: 10914, fpNeu: 11116, sonst: null, zusch: null, zusatz: null, vergAlt: 15416, vergSim: 14839, diff: -577 },
        { nr: '00600152', name: 'Anders OHG', status: 'Vertrag unterz./nicht eingegangen', apAlt: 146285, apNeu: 195287, fpAlt: 194038, fpNeu: 194038, sonst: null, zusch: 12000, zusatz: 27400, vergAlt: 401723, vergSim: 401324, diff: 21601 },
        { nr: '00601174', name: 'Andre Caspar', status: 'Vertrag erneuert (Tranche 3)', apAlt: 1491760, apNeu: 1542575, fpAlt: 2646883, fpNeu: 2648883, sonst: null, zusch: 3702630, zusatz: 24000, vergAlt: 7867273, vergSim: 4215458, diff: -3651815 },
        { nr: '00601246', name: 'Andrea Salamone', status: 'Vertrag unterz./nicht eingegangen', apAlt: 6665, apNeu: 10107, fpAlt: 5374, fpNeu: 4021, sonst: null, zusch: null, zusatz: null, vergAlt: 12039, vergSim: 33328, diff: 2089 },
        { nr: '00600565', name: 'Anne Schulte-Gosewinkel', status: 'Vertrag unterz./nicht eingegangen', apAlt: 28842, apNeu: 38840, fpAlt: 51500, fpNeu: 57509, sonst: null, zusch: 6000, zusatz: null, vergAlt: 92350, vergSim: 96349, diff: 3999 },
        { nr: '00601261', name: 'Apostolos Konstantinidis', status: 'Vertrag unterz./nicht eingegangen', apAlt: 1127, apNeu: 2039, fpAlt: 215, fpNeu: 215, sonst: null, zusch: 24000, zusatz: null, vergAlt: 25341, vergSim: 27153, diff: 1812 },
        { nr: '00601271', name: 'Ardit Bytyqi', status: 'Vertrag unterz./nicht eingegangen', apAlt: null, apNeu: 0, fpAlt: null, fpNeu: 0, sonst: null, zusch: 24000, zusatz: null, vergAlt: 24000, vergSim: 24000, diff: 0 },
        { nr: '00601144', name: 'Becker Finanz GmbH und Co. KG', status: 'Vertrag erneuert (Tranche 3)', apAlt: 159869, apNeu: 417276, fpAlt: 238897, fpNeu: 239758, sonst: 86158, zusch: 129600, zusatz: 25000, vergAlt: 639524, vergSim: 726633, diff: 87109 },
        { nr: '00601266', name: 'Bertan Edes', status: 'Austritt', apAlt: null, apNeu: 0, fpAlt: null, fpNeu: 0, sonst: null, zusch: null, zusatz: null, vergAlt: 19200, vergSim: null, diff: -19200 },
    ];

    function renderUebersichtTab() {
        renderUbVermittlerTable();
        renderUbVzChart();
        renderUbDistributionCharts();
        renderUbZuschuesseChart();
    }

    function renderUbVermittlerTable() {
        const tbody = document.getElementById('bgavUbTableBody');
        if (!tbody) return;

        let html = '';
        mockVermittler.forEach(vm => {
            const diffClass = vm.diff > 0 ? 'color:#16a34a' : vm.diff < 0 ? 'color:#dc2626' : '';
            const diffSign = vm.diff > 0 ? '+' : '';
            html += `<tr>
                <td style="font-size:10px; color:#94a3b8;">${vm.nr}</td>
                <td><strong>${vm.name}</strong></td>
                <td style="font-size:10px;">${vm.status}</td>
                <td>${vm.apAlt != null ? formatEuro(vm.apAlt) : '&ndash;'}</td>
                <td>${vm.apNeu != null ? formatEuro(vm.apNeu) : '&ndash;'}</td>
                <td>${vm.fpAlt != null ? formatEuro(vm.fpAlt) : '&ndash;'}</td>
                <td>${vm.fpNeu != null ? formatEuro(vm.fpNeu) : '&ndash;'}</td>
                <td>${vm.sonst != null ? formatEuro(vm.sonst) : '&ndash;'}</td>
                <td>${vm.zusch != null ? formatEuro(vm.zusch) : '&ndash;'}</td>
                <td>${vm.zusatz != null ? formatEuro(vm.zusatz) : '&ndash;'}</td>
                <td>${vm.vergAlt != null ? formatEuro(vm.vergAlt) : '&ndash;'}</td>
                <td>${vm.vergSim != null ? formatEuro(vm.vergSim) : '&ndash;'}</td>
                <td style="font-weight:700; ${diffClass}">${diffSign}${formatEuro(vm.diff)}</td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }

    function renderUbVzChart() {
        const canvas = document.getElementById('bgavUbVzChart');
        if (!canvas) return;
        if (window._bgavUbVzChart) window._bgavUbVzChart.destroy();
        resetCanvas(canvas);

        window._bgavUbVzChart = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['(Null)', '< 0%', '0-5%', '5-10%', '> 10%'],
                datasets: [{
                    data: [4, 15, 12, 18, 19],
                    backgroundColor: ['#94a3b8', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'],
                    borderRadius: 4,
                    barPercentage: 0.7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { font: { size: 10 }, color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.06)' } },
                    x: { ticks: { font: { size: 9 }, color: 'rgba(255,255,255,0.5)' }, grid: { display: false } }
                }
            }
        });
    }

    function renderUbDistributionCharts() {
        const configs = [
            { id: 'bgavUbChartSU', labels: ['40%','60%','70%','80%','90%'], data: [28, 13, 13, 7, 3] },
            { id: 'bgavUbChartKV', labels: ['3,75MB','5,25MB','6,25MB','6,75MB','7,25MB'], data: [20, 24, 10, 5, 5] },
            { id: 'bgavUbChartLV', labels: ['1,5%','2,0%','2,3%','2,5%','2,7%'], data: [29, 24, 13, 7, 5] }
        ];

        configs.forEach(cfg => {
            const canvas = document.getElementById(cfg.id);
            if (!canvas) return;
            const key = '_bgav_' + cfg.id;
            if (window[key]) window[key].destroy();
            resetCanvas(canvas);

            window[key] = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: cfg.labels,
                    datasets: [{
                        data: cfg.data,
                        backgroundColor: '#0C2340',
                        borderRadius: 3,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
                        x: { ticks: { font: { size: 8 }, maxRotation: 45 }, grid: { display: false } }
                    }
                }
            });
        });

        // Agenturfunktionen chart
        const aCanvas = document.getElementById('bgavUbChartAgentur');
        if (aCanvas) {
            if (window._bgavUbAgentur) window._bgavUbAgentur.destroy();
            resetCanvas(aCanvas);
            window._bgavUbAgentur = new Chart(aCanvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['GST', 'HGST', 'GA I', 'BD II', 'BD I'],
                    datasets: [{
                        data: [26, 12, 12, 11, 11],
                        backgroundColor: '#0C2340',
                        borderRadius: 3,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
                        x: { ticks: { font: { size: 10, weight: '600' } }, grid: { display: false } }
                    }
                }
            });
        }
    }

    function renderUbZuschuesseChart() {
        const canvas = document.getElementById('bgavUbChartZuschuesse');
        if (!canvas) return;
        if (window._bgavUbZusch) window._bgavUbZusch.destroy();
        resetCanvas(canvas);

        window._bgavUbZusch = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Alt', 'Neu'],
                datasets: [
                    { label: 'Allgemeiner Zuschuss', data: [736395, 595285], backgroundColor: '#334155', borderRadius: 4 },
                    { label: 'Bürozuschuss', data: [101835, 101835], backgroundColor: '#00A3E0', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { size: 10 }, usePointStyle: true, padding: 10 } },
                    tooltip: { ...bgavTooltipStyle, callbacks: { label: function(c) { return ' ' + c.dataset.label + ':  ' + formatEuro(c.raw); } } }
                },
                scales: {
                    y: { beginAtZero: true, stacked: true, ticks: { callback: function(v) { return formatEuro(v); }, font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
                    x: { stacked: true, ticks: { font: { size: 12, weight: '700' } }, grid: { display: false } }
                }
            }
        });
    }

    // ========================================
    // CHAT BOT (Mock Mode)
    // ========================================
    const bgavChatResponses = {
        'default': 'Ich bin der BGAV-Umstellungsassistent. Ich kann Ihnen bei Fragen zur Vertragsumstellung, Provisionssimulation und dem ICM2026 Projekt helfen. Was möchten Sie wissen?',

        'provision|vergütung|commission': `Die BGAV-Umstellung bringt folgende Änderungen:

**Abschlussprovision (AP):**
- Leben: 2.0% → 1.8% (leicht reduziert)
- Kranken: 5.0% → 4.5%
- SHUK: 15.0% → 13.0%

**Bestandsprovision (BP):**
- Leben: 0.3% → 0.45% (deutlich erhöht!)
- Kranken: 0.5% → 0.7%
- SHUK: 2.0% → 3.0%

**Fazit:** Der Fokus verschiebt sich hin zu nachhaltiger Bestandsprovision. Bei einem gesunden Bestand profitieren die meisten Vermittler.`,

        'blindpool|sammelvermittler': `Der aktuelle **Blindpool** nutzt eine Sammelvermittlernummer als Zwischenlösung:

- Vermittler sind in der silofremden Systemwelt unbekannt
- Nutzung einer Sammel-VM-Nr. + Fremdordnungsmerkmal
- **Empfohlene Lösung (Option 4):** Gegenseitige Stammdatenanlage & Demaskierung
- Ziel: Jeder ex-B. VM erhält Allis-Nr., VDAGT-Nr. und GLBK-Nr.
- Deadline: 30.06.2026 (altes ex-B. Produktportfolio wird eingestellt)`,

        'timeline|zeitplan|roadmap': `**Projektplanung Provision 2026 ff.:**

**2026 – Kurzfristig:**
- Q1-Q2: Gegenseitige VM-Anlage & Anpassung SST/Servicelayer
- Q2-Q3: Definition Provisionsregelwerk für BÜ
- Q3-Q4: Systemupdates FS-ICM (NetWeaver/EHP8)

**2027 – Mittelfristig:**
- Umstellung echtes Neugeschäft in allen Sparten nach BGAV via FS-ICM
- S/4HANA Upgrade & Journey-to-Cloud
- Vereinheitlichung Abrechnung

**2028+ – Langfristig:**
- Weitere Kanäle & Bestandsgeschäft
- Vollständige Konsolidierung auf FS-ICM`,

        'icm2026|golive|status': `**ICM2026 GoLive Status:**

✅ Überführung ex-Barmenia Vermittler ins BGAV ✅
✅ Einheitliche AP/FP für SHUK in FS-ICM ✅
✅ Karrierestufen-Angleichung (Fahrstuhllogik) ✅
✅ Mitverdienerstrukturen inkl. Untervermittlerlogik ✅
✅ Neues BG-Produktportfolio provisionsseitig ✅

**Offene Herausforderungen:**
⚠ Keine identische vertragliche Grundlage ex-B./ex-G.
⚠ Keine gemeinsame Abrechnung (2 Abrechnungen)
⚠ Getrennte VM-Stammdatenhaltung
⚠ Zwei aktive Provisionssysteme parallel`,

        'stammdaten|mapping|datenmodell': `**Datenmodell-Mapping:**

**Ex-Barmenia:**
- Partner ↔ ADM-Nr. (8-stellig) + BP-ID (10-stellig)
- Pro Rolle: 1 Provisionsvertrag → 1 BD-VM-Nr.

**Ex-Gothaer:**
- Partner ↔ VPT-Nr. (10-stellig alphanumerisch)
- 1 VPT → n Allis-Nummern
- Je Allis: 1 VDAGT-Nr. + 1 GL-Bestandskennzeichen

**Mapping:** BP-ID ↔ VPT-Nr. (eindeutig pro Person) und BD-VM-Nr. ↔ Allis-Nr. als zentrale Schlüssel.`,

        'bestandsübertragung|übertragung': `**Silo-übergreifende Bestandsübertragung:**

Durch die Demaskierung (Thema I) können Bestände silo-übergreifend zugeordnet werden.

**Erwartete Aktivitäten:**
- Definition Provisionsregelwerk (GeVos, Storno, Minderung, Teilung)
- Anpassung Prüfservices zur Auswahl FS-ICM oder 3PA
- Anpassung Berechnungslogik Alt und Neu
- Vollumfängliche Tests

**Abhängigkeit:** Lösung I (Demaskierung) muss zuerst umgesetzt sein.`,

        'karrierestufe|revers|staffel': `**Karrierestufen / Revers-Staffelung:**

| Stufe | Produktionsvolumen | Faktor |
|-------|-------------------|--------|
| Basis | 0 - 100.000€ | 0.85x |
| Standard | 100.000 - 250.000€ | 0.95x |
| Premium | 250.000 - 500.000€ | 1.00x |
| Top | > 500.000€ | 1.10x |

Die Stufe basiert auf dem Gesamtproduktionsvolumen (Neugeschäft + Bestand) über alle Sparten.`
    };

    function initBgavChat() {
        const toggle = document.getElementById('bgavChatToggle');
        const widget = document.getElementById('bgavChatWidget');
        const closeBtn = document.getElementById('bgavChatClose');
        const sendBtn = document.getElementById('bgavChatSend');
        const input = document.getElementById('bgavChatInput');

        if (!toggle || !widget) return;

        toggle.addEventListener('click', () => {
            widget.classList.remove('hidden');
            toggle.style.display = 'none';
            if (input) input.focus();

            // Initial welcome message
            if (bgavState.chatMessages.length === 0) {
                addBgavChatMessage('bot welcome', `Willkommen zum **BGAV-Umstellungsassistenten**! Ich kann Ihnen bei Fragen zur Vertragsumstellung auf das neue Provisionsmodell BGAV helfen.\n\nWorüber möchten Sie mehr erfahren?`);
                addBgavChatSuggestions([
                    'Wie ändert sich meine Provision?',
                    'Was ist der Blindpool?',
                    'Zeitplan der Umstellung',
                    'ICM2026 Status'
                ]);
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                widget.classList.add('hidden');
                toggle.style.display = 'flex';
            });
        }

        if (sendBtn && input) {
            sendBtn.addEventListener('click', () => sendBgavChat());
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendBgavChat();
                }
            });
        }
    }

    function sendBgavChat() {
        const input = document.getElementById('bgavChatInput');
        if (!input) return;

        const msg = input.value.trim();
        if (!msg) return;

        input.value = '';
        addBgavChatMessage('user', msg);

        // Show typing indicator
        const body = document.getElementById('bgavChatBody');
        const typing = document.createElement('div');
        typing.className = 'bgav-typing';
        typing.id = 'bgavTyping';
        typing.innerHTML = '<span></span><span></span><span></span>';
        if (body) body.appendChild(typing);
        body.scrollTop = body.scrollHeight;

        // Find matching response
        setTimeout(() => {
            const typingEl = document.getElementById('bgavTyping');
            if (typingEl) typingEl.remove();

            const response = findBgavResponse(msg);
            addBgavChatMessage('bot', response);

            // Add follow-up suggestions
            addBgavChatSuggestions(getFollowUpSuggestions(msg));
        }, 800 + Math.random() * 600);
    }

    function findBgavResponse(query) {
        const q = query.toLowerCase();

        for (const [keywords, response] of Object.entries(bgavChatResponses)) {
            if (keywords === 'default') continue;
            const keys = keywords.split('|');
            if (keys.some(k => q.includes(k))) {
                return response;
            }
        }

        return bgavChatResponses.default;
    }

    function getFollowUpSuggestions(lastQuery) {
        const q = lastQuery.toLowerCase();
        if (q.includes('provision') || q.includes('vergütung')) {
            return ['Karrierestufen erklärt', 'Blindpool-Lösung', 'Timeline anzeigen'];
        }
        if (q.includes('blindpool') || q.includes('stamm')) {
            return ['Datenmodell-Mapping', 'Bestandsübertragung', 'ICM2026 Status'];
        }
        return ['Provision berechnen', 'Blindpool erklärt', 'Roadmap 2026-2028'];
    }

    function addBgavChatMessage(type, text) {
        const body = document.getElementById('bgavChatBody');
        if (!body) return;

        // Simple markdown rendering
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        const msg = document.createElement('div');
        msg.className = 'bgav-chat-msg ' + type;
        msg.innerHTML = html;
        body.appendChild(msg);
        body.scrollTop = body.scrollHeight;

        bgavState.chatMessages.push({ type, text });
    }

    function addBgavChatSuggestions(suggestions) {
        const body = document.getElementById('bgavChatBody');
        if (!body || !suggestions.length) return;

        const div = document.createElement('div');
        div.className = 'bgav-chat-suggestions';
        suggestions.forEach(s => {
            const btn = document.createElement('button');
            btn.textContent = s;
            btn.onclick = function() {
                const input = document.getElementById('bgavChatInput');
                if (input) {
                    input.value = s;
                    sendBgavChat();
                }
            };
            div.appendChild(btn);
        });
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    // ========================================
    // SHARED TOOLTIP STYLE
    // ========================================
    const bgavTooltipStyle = {
        backgroundColor: '#0C2340',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(0, 163, 224, 0.5)',
        borderWidth: 2,
        cornerRadius: 10,
        padding: 18,
        titleFont: { size: 16, weight: '700' },
        bodyFont: { size: 15, weight: '500' },
        displayColors: true,
        boxPadding: 6,
        caretSize: 10,
        caretPadding: 12
    };

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    function formatEuro(val) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(val);
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // ========================================
    // NAVIGATION: Open/Close BGAV Tool
    // ========================================

    // Shared helper: show BGAV page and hide everything else
    function showBgavPage() {
        const pages = ['landingPage', 'agenturOverview', 'mainApp', 'kundenDetailPage', 'potentialAnalysePage', 'billingCheckPage'];
        pages.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const bgavPage = document.getElementById('bgavUmstellungPage');
        if (bgavPage) {
            bgavPage.style.display = 'block';
            initBgavUmstellung();
        }
    }

    // A-11: BGAV Übersicht (Vermittler-Tabelle + Charts)
    function openBgavUebersicht() {
        showBgavPage();
        switchBgavTab('uebersicht');

        if (window.AppRouter) {
            AppRouter.navigate('/bgav-uebersicht');
        } else if (window.history && window.history.pushState) {
            window.history.pushState({ view: 'bgav-uebersicht' }, '', '#/bgav-uebersicht');
        }

        setTimeout(() => {
            if (typeof PageIDTracker !== 'undefined') {
                PageIDTracker.setPageId('A-11');
            }
        }, 50);
    }

    // A-12: BGAV Simulation (Provisions-Rechner)
    function openBgavTool() {
        showBgavPage();
        switchBgavTab('simulation');

        if (window.AppRouter) {
            AppRouter.navigate('/bgav-umstellung');
        } else if (window.history && window.history.pushState) {
            window.history.pushState({ view: 'bgav-umstellung' }, '', '#/bgav-umstellung');
        }

        // Chat-Widget automatisch aufklappen
        setTimeout(() => {
            const widget = document.getElementById('bgavChatWidget');
            const toggle = document.getElementById('bgavChatToggle');
            const input = document.getElementById('bgavChatInput');
            if (widget) {
                widget.classList.remove('hidden');
                if (toggle) toggle.style.display = 'none';
                if (input) input.focus();
                // Welcome-Nachricht falls noch keine Nachrichten
                if (bgavState.chatMessages.length === 0) {
                    addBgavChatMessage('bot', `Willkommen zum **BGAV-Umstellungsassistenten**! Ich kann Ihnen bei Fragen zur Vertragsumstellung auf das neue Provisionsmodell BGAV helfen.\n\nWorüber möchten Sie mehr erfahren?`);
                    addBgavChatSuggestions([
                        'Wie ändert sich meine Provision?',
                        'Was ist der Blindpool?',
                        'Zeitplan der Umstellung',
                        'ICM2026 Status'
                    ]);
                }
            }
        }, 100);

        setTimeout(() => {
            if (typeof PageIDTracker !== 'undefined') {
                PageIDTracker.setPageId('A-12');
            }
        }, 50);
    }

    function closeBgavTool() {
        const bgavPage = document.getElementById('bgavUmstellungPage');
        if (bgavPage) bgavPage.style.display = 'none';

        // Reset zoom that BGAV may have applied
        document.documentElement.style.zoom = '';
        document.documentElement.style.transform = '';
        document.documentElement.style.transformOrigin = '';

        // Show landing page (flex for proper centering)
        const landing = document.getElementById('landingPage');
        if (landing) landing.style.display = 'flex';

        // Re-apply landing zoom if available
        if (typeof applyAutoZoom === 'function') {
            setTimeout(applyAutoZoom, 50);
        }

        // Reset URL hash
        if (window.AppRouter) {
            AppRouter.navigate('/landing');
        } else if (window.history && window.history.pushState) {
            window.history.pushState({ view: 'landing' }, '', '#/');
        }

        if (typeof PageIDTracker !== 'undefined') {
            PageIDTracker.setPageId('M-01');
        }
    }

    // ========================================
    // EXPORT GLOBALS
    // ========================================
    window.openBgavUebersicht = openBgavUebersicht;
    window.openBgavTool = openBgavTool;
    window.closeBgavTool = closeBgavTool;
    window.initBgavUmstellung = initBgavUmstellung;
    window.sendBgavChat = sendBgavChat;
    window.switchBgavTab = switchBgavTab;

})();
