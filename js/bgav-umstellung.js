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
        currentTab: 'uebersicht',
        vermittler: {
            name: 'Max Mustermann',
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
        renderGanttChart();
        initBgavChat();

        // Page ID update
        if (typeof PageIDTracker !== 'undefined') {
            PageIDTracker.setPageId('M-01');
        }
    }

    // ========================================
    // VERMITTLER PHOTO COPY FROM A-02
    // ========================================
    function copyVermittlerPhoto() {
        const sourceImg = document.getElementById('agenturPhotoImgSmall');
        const targetImg = document.getElementById('bgavVermittlerPhoto');
        const targetPlaceholder = document.getElementById('bgavVermittlerPhotoPlaceholder');

        if (sourceImg && sourceImg.style.display !== 'none' && sourceImg.src) {
            if (targetImg) {
                targetImg.src = sourceImg.src;
                targetImg.style.display = 'block';
            }
            if (targetPlaceholder) {
                targetPlaceholder.style.display = 'none';
            }
        }
    }

    // ========================================
    // TAB NAVIGATION
    // ========================================
    function setupBgavTabs() {
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

        // Update detail table
        updateSimDetailTable(results);

        // Update chart
        renderSimChart(results);
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
                bgavState.simulation[field] = value;

                // Update display
                const display = document.getElementById('bgavSliderVal_' + field);
                if (display) display.textContent = formatEuro(value);

                updateSimulationResults();
            });
        });
    }

    // ========================================
    // CHART RENDERING
    // ========================================
    function renderSimChart(results) {
        const canvas = document.getElementById('bgavSimChart');
        if (!canvas) return;

        // Destroy existing chart
        if (window._bgavSimChart) {
            window._bgavSimChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        window._bgavSimChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Leben', 'Kranken', 'Schaden/Unfall'],
                datasets: [
                    {
                        label: 'Alt-Modell (AP+BP)',
                        data: [results.alt.leben.total, results.alt.kranken.total, results.alt.schaden.total],
                        backgroundColor: 'rgba(148, 163, 184, 0.7)',
                        borderColor: '#94a3b8',
                        borderWidth: 1,
                        borderRadius: 6,
                        barPercentage: 0.4,
                        categoryPercentage: 0.7
                    },
                    {
                        label: 'BGAV-Modell (AP+BP)',
                        data: [results.bgav.leben.total, results.bgav.kranken.total, results.bgav.schaden.total],
                        backgroundColor: 'rgba(0, 163, 224, 0.7)',
                        borderColor: '#00A3E0',
                        borderWidth: 1,
                        borderRadius: 6,
                        barPercentage: 0.4,
                        categoryPercentage: 0.7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { font: { size: 12, weight: '600' }, usePointStyle: true, padding: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatEuro(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) { return formatEuro(value); },
                            font: { size: 11 }
                        },
                        grid: { color: '#f1f5f9' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 12, weight: '600' } }
                    }
                }
            }
        });
    }

    // ========================================
    // GANTT CHART RENDERING
    // ========================================
    function renderGanttChart() {
        const container = document.getElementById('bgavGanttContainer');
        if (!container) return;

        const items = [
            { label: 'I. Defizite Sammel-VM-Nr.', tag: 'fachlich', start: 0, end: 5, color: '#0C2340' },
            { label: 'II. Silo-übergr. BÜ', tag: 'fachlich', start: 2, end: 8, color: '#1a6aa7' },
            { label: 'III. Eine Vergütung', tag: 'fachlich', start: 1, end: 12, color: '#00A3E0' },
            { label: 'IV. Vereinheitl. Abr.', tag: 'fachlich', start: 6, end: 10, color: '#38bdf8' },
            { label: 'V. Systemupdates FS-ICM', tag: 'technisch', start: 0, end: 6, color: '#7c3aed' },
            { label: 'VI. Performance-Opt.', tag: 'technisch', start: 2, end: 8, color: '#a78bfa' },
            { label: 'VII. Vertriebsreporting', tag: 'technisch', start: 5, end: 9, color: '#c4b5fd' },
            { label: 'VIII. S/4HANA & J2C', tag: 'technisch', start: 4, end: 12, color: '#8b5cf6' }
        ];

        const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

        let html = '<div class="bgav-gantt">';

        // Header
        html += '<div class="bgav-gantt-header">';
        html += '<div class="gantt-label">Thema</div>';
        html += '<div class="gantt-year" style="grid-column: 2 / 7;">2026</div>';
        html += '<div class="gantt-year" style="grid-column: 7 / 11;">2027</div>';
        html += '<div class="gantt-year" style="grid-column: 11 / 14;">2028 ff.</div>';
        html += '</div>';

        // Month labels
        html += '<div class="bgav-gantt-header" style="margin-bottom: 8px;">';
        html += '<div class="gantt-label"></div>';
        for (let i = 0; i < 12; i++) {
            html += `<div style="text-align:center; font-size:10px; color:#94a3b8; font-weight:600;">${months[i]}</div>`;
        }
        html += '</div>';

        // Rows
        items.forEach(item => {
            html += '<div class="bgav-gantt-row">';
            html += `<div class="row-label">
                <span class="label-tag ${item.tag}">${item.tag === 'fachlich' ? 'F' : 'T'}</span>
                ${item.label}
            </div>`;

            for (let i = 0; i < 12; i++) {
                if (i === item.start) {
                    const span = item.end - item.start;
                    html += `<div style="grid-column: ${i + 2} / ${item.end + 2};">
                        <div class="bgav-gantt-bar ${item.tag}" style="background: linear-gradient(90deg, ${item.color}, ${item.color}dd);" title="${item.label}: Monat ${item.start + 1} - ${item.end}">
                            ${span > 2 ? item.label.split('.')[0] + '.' : ''}
                        </div>
                    </div>`;
                    break;
                } else if (i > item.start && i < item.end) {
                    continue;
                } else {
                    html += '<div></div>';
                }
            }

            html += '</div>';
        });

        html += '</div>';
        container.innerHTML = html;
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
                addBgavChatMessage('bot', `Willkommen zum **BGAV-Umstellungsassistenten**! Ich kann Ihnen bei Fragen zur Vertragsumstellung auf das neue Provisionsmodell BGAV helfen.\n\nWorüber möchten Sie mehr erfahren?`);
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
    function openBgavTool() {
        // Hide all other pages
        const pages = ['landingPage', 'agenturOverview', 'mainApp', 'kundenDetailPage', 'potentialAnalysePage', 'billingCheckPage'];
        pages.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Show BGAV page
        const bgavPage = document.getElementById('bgavUmstellungPage');
        if (bgavPage) {
            bgavPage.style.display = 'block';
            initBgavUmstellung();
        }

        // Update page ID
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'versicherung', view: 'bgav-umstellung' }
        }));
    }

    function closeBgavTool() {
        const bgavPage = document.getElementById('bgavUmstellungPage');
        if (bgavPage) bgavPage.style.display = 'none';

        // Show landing page
        const landing = document.getElementById('landingPage');
        if (landing) landing.style.display = 'block';

        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'main', view: 'landing' }
        }));
    }

    // ========================================
    // EXPORT GLOBALS
    // ========================================
    window.openBgavTool = openBgavTool;
    window.closeBgavTool = closeBgavTool;
    window.initBgavUmstellung = initBgavUmstellung;
    window.sendBgavChat = sendBgavChat;
    window.switchBgavTab = switchBgavTab;

})();
