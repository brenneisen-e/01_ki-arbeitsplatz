(function(){var r=['hcCockpitData'];var m=r.filter(function(f){return typeof window[f]==='undefined'});if(m.length)console.error('[hc-cockpit-ui.js] Fehlende Deps:',m.join(', '),'← Lade hc-cockpit-data.js zuerst!');})();

function renderHCRiskMovers() {
    const tbody = document.getElementById('hcRiskMoversBody');
    if (!tbody) return;

    const filter = document.getElementById('hcMoversFilter')?.value || 'all';
    let movers = hcAgents.filter(a => Math.abs(a.change) > 10);

    if (filter === 'up') movers = movers.filter(a => a.change > 0);
    else if (filter === 'down') movers = movers.filter(a => a.change < 0);

    movers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    tbody.innerHTML = movers.slice(0, 15).map(a => `
        <tr class="${a.change > 0 ? 'hc-row-risk-up' : 'hc-row-risk-down'}">
            <td><strong>${a.id}</strong></td>
            <td>${a.rdName}</td>
            <td><span class="hc-risk-badge ${a.riskTier}">${a.riskScore}%</span></td>
            <td>${a.prevScore}%</td>
            <td class="${a.change > 0 ? 'hc-change-up' : 'hc-change-down'}">${a.change > 0 ? '↑' : '↓'} ${Math.abs(a.change)} Pkt.</td>
            <td>${a.topFactor}</td>
        </tr>
    `).join('');
}

// --- RENDER: Regions ---
function renderHCRegions() {
    renderHCHeatmap();
    renderHCLeagueTable();
    renderHCRadarChart();
}

function renderHCHeatmap() {
    const tbody = document.getElementById('hcHeatmapBody');
    if (!tbody) return;

    const sorted = [...hcRDData].sort((a, b) => b.composite - a.composite);

    tbody.innerHTML = sorted.map(rd => {
        const dims = ['retention', 'staffing', 'engagement', 'demographics', 'production', 'quality'];
        return `<tr>
            <td><strong>${rd.name}</strong><br><span class="hc-hm-region">${rd.region}</span></td>
            <td class="hc-hm-cell ${hcHeatColor(rd.composite)}">${rd.composite}</td>
            ${dims.map(d => `<td class="hc-hm-cell ${hcHeatColor(rd.metrics[d])}">${rd.metrics[d]}</td>`).join('')}
        </tr>`;
    }).join('');
}

function hcHeatColor(val) {
    if (val >= 75) return 'hc-heat-green';
    if (val >= 60) return 'hc-heat-lime';
    if (val >= 40) return 'hc-heat-yellow';
    if (val >= 25) return 'hc-heat-orange';
    return 'hc-heat-red';
}

function renderHCLeagueTable() {
    const tbody = document.getElementById('hcLeagueBody');
    if (!tbody) return;

    const sorted = [...hcRDData].sort((a, b) => b.composite - a.composite);

    tbody.innerHTML = sorted.map((rd, i) => {
        const sparkline = renderHCSparklineSVG(rd.trend, 80, 24);
        return `<tr onclick="selectHCRegion('${rd.id}')" style="cursor:pointer">
            <td>${i + 1}</td>
            <td><strong>${rd.name}</strong></td>
            <td><span class="hc-risk-badge ${rd.tier}">${rd.composite}</span></td>
            <td>${sparkline}</td>
            <td>${rd.headcount}</td>
            <td>${rd.turnoverRate}%</td>
            <td>${rd.vacancyRate.toFixed(1)}%</td>
        </tr>`;
    }).join('');
}

function renderHCSparklineSVG(data, width, height) {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data) - 5;
    const max = Math.max(...data) + 5;
    const range = max - min || 1;
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const lastVal = data[data.length - 1];
    const color = lastVal >= 75 ? '#16A34A' : lastVal >= 40 ? '#D97706' : '#DC2626';
    return `<svg width="${width}" height="${height}" class="hc-sparkline-svg"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5"/></svg>`;
}

