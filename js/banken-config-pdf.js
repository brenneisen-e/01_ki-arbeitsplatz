// ========================================
// CUSTOMER ACTIONS
// ========================================

const actionConfig = {
    lastschriftsperre: {
        title: 'Lastschriftsperre einrichten',
        icon: 'warning',
        confirmClass: '',
        fields: ['grund', 'datum']
    },
    mahnung: {
        title: 'Mahnung versenden',
        icon: 'warning',
        confirmClass: '',
        fields: ['stufe', 'frist', 'betrag']
    },
    ratenzahlung: {
        title: 'Ratenzahlung vereinbaren',
        icon: 'info',
        confirmClass: '',
        fields: ['raten', 'startdatum', 'betrag']
    },
    anruf: {
        title: 'Anruf planen',
        icon: 'info',
        confirmClass: '',
        fields: ['datum', 'uhrzeit', 'notiz']
    },
    inkasso: {
        title: 'Inkasso einleiten',
        icon: 'danger',
        confirmClass: 'danger',
        fields: ['grund', 'aktenzeichen']
    },
    kuendigung: {
        title: 'Kündigung vorbereiten',
        icon: 'danger',
        confirmClass: 'danger',
        fields: ['grund', 'kuendigungsdatum']
    }
};

let currentActionType = null;

function executeCustomerAction(actionType) {
    currentActionType = actionType;
    const config = actionConfig[actionType];
    if (!config) return;

    // Create modal if not exists
    let modal = document.getElementById('customerActionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customerActionModal';
        modal.className = 'customer-action-modal';
        document.body.appendChild(modal);
    }

    const formFields = getActionFormFields(actionType);

    modal.innerHTML = `
        <div class="action-modal-content">
            <div class="action-modal-header">
                <div class="action-icon ${config.icon}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                        <path d="M12 8v4M12 16h.01"></path>
                    </svg>
                </div>
                <h3>${config.title}</h3>
                <button class="action-modal-close" onclick="closeCustomerActionModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="action-modal-body">
                ${formFields}
            </div>
            <div class="action-modal-footer">
                <button class="btn-cancel-action" onclick="closeCustomerActionModal()">Abbrechen</button>
                <button class="btn-confirm-action ${config.confirmClass}" onclick="confirmCustomerAction('${actionType}')">Bestätigen</button>
            </div>
        </div>
    `;

    setTimeout(() => modal.classList.add('open'), 10);
}

