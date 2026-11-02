// INTERVIEW QUESTIONS
// ========================================

function generateHPInterviewQuestions() {
    const applicant = hpCurrentDetailApplicant;
    if (!applicant || !applicant.interviewQuestions) {
        showHPToast('Keine Interviewfragen für diesen Kandidaten verfügbar', 'warning');
        return;
    }

    const body = document.getElementById('hpInterviewBody');
    const categories = [
        { key: 'background', title: 'Hintergrund-Verifizierung' },
        { key: 'behavioral', title: 'Verhaltens-/STAR-Fragen' },
        { key: 'technical', title: 'Fachliche Fragen' }
    ];

    body.innerHTML = `
        <div style="margin-bottom:var(--space-4);padding:var(--space-3) var(--space-4);background:var(--gray-50);border-radius:var(--radius-md);font-size:var(--font-sm);color:var(--text-secondary);">
            KI-generierte Interviewfragen für <strong>${applicant.name}</strong> (Score: ${applicant.totalScore}) — basierend auf CV-Analyse und Zielposition.
        </div>
        ${categories.map(cat => {
            const questions = applicant.interviewQuestions[cat.key];
            if (!questions || !questions.length) return '';
            return `<div class="hp-interview-category"><h4>${cat.title}</h4>${questions.map(q => `
                <div class="hp-interview-question">${q.q}<div class="hp-interview-why">Warum diese Frage: ${q.why}</div></div>
            `).join('')}</div>`;
        }).join('')}`;

    document.getElementById('hpInterviewOverlay').classList.add('active');
    showHPToast('Interviewfragen generiert', 'success');
}

function closeHPInterviewQuestions() {
    document.getElementById('hpInterviewOverlay')?.classList.remove('active');
}

// ========================================
// JOB DETAIL OVERLAY
// ========================================

function openHPJobDetail(positionId) {
    const position = HP_POSITIONS.find(p => p.id === positionId);
    if (!position) return;

    const overlay = document.getElementById('hpJobDetailOverlay');
    const titleEl = document.getElementById('hpJobDetailTitle');
    const body = document.getElementById('hpJobDetailBody');

    titleEl.textContent = position.title;

    const descriptionHTML = (position.description || '').replace(/\n/g, '<br>');

    body.innerHTML = `
        <div class="hp-job-detail-meta">
            <div class="hp-job-detail-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${position.city}
            </div>
            <div class="hp-job-detail-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path></svg>
                ${position.type}
            </div>
            <div class="hp-job-detail-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Vollzeit
            </div>
        </div>

        <div class="hp-job-detail-section">
            <h4>Stellenbeschreibung</h4>
            <div class="hp-job-detail-description">${descriptionHTML}</div>
        </div>

        <div class="hp-job-detail-section">
            <h4>Anforderungen</h4>
            <p style="font-size: var(--font-sm); color: var(--text-secondary); line-height: var(--leading-relaxed);">${position.requirements}</p>
        </div>

        ${position.benefits && position.benefits.length ? `
        <div class="hp-job-detail-section">
            <h4>Wir bieten</h4>
            <ul class="hp-job-benefits">
                ${position.benefits.map(b => `
                    <li class="hp-job-benefit-tag">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${b}
                    </li>
                `).join('')}
            </ul>
        </div>` : ''}
    `;

    overlay.classList.add('active');
}

function closeHPJobDetail() {
    const overlay = document.getElementById('hpJobDetailOverlay');
    if (overlay) overlay.classList.remove('active');
}

// ========================================
// CHATBOT
// ========================================

function initHPChat() {
    const messagesContainer = document.getElementById('hpChatMessages');
    const buttonsContainer = document.getElementById('hpChatButtons');
    if (!messagesContainer || !buttonsContainer) return;
    messagesContainer.innerHTML = '';
    buttonsContainer.innerHTML = '';
    addHPChatBubble('bot', 'Hallo! Ich bin der ERGO KI-Recruiting-Assistent. Wie kann ich Ihnen helfen?');
    renderHPChatButtons(hpCurrentMode === 'bewerber' ? HP_CHAT_BEWERBER_START : HP_CHAT_ARBEITGEBER_START);
}

function toggleHPChat() {
    const w = document.getElementById('hpChatWindow');
    if (!w) return;
    hpChatOpen = !hpChatOpen;
    w.classList.toggle('open', hpChatOpen);
}