function renderHCRadarChart() {
    const canvas = document.getElementById('hcRadarChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const rdId = document.getElementById('hcRadarSelect')?.value;
    const rd = hcRDData.find(r => r.id === rdId) || hcRDData[0];
    if (!rd) return;

    // Average benchmark
    const avg = {};
    ['retention', 'staffing', 'engagement', 'demographics', 'production', 'quality'].forEach(k => {
        avg[k] = Math.round(hcRDData.reduce((s, r) => s + r.metrics[k], 0) / hcRDData.length);
    });

    if (canvas._hcChart) canvas._hcChart.destroy();

    canvas._hcChart = new Chart(canvas, {
        type: 'radar',
        data: {
            labels: ['Retention', 'Besetzung', 'Engagement', 'Nachwuchs', 'Produktion', 'Qualität'],
            datasets: [
                {
                    label: rd.name,
                    data: [rd.metrics.retention, rd.metrics.staffing, rd.metrics.engagement, rd.metrics.demographics, rd.metrics.production, rd.metrics.quality],
                    borderColor: '#C8102E',
                    backgroundColor: 'rgba(200,16,46,0.1)',
                    borderWidth: 2,
                    pointRadius: 3
                },
                {
                    label: 'Benchmark (Ø)',
                    data: [avg.retention, avg.staffing, avg.engagement, avg.demographics, avg.production, avg.quality],
                    borderColor: '#6B7280',
                    backgroundColor: 'rgba(107,114,128,0.05)',
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    pointRadius: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, display: false }, grid: { color: 'rgba(0,0,0,0.08)' } } },
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// --- RENDER: Unit Detail ---
function renderHCUnitDetail() {
    const rdId = document.getElementById('hcUnitRDSelect')?.value || hcRDData[0]?.id;
    const rd = hcRDData.find(r => r.id === rdId);
    if (!rd) return;

    const unitAgents = hcAgents.filter(a => a.rdId === rdId);
    const title = document.getElementById('hcUnitTitle');
    if (title) title.textContent = `${rd.name} — Einheiten-Scorecard`;

    // Scorecard
    const scorecard = document.getElementById('hcUnitScorecard');
    if (scorecard) {
        const dims = [
            { label: 'Retention', value: rd.metrics.retention, weight: '25%' },
            { label: 'Besetzung', value: rd.metrics.staffing, weight: '15%' },
            { label: 'Engagement', value: rd.metrics.engagement, weight: '20%' },
            { label: 'Nachwuchs', value: rd.metrics.demographics, weight: '10%' },
            { label: 'Produktion', value: rd.metrics.production, weight: '15%' },
            { label: 'Qualität', value: rd.metrics.quality, weight: '15%' }
        ];
        scorecard.innerHTML = `
            <div class="hc-scorecard-header">
                <div class="hc-scorecard-composite ${rd.tier}">
                    <div class="hc-scorecard-score">${rd.composite}</div>
                    <div class="hc-scorecard-label">Gesamt</div>
                </div>
                <div class="hc-scorecard-meta">
                    <div><strong>${rd.headcount}</strong> AO-Vermittler (§84 HGB)</div>
                    <div>Fluktuation: <strong>${rd.turnoverRate}%</strong> | Vakanzen: <strong>${rd.budgeted - rd.headcount}</strong> (${rd.vacancyRate.toFixed(1)}%)</div>
                    <div>Region: ${rd.region}</div>
                </div>
            </div>
            <div class="hc-scorecard-dims">
                ${dims.map(d => `
                    <div class="hc-scorecard-dim">
                        <div class="hc-scorecard-dim-header">
                            <span>${d.label}</span>
                            <span class="hc-scorecard-weight">${d.weight}</span>
                        </div>
                        <div class="hc-progress-bar">
                            <div class="hc-progress-fill ${d.value >= 75 ? 'green' : d.value >= 40 ? 'amber' : 'red'}" style="width:${d.value}%"></div>
                        </div>
                        <div class="hc-scorecard-dim-value">${d.value}/100</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Age distribution
    renderHCBarChart('hcAgeDistribution', unitAgents, 'age', [
        { label: '<30', min: 0, max: 30 },
        { label: '30–39', min: 30, max: 40 },
        { label: '40–49', min: 40, max: 50 },
        { label: '50–59', min: 50, max: 60 },
        { label: '60+', min: 60, max: 100 }
    ]);

    // Tenure distribution
    renderHCBarChart('hcTenureDistribution', unitAgents, 'tenure', [
        { label: '<2J', min: 0, max: 2 },
        { label: '2–5J', min: 2, max: 6 },
        { label: '5–10J', min: 6, max: 11 },
        { label: '10–20J', min: 11, max: 21 },
        { label: '20+J', min: 21, max: 100 }
    ]);

    // Risk distribution
    const riskDist = document.getElementById('hcUnitRiskDist');
    if (riskDist) {
        const red = unitAgents.filter(a => a.riskTier === 'red').length;
        const amber = unitAgents.filter(a => a.riskTier === 'amber').length;
        const green = unitAgents.filter(a => a.riskTier === 'green').length;
        const total = unitAgents.length;
        riskDist.innerHTML = `
            <div class="hc-risk-stacked">
                <div class="hc-risk-bar-segment red" style="width:${(red/total*100).toFixed(1)}%" title="Hoch: ${red}"></div>
                <div class="hc-risk-bar-segment amber" style="width:${(amber/total*100).toFixed(1)}%" title="Mittel: ${amber}"></div>
                <div class="hc-risk-bar-segment green" style="width:${(green/total*100).toFixed(1)}%" title="Niedrig: ${green}"></div>
            </div>
            <div class="hc-risk-labels">
                <span class="red">Hoch: ${red} (${(red/total*100).toFixed(0)}%)</span>
                <span class="amber">Mittel: ${amber} (${(amber/total*100).toFixed(0)}%)</span>
                <span class="green">Niedrig: ${green} (${(green/total*100).toFixed(0)}%)</span>
            </div>
        `;
    }

    // Stayers vs Leavers
    renderHCStayersLeavers(unitAgents);

    // Unit Early Warnings
    renderHCUnitEWGrid(unitAgents);

    // Contagion
    renderHCContagion(rd, unitAgents);
}

function renderHCUnitEWGrid(unitAgents) {
    const grid = document.getElementById('hcUnitEWGrid');
    if (!grid) return;

    const riskAgents = unitAgents.filter(a => a.riskTier !== 'green').sort((a, b) => b.riskScore - a.riskScore);

    if (riskAgents.length === 0) {
        grid.innerHTML = '<div style="padding:var(--space-4);color:var(--text-tertiary);text-align:center">Keine aktiven Frühwarnungen in dieser Einheit.</div>';
        return;
    }

    grid.innerHTML = riskAgents.slice(0, 12).map(a => `
        <div class="hc-ew-card ${a.riskTier}" onclick="showHCUnitShapForAgent('${a.id}')">
            <div class="hc-ew-card-header">
                <span class="hc-ew-id">${a.name}</span><span class="hc-ew-vid">${a.id}</span>
                <span class="hc-risk-badge ${a.riskTier}">${a.riskScore}%</span>
            </div>
            <div class="hc-ew-card-meta">AO-Vermittler · ${formatTenure(a.tenure)} Zugehörigkeit · ${a.age} Jahre</div>
            <div class="hc-ew-card-factor">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ${a.topFactor}
            </div>
            <div class="hc-ew-card-change ${a.change > 0 ? 'up' : 'down'}">${a.change > 0 ? '↑' : '↓'} ${Math.abs(a.change)} Pkt.</div>
        </div>
    `).join('');
}

function showHCUnitShapForAgent(agentId) {
    const container = document.getElementById('hcUnitShapContainer');
    const agent = hcAgents.find(a => a.id === agentId);
    if (!container || !agent) return;

    const baseRisk = 15;
    const maxAbsVal = Math.max(...agent.shapFactors.map(f => Math.abs(f.value)), 0.01);
    const maxBarWidth = 200;

    // Get KI recommendation
    const riskFactors = agent.shapFactors.filter(f => f.value > 0).sort((a, b) => b.value - a.value);
    const topFactor = riskFactors[0]?.factor || agent.topFactor;
    const recommendation = HC_KI_RECOMMENDATIONS[topFactor];
    const additionalFactors = riskFactors.slice(1, 3).map(f => f.factor);

    const recHTML = recommendation ? `
        <div class="hc-ki-rec-inline" style="margin-top:var(--space-4);border-top:1px solid var(--border);padding-top:var(--space-4);">
            <div class="hc-ki-rec-header">
                <div class="hc-ki-rec-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    KI-Empfehlung: ${recommendation.title}
                </div>
                <span class="hc-ki-rec-urgency ${recommendation.urgency}">${recommendation.urgency === 'kritisch' ? 'Kritisch' : recommendation.urgency === 'hoch' ? 'Hohe Priorität' : recommendation.urgency === 'mittel' ? 'Mittlere Priorität' : 'Niedrige Priorität'}</span>
            </div>
            <div class="hc-ki-rec-trigger" style="margin:var(--space-2) 0">
                <strong>Auslöser:</strong> ${topFactor}
                ${additionalFactors.length > 0 ? ` · Weitere: ${additionalFactors.join(', ')}` : ''}
            </div>
            <div class="hc-ki-rec-measures">
                ${recommendation.measures.map((m, i) => `
                    <div class="hc-ki-rec-measure">
                        <div class="hc-ki-rec-measure-num">${i + 1}</div>
                        <div class="hc-ki-rec-measure-content">
                            <div class="hc-ki-rec-measure-action">${m.action}</div>
                            <div class="hc-ki-rec-measure-meta">
                                <span>Zeitrahmen: <strong>${m.timeline}</strong></span>
                                <span>Verantwortlich: <strong>${m.responsible}</strong></span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="hc-ki-rec-rationale">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>${recommendation.rationale}</span>
            </div>
            <div class="hc-ki-rec-footer">
                <span class="hc-ki-rec-disclaimer">KI-generierte Empfehlung — keine automatisierte Entscheidung (Art. 22 DSGVO)</span>
            </div>
        </div>
    ` : '';

    // Waterfall: Basis → kumulative Faktoren → Endergebnis
    const scale = 3.2; // px pro Prozentpunkt
    let cumulative = baseRisk;
    const waterfallRows = agent.shapFactors.map(f => {
        const startPct = cumulative;
        cumulative += f.value;
        return { ...f, startPct, endPct: cumulative };
    });

    container.innerHTML = `
        <div class="hc-shap-header">
            <div class="hc-shap-agent">
                <strong>${agent.name}</strong> <span style="color:var(--text-tertiary)">(${agent.id})</span> — ${agent.rdName} · AO-Vermittler · ${agent.age} Jahre · ${formatTenure(agent.tenure)} Zugehörigkeit
            </div>
            <div class="hc-shap-score">
                Abgangsrisiko: <span class="hc-risk-badge ${agent.riskTier}">${agent.riskScore}%</span>
            </div>
        </div>
        <div class="hc-shap-waterfall">
            <div class="hc-wf-row hc-wf-base">
                <div class="hc-wf-label">Durchschnittliches Abgangsrisiko</div>
                <div class="hc-wf-bar-area">
                    <div class="hc-wf-bar base" style="margin-left:0;width:${Math.round(baseRisk * scale)}px">
                        <span class="hc-wf-val">${baseRisk}%</span>
                    </div>
                </div>
            </div>
            ${waterfallRows.map(r => {
                const left = Math.round(Math.min(r.startPct, r.endPct) * scale);
                const width = Math.max(Math.round(Math.abs(r.value) * scale), 2);
                const isPos = r.value > 0;
                const sign = isPos ? '+' : '';
                return `
                    <div class="hc-wf-row">
                        <div class="hc-wf-label">${r.factor}</div>
                        <div class="hc-wf-bar-area">
                            <div class="hc-wf-connector" style="left:${Math.round(r.startPct * scale)}px"></div>
                            <div class="hc-wf-bar ${isPos ? 'increase' : 'decrease'}" style="margin-left:${left}px;width:${width}px">
                                <span class="hc-wf-val">${sign}${r.value}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
            <div class="hc-wf-row hc-wf-result">
                <div class="hc-wf-label"><strong>Abgangsrisiko</strong></div>
                <div class="hc-wf-bar-area">
                    <div class="hc-wf-connector" style="left:${Math.round(cumulative * scale)}px"></div>
                    <div class="hc-wf-bar result ${agent.riskTier}" style="margin-left:0;width:${Math.round(agent.riskScore * scale)}px">
                        <span class="hc-wf-val">${agent.riskScore}%</span>
                    </div>
                </div>
            </div>
        </div>
        ${recHTML}
    `;
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderHCBarChart(containerId, agents, field, buckets) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const counts = buckets.map(b => agents.filter(a => a[field] >= b.min && a[field] < b.max).length);
    const maxCount = Math.max(...counts, 1);

    container.innerHTML = `
        <div class="hc-bar-chart">
            ${buckets.map((b, i) => `
                <div class="hc-bar-col">
                    <div class="hc-bar-value">${counts[i]}</div>
                    <div class="hc-bar" style="height:${(counts[i]/maxCount*100).toFixed(0)}%"></div>
                    <div class="hc-bar-label">${b.label}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderHCStayersLeavers(unitAgents) {
    const container = document.getElementById('hcStayersLeavers');
    if (!container) return;

    const dims = ['Engagement', 'Vergütung', 'Karriere', 'Manager', 'Work-Life-Balance'];
    const stayerScores = dims.map(() => 60 + Math.floor(Math.random() * 25));
    const leaverScores = dims.map((_, i) => Math.max(20, stayerScores[i] - 15 - Math.floor(Math.random() * 15)));

    container.innerHTML = `
        <div class="hc-sl-chart">
            ${dims.map((d, i) => `
                <div class="hc-sl-row">
                    <div class="hc-sl-dim">${d}</div>
                    <div class="hc-sl-bars">
                        <div class="hc-sl-bar stayer" style="width:${stayerScores[i]}%"><span>${stayerScores[i]}</span></div>
                        <div class="hc-sl-bar leaver" style="width:${leaverScores[i]}%"><span>${leaverScores[i]}</span></div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="hc-sl-legend">
            <span class="hc-sl-legend-item"><span class="hc-legend-dot" style="background:#16A34A"></span>Aktive Vermittler</span>
            <span class="hc-sl-legend-item"><span class="hc-legend-dot" style="background:#DC2626"></span>Ausgeschiedene (12M)</span>
        </div>
    `;
}

function renderHCContagion(rd, unitAgents) {
    const panel = document.getElementById('hcContagionPanel');
    const content = document.getElementById('hcContagionContent');
    if (!panel || !content) return;

    const hasContagion = rd.tier !== 'green' && Math.random() > 0.3;

    if (!hasContagion) {
        panel.style.display = 'none';
        return;
    }
    panel.style.display = 'block';

    const daysAgo = Math.floor(Math.random() * 100 + 10);
    const daysRemaining = Math.max(0, 135 - daysAgo);
    const affectedCount = Math.floor(Math.random() * 5 + 2);

    content.innerHTML = `
        <div class="hc-contagion-info">
            <div class="hc-contagion-timer">
                <div class="hc-contagion-days">${daysRemaining}</div>
                <div class="hc-contagion-days-label">Tage verbleibend</div>
            </div>
            <div class="hc-contagion-details">
                <p><strong>Abgang vor ${daysAgo} Tagen</strong> — 135-Tage-Beobachtungsfenster aktiv</p>
                <p>${affectedCount} Team-Mitglieder mit erhöhter Sensitivität überwacht</p>
                <p>Erhöhte Abgangswahrscheinlichkeit: <strong>+7–25%</strong> (Visier-Studie)</p>
            </div>
        </div>
        <div class="hc-contagion-progress">
            <div class="hc-contagion-bar" style="width:${(daysAgo/135*100).toFixed(0)}%"></div>
        </div>
    `;
}

// --- RENDER: Early Warning ---
function renderHCEarlyWarnings() {
    renderHCEWGrid();
    renderHCKanban();
}

function renderHCEWGrid() {
    const grid = document.getElementById('hcEWGrid');
    if (!grid) return;

    const tierFilter = document.getElementById('hcEWFilterTier')?.value || 'all';
    const rdFilter = document.getElementById('hcEWFilterRD')?.value || 'all';

    let agents = hcAgents.filter(a => a.riskTier !== 'green');
    if (tierFilter === 'red') agents = agents.filter(a => a.riskTier === 'red');
    if (tierFilter === 'amber') agents = agents.filter(a => a.riskTier === 'amber');
    if (rdFilter !== 'all') agents = agents.filter(a => a.rdId === rdFilter);

    agents.sort((a, b) => b.riskScore - a.riskScore);

    grid.innerHTML = agents.slice(0, 24).map(a => `
        <div class="hc-ew-card ${a.riskTier}" onclick="showHCShapForAgent('${a.id}')">
            <div class="hc-ew-card-header">
                <span class="hc-ew-id">${a.name}</span><span class="hc-ew-vid">${a.id}</span>
                <span class="hc-risk-badge ${a.riskTier}">${a.riskScore}%</span>
            </div>
            <div class="hc-ew-card-rd">${a.rdName}</div>
            <div class="hc-ew-card-meta">AO-Vermittler · ${formatTenure(a.tenure)} Zugehörigkeit · ${a.age} Jahre</div>
            <div class="hc-ew-card-factor">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ${a.topFactor}
            </div>
            <div class="hc-ew-card-change ${a.change > 0 ? 'up' : 'down'}">${a.change > 0 ? '↑' : '↓'} ${Math.abs(a.change)} Pkt.</div>
        </div>
    `).join('');
}

function showHCShapForAgent(agentId) {
    const select = document.getElementById('hcShapSelect');
    if (select) {
        select.value = agentId;
        renderHCShapExplanation();
    }
    // Show KI recommendation
    renderHCKIRecommendation(agentId);
    // Scroll to recommendation panel
    document.getElementById('hcKIRecommendationPanel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderHCShapExplanation() {
    const container = document.getElementById('hcShapContainer');
    const agentId = document.getElementById('hcShapSelect')?.value;
    if (!container || !agentId) {
        if (container) container.innerHTML = '<div class="hc-shap-placeholder">Wählen Sie einen Vermittler aus der Liste oben, um die Score-Erklärung anzuzeigen.</div>';
        return;
    }

    const agent = hcAgents.find(a => a.id === agentId);
    if (!agent) return;

    const baseRisk = 15;
    const scale = 3.2;
    let cumulative = baseRisk;
    const waterfallRows = agent.shapFactors.map(f => {
        const startPct = cumulative;
        cumulative += f.value;
        return { ...f, startPct, endPct: cumulative };
    });

    container.innerHTML = `
        <div class="hc-shap-header">
            <div class="hc-shap-agent">
                <strong>${agent.name}</strong> <span style="color:var(--text-tertiary)">(${agent.id})</span> — ${agent.rdName} · AO-Vermittler · ${agent.age} Jahre · ${formatTenure(agent.tenure)} Zugehörigkeit
            </div>
            <div class="hc-shap-score">
                Abgangsrisiko: <span class="hc-risk-badge ${agent.riskTier}">${agent.riskScore}%</span>
            </div>
        </div>
        <div class="hc-shap-waterfall">
            <div class="hc-wf-row hc-wf-base">
                <div class="hc-wf-label">Durchschnittliches Abgangsrisiko</div>
                <div class="hc-wf-bar-area">
                    <div class="hc-wf-bar base" style="margin-left:0;width:${Math.round(baseRisk * scale)}px">
                        <span class="hc-wf-val">${baseRisk}%</span>
                    </div>
                </div>
            </div>
            ${waterfallRows.map(r => {
                const left = Math.round(Math.min(r.startPct, r.endPct) * scale);
                const width = Math.max(Math.round(Math.abs(r.value) * scale), 2);
                const isPos = r.value > 0;
                const sign = isPos ? '+' : '';
                return `
                    <div class="hc-wf-row">
                        <div class="hc-wf-label">${r.factor}</div>
                        <div class="hc-wf-bar-area">
                            <div class="hc-wf-connector" style="left:${Math.round(r.startPct * scale)}px"></div>
                            <div class="hc-wf-bar ${isPos ? 'increase' : 'decrease'}" style="margin-left:${left}px;width:${width}px">
                                <span class="hc-wf-val">${sign}${r.value}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
            <div class="hc-wf-row hc-wf-result">
                <div class="hc-wf-label"><strong>Abgangsrisiko</strong></div>
                <div class="hc-wf-bar-area">
                    <div class="hc-wf-connector" style="left:${Math.round(cumulative * scale)}px"></div>
                    <div class="hc-wf-bar result ${agent.riskTier}" style="margin-left:0;width:${Math.round(agent.riskScore * scale)}px">
                        <span class="hc-wf-val">${agent.riskScore}%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- KI-Maßnahmenempfehlung ---
const HC_KI_RECOMMENDATIONS = {
    // === Frühphase (<3 Monate) ===
    'Zugehörigkeit <3 Monate — Frühfluktuation': {
        title: 'Sofort-Intervention: Frühfluktuation verhindern',
        urgency: 'kritisch',
        measures: [
            { action: 'Sofortiges persönliches Gespräch — Erwartungen und erste Erfahrungen abgleichen', timeline: 'Sofort (24h)', responsible: 'Vertriebsdirektor' },
            { action: 'Erfahrenen Paten-Vermittler fest zuordnen — täglicher Austausch in den ersten Wochen', timeline: 'Sofort', responsible: 'Regionaldirektion' },
            { action: 'Wirtschaftliche Startabsicherung prüfen: Bestandszuweisung, Startprovisionen, Lead-Pakete', timeline: '48 Stunden', responsible: 'Vertriebssteuerung' },
            { action: 'Strukturierten Einarbeitungsplan mit Wochenmeilensteinen aufsetzen und nachhalten', timeline: '1 Woche', responsible: 'Vertriebscoach' },
            { action: 'Wöchentliches Check-in mit VD fest im Kalender verankern — mindestens für die ersten 90 Tage', timeline: 'Fortlaufend', responsible: 'Vertriebsdirektor' }
        ],
        rationale: 'Die ersten 3 Monate sind die kritischste Phase: 33% der AO-Vermittler verlassen die Organisation in dieser Frühphase. Häufigste Ursachen: fehlende wirtschaftliche Perspektive, mangelnde Betreuung, unerfüllte Erwartungen.'
    },
    'Zufriedenheit Onboarding-Prozess (letzte Umfrage: niedrig)': {
        title: 'Onboarding-Erlebnis sofort verbessern',
        urgency: 'kritisch',
        measures: [
            { action: 'Persönliches Feedbackgespräch: Was konkret hat nicht funktioniert?', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Onboarding-Checkliste für diesen Vermittler individuell nacharbeiten', timeline: '1 Woche', responsible: 'Vertriebscoach' },
            { action: 'Rückmeldung an das zentrale Onboarding-Team zur Prozessoptimierung', timeline: '2 Wochen', responsible: 'Personalentwicklung' }
        ],
        rationale: 'Negative Onboarding-Erfahrungen sind der stärkste Frühindikator für Abgänge in den ersten 90 Tagen. 70% der Vermittler, die den Onboarding-Prozess negativ bewerten, verlassen das Unternehmen innerhalb von 6 Monaten.'
    },
    'Einschätzung Führungskraft: Integration gefährdet': {
        title: 'Integration durch Führungskraft begleiten',
        urgency: 'kritisch',
        measures: [
            { action: 'VD-Gespräch mit konkretem Integrationsplan: Was fehlt dem Vermittler?', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Teamintegration aktiv fördern: Einbindung in gemeinsame Kundenbesuche und Teamrunden', timeline: '1 Woche', responsible: 'Regionaldirektion' },
            { action: 'Paten-Tandem intensivieren oder neuen Paten zuweisen', timeline: '1 Woche', responsible: 'Vertriebsdirektor' }
        ],
        rationale: 'Die Einschätzung der direkten Führungskraft ist der valideste Frühindikator für Abgangsrisiken. Wenn der VD die Integration als gefährdet einstuft, liegt die Abgangswahrscheinlichkeit bei über 60%.'
    },
    'Erwartungslücke Vergütung vs. Realität': {
        title: 'Erwartungsmanagement und Startunterstützung',
        urgency: 'hoch',
        measures: [
            { action: 'Transparentes Gespräch: Realistische Einkommenserwartung für die ersten 12 Monate aufzeigen', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Startfinanzierung und Zuschussregelungen prüfen und ggf. nachbessern', timeline: '1 Woche', responsible: 'Vertriebssteuerung' },
            { action: 'Kurzfristige Erfolgsaussichten aufzeigen: schnell erzielbare Abschlüsse identifizieren', timeline: '1 Woche', responsible: 'Vertriebscoach' }
        ],
        rationale: 'Enttäuschte Verdiensterwartungen sind der häufigste Grund für Frühfluktuation. Ehrliches Erwartungsmanagement kombiniert mit wirtschaftlicher Startunterstützung kann die Abgangsquote um 30% senken.'
    },
    'Kein Pate/Mentor zugewiesen': {
        title: 'Patenmodell umgehend aktivieren',
        urgency: 'kritisch',
        measures: [
            { action: 'Sofort erfahrenen Paten aus der Einheit zuweisen (Top-Performer mit Mentoring-Eignung)', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Erste gemeinsame Bestandsbearbeitung und Kundenbesuche planen', timeline: '1 Woche', responsible: 'Pate/Mentor' },
            { action: 'Regelmäßige Tandem-Termine (mind. 2x/Woche) fest einrichten', timeline: '1 Woche', responsible: 'Regionaldirektion' }
        ],
        rationale: 'Neue Vermittler ohne Patenbegleitung haben eine 2,5x höhere Abgangswahrscheinlichkeit. Ein strukturiertes Patenmodell ist der wirksamste Hebel zur Senkung der Frühfluktuation.'
    },
    'Noch kein erster Abschluss erzielt': {
        title: 'Schnelle Erfolgserlebnisse ermöglichen',
        urgency: 'hoch',
        measures: [
            { action: 'Einfache Abschlussmöglichkeiten identifizieren (z.B. Bestandsübernahme, Familien-/Freundeskreis)', timeline: 'Sofort', responsible: 'Vertriebscoach' },
            { action: 'Gemeinsame Erstberatung mit erfahrenem Kollegen oder VD durchführen', timeline: '1 Woche', responsible: 'Vertriebsdirektor' },
            { action: 'Kurzfristiges Aktivitätenziel setzen: 10 Beratungstermine in 2 Wochen', timeline: '1 Woche', responsible: 'Vertriebscoach' }
        ],
        rationale: 'Der erste Abschluss hat eine enorme psychologische Wirkung. Vermittler die innerhalb der ersten 6 Wochen keinen Abschluss erzielen, verlassen das Unternehmen mit 55% Wahrscheinlichkeit.'
    },
    'Geografische Entfernung zum Team/Büro': {
        title: 'Anbindung trotz Distanz sicherstellen',
        urgency: 'mittel',
        measures: [
            { action: 'Regelmäßige Video-Calls mit VD und Teamkollegen einrichten', timeline: '1 Woche', responsible: 'Vertriebsdirektor' },
            { action: 'Monatliche Präsenz-Termine im Büro/Team fest einplanen', timeline: '2 Wochen', responsible: 'Regionaldirektion' },
            { action: 'Digitale Zusammenarbeit stärken: Einbindung in Team-Chat und gemeinsame Projekte', timeline: '1 Woche', responsible: 'Vertriebsdirektor' }
        ],
        rationale: 'Vermittler mit großer Entfernung zum nächsten Teambüro haben ein 1,4x höheres Abgangsrisiko durch Isolation. Regelmäßiger Kontakt — auch digital — ist entscheidend.'
    },
    'Vorherige Branchenerfahrung: gering': {
        title: 'Branchenspezifische Einarbeitung intensivieren',
        urgency: 'mittel',
        measures: [
            { action: 'Zusätzliches Produkttraining für Kernsparten (Leben, Sach, Vorsorge) ansetzen', timeline: '1 Woche', responsible: 'Vertriebscoach' },
            { action: 'Hospitationen bei erfahrenen Vermittlern organisieren', timeline: '2 Wochen', responsible: 'Regionaldirektion' },
            { action: 'Beratungsleitfäden und Gesprächsvorlagen bereitstellen', timeline: '1 Woche', responsible: 'Vertriebscoach' }
        ],
        rationale: 'Quereinsteiger ohne Versicherungserfahrung haben eine doppelt so hohe Frühfluktuation. Gezielte Zusatzqualifizierung in den ersten Monaten kann dies signifikant reduzieren.'
    },

    // === Einarbeitung (3–12 Monate) ===
    'Zugehörigkeit <12 Monate — Einarbeitungsphase': {
        title: 'Einarbeitung intensivieren',
        urgency: 'kritisch',
        measures: [
            { action: 'Einarbeitungsstatus prüfen: Wurden alle Meilensteine erreicht?', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Persönlichen Paten (erfahrener Vermittler) zuordnen — wöchentliche Tandem-Termine', timeline: 'Sofort', responsible: 'Regionaldirektion' },
            { action: 'Kurzfristige Produktivitätsziele definieren (erste Abschlüsse, Bestandsübernahme)', timeline: '1 Woche', responsible: 'Vertriebscoach' },
            { action: 'Bestandszuweisung / Lead-Paket sicherstellen', timeline: '1 Woche', responsible: 'Vertriebssteuerung' },
            { action: 'Regelmäßiges Feedback-Gespräch (14-tägig) mit VD', timeline: 'Fortlaufend', responsible: 'Vertriebsdirektor' }
        ],
        rationale: 'Die ersten 12 Monate sind die kritischste Phase. Branchenweit verlassen 30–40% der Neuzugänge innerhalb des ersten Jahres. Strukturierte Einarbeitung mit Patenmodell kann die Frühfluktuation um bis zu 50% senken.'
    },
    'Zufriedenheit letzte Mitarbeiterumfrage: unterdurchschnittlich': {
        title: 'Unzufriedenheit adressieren',
        urgency: 'hoch',
        measures: [
            { action: 'Vertrauliches Einzelgespräch: Konkrete Ursachen der Unzufriedenheit erfragen', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Quick Wins identifizieren: Welche Themen können sofort verbessert werden?', timeline: '1 Woche', responsible: 'Vertriebsdirektor' },
            { action: 'Strukturelle Themen (Prozesse, Tools, Unterstützung) an die RD-Leitung eskalieren', timeline: '2 Wochen', responsible: 'Regionaldirektion' }
        ],
        rationale: 'Niedrige Zufriedenheit in Mitarbeiterbefragungen ist ein starker Prädiktor für Abgänge. Vermittler die ihre Zufriedenheit als „unterdurchschnittlich" bewerten, haben ein 3x höheres Abgangsrisiko in den folgenden 12 Monaten.'
    },
    'Einschätzung Führungskraft: Entwicklung unter Plan': {
        title: 'Entwicklungsplan anpassen',
        urgency: 'hoch',
        measures: [
            { action: 'Gemeinsame Standortbestimmung: Wo steht der Vermittler vs. Plan?', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Konkreten Aufholplan mit erreichbaren Zwischenzielen erarbeiten', timeline: '1 Woche', responsible: 'Vertriebscoach' },
            { action: 'Zusätzliche Ressourcen bereitstellen: Leads, Coaching-Stunden, Tandem-Begleitung', timeline: '1 Woche', responsible: 'Regionaldirektion' }
        ],
        rationale: 'Die Führungskraft-Einschätzung ist der valideste Indikator. Wenn die Entwicklung als „unter Plan" eingestuft wird, ist proaktives Coaching entscheidend um den Vermittler auf Kurs zu bringen.'
    },
    'Bestandsaufbau hinter Erwartung': {
        title: 'Bestandsaufbau beschleunigen',
        urgency: 'hoch',
        measures: [
            { action: 'Bestandszuweisung aus auslaufenden Verträgen oder verwaisten Beständen prüfen', timeline: 'Sofort', responsible: 'Vertriebssteuerung' },
            { action: 'Gezielte Akquisitionsstrategie mit dem Vermittler erarbeiten', timeline: '1 Woche', responsible: 'Vertriebscoach' },
            { action: 'Lead-Pakete aus zentralem Marketing bereitstellen', timeline: '1 Woche', responsible: 'Marketing' }
        ],
        rationale: 'Ein zu langsamer Bestandsaufbau gefährdet die wirtschaftliche Grundlage. Ohne ausreichenden Bestand sinkt die Bindungsmotivation massiv.'
    },
    'Erste Stornierungen im jungen Bestand': {
        title: 'Beratungsqualität sicherstellen',
        urgency: 'mittel',
        measures: [
            { action: 'Stornierte Verträge analysieren: Beratungsfehler oder Kundenumstände?', timeline: 'Sofort', responsible: 'Vertriebscoach' },
            { action: 'Nachschulung zur bedarfsgerechten Beratung (DIN 77230)', timeline: '2 Wochen', responsible: 'Vertriebscoach' },
            { action: 'Begleitung bei den nächsten 3 Kundenterminen zur Qualitätssicherung', timeline: '2 Wochen', responsible: 'Pate/Mentor' }
        ],
        rationale: 'Frühe Stornierungen sind ein Warnsignal für die Beratungsqualität und belasten den Vermittler finanziell und psychologisch in einer ohnehin fragilen Phase.'
    },
    'Geringe Teilnahme an Teamveranstaltungen': {
        title: 'Teamanbindung stärken',
        urgency: 'mittel',
        measures: [
            { action: 'Persönlich einladen und Bedeutung der Vernetzung erklären', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Buddy-System: Festen Teamkollegen als Begleitung für Veranstaltungen zuweisen', timeline: '1 Woche', responsible: 'Regionaldirektion' },
            { action: 'Veranstaltungsformat prüfen: Sind Zeiten und Inhalte für Neulinge geeignet?', timeline: '2 Wochen', responsible: 'Regionaldirektion' }
        ],
        rationale: 'Soziale Isolation ist einer der stärksten Abgangstreiber in den ersten 12 Monaten. Vermittler mit starker Teamanbindung haben eine 40% höhere Verbleibwahrscheinlichkeit.'
    },
    'Startfinanzierung / Zuschüsse laufen aus': {
        title: 'Wirtschaftliche Übergangslösung prüfen',
        urgency: 'hoch',
        measures: [
            { action: 'Aktuelle Ertragssituation bewerten: Kann der Vermittler sich selbst tragen?', timeline: 'Sofort', responsible: 'Vertriebssteuerung' },
            { action: 'Verlängerung oder Anpassung der Startfinanzierung prüfen', timeline: '1 Woche', responsible: 'Vertriebsleitung' },
            { action: 'Zusätzliche Ertragsquellen erschließen (Bestandsübernahmen, Cross-Selling-Potenziale)', timeline: '1 Woche', responsible: 'Vertriebscoach' }
        ],
        rationale: 'Das Auslaufen der Startfinanzierung ist ein kritischer Moment. Vermittler die zu diesem Zeitpunkt wirtschaftlich noch nicht tragfähig sind, verlassen die Organisation mit 70% Wahrscheinlichkeit.'
    },
    'Unregelmäßige CRM-Nutzung': {
        title: 'Digitale Arbeitsweise etablieren',
        urgency: 'mittel',
        measures: [
            { action: 'CRM-Nutzung analysieren: Wo hakt es? Schulungsbedarf ermitteln', timeline: '1 Woche', responsible: 'IT-Support' },
            { action: 'Praxisnahes CRM-Training (kein Frontalunterricht) vor Ort durchführen', timeline: '2 Wochen', responsible: 'Digitalisierung' },
            { action: 'Festen Ansprechpartner für CRM-Fragen zuweisen', timeline: '1 Woche', responsible: 'Vertriebsdirektor' }
        ],
        rationale: 'Unregelmäßige CRM-Nutzung deutet auf mangelnde Integration in die Arbeitsabläufe hin und ist ein Frühindikator für Disengagement.'
    },

    // === Aufbauphase (1–2 Jahre) ===
    'Zugehörigkeit <24 Monate — kritische Phase': {
        title: 'Stabilisierung in der Aufbauphase',
        urgency: 'hoch',
        measures: [
            { action: 'Standortbestimmung: Hat der Vermittler die Anlaufphase wirtschaftlich überstanden?', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Vertriebscoaching intensivieren — Fokus auf eigenständige Kundenakquise und Bestandsaufbau', timeline: '1 Woche', responsible: 'Vertriebscoach' },
            { action: 'Netzwerk-Integration: Einbindung in regionale Vertriebsgruppen', timeline: '2 Wochen', responsible: 'Regionaldirektion' },
            { action: 'Entwicklungsplan für die nächsten 12 Monate gemeinsam erarbeiten', timeline: '2 Wochen', responsible: 'Vertriebsdirektor' }
        ],
        rationale: '60% der AO-Vermittler verlassen die Organisation innerhalb der ersten 2 Jahre. Die Aufbauphase (12–24 Monate) erfordert den Übergang von Einarbeitung zur Eigenständigkeit.'
    },
    'Einschätzung Führungskraft: Leistungsentwicklung stagniert': {
        title: 'Leistungsstagnation durchbrechen',
        urgency: 'hoch',
        measures: [
            { action: 'Ursachenanalyse mit VD: Motivation, Können oder Rahmenbedingungen?', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Individuelles Intensiv-Coaching: 4 Wochen mit wöchentlicher Begleitung', timeline: '1 Woche', responsible: 'Vertriebscoach' },
            { action: 'Neue Impulse setzen: Spartenrotation, Hospitationen, Best-Practice-Tandem', timeline: '2 Wochen', responsible: 'Regionaldirektion' }
        ],
        rationale: 'Stagnation in der Aufbauphase ist ein starkes Abwanderungssignal. Wenn die Führungskraft eine Stagnation erkennt, muss schnell gehandelt werden — sonst manifestiert sich die Unzufriedenheit.'
    },
    'Provisionsrückgang vs. Vorquartal': {
        title: 'Provisionsrückgang stoppen',
        urgency: 'hoch',
        measures: [
            { action: 'Ursachenanalyse: Welche Sparten/Kundengruppen sind rückläufig?', timeline: 'Sofort', responsible: 'Vertriebscoach' },
            { action: 'Gezieltes Cross-Selling-Coaching für unterrepräsentierte Sparten', timeline: '1 Woche', responsible: 'Vertriebscoach' },
            { action: 'Lead-Paket für Neukundenakquise bereitstellen', timeline: '1 Woche', responsible: 'Marketing' }
        ],
        rationale: 'Ein Provisionsrückgang in der Aufbauphase bedroht die wirtschaftliche Konsolidierung und ist häufig der Auslöser für einen Wechsel.'
    },
    'Bestandsgröße unter Peergroup-Niveau': {
        title: 'Bestandsaufbau beschleunigen',
        urgency: 'mittel',
        measures: [
            { action: 'Bestandsvergleich mit Peergroup aufbereiten: Wo liegt die Lücke?', timeline: '1 Woche', responsible: 'Vertriebssteuerung' },
            { action: 'Verwaiste Bestände oder Lead-Pakete zur Überbrückung zuweisen', timeline: '1 Woche', responsible: 'Regionaldirektion' },
            { action: 'Akquise-Strategie mit Fokus auf nachhaltigem Bestandsaufbau erarbeiten', timeline: '2 Wochen', responsible: 'Vertriebscoach' }
        ],
        rationale: 'Ein unterdurchschnittlicher Bestand nach 1–2 Jahren deutet auf strukturelle Probleme in der Akquise hin und erhöht das Abgangsrisiko durch wirtschaftlichen Druck.'
    },
    'Geringe Netzwerk-Integration in der Region': {
        title: 'Regionale Vernetzung fördern',
        urgency: 'mittel',
        measures: [
            { action: 'Einbindung in regionale Vertriebsgruppen und Erfahrungsaustausch', timeline: '1 Woche', responsible: 'Regionaldirektion' },
            { action: 'Gemeinsame Veranstaltungen mit Kooperationspartnern (Makler, Banken, Steuerberater)', timeline: '4 Wochen', responsible: 'Vertriebsdirektor' },
            { action: 'Lokale Marketinginitiative unterstützen (Sponsoring, Veranstaltungen)', timeline: '4 Wochen', responsible: 'Marketing' }
        ],
        rationale: 'Regionale Verwurzelung und ein stabiles lokales Netzwerk sind entscheidend für den langfristigen Vertriebserfolg und die Bindung an den Standort.'
    },

    // === Etablierte Vermittler (2–5 Jahre) und Senior (>5 Jahre) ===
    'Einschätzung Führungskraft: Motivationsrückgang': {
        title: 'Motivation und Perspektive erneuern',
        urgency: 'hoch',
        measures: [
            { action: 'Vertrauensvolles Vier-Augen-Gespräch: Was belastet den Vermittler?', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Neue Impulse: Spezialisierung, Mentoring-Rolle, Projektverantwortung anbieten', timeline: '2 Wochen', responsible: 'Regionaldirektion' },
            { action: 'Work-Life-Balance prüfen: Flexible Arbeitsmodelle oder Entlastung möglich?', timeline: '2 Wochen', responsible: 'Vertriebsdirektor' }
        ],
        rationale: 'Wenn die Führungskraft einen Motivationsrückgang erkennt, liegt häufig eine innere Kündigung vor. Ohne Intervention folgt der faktische Abgang innerhalb von 6–12 Monaten.'
    },
    'Monate seit letzter Beförderung': {
        title: 'Karriereperspektive eröffnen',
        urgency: 'hoch',
        measures: [
            { action: 'Persönliches Karrieregespräch innerhalb von 5 Werktagen', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Prüfung der Qualifikation zum Agenturleiter / Mehrfachagenten', timeline: '2 Wochen', responsible: 'Personalentwicklung' },
            { action: 'Einbindung als Mentor für Nachwuchsvermittler', timeline: '4 Wochen', responsible: 'Regionaldirektion' }
        ],
        rationale: 'Fehlende Aufstiegsperspektive ist einer der stärksten Prädiktoren für Abgänge bei erfahrenen AO-Vermittlern. Ein proaktives Karrieregespräch kann die Abgangswahrscheinlichkeit um bis zu 35% senken.'
    },
    'Fehlende Karriereperspektive / Stagnation': {
        title: 'Karriereperspektive eröffnen',
        urgency: 'hoch',
        measures: [
            { action: 'Persönliches Karrieregespräch: Wo sieht sich der Vermittler in 3 Jahren?', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Entwicklungspfade aufzeigen: Agenturleitung, Spezialisierung, Mehrfachagent', timeline: '2 Wochen', responsible: 'Personalentwicklung' },
            { action: 'Verantwortungsbereich erweitern: Mentoring, Projektleitung, Fachexpertise', timeline: '4 Wochen', responsible: 'Regionaldirektion' }
        ],
        rationale: 'Erfahrene Vermittler die keine Perspektive mehr sehen, sind besonders anfällig für Abwerbung durch Wettbewerber. Neue Herausforderungen und Anerkennung sind entscheidend.'
    },
    'Provisionsrückgang >20%': {
        title: 'Vertriebsleistung stabilisieren',
        urgency: 'hoch',
        measures: [
            { action: 'Individuelle Bestandsanalyse — Ursachen des Provisionsrückgangs identifizieren', timeline: 'Sofort', responsible: 'Vertriebscoach' },
            { action: 'Gezieltes Cross-Selling-Coaching für unterrepräsentierte Sparten', timeline: '1 Woche', responsible: 'Vertriebscoach' },
            { action: 'Temporäre Sonderprovisionsregelung / Bestandssicherungsprämie prüfen', timeline: '2 Wochen', responsible: 'Vertriebsleitung' },
            { action: 'Lead-Paket aus zentralem Marketing bereitstellen', timeline: '1 Woche', responsible: 'Marketing' }
        ],
        rationale: 'Ein Provisionsrückgang >20% bedroht die wirtschaftliche Grundlage und ist häufig Auslöser für einen Wechsel zur Konkurrenz.'
    },
    'Stornoquote über Durchschnitt': {
        title: 'Beratungsqualität stärken',
        urgency: 'mittel',
        measures: [
            { action: 'Stornogründe-Analyse der letzten 6 Monate — Muster identifizieren', timeline: 'Sofort', responsible: 'Qualitätsmanagement' },
            { action: 'Bedarfsanalyse-Workshop: Kundenberatung nach DIN 77230 sicherstellen', timeline: '2 Wochen', responsible: 'Vertriebscoach' },
            { action: 'Bestandspflegeprogramm: automatisierte Kontaktpunkte für Bestandskunden', timeline: '4 Wochen', responsible: 'CRM-Team' }
        ],
        rationale: 'Hohe Stornoquoten belasten den Vermittler finanziell und gefährden das Vertrauensverhältnis. Gezielte Qualifizierung kann die Stornoquote um 20–30% senken.'
    },
    'Zielerfüllung <70%': {
        title: 'Vertriebsperformance steigern',
        urgency: 'hoch',
        measures: [
            { action: 'Wöchentliches Performance-Coaching mit konkreten Aktivitätenzielen', timeline: 'Sofort', responsible: 'Vertriebscoach' },
            { action: 'Best-Practice-Sharing: Tandem-Bildung mit Top-Performer', timeline: '1 Woche', responsible: 'Regionaldirektion' },
            { action: 'Überprüfung der Gebietszuordnung — ggf. Marktpotenzial-Analyse', timeline: '2 Wochen', responsible: 'Vertriebssteuerung' }
        ],
        rationale: 'Dauerhafte Zielunterschreitung führt zu wirtschaftlichem Druck und Frustration. Individuelle Unterstützung kann den Vermittler in 60% der Fälle wieder auf Kurs bringen.'
    },
    'Engagement-Score rückläufig': {
        title: 'Engagement reaktivieren',
        urgency: 'mittel',
        measures: [
            { action: 'Persönliches Gespräch: Ursachen für Motivationsverlust erfragen', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Individuelle Zielsetzung gemeinsam überarbeiten — erreichbare Etappenziele', timeline: '1 Woche', responsible: 'Vertriebsdirektor' },
            { action: 'Einladung zu Vertriebs-Events, Wettbewerben oder Best-Practice-Austausch', timeline: '2 Wochen', responsible: 'Regionaldirektion' }
        ],
        rationale: 'Rückläufiges Engagement geht einem Abgang häufig 3–6 Monate voraus. Frühzeitiges Ansprechen kann die Bindung signifikant erhöhen.'
    },
    'CRM-Aktivität rückläufig': {
        title: 'Digitale Vertriebsunterstützung verbessern',
        urgency: 'mittel',
        measures: [
            { action: 'CRM-Nutzungsanalyse: Schulungsbedarf ermitteln', timeline: '1 Woche', responsible: 'Digitalisierung' },
            { action: 'Individuelles CRM-Training vor Ort mit Praxisbezug', timeline: '2 Wochen', responsible: 'IT-Support' },
            { action: 'Workflow-Vereinfachung im CRM prüfen — Hürden abbauen', timeline: '4 Wochen', responsible: 'Digitalisierung' }
        ],
        rationale: 'Rückläufige CRM-Aktivität korreliert stark mit nachlassendem Engagement und sinkender Produktivität.'
    },
    'IDD-Weiterbildung unvollständig': {
        title: 'Weiterbildungspflicht sicherstellen',
        urgency: 'mittel',
        measures: [
            { action: 'Aktuellen Weiterbildungsstand prüfen und fehlende Stunden identifizieren', timeline: 'Sofort', responsible: 'Vertriebsassistenz' },
            { action: 'Individuellen Weiterbildungsplan erstellen', timeline: '1 Woche', responsible: 'Personalentwicklung' },
            { action: 'Erinnerungssystem aktivieren', timeline: '1 Woche', responsible: 'Vertriebsassistenz' }
        ],
        rationale: 'Die IDD-Weiterbildungspflicht (15 Stunden/Jahr) ist gesetzlich vorgeschrieben. Unvollständige Weiterbildung gefährdet die Vermittlerzulassung.'
    },
    'Keine freiwillige Weiterbildung seit 18 Mon.': {
        title: 'Entwicklungsbereitschaft fördern',
        urgency: 'niedrig',
        measures: [
            { action: 'Attraktive Weiterbildungsangebote vorstellen (Fachwirt, Spezialistenmodule)', timeline: '2 Wochen', responsible: 'Personalentwicklung' },
            { action: 'Finanzielle Förderung oder Provisionsfreistellung für Qualifizierung anbieten', timeline: '4 Wochen', responsible: 'Vertriebsleitung' }
        ],
        rationale: 'Fehlende Lernbereitschaft über längere Zeit kann auf innere Kündigung hindeuten. Zielgerichtete Angebote mit wirtschaftlichem Nutzen erhöhen die Akzeptanz.'
    },
    'Compa-Ratio <0.80': {
        title: 'Vergütungssituation prüfen',
        urgency: 'hoch',
        measures: [
            { action: 'Provisionssituation im Vergleich zum Markt und Peergroup analysieren', timeline: 'Sofort', responsible: 'Vertriebssteuerung' },
            { action: 'Bestandsumverteilung oder zusätzliche Vertriebsgebiete prüfen', timeline: '2 Wochen', responsible: 'Regionaldirektion' },
            { action: 'Gespräch über Sonderleistungen: Büromiete, Technik, Marketingbudget', timeline: '2 Wochen', responsible: 'Vertriebsdirektor' }
        ],
        rationale: 'Eine Compa-Ratio unter 0,80 bedeutet deutlich unter Marktdurchschnitt — einer der stärksten Abwanderungstreiber.'
    },
    'Team-Abgänge (Ansteckungseffekt)': {
        title: 'Ansteckungseffekt eindämmen',
        urgency: 'hoch',
        measures: [
            { action: 'Sofortiges Stabilisierungsgespräch mit allen betroffenen Teammitgliedern', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Teambuilding-Maßnahme organisieren', timeline: '1 Woche', responsible: 'Regionaldirektion' },
            { action: 'Abgangsursache transparent kommunizieren (soweit möglich)', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Erhöhte Kontaktfrequenz für die Dauer des Beobachtungsfensters', timeline: 'Fortlaufend', responsible: 'Vertriebsdirektor' }
        ],
        rationale: 'Nach Teamabgängen steigt die Abgangswahrscheinlichkeit der verbleibenden Mitglieder um 7–25%. Proaktive Kommunikation im 135-Tage-Fenster ist entscheidend.'
    },
    'Manager-Wechsel <180 Tage': {
        title: 'Beziehungsaufbau nach Führungswechsel',
        urgency: 'mittel',
        measures: [
            { action: 'Neuer VD: Kennenlern-Besuche vor Ort mit allen Vermittlern', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Individuelle Erwartungsgespräche: Arbeitsweise, Wünsche, Sorgen', timeline: '2 Wochen', responsible: 'Vertriebsdirektor' },
            { action: 'Stabilisierungsphase: Keine großen strukturellen Veränderungen in den ersten 6 Monaten', timeline: 'Fortlaufend', responsible: 'Regionaldirektion' }
        ],
        rationale: 'Ein Führungswechsel ist ein kritischer Moment. Innerhalb der ersten 180 Tage ist die Abgangswahrscheinlichkeit um 15–20% erhöht.'
    },
    'Wettbewerber-Recruiting aktiv': {
        title: 'Abwerbung abwehren',
        urgency: 'kritisch',
        measures: [
            { action: 'Vertrauliches Gespräch: Wertschätzung ausdrücken und Zukunftsperspektive aufzeigen', timeline: 'Sofort', responsible: 'Vertriebsdirektor' },
            { action: 'Retention-Bonus oder Bindungsprämie prüfen', timeline: '1 Woche', responsible: 'Vertriebsleitung' },
            { action: 'Exklusive Entwicklungsmöglichkeiten aufzeigen (Agenturleitung, Spezialistenrolle)', timeline: '1 Woche', responsible: 'Vertriebsdirektor' }
        ],
        rationale: 'Aktives Wettbewerber-Recruiting signalisiert akute Abgangsgefahr. Ohne schnelle Intervention beträgt die Abgangswahrscheinlichkeit innerhalb von 90 Tagen über 50%.'
    },
    'Wettbewerber-Recruiting aktiv (Branche)': {
        title: 'Abwerbungsgefahr in der Branche begegnen',
        urgency: 'hoch',
        measures: [
            { action: 'Marktbeobachtung: Welche Wettbewerber rekrutieren aktiv in der Region?', timeline: 'Sofort', responsible: 'Regionaldirektion' },
            { action: 'Präventiv-Gespräch mit dem Vermittler: Bindungsfaktoren stärken', timeline: '1 Woche', responsible: 'Vertriebsdirektor' },
            { action: 'Vergleich der eigenen Konditionen mit Wettbewerber-Angeboten', timeline: '2 Wochen', responsible: 'Vertriebssteuerung' }
        ],
        rationale: 'In Phasen aktiver Wettbewerber-Abwerbung sind besonders neue Vermittler gefährdet, die noch keine starke Bindung aufgebaut haben.'
    }
};

// KI-Zusammenfassung für eine Person generieren
function generateKISummary(agent) {
    const tenureStr = formatTenure(agent.tenure);
    const riskFactors = agent.shapFactors.filter(f => f.value > 0).sort((a, b) => b.value - a.value);
    const topFactors = riskFactors.slice(0, 3).map(f => f.factor);
    const protectiveFactors = agent.shapFactors.filter(f => f.value < 0).map(f => f.factor);

    // Tenure-Kontext
    let tenureContext;
    if (agent.tenure < 0.25) {
        tenureContext = `befindet sich mit ${tenureStr} Zugehörigkeit noch in der kritischen Frühphase`;
    } else if (agent.tenure < 1) {
        tenureContext = `befindet sich mit ${tenureStr} Zugehörigkeit noch in der Einarbeitungsphase`;
    } else if (agent.tenure < 2) {
        tenureContext = `ist seit ${tenureStr} in der Aufbauphase und noch nicht vollständig etabliert`;
    } else if (agent.tenure < 5) {
        tenureContext = `ist mit ${tenureStr} Zugehörigkeit ein etablierter Vermittler im Bestand`;
    } else {
        tenureContext = `gehört mit ${tenureStr} Zugehörigkeit zu den erfahrenen Vermittlern der Organisation`;
    }

    // Risiko-Kontext
    let riskContext;
    if (agent.riskTier === 'red') {
        riskContext = `Das Abgangsrisiko liegt mit ${agent.riskScore}% im kritischen Bereich.`;
    } else if (agent.riskTier === 'amber') {
        riskContext = `Das Abgangsrisiko liegt mit ${agent.riskScore}% im erhöhten Bereich und sollte beobachtet werden.`;
    } else {
        riskContext = `Das Abgangsrisiko liegt mit ${agent.riskScore}% im grünen Bereich.`;
    }

    // Trend
    const trendDelta = agent.riskScore - agent.prevScore;
    let trendText = '';
    if (Math.abs(trendDelta) >= 3) {
        trendText = trendDelta > 0
            ? ` Im Vergleich zum Vormonat ist das Risiko um ${Math.abs(trendDelta)} Prozentpunkte gestiegen, was auf eine aktive Verschlechterung der Situation hindeutet.`
            : ` Im Vergleich zum Vormonat ist das Risiko um ${Math.abs(trendDelta)} Prozentpunkte gesunken.`;
    }

    // Faktoren-Text
    let factorText = '';
    if (topFactors.length > 0) {
        factorText = ` Die stärksten Risikotreiber sind: ${topFactors.join(', ')}.`;
    }
    if (protectiveFactors.length > 0) {
        factorText += ` Stabilisierend wirken: ${protectiveFactors.join(', ')}.`;
    }

    // Alterskontext
    let ageText = '';
    if (agent.age < 30) {
        ageText = ` Als jüngerer Vermittler (${agent.age} J.) ist die Wechselbereitschaft grundsätzlich höher — gezielte Bindungsmaßnahmen sind besonders wichtig.`;
    } else if (agent.age > 58) {
        ageText = ` Mit ${agent.age} Jahren nähert sich der Vermittler dem Ruhestand — eine frühzeitige Nachfolgeplanung sollte eingeleitet werden.`;
    }

    return `${agent.name} ${tenureContext} und ist der ${agent.rdName} zugeordnet. ${riskContext}${trendText}${factorText}${ageText}`;
}

function renderHCKIRecommendation(agentId) {
    const panel = document.getElementById('hcKIRecommendationPanel');
    const content = document.getElementById('hcKIRecommendationContent');
    if (!panel || !content) return;

    const agent = hcAgents.find(a => a.id === agentId);
    if (!agent) { panel.style.display = 'none'; return; }

    panel.style.display = 'block';

    // KI-Zusammenfassung generieren
    const kiSummary = generateKISummary(agent);

    // Get top risk-increasing factors
    const riskFactors = agent.shapFactors.filter(f => f.value > 0).sort((a, b) => b.value - a.value);
    const topFactor = riskFactors[0]?.factor || agent.topFactor;
    const recommendation = HC_KI_RECOMMENDATIONS[topFactor];

    const summaryHTML = `
        <div class="hc-ki-summary">
            <div class="hc-ki-summary-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 2a4 4 0 014 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0112 2z"/><circle cx="12" cy="6" r="1"/></svg>
                KI-Analyse
            </div>
            <p class="hc-ki-summary-text">${kiSummary}</p>
        </div>
    `;

    if (!recommendation) {
        content.innerHTML = `
            <div class="hc-ki-rec-agent">
                <span class="hc-risk-badge ${agent.riskTier}">${agent.riskScore}%</span>
                <strong>${agent.name}</strong> <span style="color:var(--text-tertiary)">(${agent.id})</span> — ${agent.rdName} · AO-Vermittler
            </div>
            ${summaryHTML}
            <div class="hc-ki-rec-body">
                <div class="hc-ki-rec-title">Allgemeine Retention-Empfehlung</div>
                <p class="hc-ki-rec-rationale">Für diesen Vermittler sollte zeitnah ein persönliches Gespräch mit dem Vertriebsdirektor vereinbart werden, um die individuelle Situation zu analysieren und passende Maßnahmen abzuleiten.</p>
            </div>
        `;
        return;
    }

    const additionalFactors = riskFactors.slice(1, 3).map(f => f.factor);

    content.innerHTML = `
        <div class="hc-ki-rec-agent">
            <span class="hc-risk-badge ${agent.riskTier}">${agent.riskScore}%</span>
            <strong>${agent.name}</strong> <span style="color:var(--text-tertiary)">(${agent.id})</span> — ${agent.rdName} · AO-Vermittler · ${agent.age} Jahre · ${formatTenure(agent.tenure)} Zugehörigkeit
        </div>
        ${summaryHTML}
        <div class="hc-ki-rec-body">
            <div class="hc-ki-rec-header">
                <div class="hc-ki-rec-title">${recommendation.title}</div>
                <span class="hc-ki-rec-urgency ${recommendation.urgency}">${recommendation.urgency === 'kritisch' ? 'Kritisch' : recommendation.urgency === 'hoch' ? 'Hohe Priorität' : recommendation.urgency === 'mittel' ? 'Mittlere Priorität' : 'Niedrige Priorität'}</span>
            </div>
            <div class="hc-ki-rec-trigger">
                <strong>Auslöser:</strong> ${topFactor}
                ${additionalFactors.length > 0 ? `<br><span style="color:var(--text-tertiary)">Weitere Risikofaktoren: ${additionalFactors.join(', ')}</span>` : ''}
            </div>
            <div class="hc-ki-rec-measures">
                <div class="hc-ki-rec-measures-title">Empfohlene Maßnahmen:</div>
                ${recommendation.measures.map((m, i) => `
                    <div class="hc-ki-rec-measure">
                        <div class="hc-ki-rec-measure-num">${i + 1}</div>
                        <div class="hc-ki-rec-measure-content">
                            <div class="hc-ki-rec-measure-action">${m.action}</div>
                            <div class="hc-ki-rec-measure-meta">
                                <span>Zeitrahmen: <strong>${m.timeline}</strong></span>
                                <span>Verantwortlich: <strong>${m.responsible}</strong></span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="hc-ki-rec-rationale">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>${recommendation.rationale}</span>
            </div>
        </div>
        <div class="hc-ki-rec-footer">
            <span class="hc-ki-rec-disclaimer">KI-generierte Empfehlung auf Basis der SHAP-Faktoranalyse — keine automatisierte Entscheidung (Art. 22 DSGVO)</span>
        </div>
    `;
}

function renderHCKanban() {
    ['identified', 'scheduled', 'action', 'resolved'].forEach((status, i) => {
        const col = document.getElementById(`hcKanbanCol${i + 1}`);
        const count = document.getElementById(`hcKanbanCount${i + 1}`);
        const items = hcKanban[status] || [];
        if (count) count.textContent = items.length;
        if (!col) return;

        col.innerHTML = items.map(item => `
            <div class="hc-kanban-card ${item.tier || ''}">
                <div class="hc-kanban-card-header">
                    <strong>${item.id}</strong>
                    ${item.tier ? `<span class="hc-risk-badge ${item.tier}">${item.tier === 'red' ? 'Hoch' : item.tier === 'amber' ? 'Mittel' : 'Gelöst'}</span>` : ''}
                </div>
                <div class="hc-kanban-card-rd">${item.rd}</div>
                ${item.assignee ? `<div class="hc-kanban-card-assignee">→ ${item.assignee}</div>` : ''}
                ${item.action ? `<div class="hc-kanban-card-action">${item.action}</div>` : ''}
                ${item.result ? `<div class="hc-kanban-card-result">${item.result}</div>` : ''}
                <div class="hc-kanban-card-days">${item.days} Tage</div>
            </div>
        `).join('');
    });
}

window.openHRPipeline = openHRPipeline;
window.closeHRPipeline = closeHRPipeline;
window.switchHPMode = switchHPMode;
window.handleHPUpload = handleHPUpload;
window.loadHPDemoProfile = loadHPDemoProfile;
window.resetHPBewerber = resetHPBewerber;
window.toggleHPMatchDetails = toggleHPMatchDetails;
window.sortHPMatches = sortHPMatches;
window.filterHPApplicants = filterHPApplicants;
window.filterHPByRecommended = filterHPByRecommended;
window.openHPDetail = openHPDetail;
window.closeHPDetail = closeHPDetail;
window.hpDetailAction = hpDetailAction;
window.toggleHPChat = toggleHPChat;
window.hpChatAction = hpChatAction;
window.toggleHPBlindScreening = toggleHPBlindScreening;
window.toggleHPCompareCandidate = toggleHPCompareCandidate;
window.openHPCompare = openHPCompare;
window.closeHPCompare = closeHPCompare;
window.generateHPInterviewQuestions = generateHPInterviewQuestions;
window.closeHPInterviewQuestions = closeHPInterviewQuestions;
window.toggleHPSideBySide = toggleHPSideBySide;
window.openHPJobDetail = openHPJobDetail;
window.closeHPJobDetail = closeHPJobDetail;
window.switchHCView = switchHCView;
window.renderHCRiskMovers = renderHCRiskMovers;
window.renderHCRadarChart = renderHCRadarChart;
window.renderHCUnitDetail = renderHCUnitDetail;
window.renderHCEarlyWarnings = renderHCEarlyWarnings;
window.renderHCShapExplanation = renderHCShapExplanation;
window.selectHCRegion = selectHCRegion;
window.showHCShapForAgent = showHCShapForAgent;
window.showHCUnitShapForAgent = showHCUnitShapForAgent;
window.renderHCKIRecommendation = renderHCKIRecommendation;
window.__registerModule('hc-cockpit-ui.js');