function getActionFormFields(actionType) {
    const today = new Date().toISOString().split('T')[0];

    switch (actionType) {
        case 'lastschriftsperre':
            return `
                <div class="action-form-group">
                    <label>Grund der Sperre</label>
                    <select id="actionGrund">
                        <option value="ruecklastschrift">Rücklastschrift</option>
                        <option value="kundenwunsch">Kundenwunsch</option>
                        <option value="betrug">Betrugsverdacht</option>
                        <option value="insolvenz">Insolvenz</option>
                    </select>
                </div>
                <div class="action-form-group">
                    <label>Wirksamkeitsdatum</label>
                    <input type="date" id="actionDatum" value="${today}">
                </div>
            `;
        case 'mahnung':
            return `
                <div class="action-form-group">
                    <label>Mahnstufe</label>
                    <select id="actionStufe">
                        <option value="1">1. Mahnung (Zahlungserinnerung)</option>
                        <option value="2">2. Mahnung</option>
                        <option value="3">3. Mahnung (Letzte Warnung)</option>
                    </select>
                </div>
                <div class="action-form-group">
                    <label>Zahlungsfrist (Tage)</label>
                    <input type="number" id="actionFrist" value="14" min="7" max="30">
                </div>
                <div class="action-form-group">
                    <label>Offener Betrag</label>
                    <input type="text" id="actionBetrag" value="€ 4.230,00" readonly>
                </div>
            `;
        case 'ratenzahlung':
            return `
                <div class="action-form-group">
                    <label>Anzahl Raten</label>
                    <select id="actionRaten">
                        <option value="3">3 Raten</option>
                        <option value="6">6 Raten</option>
                        <option value="12" selected>12 Raten</option>
                        <option value="24">24 Raten</option>
                    </select>
                </div>
                <div class="action-form-group">
                    <label>Startdatum</label>
                    <input type="date" id="actionStartdatum" value="${today}">
                </div>
                <div class="action-form-group">
                    <label>Monatliche Rate (berechnet)</label>
                    <input type="text" id="actionRate" value="€ 352,50" readonly>
                </div>
            `;
        case 'anruf':
            return `
                <div class="action-form-group">
                    <label>Datum</label>
                    <input type="date" id="actionDatum" value="${today}">
                </div>
                <div class="action-form-group">
                    <label>Uhrzeit</label>
                    <input type="time" id="actionUhrzeit" value="10:00">
                </div>
                <div class="action-form-group">
                    <label>Notiz</label>
                    <textarea id="actionNotiz" rows="3" placeholder="Gesprächspunkte..."></textarea>
                </div>
            `;
        case 'inkasso':
            return `
                <div class="action-form-group">
                    <label>Begründung</label>
                    <textarea id="actionGrund" rows="3" placeholder="Begründung für Inkasso-Übergabe...">Kunde reagiert nicht auf Mahnungen. Letzte Kontaktaufnahme vor 45 Tagen ohne Erfolg.</textarea>
                </div>
                <div class="action-form-group">
                    <label>Inkasso-Partner</label>
                    <select id="actionPartner">
                        <option value="internes">Internes Inkasso</option>
                        <option value="externes">Externes Inkasso (EOS)</option>
                        <option value="anwalt">Anwalt</option>
                    </select>
                </div>
            `;
        case 'kuendigung':
            return `
                <div class="action-form-group">
                    <label>Kündigungsgrund</label>
                    <select id="actionGrund">
                        <option value="zahlungsverzug">Zahlungsverzug > 90 Tage</option>
                        <option value="vertragsbruch">Vertragsbruch</option>
                        <option value="insolvenz">Insolvenz des Kunden</option>
                        <option value="betrug">Betrug</option>
                    </select>
                </div>
                <div class="action-form-group">
                    <label>Kündigungsdatum</label>
                    <input type="date" id="actionKuendigungsdatum" value="${today}">
                </div>
                <div class="action-form-group">
                    <label>Hinweis</label>
                    <p style="font-size: 12px; color: #dc2626; margin: 0;">⚠️ Diese Aktion ist nicht umkehrbar und erfordert die Genehmigung der Abteilungsleitung.</p>
                </div>
            `;
        default:
            return '<p>Keine Formularfelder verfügbar.</p>';
    }
}

function closeCustomerActionModal() {
    const modal = document.getElementById('customerActionModal');
    if (modal) {
        modal.classList.remove('open');
        setTimeout(() => modal.remove(), 300);
    }
    currentActionType = null;
}

function confirmCustomerAction(actionType) {
    const config = actionConfig[actionType];
    if (!config) return;

    // Show success notification
    showNotification(`${config.title} wurde erfolgreich initiiert.`, 'success');

    // Close modal
    closeCustomerActionModal();

    // Log action (in production would save to backend)
    console.log(`Customer action executed: ${actionType}`, {
        timestamp: new Date().toISOString(),
        actionType: actionType
    });
}

function refreshAiSummary() {
    const summaryContent = document.getElementById('aiSummaryContent');
    const recommendation = document.getElementById('aiRecommendation');

    if (summaryContent) {
        summaryContent.innerHTML = '<p class="ai-summary-text">Analysiere Kundendaten...</p>';
    }

    // Simulate AI analysis
    setTimeout(() => {
        if (summaryContent) {
            summaryContent.innerHTML = `
                <p class="ai-summary-text">
                    <strong>Kritischer Fall:</strong> Kunde hat offene Forderungen seit über 60 Tagen.
                    Letzte Teilzahlung (€ 500) am 15.10.2025. Kommunikationsversuche bisher erfolglos.
                    Bonitätsverschlechterung festgestellt.
                </p>
            `;
        }
        if (recommendation) {
            recommendation.innerHTML = `
                <span class="recommendation-icon">⚠️</span>
                <span class="recommendation-text">Empfehlung: Letzte Mahnung versenden und gleichzeitig Ratenzahlungsangebot unterbreiten. Bei ausbleibender Reaktion Inkasso-Verfahren einleiten.</span>
            `;
        }
    }, 1000);
}

