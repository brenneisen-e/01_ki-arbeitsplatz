// ========================================
// MODE SWITCHING
// ========================================

function switchHPMode(mode) {
    hpCurrentMode = mode;
    document.querySelectorAll('.hp-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    const bewerberSection = document.getElementById('hpBewerberMode');
    const arbeitgeberSection = document.getElementById('hpArbeitgeberMode');
    const cockpitSection = document.getElementById('hpCockpitMode');

    if (mode === 'bewerber') {
        if (bewerberSection) bewerberSection.style.display = 'block';
        if (arbeitgeberSection) arbeitgeberSection.classList.remove('active');
        if (cockpitSection) cockpitSection.classList.remove('active');
    } else if (mode === 'arbeitgeber') {
        if (bewerberSection) bewerberSection.style.display = 'none';
        if (cockpitSection) cockpitSection.classList.remove('active');
        if (arbeitgeberSection) {
            arbeitgeberSection.classList.add('active');
            renderHPDashboard();
            setTimeout(() => { animateHPKPICounters(); drawHPSparklines(); }, 100);
        }
    } else if (mode === 'cockpit') {
        if (bewerberSection) bewerberSection.style.display = 'none';
        if (arbeitgeberSection) arbeitgeberSection.classList.remove('active');
        if (cockpitSection) {
            cockpitSection.classList.add('active');
            initHRCockpit();
        }
    }
    // Auto-expand chat on mode switch
    setTimeout(() => {
        const chatWindow = document.getElementById('hpChatWindow');
        if (chatWindow && !chatWindow.classList.contains('open')) {
            hpChatOpen = true;
            chatWindow.classList.add('open');
        }
    }, 300);
    initHPChat();
    document.dispatchEvent(new CustomEvent('moduleChanged', { detail: { module: 'hr-pipeline', view: mode } }));
}

// ========================================
// BEWERBER MODE
// ========================================

function handleHPUpload(event) { loadHPDemoProfile('max'); }

function loadHPDemoProfile(profileId) {
    const profile = HP_PROFILES[profileId];
    if (!profile) return;
    hpCurrentProfile = profile;

    document.getElementById('hpUploadSection').style.display = 'none';
    const loadingSection = document.getElementById('hpLoadingSection');
    loadingSection.classList.add('active');

    const bar = document.getElementById('hpLoadingBar');
    const status = document.getElementById('hpLoadingStatus');
    const useLinkedin = document.getElementById('hpLinkedinToggle')?.checked;
    const steps = [
        { pct: 12, text: 'Dokument wird verarbeitet...' },
        { pct: 25, text: 'Textextraktion läuft...' },
        { pct: 40, text: 'Qualifikationen werden erkannt (§34d, IHK, Fachwirt)...' },
        { pct: 55, text: 'Versicherungs-Branchenerfahrung wird analysiert...' },
        ...(useLinkedin ? [{ pct: 68, text: 'LinkedIn-Profil wird analysiert...' }, { pct: 78, text: 'Social-Media-Netzwerk wird ausgewertet...' }] : []),
        { pct: 88, text: 'Stellenabgleich wird durchgeführt...' },
        { pct: 95, text: 'SHAP-Erklärung wird generiert...' },
        { pct: 100, text: 'Analyse abgeschlossen!' }
    ];

    let i = 0;
    const interval = setInterval(() => {
        if (i < steps.length) {
            bar.style.width = steps[i].pct + '%';
            status.textContent = steps[i].text;
            i++;
        } else {
            clearInterval(interval);
            setTimeout(() => { loadingSection.classList.remove('active'); showHPResults(profile); }, 400);
        }
    }, 350);
}

function showHPResults(profile) {
    const resultsSection = document.getElementById('hpResultsSection');
    resultsSection.classList.add('active');
    renderHPProfileCard(profile);

    const rejectionNotice = document.getElementById('hpRejectionNotice');
    if (profile.rejected) {
        rejectionNotice.classList.add('active');
        document.getElementById('hpRejectionText').textContent = profile.rejectionText;
    } else {
        rejectionNotice.classList.remove('active');
    }

    renderHPMatches(profile);
    initHPChat();
    showHPToast('KI-Analyse abgeschlossen', 'success');
}

function renderHPProfileCard(profile) {
    const card = document.getElementById('hpProfileCard');
    const scoreClass = profile.totalScore >= 80 ? 'high' : profile.totalScore >= 60 ? 'mid' : 'low';
    const circumference = Math.round(2 * Math.PI * 24);
    const offset = Math.round(circumference * (1 - profile.totalScore / 100));

    const certTags = (profile.certifications || []).map(c => `<span class="hp-tag cert">${c}</span>`).join('');
    const greenFlags = (profile.insuranceFlags?.green || []).map(f => `<span class="hp-tag flag-green">${f}</span>`).join('');
    const redFlags = (profile.insuranceFlags?.red || []).map(f => `<span class="hp-tag flag-red">${f}</span>`).join('');
    const neutralFlags = (profile.insuranceFlags?.neutral || []).map(f => `<span class="hp-tag flag-neutral">${f}</span>`).join('');
    const linkedinBadge = '<span class="hp-linkedin-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>LinkedIn</span>';
    const useLinkedin = document.getElementById('hpLinkedinToggle')?.checked;
    const linkedinHTML = useLinkedin && profile.linkedinInsights ? `
        <div class="hp-profile-section" style="grid-column: 1 / -1;">
            <h4>LinkedIn-Erkenntnisse ${linkedinBadge}</h4>
            ${profile.linkedinInsights.map(i => `
                <div class="hp-linkedin-insight">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="color:#0A66C2;flex-shrink:0;margin-top:2px"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    <div>
                        <div class="hp-linkedin-insight-text">${i.text}</div>
                        <div class="hp-linkedin-insight-detail">${i.detail}</div>
                    </div>
                </div>
            `).join('')}
        </div>` : '';

    card.innerHTML = `
        <div class="hp-profile-header">
            ${profile.photo ? `<img src="${profile.photo}" alt="${profile.name}" class="hp-profile-avatar-large" style="width:56px;height:56px;border-radius:50%;object-fit:cover;">` : `<div class="hp-profile-avatar-large">${profile.initials}</div>`}
            <div class="hp-profile-info">
                <h2>${profile.name}</h2>
                <div class="hp-profile-meta">
                    <span class="hp-profile-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${profile.city}
                    </span>
                    <span class="hp-profile-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${profile.age} Jahre
                    </span>
                    <span class="hp-profile-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path></svg>
                        ${profile.experienceYears} Jahre Erfahrung
                    </span>
                </div>
            </div>
            <div class="hp-score-ring">
                <svg viewBox="0 0 56 56" width="56" height="56">
                    <circle class="score-bg" cx="28" cy="28" r="24"></circle>
                    <circle class="score-fill ${scoreClass}" cx="28" cy="28" r="24" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
                </svg>
                <div class="hp-score-value">${profile.totalScore}%</div>
            </div>
        </div>
        <div class="hp-profile-body">
            <div class="hp-profile-section">
                <h4>Berufserfahrung</h4>
                <p style="font-size:var(--font-base);color:var(--text-secondary);margin:0;">${profile.experience}</p>
            </div>
            <div class="hp-profile-section">
                <h4>Ausbildung & Zertifikate</h4>
                <div class="hp-tags">${certTags || `<span class="hp-tag">${profile.education}</span>`}</div>
            </div>
            <div class="hp-profile-section">
                <h4>Versicherungs-Indikatoren</h4>
                <div class="hp-tags">${greenFlags}${redFlags}${neutralFlags}</div>
            </div>
            ${linkedinHTML}
            <div class="hp-profile-section">
                <h4>Stärken-Profil</h4>
                <canvas id="hpRadarChart" class="hp-radar-container"></canvas>
            </div>
            ${profile.waterfall ? renderHPWaterfallHTML(profile.waterfall) : ''}
            <div class="hp-ki-summary" id="hpKiSummary">
                <strong>KI-Zusammenfassung:</strong> ${profile.summary}
            </div>
            ${profile.counterfactual ? `
            <div class="hp-counterfactual" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <div class="hp-counterfactual-text">${profile.counterfactual}</div>
            </div>` : ''}
        </div>
    `;

    setTimeout(() => drawHPRadarChart(profile), 100);
    setTimeout(() => hpTypewriterEffect(document.getElementById('hpKiSummary'), profile.summary, 12), 200);
}

function renderHPWaterfallHTML(waterfall) {
    const maxPoints = Math.max(...waterfall.map(w => Math.abs(w.points)));
    const bars = waterfall.map(w => {
        const pct = (Math.abs(w.points) / maxPoints) * 100;
        const typeClass = w.type === 'positive' ? 'positive' : w.type === 'neutral' ? 'neutral' : 'negative';
        return `<div class="hp-waterfall-bar">
            <div class="hp-waterfall-label">${w.label}</div>
            <div class="hp-waterfall-track"><div class="hp-waterfall-fill ${typeClass}" style="width:${pct}%"></div></div>
            <div class="hp-waterfall-value ${typeClass}">${w.type === 'positive' ? '+' : ''}${w.points}</div>
        </div>`;
    }).join('');
    return `<div class="hp-waterfall" style="grid-column: 1 / -1;"><h4>Score-Erklärung (SHAP-Analyse)</h4>${bars}</div>`;
}

function drawHPRadarChart(profile) {
    const canvas = document.getElementById('hpRadarChart');
    if (!canvas || typeof Chart === 'undefined') return;
    new Chart(canvas.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Vertrieb', 'Branche', 'Qualifikation', 'Standort', 'Soft Skills'],
            datasets: [{
                label: 'Profil-Score',
                data: profile.radarData,
                backgroundColor: 'rgba(200, 16, 46, 0.1)',
                borderColor: 'rgba(200, 16, 46, 0.7)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(200, 16, 46, 0.8)',
                pointRadius: 3
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 25, font: { size: 12 }, backdropColor: 'transparent' }, pointLabels: { font: { size: 14, weight: '500' }, color: '#475569' }, grid: { color: 'rgba(0,0,0,0.06)' }, angleLines: { color: 'rgba(0,0,0,0.06)' } } },
            plugins: { legend: { display: false } },
            animation: { duration: 800, easing: 'easeOutQuart' }
        }
    });
}

