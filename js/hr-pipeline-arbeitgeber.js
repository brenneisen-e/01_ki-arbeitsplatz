// ========================================
// ARBEITGEBER MODE
// ========================================

function renderHPDashboard() {
    const grid = document.getElementById('hpApplicantGrid');
    if (!grid) return;

    grid.innerHTML = HP_ALL_APPLICANTS.map(applicant => {
        const scoreClass = applicant.totalScore >= 80 ? 'high' : applicant.totalScore >= 60 ? 'mid' : 'low';
        const statusLabel = applicant.status === 'recommended' ? 'Empfohlen' : applicant.status === 'review' ? 'Prüfen' : 'Ablehnung empfohlen';
        const isBlind = hpBlindScreening;
        const appliedPos = applicant.appliedPositionId ? HP_POSITIONS.find(p => p.id === applicant.appliedPositionId) : null;
        const appliedDateFormatted = applicant.appliedDate ? new Date(applicant.appliedDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

        return `
            <div class="hp-applicant-card ${applicant.status === 'rejected' ? 'rejection' : ''} ${isBlind ? 'blind' : ''}" data-region="${applicant.region}" data-score="${applicant.totalScore}" data-status="${applicant.status}" onclick="openHPDetail('${applicant.id}')">
                <div class="hp-applicant-score ${scoreClass}">${applicant.totalScore}</div>
                <div class="hp-applicant-info">
                    <h4>${isBlind ? 'Kandidat/in #' + getBlindId(applicant.id) : applicant.name}</h4>
                    <div class="hp-applicant-location">${isBlind ? applicant.region.toUpperCase() : applicant.city + ' | ' + applicant.age + ' Jahre'}</div>
                    ${appliedPos && !isBlind ? `<div style="font-size:var(--font-xs);color:var(--text-tertiary);margin-top:var(--space-1);display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;">
                        <span>${appliedDateFormatted}</span>
                        <span style="color:var(--border)">|</span>
                        <span class="hp-tag" style="cursor:pointer;font-size:var(--font-xs)" onclick="event.stopPropagation(); openHPJobDetail(${appliedPos.id})" title="Stellenbeschreibung anzeigen">${appliedPos.title}, ${appliedPos.city}</span>
                    </div>` : ''}
                    <div class="hp-applicant-summary">${isBlind ? anonymizeText(applicant.summary, applicant) : (applicant.summary || '')}</div>
                    <div class="hp-tags">${(applicant.strengths || []).slice(0, 3).map(s => `<span class="hp-tag">${s}</span>`).join('')}</div>
                </div>
                <div class="hp-applicant-status">
                    <span class="hp-status-badge ${applicant.status}">${statusLabel}</span>
                    ${applicant.koKriterium ? '<span class="hp-status-badge" style="background:#fef2f2;color:#DC2626;border:1px solid #fecaca;font-weight:700">Kritischer Ablehnungsgrund (&bdquo;KO&ldquo;)</span>' : ''}
                </div>
            </div>`;
    }).join('');
}

function filterHPApplicants() {
    const regionFilter = document.getElementById('hpFilterRegion').value;
    const scoreFilter = document.getElementById('hpFilterScore').value;
    const statusFilter = document.getElementById('hpFilterStatus').value;
    document.querySelectorAll('.hp-applicant-card').forEach(card => {
        let show = true;
        if (regionFilter && card.dataset.region !== regionFilter) show = false;
        if (scoreFilter) {
            const score = parseInt(card.dataset.score);
            if (scoreFilter === 'high' && score < 80) show = false;
            if (scoreFilter === 'mid' && (score < 60 || score >= 80)) show = false;
            if (scoreFilter === 'low' && score >= 60) show = false;
        }
        if (statusFilter && card.dataset.status !== statusFilter) show = false;
        card.style.display = show ? '' : 'none';
    });
}

// ========================================
// BLIND SCREENING
// ========================================

function getBlindId(applicantId) {
    const idx = HP_ALL_APPLICANTS.findIndex(a => a.id === applicantId);
    return String(idx + 1).padStart(3, '0');
}

function toggleHPBlindScreening() {
    hpBlindScreening = document.getElementById('hpBlindToggle')?.checked || false;
    renderHPDashboard();
    showHPToast(hpBlindScreening ? 'Blind Screening aktiviert (AGG-konform)' : 'Blind Screening deaktiviert', 'info');
}

// ========================================
// CANDIDATE COMPARISON
// ========================================

function toggleHPCompareCandidate(id) {
    if (hpSelectedForCompare.has(id)) hpSelectedForCompare.delete(id);
    else if (hpSelectedForCompare.size < 4) hpSelectedForCompare.add(id);
    else { showHPToast('Maximal 4 Kandidaten zum Vergleich', 'warning'); return; }

    const btn = document.getElementById('hpCompareBtn');
    const count = document.getElementById('hpCompareCount');
    if (btn) btn.style.display = hpSelectedForCompare.size >= 2 ? '' : 'none';
    if (count) count.textContent = hpSelectedForCompare.size;
}

function openHPCompare() {
    if (hpSelectedForCompare.size < 2) return;
    const candidates = [...hpSelectedForCompare].map(id => HP_ALL_APPLICANTS.find(a => a.id === id)).filter(Boolean);
    const body = document.getElementById('hpCompareBody');

    const dims = ['Vertrieb', 'Branche', 'Qualifikation', 'Standort', 'Soft Skills'];
    const keys = ['vertrieb', 'branche', 'qualifikation', 'standort', 'softskills'];

    const rows = [
        { label: 'Gesamt-Score', values: candidates.map(c => c.totalScore), best: Math.max(...candidates.map(c => c.totalScore)) },
        ...keys.map((k, i) => ({ label: dims[i], values: candidates.map(c => c.scores?.[k] || 0), best: Math.max(...candidates.map(c => c.scores?.[k] || 0)) })),
        { label: 'Erfahrung', values: candidates.map(c => c.experienceYears + ' Jahre'), isText: true },
        { label: 'Standort', values: candidates.map(c => c.city), isText: true },
        { label: 'Qualifikation', values: candidates.map(c => c.education), isText: true },
        { label: 'Status', values: candidates.map(c => c.status === 'recommended' ? 'Empfohlen' : c.status === 'review' ? 'Prüfen' : 'Ablehnung'), isText: true }
    ];

    body.innerHTML = `
        <table class="hp-compare-table">
            <thead><tr><th>Kriterium</th>${candidates.map(c => `<th>${c.name}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(r => `<tr><td class="hp-compare-label">${r.label}</td>${r.values.map((v, i) => {
                const isBest = !r.isText && v === r.best;
                return `<td class="${isBest ? 'hp-compare-best' : ''}">${v}</td>`;
            }).join('')}</tr>`).join('')}</tbody>
        </table>`;

    document.getElementById('hpCompareOverlay').classList.add('active');
}

function closeHPCompare() {
    document.getElementById('hpCompareOverlay')?.classList.remove('active');
}

// ========================================
// DETAIL VIEW (Enhanced with waterfall, skill gap, counterfactual)
// ========================================

function openHPDetail(applicantId) {
    const applicant = HP_ALL_APPLICANTS.find(a => a.id === applicantId);
    if (!applicant) return;
    hpCurrentDetailApplicant = applicant;

    const isBlind = hpBlindScreening;
    document.getElementById('hpDetailName').textContent = isBlind ? 'Kandidat/in #' + getBlindId(applicant.id) : applicant.name;
    const body = document.getElementById('hpDetailBody');

    const scoreCategories = [
        { label: 'Vertriebserfahrung (30%)', value: applicant.scores?.vertrieb || 0 },
        { label: 'Branchenkenntnis (25%)', value: applicant.scores?.branche || 0 },
        { label: 'Qualifikation (20%)', value: applicant.scores?.qualifikation || 0 },
        { label: 'Standort-Match (15%)', value: applicant.scores?.standort || 0 },
        { label: 'Soft Skills (10%)', value: applicant.scores?.softskills || 0 }
    ];

    body.innerHTML = `
        <div style="display:flex;gap:var(--space-4);margin-bottom:var(--space-6);align-items:center;">
            ${!isBlind && applicant.photo ? `<img src="${applicant.photo}" alt="${applicant.name}" class="hp-profile-avatar-large hp-photo-hover" style="width:56px;height:56px;border-radius:50%;object-fit:cover;">` : `<div class="hp-profile-avatar-large">${isBlind ? '#' + getBlindId(applicant.id) : applicant.initials}</div>`}
            <div>
                <div style="font-size:var(--font-lg);font-weight:var(--font-bold);color:var(--text-primary);">${isBlind ? 'Kandidat/in #' + getBlindId(applicant.id) : applicant.name}</div>
                <div style="font-size:var(--font-sm);color:var(--text-secondary);">${isBlind ? applicant.region.toUpperCase() + ' | — Jahre | ' + applicant.experience : applicant.city + ' | ' + applicant.age + ' Jahre | ' + applicant.experience}</div>
                ${(applicant.certifications || []).length ? `<div class="hp-tags" style="margin-top:var(--space-2)">${applicant.certifications.map(c => `<span class="hp-tag cert">${c}</span>`).join('')}</div>` : ''}
                ${(() => {
                    const pos = applicant.appliedPositionId ? HP_POSITIONS.find(p => p.id === applicant.appliedPositionId) : null;
                    const dateStr = applicant.appliedDate ? new Date(applicant.appliedDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
                    return pos ? `<div style="font-size:var(--font-xs);color:var(--text-tertiary);margin-top:var(--space-2);display:flex;align-items:center;gap:var(--space-2);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Bewerbung vom ${dateStr}
                        <span style="color:var(--border)">|</span>
                        <span style="cursor:pointer;color:var(--primary);text-decoration:underline;" onclick="event.stopPropagation(); openHPJobDetail(${pos.id})">${pos.title}, ${pos.city}</span>
                    </div>` : '';
                })()}
            </div>
            <div class="hp-applicant-score ${applicant.totalScore >= 80 ? 'high' : applicant.totalScore >= 60 ? 'mid' : 'low'}" style="margin-left:auto;width:56px;height:56px;font-size:var(--font-lg);">${applicant.totalScore}</div>
        </div>

        <div class="hp-ki-summary" style="margin-bottom:var(--space-6);"><strong>KI-Zusammenfassung:</strong> ${isBlind ? anonymizeText(applicant.summary, applicant) : applicant.summary}</div>

        ${applicant.linkedinInsights ? `
        <div style="margin-bottom:var(--space-6);">
            <h4 style="font-size:var(--font-sm);font-weight:var(--font-semibold);color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:var(--space-3);display:flex;align-items:center;gap:var(--space-2);">LinkedIn-Erkenntnisse <span class="hp-linkedin-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>LinkedIn</span></h4>
            ${applicant.linkedinInsights.map(i => `
                <div class="hp-linkedin-insight">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="color:#0A66C2;flex-shrink:0;margin-top:2px"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    <div>
                        <div class="hp-linkedin-insight-text">${i.text}</div>
                        <div class="hp-linkedin-insight-detail">${i.detail}</div>
                    </div>
                </div>`).join('')}
        </div>` : ''}

        ${applicant.koKriterium ? `
        <div style="background:#fef2f2;border:2px solid #DC2626;border-radius:var(--radius-md);padding:var(--space-4) var(--space-5);margin-bottom:var(--space-6);display:flex;align-items:flex-start;gap:var(--space-3);">
            <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" width="24" height="24" style="flex-shrink:0;margin-top:2px"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div>
                <div style="font-weight:700;color:#DC2626;font-size:var(--font-base);margin-bottom:var(--space-1)">Kritischer Ablehnungsgrund (&bdquo;KO&ldquo;)</div>
                <div style="color:#991b1b;font-size:var(--font-sm)">${applicant.koKriterium}</div>
            </div>
        </div>` : ''}

        ${applicant.waterfall ? renderHPWaterfallHTML(applicant.waterfall) : ''}

        <div class="hp-score-breakdown">
            <h4>Score-Aufschlüsselung</h4>
            ${scoreCategories.map(cat => {
                const barClass = cat.value >= 70 ? 'high' : cat.value >= 40 ? 'mid' : 'low';
                return `<div class="hp-score-bar-row"><div class="hp-score-bar-label">${cat.label}</div><div class="hp-score-bar-track"><div class="hp-score-bar-value ${barClass}" style="width:${cat.value}%"></div></div><div class="hp-score-bar-num">${cat.value}</div></div>`;
            }).join('')}
        </div>

        ${applicant.skillGap ? renderHPSkillGapHTML(applicant.skillGap) : ''}

        ${applicant.counterfactual ? `<div class="hp-counterfactual"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg><div class="hp-counterfactual-text">${applicant.counterfactual}</div></div>` : ''}

        <div class="hp-strengths-weaknesses" style="margin-top:var(--space-6);">
            <div class="hp-sw-section strengths"><h4>Stärken</h4><ul class="hp-sw-list">${(applicant.strengths || []).map(s => `<li><svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>${s}</li>`).join('')}</ul></div>
            <div class="hp-sw-section weaknesses"><h4>Schwächen</h4><ul class="hp-sw-list">${(applicant.weaknesses || []).map(w => `<li><svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>${w}</li>`).join('')}${(applicant.neutrals || []).map(n => `<li style="color:var(--text-tertiary)"><svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>${n}</li>`).join('')}</ul></div>
        </div>`;

    // Show PDF button only for Max Berger (who has a CV PDF)
    const pdfBtn = document.getElementById('hpPdfBtn');
    if (pdfBtn) pdfBtn.style.display = applicant.id === 'max' ? 'inline-flex' : 'none';

    document.getElementById('hpDetailOverlay').classList.add('active');
}

function renderHPSkillGapHTML(skillGap) {
    const rows = skillGap.dimensions.map(d => {
        const gap = Math.max(0, d.required - d.current);
        const color = gap > 0 ? '#DC2626' : '#16A34A';
        return `<div class="hp-skill-gap-row">
            <div class="hp-skill-gap-label">${d.label}</div>
            <div class="hp-skill-gap-bars">
                <div class="hp-skill-gap-current" style="width:${d.current}%"></div>
                <div class="hp-skill-gap-required" style="left:${d.required}%" title="Anforderung: ${d.required}%"></div>
            </div>
            <div class="hp-skill-gap-pct" style="color:${color}">${gap > 0 ? '-' + gap + '%' : 'OK'}</div>
        </div>${d.reason ? `<div class="hp-skill-gap-reason"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>${d.reason}</div>` : ''}`;
    }).join('');
    return `<div class="hp-skill-gap"><h4>Skill-Gap-Analyse (Ist vs. Soll)</h4>${rows}${skillGap.training ? `<div class="hp-training-rec"><strong>Weiterbildungsempfehlung:</strong> ${skillGap.training}</div>` : ''}</div>`;
}

function closeHPDetail() {
    document.getElementById('hpDetailOverlay')?.classList.remove('active');
    const panel = document.getElementById('hpDetailPanel');
    const cvPane = document.getElementById('hpDetailCV');
    const iframe = document.getElementById('hpPdfFrame');
    if (panel) panel.classList.remove('side-by-side');
    if (cvPane) cvPane.classList.remove('visible');
    if (iframe) iframe.src = '';
}

function hpDetailAction(action) {
    const name = hpCurrentDetailApplicant?.name || 'Kandidat';
    if (action === 'merken') { showHPToast(`${name} wurde vorgemerkt`, 'info'); return; }

    if (action === 'einladen') {
        showHPActionWorkflow('einladen');
    } else if (action === 'ablehnen') {
        showHPActionWorkflow('ablehnen');
    }
}

function showHPActionWorkflow(type) {
    const applicant = hpCurrentDetailApplicant;
    const name = applicant?.name || 'Kandidat';
    const actionsDiv = document.querySelector('.hp-detail-actions');
    if (!actionsDiv) return;

    if (type === 'einladen') {
        actionsDiv.innerHTML = `
            <div class="hp-workflow-panel">
                <div class="hp-workflow-header">
                    <h4>Einladung für ${name}</h4>
                    <button class="hp-workflow-close" onclick="resetHPDetailActions()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">Gesprächsformat</label>
                    <div class="hp-workflow-options" id="hpInviteType">
                        <button class="hp-workflow-option selected" data-value="video" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                            Video-Interview
                        </button>
                        <button class="hp-workflow-option" data-value="telefon" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                            Telefoninterview
                        </button>
                        <button class="hp-workflow-option" data-value="vor-ort" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            Vor-Ort-Gespräch
                        </button>
                    </div>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">Terminvorschlag</label>
                    <div class="hp-workflow-options" id="hpInviteDate">
                        ${generateHPDateOptions().map((d, i) => `<button class="hp-workflow-option${i === 0 ? ' selected' : ''}" data-value="${d.value}" onclick="hpSelectOption(this)">${d.label}</button>`).join('')}
                    </div>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">Interviewer</label>
                    <div class="hp-workflow-options" id="hpInviteInterviewer">
                        <button class="hp-workflow-option selected" data-value="mueller" onclick="hpSelectOption(this)">
                            <span class="hp-workflow-avatar">SM</span>
                            Sandra Müller<span class="hp-workflow-role">Teamleiterin Recruiting</span>
                        </button>
                        <button class="hp-workflow-option" data-value="fischer" onclick="hpSelectOption(this)">
                            <span class="hp-workflow-avatar">MF</span>
                            Martin Fischer<span class="hp-workflow-role">Abteilungsleiter Vertrieb</span>
                        </button>
                        <button class="hp-workflow-option" data-value="schmidt" onclick="hpSelectOption(this)">
                            <span class="hp-workflow-avatar">KS</span>
                            Katrin Schmidt<span class="hp-workflow-role">HR Business Partner</span>
                        </button>
                    </div>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">Notiz an den Kandidaten</label>
                    <textarea class="hp-workflow-textarea" id="hpInviteNote" placeholder="Optionale Nachricht zur Einladung..." rows="2"></textarea>
                </div>

                <div class="hp-workflow-actions">
                    <button class="hp-action-btn" onclick="resetHPDetailActions()">Abbrechen</button>
                    <button class="hp-action-btn primary" onclick="confirmHPInvite()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>
                        Einladung senden
                    </button>
                </div>
            </div>`;
    } else if (type === 'ablehnen') {
        actionsDiv.innerHTML = `
            <div class="hp-workflow-panel rejection">
                <div class="hp-workflow-header">
                    <h4>Absage für ${name}</h4>
                    <button class="hp-workflow-close" onclick="resetHPDetailActions()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">Ablehnungsgrund</label>
                    <div class="hp-workflow-options vertical" id="hpRejectReason">
                        <button class="hp-workflow-option selected" data-value="qualifikation" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            Qualifikation nicht ausreichend
                        </button>
                        <button class="hp-workflow-option" data-value="branche" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                            Fehlende Branchenerfahrung
                        </button>
                        <button class="hp-workflow-option" data-value="standort" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            Standort nicht passend
                        </button>
                        <button class="hp-workflow-option" data-value="besetzt" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
                            Position bereits besetzt
                        </button>
                        <button class="hp-workflow-option" data-value="ko" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            Kritischer Ablehnungsgrund
                        </button>
                    </div>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">E-Mail-Vorlage</label>
                    <div class="hp-workflow-options" id="hpRejectTemplate">
                        <button class="hp-workflow-option selected" data-value="standard" onclick="hpSelectOption(this); hpUpdateRejectPreview()">
                            Standard-Absage
                        </button>
                        <button class="hp-workflow-option" data-value="talentpool" onclick="hpSelectOption(this); hpUpdateRejectPreview()">
                            Absage + Talent-Pool
                        </button>
                        <button class="hp-workflow-option" data-value="empfehlung" onclick="hpSelectOption(this); hpUpdateRejectPreview()">
                            Absage + Empfehlung
                        </button>
                    </div>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">Vorschau</label>
                    <div class="hp-workflow-preview" id="hpRejectPreview">
                        ${getHPRejectPreview('standard', name)}
                    </div>
                </div>

                <div class="hp-workflow-actions">
                    <button class="hp-action-btn" onclick="resetHPDetailActions()">Abbrechen</button>
                    <button class="hp-action-btn danger" onclick="confirmHPReject()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>
                        Absage senden
                    </button>
                </div>
            </div>`;
    }
}

function hpSelectOption(btn) {
    const group = btn.parentElement;
    group.querySelectorAll('.hp-workflow-option').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function generateHPDateOptions() {
    const options = [];
    const now = new Date();
    const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const times = ['10:00', '14:00', '11:00'];
    let count = 0;
    for (let i = 1; count < 3; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        options.push({
            value: d.toISOString().split('T')[0],
            label: `${dayNames[d.getDay()]}, ${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} · ${times[count]} Uhr`
        });
        count++;
    }
    return options;
}

function getHPRejectPreview(template, name) {
    const templates = {
        standard: `Sehr geehrte/r ${name},\n\nvielen Dank für Ihre Bewerbung und Ihr Interesse an ERGO. Nach sorgfältiger Prüfung müssen wir Ihnen leider mitteilen, dass wir uns für andere Kandidat/innen entschieden haben.\n\nWir wünschen Ihnen für Ihre berufliche Zukunft alles Gute.\n\nMit freundlichen Grüßen\nERGO Recruiting Team`,
        talentpool: `Sehr geehrte/r ${name},\n\nvielen Dank für Ihre Bewerbung. Leider können wir Ihnen aktuell keine passende Position anbieten. Ihr Profil hat uns jedoch überzeugt — wir möchten Sie gerne in unseren Talent-Pool aufnehmen und Sie kontaktieren, sobald eine geeignete Stelle frei wird.\n\nMit freundlichen Grüßen\nERGO Recruiting Team`,
        empfehlung: `Sehr geehrte/r ${name},\n\nvielen Dank für Ihre Bewerbung. Für die ausgeschriebene Position können wir Ihnen leider kein Angebot machen. Wir empfehlen Ihnen jedoch, sich auf andere offene Stellen in unserem Karriereportal umzusehen, die besser zu Ihrem Profil passen könnten.\n\nMit freundlichen Grüßen\nERGO Recruiting Team`
    };
    return `<div class="hp-email-preview">${(templates[template] || templates.standard).replace(/\n/g, '<br>')}</div>`;
}

function hpUpdateRejectPreview() {
    const name = hpCurrentDetailApplicant?.name || 'Kandidat';
    const selected = document.querySelector('#hpRejectTemplate .hp-workflow-option.selected');
    const template = selected?.dataset.value || 'standard';
    const preview = document.getElementById('hpRejectPreview');
    if (preview) preview.innerHTML = getHPRejectPreview(template, name);
}

function confirmHPInvite() {
    const name = hpCurrentDetailApplicant?.name || 'Kandidat';
    const type = document.querySelector('#hpInviteType .selected')?.dataset.value || 'video';
    const date = document.querySelector('#hpInviteDate .selected')?.textContent.trim() || '';
    const interviewer = document.querySelector('#hpInviteInterviewer .selected')?.textContent.trim().split('\n')[0] || '';
    const typeLabels = { video: 'Video-Interview', telefon: 'Telefoninterview', 'vor-ort': 'Vor-Ort-Gespräch' };
    showHPToast(`${typeLabels[type]} mit ${name} geplant: ${date}`, 'success');
    closeHPDetail();
}

function confirmHPReject() {
    const name = hpCurrentDetailApplicant?.name || 'Kandidat';
    const template = document.querySelector('#hpRejectTemplate .selected')?.dataset.value || 'standard';
    const templateLabels = { standard: 'Standard-Absage', talentpool: 'Absage mit Talent-Pool-Aufnahme', empfehlung: 'Absage mit Stellenempfehlung' };
    showHPToast(`${templateLabels[template]} an ${name} gesendet`, 'warning');
    closeHPDetail();
}

function resetHPDetailActions() {
    const actionsDiv = document.querySelector('.hp-detail-actions');
    if (!actionsDiv) return;
    actionsDiv.innerHTML = `
        <button class="hp-action-btn primary" onclick="hpDetailAction('einladen')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Einladen
        </button>
        <button class="hp-action-btn danger" onclick="hpDetailAction('ablehnen')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            Ablehnen
        </button>
        <button class="hp-action-btn" onclick="hpDetailAction('merken')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"></path></svg>
            Merken
        </button>
        <button class="hp-action-btn" onclick="generateHPInterviewQuestions()" title="KI-generierte Interviewfragen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Interviewfragen
        </button>`;
}

// ========================================
window.__registerModule('hr-pipeline-arbeitgeber.js');