// Initialize AI summary when opening customer modal
function updateAiSummary(customer) {
    const summaryContent = document.getElementById('aiSummaryContent');
    const recommendation = document.getElementById('aiRecommendation');

    if (!summaryContent || !recommendation) return;

    // Get real customer data
    const dpd = customer?.dpd || 0;
    const forderung = customer?.gesamtforderung || customer?.restschuld || 0;
    const segment = customer?.segment || 'standard';
    const kernproblem = customer?.kernproblem || '';
    const willingness = customer?.willingness || 50;
    const ability = customer?.ability || 50;
    const name = customer?.name || 'Kunde';
    const status = customer?.status || '';

    let summaryText = '';
    let recommendationText = '';
    let recommendationIcon = '⚠️';

    // Use kernproblem if available, otherwise generate based on data
    if (kernproblem) {
        summaryText = `<strong>${name}:</strong> ${kernproblem}`;
    } else if (segment === 'eskalation' || dpd > 60) {
        summaryText = `<strong>Kritischer Fall:</strong> ${name} hat eine offene Forderung von € ${forderung.toLocaleString('de-DE')} seit ${dpd} Tagen. Zahlungsbereitschaft: ${willingness}%, Zahlungsfähigkeit: ${ability}%. Sofortiger Handlungsbedarf.`;
    } else if (segment === 'prioritaet' || dpd > 30) {
        summaryText = `<strong>Erhöhtes Risiko:</strong> ${name} mit € ${forderung.toLocaleString('de-DE')} offener Forderung (${dpd} DPD). Zahlungsbereitschaft: ${willingness}%, Zahlungsfähigkeit: ${ability}%.`;
    } else if (segment === 'restrukturierung') {
        summaryText = `<strong>Restrukturierung möglich:</strong> ${name} zeigt Kooperationsbereitschaft. Forderung: € ${forderung.toLocaleString('de-DE')}. Zahlungsbereitschaft: ${willingness}%, Zahlungsfähigkeit: ${ability}%.`;
    } else {
        summaryText = `<strong>${name}:</strong> Offene Forderung von € ${forderung.toLocaleString('de-DE')} (${dpd} Tage überfällig). Zahlungsbereitschaft: ${willingness}%, Zahlungsfähigkeit: ${ability}%.`;
    }

    // Generate recommendation based on segment and data (no emojis - professional style)
    let recommendationClass = 'info';
    if (segment === 'eskalation' || status === 'Inkasso') {
        recommendationText = 'Empfehlung: Inkasso-Verfahren fortführen. Bei Kontaktaufnahme letztmalige Ratenzahlung anbieten. Forderungsverkauf als Alternative prüfen.';
        recommendationClass = 'danger';
    } else if (segment === 'abwicklung' || willingness < 30) {
        recommendationText = 'Empfehlung: Abschreibung oder Forderungsverkauf prüfen. Geringe Erfolgsaussichten bei Standardmaßnahmen.';
        recommendationClass = 'muted';
    } else if (segment === 'prioritaet' || dpd > 30) {
        recommendationText = 'Empfehlung: Sofortige telefonische Kontaktaufnahme. Letzte Mahnung mit Ratenzahlungsangebot versenden.';
        recommendationClass = 'warning';
    } else if (segment === 'restrukturierung' || ability > 50) {
        recommendationText = 'Empfehlung: Aktive Ratenzahlungsvereinbarung anbieten. Kunde zeigt Potenzial zur Kooperation.';
        recommendationClass = 'info';
    } else {
        recommendationText = 'Empfehlung: Freundliche Zahlungserinnerung versenden und Kontakt suchen.';
        recommendationClass = 'success';
    }

    summaryContent.innerHTML = `<p class="ai-summary-text">${summaryText}</p>`;
    recommendation.innerHTML = `
        <span class="recommendation-indicator ${recommendationClass}"></span>
        <span class="recommendation-text">${recommendationText}</span>
    `;
}

// Export customer action functions
window.executeCustomerAction = executeCustomerAction;
window.closeCustomerActionModal = closeCustomerActionModal;
window.confirmCustomerAction = confirmCustomerAction;
window.refreshAiSummary = refreshAiSummary;
window.updateAiSummary = updateAiSummary;

// ========================================
// PDF SCREENSHOT AGENT - v2.0
// ========================================