// ========================================
// JOB MATCHES
// ========================================

function getHPMatchesForProfile(profile) {
    return HP_POSITIONS.map(pos => {
        const score = getHPMatchScore(profile, pos);
        const distance = HP_DISTANCES[profile.city]?.[pos.city] || 999;
        const badges = getHPMatchBadges(profile, pos);
        return { position: pos, score, distance, badges, recommended: score >= 85 && distance <= 50 };
    }).sort((a, b) => b.score - a.score);
}

function renderHPMatchCard(match, idx) {
    const scoreClass = match.score >= 80 ? 'high' : match.score >= 60 ? 'mid' : 'low';
    const circumference = Math.round(2 * Math.PI * 24);
    const offset = Math.round(circumference * (1 - match.score / 100));
    return `
        <div class="hp-match-card ${match.recommended ? 'recommended' : ''}" onclick="openHPJobDetail(${match.position.id})">
            <div class="hp-match-card-header">
                <div class="hp-match-title-area">
                    <div class="hp-match-title">
                        ${match.position.title}
                        ${match.recommended ? '<span class="hp-recommended-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Empfohlen</span>' : ''}
                    </div>
                    <div class="hp-match-location">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${match.position.city} <span class="hp-match-distance">(${match.distance} km)</span>
                    </div>
                </div>
                <div class="hp-score-ring">
                    <svg viewBox="0 0 56 56" width="56" height="56"><circle class="score-bg" cx="28" cy="28" r="24"></circle><circle class="score-fill ${scoreClass}" cx="28" cy="28" r="24" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle></svg>
                    <div class="hp-score-value">${match.score}%</div>
                </div>
            </div>
            <div class="hp-match-badges">${match.badges.map(b => `<span class="hp-match-badge ${b.color}">${b.text}</span>`).join('')}</div>
            <button class="hp-match-expand-btn" onclick="event.stopPropagation(); toggleHPMatchDetails(${idx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"></polyline></svg>
                Details anzeigen
            </button>
            <div class="hp-match-details" id="hpMatchDetail${idx}">
                <h4 style="font-size:var(--font-sm);font-weight:var(--font-semibold);color:var(--text-primary);margin:0 0 var(--space-2);">Anforderungsprofil</h4>
                <p style="font-size:var(--font-sm);color:var(--text-secondary);margin:0 0 var(--space-3);">${match.position.requirements}</p>
                <h4 style="font-size:var(--font-sm);font-weight:var(--font-semibold);color:var(--text-primary);margin:0 0 var(--space-2);">Stellentyp</h4>
                <p style="font-size:var(--font-sm);color:var(--text-secondary);margin:0;">${match.position.type}</p>
            </div>
        </div>`;
}