function addHPChatBubble(type, text) {
    const container = document.getElementById('hpChatMessages');
    if (!container) return;
    const bubble = document.createElement('div');
    bubble.className = `hp-chat-bubble ${type}`;
    bubble.innerHTML = text.replace(/\n- /g, '\n<li>').replace(/\n\d+\. /g, (m) => '\n<li>' + m.trim().replace(/^\d+\. /, '')).replace(/\n/g, '<br>');
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function showHPTypingIndicator() {
    const container = document.getElementById('hpChatMessages');
    if (!container) return;
    const typing = document.createElement('div');
    typing.className = 'hp-chat-typing';
    typing.id = 'hpTypingIndicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
}

function removeHPTypingIndicator() {
    document.getElementById('hpTypingIndicator')?.remove();
}

function renderHPChatButtons(buttons) {
    const container = document.getElementById('hpChatButtons');
    if (!container) return;
    const iconMap = {
        search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
        alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
        trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
        bar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
        star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
        mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22 6 12 13 2 6"></polyline></svg>',
        home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
        list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    };
    container.innerHTML = buttons.map(btn => `<button class="hp-chat-btn" onclick="hpChatAction('${btn.action}')">${iconMap[btn.icon] || ''}${btn.label}</button>`).join('');
}

function hpChatAction(action) {
    if (action === 'start') { initHPChat(); return; }
    const response = HP_CHAT_RESPONSES[action];
    if (!response) return;

    const allButtons = [...(hpCurrentMode === 'bewerber' ? HP_CHAT_BEWERBER_START : HP_CHAT_ARBEITGEBER_START)];
    Object.values(HP_CHAT_RESPONSES).forEach(r => { if (r.followUp) allButtons.push(...r.followUp); });
    const clicked = allButtons.find(b => b.action === action);
    if (clicked) addHPChatBubble('user', clicked.label);

    // Also filter in the dashboard when relevant chat actions are triggered
    if (action === 'top_kandidaten' && hpCurrentMode === 'arbeitgeber') {
        const statusFilter = document.getElementById('hpFilterStatus');
        if (statusFilter) { statusFilter.value = 'recommended'; filterHPApplicants(); }
    } else if (action === 'kritische' && hpCurrentMode === 'arbeitgeber') {
        const statusFilter = document.getElementById('hpFilterStatus');
        if (statusFilter) { statusFilter.value = 'rejected'; filterHPApplicants(); }
    }

    showHPTypingIndicator();
    setTimeout(() => {
        removeHPTypingIndicator();
        const text = typeof response.getText === 'function' ? response.getText(hpCurrentProfile) : response.text;
        addHPChatBubble('bot', text);
        if (response.followUp) renderHPChatButtons(response.followUp);
    }, 800 + Math.random() * 400);
}

// ========================================
// GLOBAL EXPORTS
// ========================================

// ========================================
// FILTER BY RECOMMENDED (KPI Card Click)
// ========================================

function filterHPByRecommended() {
    const statusFilter = document.getElementById('hpFilterStatus');
    if (!statusFilter) return;

    // Toggle filter
    if (statusFilter.value === 'recommended') {
        statusFilter.value = '';
        document.querySelector('.hp-kpi-card.clickable')?.classList.remove('active-filter');
    } else {
        statusFilter.value = 'recommended';
        document.querySelector('.hp-kpi-card.clickable')?.classList.add('active-filter');
    }
    filterHPApplicants();
    showHPToast(statusFilter.value === 'recommended' ? 'Gefiltert: Empfohlene Kandidaten' : 'Filter zurückgesetzt', 'info');
}

// ========================================
// SIDE-BY-SIDE CV PREVIEW
// ========================================

function toggleHPSideBySide() {
    const applicant = hpCurrentDetailApplicant;
    if (!applicant || applicant.id !== 'max') return;

    const panel = document.getElementById('hpDetailPanel');
    const cvPane = document.getElementById('hpDetailCV');
    const iframe = document.getElementById('hpPdfFrame');
    const btnText = document.getElementById('hpPdfBtnText');

    if (cvPane.classList.contains('visible')) {
        cvPane.classList.remove('visible');
        panel.classList.remove('side-by-side');
        if (iframe) iframe.src = '';
        if (btnText) btnText.textContent = 'Original-CV';
    } else {
        if (iframe) iframe.src = '08_cv/Lebenslauf_Max_Berger.pdf';
        cvPane.classList.add('visible');
        panel.classList.add('side-by-side');
        if (btnText) btnText.textContent = 'CV ausblenden';

        // In blind mode: hide photo and name in the CV iframe
        if (hpBlindScreening && iframe) {
            iframe.onload = function() {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const style = iframeDoc.createElement('style');
                    style.textContent = `
                        .cv-photo-wrapper { position: relative; }
                        .cv-photo { filter: blur(20px) brightness(0.7) !important; }
                        .cv-photo-wrapper::after {
                            content: 'ANONYMISIERT';
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            background: rgba(200,16,46,0.9);
                            color: white;
                            padding: 8px 16px;
                            border-radius: 8px;
                            font-size: 11px;
                            font-weight: 700;
                            letter-spacing: 2px;
                            pointer-events: none;
                        }
                        .cv-name, .cv-footer { visibility: hidden !important; }
                        .cv-name::after {
                            content: 'Kandidat/in #${getBlindId(applicant.id)}';
                            visibility: visible;
                            display: block;
                        }
                    `;
                    iframeDoc.head.appendChild(style);
                } catch(e) { /* cross-origin fallback */ }
            };
        }
    }
}

window.__registerModule('hr-pipeline-overlays.js');