// Screenshot Agent - navigiert durch das Dashboard und erstellt PDF mit Screenshots
async function printToolOverview() {
    const { jsPDF } = window.jspdf;

    if (!jsPDF) {
        alert('PDF-Bibliothek nicht geladen. Bitte Seite neu laden.');
        return;
    }

    // Screenshots sammeln
    const screenshots = [];

    // Fortschritts-Overlay erstellen
    const overlay = createScreenshotAgentOverlay();
    document.body.appendChild(overlay);

    // Scroll position merken
    const originalScrollTop = window.scrollY;
    const bankenContent = document.querySelector('.banken-content-area');
    const originalContentScroll = bankenContent ? bankenContent.scrollTop : 0;

    const steps = [
        { name: 'Dashboard - KPIs & Übersicht', action: () => captureDashboardSection('top') },
        { name: 'Dashboard - Kundenliste', action: () => captureDashboardSection('table') },
        { name: 'Kundendetail - Stammdaten', action: () => captureCustomerTab('stammdaten') },
        { name: 'Kundendetail - Konten & Finanzen', action: () => captureCustomerTab('konten') },
        { name: 'Kundendetail - KI-Analyse', action: () => captureCustomerTab('ki-analyse') },
        { name: 'KI Chatbot', action: () => captureChatbotView() }
    ];

    try {
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            updateAgentProgress(overlay, i + 1, steps.length, step.name);

            // Overlay kurz verstecken für Screenshot
            overlay.style.display = 'none';
            await delay(100);

            const screenshot = await step.action();

            // Overlay wieder zeigen
            overlay.style.display = 'flex';

            if (screenshot) {
                screenshots.push({ name: step.name, data: screenshot });
                console.log(`Screenshot ${i + 1}: ${step.name}`);
            } else {
                console.warn(`Kein Screenshot für: ${step.name}`);
            }

            await delay(300);
        }

        // Alles schließen und zurücksetzen
        closeAllModals();
        window.scrollTo(0, originalScrollTop);
        if (bankenContent) bankenContent.scrollTop = originalContentScroll;

        updateAgentProgress(overlay, steps.length, steps.length, 'PDF wird generiert...');
        await delay(300);

        // PDF erstellen - Landscape A4
        const pdf = new jsPDF('l', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth(); // 297mm
        const pageHeight = pdf.internal.pageSize.getHeight(); // 210mm

        // Titelseite
        pdf.setFillColor(30, 41, 59);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(36);
        pdf.text('Collections Management', pageWidth / 2, pageHeight / 2 - 25, { align: 'center' });
        pdf.setFontSize(18);
        pdf.text('Forderungsmanagement mit KI-Unterstützung', pageWidth / 2, pageHeight / 2 + 5, { align: 'center' });
        pdf.setFontSize(12);
        pdf.setTextColor(200, 200, 200);
        pdf.text('Tool-Übersicht · Erstellt am ' + new Date().toLocaleDateString('de-DE'), pageWidth / 2, pageHeight / 2 + 30, { align: 'center' });

        // Screenshots als Seiten hinzufügen
        for (const screenshot of screenshots) {
            try {
                if (!screenshot.data || !screenshot.data.startsWith('data:image/')) {
                    console.warn(`Überspringe ungültigen Screenshot: ${screenshot.name}`);
                    continue;
                }

                pdf.addPage();

                // Header-Bereich
                pdf.setFillColor(30, 41, 59);
                pdf.rect(0, 0, pageWidth, 12, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(11);
                pdf.text(screenshot.name, 8, 8);
                pdf.setFontSize(9);
                pdf.text('Collections Management', pageWidth - 8, 8, { align: 'right' });

                // Bild laden und Proportionen berechnen
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = screenshot.data;
                });

                const imgRatio = img.width / img.height;
                const availableWidth = pageWidth - 16; // 8mm margin each side
                const availableHeight = pageHeight - 20; // 12mm header + 8mm bottom

                let finalWidth, finalHeight;

                if (imgRatio > availableWidth / availableHeight) {
                    // Bild ist breiter - an Breite anpassen
                    finalWidth = availableWidth;
                    finalHeight = finalWidth / imgRatio;
                } else {
                    // Bild ist höher - an Höhe anpassen
                    finalHeight = availableHeight;
                    finalWidth = finalHeight * imgRatio;
                }

                const x = (pageWidth - finalWidth) / 2;
                const y = 14; // Nach Header

                pdf.addImage(screenshot.data, 'JPEG', x, y, finalWidth, finalHeight);

            } catch (imgError) {
                console.error(`Fehler bei ${screenshot.name}:`, imgError);
            }
        }

        // PDF speichern
        const filename = `Collections_Management_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);

        updateAgentProgress(overlay, steps.length, steps.length, 'PDF erfolgreich erstellt!', true);
        await delay(1500);

    } catch (error) {
        console.error('Screenshot Agent Fehler:', error);
        updateAgentProgress(overlay, 0, steps.length, 'Fehler: ' + error.message, false, true);
        await delay(2000);
    }

    overlay.remove();
    // Style entfernen
    const style = document.getElementById('screenshotAgentStyles');
    if (style) style.remove();
}

// Dashboard-Bereich erfassen
async function captureDashboardSection(section) {
    // Erfasse das spezifische Element direkt!
    let targetElement;

    if (section === 'top') {
        // KPI-Grid (die 5 KPI-Kacheln oben)
        targetElement = document.querySelector('.portfolio-kpi-grid');

        if (!targetElement) {
            // Fallback zu anderen KPI-Klassen
            targetElement = document.querySelector('.kpi-metrics-row, .kpi-cards-grid');
        }

    } else if (section === 'table') {
        // Kundentabelle direkt erfassen
        targetElement = document.querySelector('.customer-table-wrapper');

        if (!targetElement) {
            // Fallback
            targetElement = document.querySelector('.customer-table')?.parentElement ||
                           document.querySelector('table.customer-table');
        }
    }

    if (!targetElement) {
        console.warn('Kein Element gefunden für:', section);
        return null;
    }

    await delay(300);

    try {
        const canvas = await html2canvas(targetElement, {
            scale: 1,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: Math.min(targetElement.scrollWidth, 1400),
            height: Math.min(targetElement.scrollHeight, 800)
        });
        return canvas.toDataURL('image/jpeg', 0.88);
    } catch (error) {
        console.error('Dashboard Screenshot Fehler:', error);
        return null;
    }
}

// Kundendetail Tab öffnen und erfassen
async function captureCustomerTab(tabName) {
    // Modal öffnen wenn noch nicht offen
    let modal = document.getElementById('customerDetailModal');

    if (!modal || modal.style.display === 'none') {
        // Ersten Kunden öffnen
        if (typeof openCustomerDetail === 'function') {
            openCustomerDetail('K-2024-0001');
            await delay(1000);
            modal = document.getElementById('customerDetailModal');
        }
    }

    if (!modal) return null;

    // Tab wechseln mit showCustomerTab (die richtige Funktion!)
    if (typeof showCustomerTab === 'function') {
        showCustomerTab(tabName);
        await delay(600);
    } else {
        // Fallback: Tab-Button direkt klicken
        const tabBtn = document.querySelector(`.modal-tab[onclick*="showCustomerTab('${tabName}')"]`);
        if (tabBtn) {
            tabBtn.click();
            await delay(600);
        }
    }

    // Modal-Content erfassen
    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) return null;

    try {
        const canvas = await html2canvas(modalContent, {
            scale: 1,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: modalContent.offsetWidth,
            height: Math.min(modalContent.scrollHeight, 800)
        });
        return canvas.toDataURL('image/jpeg', 0.88);
    } catch (error) {
        console.error('Customer Tab Screenshot Fehler:', error);
        return null;
    }
}

// Chatbot-Ansicht öffnen und erfassen
async function captureChatbotView() {
    // Alle Modals schließen
    closeAllModals();
    await delay(300);

    // Chatbot öffnen
    const chatToggle = document.querySelector('#bankenChatToggle');
    if (chatToggle) {
        chatToggle.click();
        await delay(500);
    }

    const chatWidget = document.querySelector('#bankenChatWidget');
    if (!chatWidget || chatWidget.style.display === 'none') {
        return null;
    }

    // Demo-Konversation einfügen falls leer
    const chatBody = document.querySelector('#bankenChatBody');
    if (chatBody) {
        const hasMessages = chatBody.querySelector('.banken-chat-message');
        if (!hasMessages) {
            const welcome = chatBody.querySelector('.banken-chat-welcome');
            if (welcome) welcome.style.display = 'none';

            chatBody.innerHTML += `
                <div class="banken-chat-message user">
                    <div class="message-content">Zeige mir die Top 3 Kunden mit höchster Forderung</div>
                </div>
                <div class="banken-chat-message assistant">
                    <div class="message-content">
                        <p><strong>Top 3 Kunden nach Restforderung:</strong></p>
                        <p>1. <strong>K-2024-0003</strong> - €45.230 (92 Tage überfällig)<br>
                        2. <strong>K-2024-0007</strong> - €38.750 (67 Tage überfällig)<br>
                        3. <strong>K-2024-0015</strong> - €31.200 (45 Tage überfällig)</p>
                        <p>Möchten Sie Details zu einem Kunden sehen?</p>
                    </div>
                </div>
            `;
        }
    }
    await delay(300);

    try {
        const canvas = await html2canvas(chatWidget, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // Chatbot schließen
        const closeBtn = document.querySelector('.banken-chat-close');
        if (closeBtn) closeBtn.click();

        return canvas.toDataURL('image/jpeg', 0.92);
    } catch (error) {
        console.error('Chatbot Screenshot Fehler:', error);
        return null;
    }
}

// Alle Modals schließen
function closeAllModals() {
    // Customer Detail Modal
    const customerClose = document.querySelector('.customer-detail-close, .crm-close-btn');
    if (customerClose) customerClose.click();

    // CRM Profile
    if (typeof closeCustomerDetail === 'function') {
        try { closeCustomerDetail(); } catch (e) {}
    }

    // Chatbot
    const chatClose = document.querySelector('.banken-chat-close');
    if (chatClose) chatClose.click();
}

// Overlay für Screenshot-Agent erstellen
function createScreenshotAgentOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'screenshotAgentOverlay';
    overlay.innerHTML = `
        <div class="screenshot-agent-modal">
            <div class="screenshot-agent-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
            </div>
            <h3 class="screenshot-agent-title">Screenshot Agent</h3>
            <p class="screenshot-agent-subtitle">Navigiert durch das Dashboard...</p>
            <div class="screenshot-agent-progress">
                <div class="screenshot-agent-progress-bar" style="width: 0%"></div>
            </div>
            <div class="screenshot-agent-step">
                <span class="step-current">0</span> / <span class="step-total">0</span>
                <span class="step-name">Initialisiere...</span>
            </div>
        </div>
    `;
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
    `;

    const style = document.createElement('style');
    style.id = 'screenshotAgentStyles';
    style.textContent = `
        .screenshot-agent-modal {
            background: white;
            border-radius: 16px;
            padding: 40px 60px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .screenshot-agent-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            animation: pulse 2s ease-in-out infinite;
        }
        .screenshot-agent-icon svg {
            color: white;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .screenshot-agent-title {
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 8px 0;
        }
        .screenshot-agent-subtitle {
            font-size: 14px;
            color: #64748b;
            margin: 0 0 24px 0;
        }
        .screenshot-agent-progress {
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 16px;
        }
        .screenshot-agent-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        .screenshot-agent-step {
            font-size: 13px;
            color: #64748b;
        }
        .screenshot-agent-step .step-current {
            font-weight: 600;
            color: #3b82f6;
        }
        .screenshot-agent-step .step-name {
            display: block;
            margin-top: 4px;
            color: #1e293b;
            font-weight: 500;
        }
        .screenshot-agent-success .screenshot-agent-icon {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        .screenshot-agent-error .screenshot-agent-icon {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
    `;
    document.head.appendChild(style);

    return overlay;
}

// Fortschritt aktualisieren
function updateAgentProgress(overlay, current, total, stepName, success = false, error = false) {
    const progressBar = overlay.querySelector('.screenshot-agent-progress-bar');
    const stepCurrent = overlay.querySelector('.step-current');
    const stepTotal = overlay.querySelector('.step-total');
    const stepNameEl = overlay.querySelector('.step-name');
    const subtitle = overlay.querySelector('.screenshot-agent-subtitle');
    const modal = overlay.querySelector('.screenshot-agent-modal');

    const percent = (current / total) * 100;
    progressBar.style.width = percent + '%';
    stepCurrent.textContent = current;
    stepTotal.textContent = total;
    stepNameEl.textContent = stepName;

    if (success) {
        modal.classList.add('screenshot-agent-success');
        subtitle.textContent = 'Fertig!';
    } else if (error) {
        modal.classList.add('screenshot-agent-error');
        subtitle.textContent = 'Ein Fehler ist aufgetreten';
    }
}

// Hilfs-Funktion für Verzögerung
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


window.printToolOverview = printToolOverview;

console.log('banken modules geladen');