function renderHPMatches(profile) {
    const container = document.getElementById('hpMatchesList');
    container.innerHTML = getHPMatchesForProfile(profile).map((m, i) => renderHPMatchCard(m, i)).join('');
}

function toggleHPMatchDetails(idx) {
    const detail = document.getElementById('hpMatchDetail' + idx);
    if (detail) {
        detail.classList.toggle('expanded');
        const btn = detail.previousElementSibling;
        const isExpanded = detail.classList.contains('expanded');
        if (btn) btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="transform:${isExpanded ? 'rotate(180deg)' : 'none'}"><polyline points="6 9 12 15 18 9"></polyline></svg> ${isExpanded ? 'Details ausblenden' : 'Details anzeigen'}`;
    }
}

function sortHPMatches(sortBy) {
    if (!hpCurrentProfile) return;
    const container = document.getElementById('hpMatchesList');
    const matches = getHPMatchesForProfile(hpCurrentProfile);
    if (sortBy === 'distance') matches.sort((a, b) => a.distance - b.distance);
    else if (sortBy === 'region') matches.sort((a, b) => a.position.region.localeCompare(b.position.region));
    container.innerHTML = matches.map((m, i) => renderHPMatchCard(m, i)).join('');
}

function resetHPBewerber() {
    hpCurrentProfile = null;
    document.getElementById('hpUploadSection').style.display = '';
    document.getElementById('hpResultsSection').classList.remove('active');
    document.getElementById('hpLoadingSection').classList.remove('active');
    document.getElementById('hpLoadingBar').style.width = '0%';
    initHPChat();
}

