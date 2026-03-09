function backFromAgentur() {
    console.log('Zurück vom Agentur-Overview');

    // Hide agentur-specific elements
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'none';
    hideAgenturChat();

    // Use the comprehensive landing reset (handles module tabs, welcome chat, zoom, etc.)
    if (typeof backToLanding === 'function') {
        backToLanding();
    } else {
        // Fallback if backToLanding not yet loaded
        const landingPage = document.getElementById('landingPage');
        if (landingPage) landingPage.style.display = 'flex';
        if (window.AppRouter) AppRouter.navigate('/landing');
    }
}

// ========================================
// BILLING CHECK FUNCTIONS
// ========================================

function openBillingCheck() {
    console.log('Öffne Billing Check');

    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    const agenturOverview = document.getElementById('agenturOverview');
    const billingCheckPage = document.getElementById('billingCheckPage');

    if (landingPage) landingPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'none';
    if (agenturOverview) agenturOverview.style.display = 'none';
    if (billingCheckPage) billingCheckPage.style.display = 'block';

    // Lazy-load iframe src beim ersten Öffnen
    var iframe = document.getElementById('billingCheckIframe');
    if (iframe && !iframe.src && iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
    }

    // Verstecke den Agentur-Chat-Toggle
    hideAgenturChat();
}

function closeBillingCheck() {
    console.log('Schließe Billing Check');

    const landingPage = document.getElementById('landingPage');
    const billingCheckPage = document.getElementById('billingCheckPage');

    if (landingPage) landingPage.style.display = 'flex';
    if (billingCheckPage) billingCheckPage.style.display = 'none';
}

// ========================================
// FIDA POTENTIALE FUNCTIONS
// ========================================

/**
 * Filtert die FIDA-Fälle Tabelle nach Status
 * @param {string} status - Filter-Status (alle, neu, angeschrieben, termin, abgeschlossen)
 */
function filterFidaCases(status) {
    console.log('Filtere FIDA-Fälle nach:', status);

    // Update active filter button
    document.querySelectorAll('.fida-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.fida-filter-btn[onclick="filterFidaCases('${status}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Filter table rows
    const tableBody = document.getElementById('fidaCasesTableBody');
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        if (status === 'alle' || rowStatus === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * Mapping von Kunden-IDs zu Kundennamen
 */
const kundenMapping = {
    'KD00001': 'Peter Schmidt',
    'KD00002': 'Amira König',
    'KD00003': 'Thomas Weber',
    'KD00004': 'Maria Schneider',
    'KD00005': 'Andreas Müller',
    'KD00006': 'Julia Fischer',
    'KD00007': 'Michael Bauer',
    'KD00008': 'Lisa Wagner',
    'KD00009': 'Stefan Hoffmann',
    'KD00010': 'Claudia Richter'
};

/**
 * Öffnet die Kundendetailansicht für einen Kunden
 * @param {string} kundenId - Die Kunden-ID (z.B. 'KD00001')
 */
function openKundenDetailFromFida(kundenId) {
    console.log('Öffne Kundendetail von FIDA für:', kundenId);

    // Hole Kundennamen aus Mapping
    const kundenName = kundenMapping[kundenId] || kundenId;

    // Wenn openKundenDetail existiert, nutze sie mit korrekten Parametern
    if (typeof window.openKundenDetail === 'function') {
        window.openKundenDetail(kundenName, kundenId);
    } else {
        console.log('openKundenDetail Funktion nicht gefunden');
    }
}

/**
 * Expandiert/Kollabiert die Vertriebspotentiale-Details
 * @param {HTMLElement} item - Das Potential-Item Element
 */
function togglePotentialDetails(item) {
    const details = item.querySelector('.potential-details');
    const isExpanded = item.classList.contains('expanded');

    // Alle anderen schließen
    document.querySelectorAll('.potential-item.expanded').forEach(el => {
        if (el !== item) {
            el.classList.remove('expanded');
            el.querySelector('.potential-details').style.display = 'none';
        }
    });

    // Toggle current
    if (isExpanded) {
        item.classList.remove('expanded');
        details.style.display = 'none';
    } else {
        item.classList.add('expanded');
        details.style.display = 'block';
    }
}

/**
 * Wechselt die Periode für Vertriebskennzahlen
 * @param {string} period - 'week' oder 'month'
 */
function toggleVertriebsPeriod(period) {
    const buttons = document.querySelectorAll('.period-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const kennzahlenContainer = document.getElementById('vertriebsKennzahlen');

    if (period === 'week') {
        kennzahlenContainer.innerHTML = `
            <div class="kennzahl-item">
                <div class="kennzahl-value">12</div>
                <div class="kennzahl-label">Abschlüsse</div>
                <div class="kennzahl-trend positive">+3 vs. Vorwoche</div>
            </div>
            <div class="kennzahl-item">
                <div class="kennzahl-value">€18.450</div>
                <div class="kennzahl-label">Neugeschäft</div>
                <div class="kennzahl-trend positive">+12%</div>
            </div>
            <div class="kennzahl-item">
                <div class="kennzahl-value">28</div>
                <div class="kennzahl-label">Termine</div>
                <div class="kennzahl-trend neutral">±0</div>
            </div>
            <div class="kennzahl-item">
                <div class="kennzahl-value">68%</div>
                <div class="kennzahl-label">Abschlussquote</div>
                <div class="kennzahl-trend positive">+5%</div>
            </div>
        `;
    } else {
        kennzahlenContainer.innerHTML = `
            <div class="kennzahl-item">
                <div class="kennzahl-value">47</div>
                <div class="kennzahl-label">Abschlüsse</div>
                <div class="kennzahl-trend positive">+8 vs. Vormonat</div>
            </div>
            <div class="kennzahl-item">
                <div class="kennzahl-value">€72.340</div>
                <div class="kennzahl-label">Neugeschäft</div>
                <div class="kennzahl-trend positive">+18%</div>
            </div>
            <div class="kennzahl-item">
                <div class="kennzahl-value">112</div>
                <div class="kennzahl-label">Termine</div>
                <div class="kennzahl-trend positive">+12</div>
            </div>
            <div class="kennzahl-item">
                <div class="kennzahl-value">71%</div>
                <div class="kennzahl-label">Abschlussquote</div>
                <div class="kennzahl-trend positive">+3%</div>
            </div>
        `;
    }
}

/**
 * Öffnet ein Mock-Formular im Modal
 * @param {string} formularId - Die ID des Formulars
 */
function openFormular(formularId) {
    var formulare = {
        'antrag-leben': { titel: 'Neuantrag Lebensversicherung', felder: ['Kunde', 'Produkt', 'Versicherungssumme', 'Laufzeit', 'Beginn'] },
        'antrag-kfz': { titel: 'KFZ-Versicherung Antrag', felder: ['Kunde', 'Fahrzeug (HSN/TSN)', 'Kennzeichen', 'Schadenfreiheitsklasse', 'Beginn'] },
        'antrag-sach': { titel: 'Sachversicherung Antrag', felder: ['Kunde', 'Objektart', 'Versicherungssumme', 'Selbstbeteiligung', 'Beginn'] },
        'schadenmeldung': { titel: 'Schadensmeldung', felder: ['Vertragsnr.', 'Schadendatum', 'Schadenort', 'Beschreibung', 'Geschätzte Höhe'] },
        'vr-finanzplan': { titel: 'VR-Finanzplan erstellen', felder: ['Kunde', 'Anlageziel', 'Anlagehorizont', 'Risikobereitschaft'] },
        'baufinanzierung': { titel: 'Baufinanzierung Antrag', felder: ['Kunde', 'Objektwert', 'Darlehenssumme', 'Zinsbindung', 'Tilgung'] },
        'depot-eroeffnung': { titel: 'Depot-Eröffnung', felder: ['Kunde', 'Depotmodell', 'Erfahrungsklasse', 'Referenzkonto'] },
        'ratenkredit': { titel: 'Ratenkredit Antrag', felder: ['Kunde', 'Kreditsumme', 'Laufzeit', 'Verwendungszweck', 'Nettoeinkommen'] }
    };

    var formular = formulare[formularId] || { titel: 'Formular: ' + formularId, felder: ['Feld 1', 'Feld 2', 'Feld 3'] };
    var modal = document.getElementById('formularModal');
    if (!modal) return;

    modal.querySelector('.formular-modal-title').textContent = formular.titel;
    modal.querySelector('.formular-modal-body').innerHTML = formular.felder
        .map(function(f) {
            return '<div class="formular-modal-group"><label class="formular-modal-label">' + f + '</label><input type="text" class="formular-modal-input" placeholder="' + f + ' eingeben..." /></div>';
        }).join('');
    modal.style.display = 'flex';
}

function closeFormularModal() {
    var modal = document.getElementById('formularModal');
    if (modal) modal.style.display = 'none';
}

function submitFormularModal() {
    closeFormularModal();
    showToast('Formular erfolgreich übermittelt');
}

function showToast(message) {
    var existing = document.getElementById('formularToast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'formularToast';
    toast.className = 'formular-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('show'); }, 10);
    setTimeout(function() { toast.classList.remove('show'); setTimeout(function() { toast.remove(); }, 300); }, 3000);
}

/**
 * Öffnet eine Provisionsabrechnung (PDF)
 * @param {string} period - Der Abrechnungszeitraum (z.B. '2024-12')
 */
function openAbrechnung(period) {
    console.log('Öffne Provisionsabrechnung:', period);
    const [year, month] = period.split('-');
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                       'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const monthName = monthNames[parseInt(month) - 1];
    alert(`Provisionsabrechnung ${monthName} ${year}\n\nDas PDF wird heruntergeladen...\n\n(Demo-Funktion)`);
}

/**
 * Sendet eine Frage an den Agentur-Chat
 */
function sendAgenturChat() {
    const input = document.getElementById('agenturChatInput');
    const chatBody = document.getElementById('agenturChatBody');
    const question = input.value.trim();

    if (!question) return;

    // Clear welcome message
    const welcome = chatBody.querySelector('.agentur-chat-welcome');
    if (welcome) welcome.style.display = 'none';

    // Add user message
    chatBody.innerHTML += `
        <div class="chat-message user-message">
            <div class="message-content">${question}</div>
        </div>
    `;

    input.value = '';

    // Simulate AI response
    setTimeout(() => {
        const response = getAgenturChatResponse(question);
        chatBody.innerHTML += `
            <div class="chat-message ai-message">
                <div class="message-content">${response}</div>
            </div>
        `;
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 800);
}

/**
 * Stellt eine vordefinierte Frage an den Agentur-Chat
 * @param {string} question - Die vordefinierte Frage
 */
function askAgenturQuestion(question) {
    const input = document.getElementById('agenturChatInput');
    input.value = question;
    sendAgenturChat();
}

/**
 * Generiert eine Chat-Antwort basierend auf der Frage
 * @param {string} question - Die Frage
 * @returns {string} - Die Antwort
 */
function getAgenturChatResponse(question) {
    const q = question.toLowerCase();
    const isMRH = typeof viewMode !== 'undefined' && viewMode === 'mrh';
    const isMakler = isMRH ? false : (typeof maklerModus !== 'undefined' && maklerModus);

    // Dynamische Datums-Helper
    const getDynamicDate = (daysFromNow) => {
        if (window.demoDates && window.demoDates.formatDate) {
            return window.demoDates.formatDate(window.demoDates.addDays(daysFromNow));
        }
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toLocaleDateString('de-DE');
    };

    // Kunden-Button Helper mit optionaler Tab/Vertrag-Navigation
    const customerBtn = (name, id, tab, contractType) => {
        if (isMakler) {
            return `<button class="chat-customer-btn" onclick="openMaklerKundenDetail('${id}')">${name}</button>`;
        }
        const params = tab
            ? `'${id}', '${tab}', '${contractType || ''}'`
            : `'${id}'`;
        return `<button class="chat-customer-btn" onclick="openKundenDetailFromChat(${params})">${name}</button>`;
    };

    // Vertrag-Badge Helper (Wettbewerber vs. Eigener Vertrag)
    const vertragBadge = (isExtern) => {
        return `<span class="chat-vertrag-badge ${isExtern ? 'extern' : 'eigen'}">${isExtern ? 'Wettbewerber' : 'Eigener Vertrag'}</span>`;
    };

    // Follow-up Vorschläge
    const followUpSuggestions = isMakler ? `
        <div class="chat-followup-suggestions">
            <button onclick="askAgenturQuestion('Welche Renewals stehen in den nächsten 90 Tagen an?')">Anstehende Renewals?</button>
            <button onclick="askAgenturQuestion('Welche Kunden haben Deckungslücken?')">Deckungslücken?</button>
            <button onclick="showNeuePotentiale()">Neue Potentiale?</button>
            <button onclick="askAgenturQuestion('Wie ist die aktuelle Schadenquote?')">Schadenquote?</button>
        </div>` : `
        <div class="chat-followup-suggestions">
            <button onclick="askAgenturQuestion('Welche Verträge laufen in den nächsten 30 Tagen aus?')">Welche Verträge laufen bald aus?</button>
            <button onclick="askAgenturQuestion('Welche Kunden haben Cross-Selling-Potential?')">Wer hat Cross-Selling-Potential?</button>
            <button onclick="showNeuePotentiale()">Neue Potentiale?</button>
            <button onclick="goToSalesReport()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align: middle; margin-right: 4px;">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Vertriebsbericht
            </button>
        </div>`;

    // ========== MRH TROWE 360° RESPONSES ==========
    if (isMRH) {
        const mrhFollowUp = `
            <div class="chat-followup-suggestions">
                <button onclick="askAgenturQuestion('Welche Kunden haben Potential für bAV?')">bAV-Potential?</button>
                <button onclick="askAgenturQuestion('Welche Renewals stehen im Q2 an?')">Q2 Renewals?</button>
                <button onclick="askAgenturQuestion('Was unterscheidet uns von Ecclesia?')">Ecclesia vs. MRH?</button>
                <button onclick="askAgenturQuestion('Wie ist die Cross-Sell-Pipeline?')">Cross-Sell?</button>
            </div>`;

        const mrhCustomerBtn = (name, id) => `<button class="chat-customer-btn" onclick="openMRHKundenDetail('${id}')">${name}</button>`;

        // bAV / Benefits
        if (q.includes('bav') || q.includes('benefit') || q.includes('potential für bav') || q.includes('pension')) {
            return `<strong>bAV-Potentiale (Insurance → Benefits):</strong><br><br>
            B2B-Kunden mit >100 MA ohne Benefits-Mandat:<br><br>
            <div class="chat-customer-item">
                ${mrhCustomerBtn('Rhein-Main Maschinenbau', 'MRH-001')} 340 MA, Prämie 420k, kein bAV<br>
                <span class="chat-recommendation">Geschätztes Potential: 85k bAV-Volumen/Jahr — Steuerberater-Lösung ablösen</span>
            </div>
            <div class="chat-customer-item">
                ${mrhCustomerBtn('Hessenlog Spedition', 'MRH-005')} 210 MA, kein bAV<br>
                <span class="chat-recommendation">Einfaches Modell als Bindungsinstrument gegen Fluktuation</span>
            </div>
            <br>Aktuelle Durchdringung: <strong>38%</strong> (Ziel: 55%)
            ${mrhFollowUp}`;
        }

        // Renewals
        if (q.includes('renewal') || q.includes('q2') || q.includes('ablaufend') || q.includes('vertrag') && q.includes('lauf') || q.includes('30 tag') || q.includes('auslauf') || q.includes('frist')) {
            return `<strong>Anstehende Renewals (Niederlassung Rhein-Main):</strong><br><br>
            <strong>Handlungsbedarf:</strong><br><br>
            <div class="chat-customer-item">
                ${mrhCustomerBtn('Rhein-Main Maschinenbau', 'MRH-001')} Betriebshaftpflicht — 01.04.2026<br>
                <span class="chat-recommendation">420k Prämie — Allianz hat 15% Erhöhung angekündigt</span>
            </div>
            <div class="chat-customer-item">
                ${mrhCustomerBtn('Rhein-Main Verkehr', 'MRH-015')} Flotte + BH ÖPNV — 01.07.2026<br>
                <span class="chat-recommendation">1,45 Mio. Prämie — größtes Renewal des Halbjahres</span>
            </div>
            ${mrhFollowUp}`;
        }

        // Cross-Sell
        if (q.includes('cross-sell') || q.includes('cross sell') || q.includes('pipeline')) {
            return `<strong>Cross-Sell-Pipeline (3 Säulen):</strong><br><br>
            <strong>Insurance → Benefits:</strong> 3 Kunden mit >100 MA ohne bAV<br>
            <strong>Insurance → Finance:</strong> DigiCore SaaS-Kreditversicherung in Prüfung<br>
            <strong>Finance → Insurance:</strong> CNC-Leasing 1,4 Mio. ohne technische Versicherung<br><br>
            Geschätztes Gesamtpotential: <strong>~450k €/a</strong>
            ${mrhFollowUp}`;
        }

        // Ecclesia vs Gewerbemakler
        if (q.includes('ecclesia') || q.includes('unterschied') || q.includes('vergleich')) {
            return `<strong>Gewerbemakler vs. Ecclesia — Kernunterschiede:</strong><br><br>
            <strong>Kundenbasis:</strong> Gewerbemakler bedient B2B + gehobene Privatkunden (500–2.000 Kunden, 20+ Specialties), Ecclesia nur B2B (80–250 Institutionen, 5 Segmente)<br><br>
            <strong>Schwerpunkte:</strong> Gewerbemakler branchenübergreifend (Industrie, Real Estate, Mobilität), Ecclesia fokussiert auf Sozialwirtschaft und Kirche<br><br>
            <strong>Eigentümerstruktur:</strong> PE-gestützt vs. kirchlich-ökumenisch
            ${mrhFollowUp}`;
        }

        // Specialty / Autohaus / Deckung
        if (q.includes('autohaus') || q.includes('kfz') || q.includes('deckung') && q.includes('typisch')) {
            return `<strong>Specialty-Wissen: Autohaus / Kfz-Motor</strong><br><br>
            Typische Deckungen für Autohäuser:<br>
            • Kfz-Handel inkl. Probefahrtrisiko<br>
            • Vorführwagen-Flotte<br>
            • Werkstatt-Inhaltsversicherung<br>
            • Transportversicherung Neuwagen<br>
            • GAP-Versicherung Leasingrückläufer<br>
            • Cyber (Kundendaten, DMS)<br><br>
            <div class="chat-customer-item">
                ${mrhCustomerBtn('AutoZentrum Rhein-Main', 'MRH-004')} Prämie 310k, 14 Verträge<br>
                <span class="chat-recommendation">GAP-Versicherung fehlt — Deckungslücke</span>
            </div>
            ${mrhFollowUp}`;
        }

        // W&I
        if (q.includes('w&i') || q.includes('warranty') || q.includes('m&a') || q.includes('deal')) {
            return `<strong>W&I-Policen (Warranty & Indemnity):</strong><br><br>
            Pricing-Logik: ca. <strong>1–1,5%</strong> der Deckungssumme<br><br>
            <div class="chat-customer-item">
                ${mrhCustomerBtn('Alphatech Holding', 'MRH-014')} 3 abgeschlossene W&I-Policen<br>
                <span class="chat-recommendation">Buy-Side 8 Mio. + 5 Mio., Sell-Side 12 Mio. — über MRH Specialty M&A</span>
            </div>
            ${mrhFollowUp}`;
        }

        // Bestand / Portfolio
        if (q.includes('kredit') || q.includes('finance') || q.includes('bestand')) {
            return `<strong>Bestandsübersicht Niederlassung Rhein-Main:</strong><br><br>
            Gesamtbestand: <strong>42,3 Mio. €</strong> (+6,1% YoY)<br><br>
            <strong>Top-Kunden:</strong><br>
            ${mrhCustomerBtn('Nordpark Projektentwicklung', 'MRH-003')} 680.000 € Prämie<br>
            ${mrhCustomerBtn('Rhein-Main Maschinenbau', 'MRH-001')} 420.000 € Prämie<br>
            ${mrhCustomerBtn('Rhein-Main Verkehr', 'MRH-009')} 380.000 € Prämie
            ${mrhFollowUp}`;
        }

        // Fallback MRH
        return `Ich kann Ihnen als Gewerbemakler 360°-Assistent bei folgenden Themen helfen:
            <br>• Kundenübersicht und Bestandsanalysen
            <br>• Renewal-Management und Fristen
            <br>• Deckungslücken und Potentiale
            <br>• Schadenquoten und Risikobewertung
            ${mrhFollowUp}`;
    }

    // ========== MAKLER B2B RESPONSES ==========
    if (isMakler) {
        // Renewals
        if (q.includes('renewal') || q.includes('ablaufend') || q.includes('vertrag') && q.includes('lauf') || q.includes('30 tag')) {
            return `<strong>Anstehende Renewals (nächste 90 Tage):</strong><br><br>
            <strong>Kritisch (≤30 Tage):</strong><br><br>
            <div class="chat-customer-item">
                ${customerBtn('Klinikum Lippetal', 'MK-GW-001')} Cyberversicherung (Hiscox) – 31.03.2026<br>
                <span class="chat-recommendation">45.000 € Prämie – Erneuerung dringend einleiten</span>
            </div>
            <strong>Bald fällig (31-90 Tage):</strong><br><br>
            <div class="chat-customer-item">
                ${customerBtn('Kirchenkreis Auental', 'MK-KI-003')} Gebäude-Rahmenvertrag – 01.04.2026<br>
                <span class="chat-recommendation">620.000 € Gesamtprämie – Verhandlungen vorbereiten</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Lippeland Fracht', 'MK-TL-003')} 3 Verträge – 01.04.2026<br>
                <span class="chat-recommendation">190.000 € Prämie – Bündelung prüfen</span>
            </div>
            ${followUpSuggestions}`;
        }

        // Deckungslücken
        if (q.includes('deckungslücke') || q.includes('deckungsluecke') || q.includes('lücke')) {
            return `<strong>Deckungslücken-Analyse:</strong><br><br>
            <strong>5 Kunden</strong> mit hoher Priorität:<br><br>
            <div class="chat-customer-item">
                ${customerBtn('Klinikum Lippetal', 'MK-GW-001')} 5 Deckungslücken<br>
                <span class="chat-recommendation">Umwelthaftpflicht & Maschinenbruch fehlen – hohe Priorität</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Reha-Klinik Teutoburg', 'MK-GW-002')} 2 Deckungslücken<br>
                <span class="chat-recommendation">Cyberversicherung & D&O fehlen komplett</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Ev. Landeskirche Teutoburg', 'MK-KI-001')} 2 Deckungslücken<br>
                <span class="chat-recommendation">Cyber nur teilweise, Missbrauchsprävention in Prüfung</span>
            </div>
            <br>Geschätztes Neugeschäft: <strong>~850.000 € p.a.</strong>
            ${followUpSuggestions}`;
        }

        // Cross-Selling / Potential
        if (q.includes('cross-selling') || q.includes('potential')) {
            return `<strong>Cross-Selling Potentiale B2B:</strong><br><br>
            <strong>Top 3 nach Prämienvolumen:</strong><br><br>
            <div class="chat-customer-item">
                ${customerBtn('Ev. Landeskirche Teutoburg', 'MK-KI-001')} Cyber-Rahmenvertrag<br>
                <span class="chat-recommendation">1.900 Kirchengemeinden – geschätzt 1,0 Mio. € Prämie</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Nordlicht Automatisierung', 'MK-IG-002')} Erweiterte Produkthaftpflicht<br>
                <span class="chat-recommendation">Internationale Produktrückruf-Absicherung – ~570.000 € p.a.</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Klinikum Lippetal', 'MK-GW-001')} Umwelthaftpflicht + Maschinenbruch<br>
                <span class="chat-recommendation">Med. Großgeräte & Labor – ~190.000 € p.a.</span>
            </div>
            <br>Gesamtpotential: <strong>~1,8 Mio. € p.a.</strong>
            ${followUpSuggestions}`;
        }

        // Schadenquote
        if (q.includes('schadenquote') || q.includes('schaden') || q.includes('quote')) {
            return `<strong>Schadenquoten-Übersicht:</strong><br><br>
            <strong>Portfolio gesamt:</strong> 62% (Ziel: <65%)<br>
            <strong>Vorjahr:</strong> 58%<br><br>
            <strong>Auffällige Kunden:</strong><br><br>
            <div class="chat-customer-item">
                ${customerBtn('Weserland Spedition', 'MK-TL-002')} Schadenquote <strong>62%</strong><br>
                <span class="chat-recommendation">Kfz-Flotte auffällig – Schadenmanagement-Gespräch empfohlen</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Klinikum Lippetal', 'MK-GW-001')} Schadenquote <strong>58%</strong><br>
                <span class="chat-recommendation">Arzthaftpflicht-Schäden steigend – Trend beobachten</span>
            </div>
            <div class="chat-customer-item">
                ${customerBtn('Teutoburger Maschinenbau', 'MK-IG-003')} Schadenquote <strong>55%</strong><br>
                <span class="chat-recommendation">Betriebsunterbrechung – Prävention besprechen</span>
            </div>
            ${followUpSuggestions}`;
        }

        // Fallback B2B
        return `Ich kann Ihnen bei folgenden Themen helfen:
            ${followUpSuggestions}`;
    }

    // ========== AO PRIVATKUNDE RESPONSES ==========

    // Ablaufende Verträge - ECHTE Daten aus der Datenbank!
    if (q.includes('ablaufend') || q.includes('30 tag') || q.includes('vertrag') && q.includes('lauf')) {
        return `<strong>Ablaufende Verträge (nächste 60 Tage):</strong><br><br>
        <strong>1 Eigener Vertrag</strong> zur Verlängerung:<br><br>
        <div class="chat-customer-item">
            ${customerBtn('Amira König', 'KD00002', 'vertraege', 'leben')} Risikoleben bei <strong>ERGO</strong> (${getDynamicDate(21)})<br>
            ${vertragBadge(false)}
            <span class="chat-recommendation">Vertragsverlängerung vorbereiten – Beitragsanpassung +3.2% kommunizieren</span>
        </div>
        <strong>2 Wettbewerber-Verträge</strong> mit Wechselpotential:<br><br>
        <div class="chat-customer-item">
            ${customerBtn('Peter Schmidt', 'KD00001', 'fida', 'kfz')} Kfz-Versicherung bei <strong>Allianz</strong> (${getDynamicDate(45)})<br>
            ${vertragBadge(true)}
            <span class="chat-recommendation">SF-Klasse 12, €720/Jahr – Wechselangebot mit €180 Ersparnis möglich</span>
        </div>
        <div class="chat-customer-item">
            ${customerBtn('Peter Schmidt', 'KD00001', 'fida', 'hausrat')} Hausratversicherung bei <strong>HUK24</strong> (${getDynamicDate(60)})<br>
            ${vertragBadge(true)}
            <span class="chat-recommendation">Standard-Tarif €142/Jahr – Premium-Upgrade empfohlen</span>
        </div>
        ${followUpSuggestions}`;
    }

    // Cross-Selling LV - basierend auf echten Kundendaten
    if (q.includes('cross-selling') || q.includes('lebensversicherung') || q.includes('potential')) {
        return `<strong>Cross-Selling-Potential Lebensversicherung:</strong><br><br>
        <strong>2 Kunden</strong> ohne LV-Absicherung trotz Bedarf:<br><br>
        <div class="chat-customer-item">
            ${customerBtn('Peter Schmidt', 'KD00001', 'stammdaten', '')} (45 J.) – BU vorhanden, keine Risikoleben<br>
            ${vertragBadge(false)}
            <span class="chat-recommendation">Baufinanzierung €285.000 – Absicherung dringend empfohlen</span>
        </div>
        <div class="chat-customer-item">
            ${customerBtn('Amira König', 'KD00002', 'stammdaten', '')} (38 J.) – 2 Kinder, selbstständig<br>
            <span class="chat-recommendation">Geschätzte Prämie: €1.200/Jahr</span>
        </div>
        <br>Gesamtpotential: <strong>€3.000/Jahr</strong>
        ${followUpSuggestions}`;
    }

    // FIDA-Fälle
    if (q.includes('fida')) {
        return `<strong>FIDA-Fälle diese Woche:</strong><br><br>
        <strong>2 offene Anfragen</strong> mit Frist:<br><br>
        <div class="chat-customer-item">
            <strong>Allianz Anfrage</strong> – ${customerBtn('Peter Schmidt', 'KD00001', 'fida', '')}<br>
            <span class="chat-recommendation">Frist: ${getDynamicDate(3)} | Status: In Bearbeitung</span>
        </div>
        <div class="chat-customer-item">
            <strong>AXA Anfrage</strong> – ${customerBtn('Thomas Weber', 'KD00003', 'fida', '')}<br>
            <span class="chat-recommendation">Frist: ${getDynamicDate(5)} | Status: Neu</span>
        </div>
        <br>Empfehlung: AXA-Anfrage priorisieren
        ${followUpSuggestions}`;
    }

    // Abschlussquote
    if (q.includes('abschlussquote') || q.includes('vergleich') || q.includes('quote')) {
        return `<strong>Abschlussquote im Vergleich:</strong><br><br>
        <strong>Aktueller Monat:</strong> 68% (12 von 18 Angeboten)<br>
        <strong>Vormonat:</strong> 62% (10 von 16 Angeboten)<br><br>
        Veränderung: <strong>+6 Prozentpunkte</strong><br><br>
        Stärkste Sparten:<br>
        • Kfz: 78% Abschlussquote<br>
        • Hausrat: 71% Abschlussquote<br>
        • BU: 45% Abschlussquote (unter Durchschnitt)
        ${followUpSuggestions}`;
    }

    // Fallback für alle anderen Fragen
    return `Ich kann Ihnen bei folgenden Themen helfen:
        ${followUpSuggestions}`;
}

/**
 * Öffnet Kundendetail aus dem Chat heraus
 * @param {string} kundenId - Kunden-ID
 * @param {string} targetTab - Ziel-Tab (optional: 'stammdaten', 'vertraege', 'fida', 'impulse', 'finanzplanung', 'kommunikation')
 * @param {string} contractType - Vertragstyp zum Highlighten (optional: 'leben', 'kfz', 'hausrat', 'rechtsschutz', 'bu', 'unfall', 'haftpflicht')
 */
function openKundenDetailFromChat(kundenId, targetTab, contractType) {
    // Chat bleibt offen, damit Nutzer ihn weiter verwenden kann
    // (Chat-Toggle Button bleibt verfügbar in Kundendetail-Ansicht)

    // Öffne Kundendetail
    if (typeof openKundenDetailFromFida === 'function') {
        openKundenDetailFromFida(kundenId);
    } else if (typeof window.openKundenDetail === 'function') {
        window.openKundenDetail(kundenId);
    } else {
        console.log('Öffne Kunde:', kundenId);
        return;
    }

    // Warte kurz, bis die Kundendetail-Seite geladen ist
    setTimeout(() => {
        // Tab wechseln wenn angegeben
        if (targetTab) {
            const tabBtn = document.querySelector(`[data-tab="${targetTab}"]`);
            if (tabBtn) {
                tabBtn.click();
            }
        }

        // Vertrag highlighten wenn angegeben
        if (contractType) {
            setTimeout(() => {
                highlightContractRow(contractType);
            }, 300);
        }
    }, 200);
}

/**
 * Highlightet eine Vertragszeile für 2 Sekunden
 * @param {string} contractType - Vertragstyp (kfz, hausrat, rechtsschutz, bu)
 */
function highlightContractRow(contractType) {
    // Mapping von Vertragstyp zu Suchbegriff
    const searchTerms = {
        'leben': 'Risikolebensversicherung',
        'kfz': 'Kfz-Versicherung',
        'hausrat': 'Hausratversicherung',
        'rechtsschutz': 'Rechtsschutz',
        'bu': 'Berufsunfähigkeitsversicherung',
        'wohngebaeude': 'Wohngebäudeversicherung',
        'unfall': 'Unfallversicherung',
        'haftpflicht': 'Privathaftpflichtversicherung'
    };

    const searchTerm = searchTerms[contractType] || contractType;

    // Suche in allen sichtbaren Tabellen
    const tables = document.querySelectorAll('.kunden-table tbody tr, .fida-table tbody tr');

    for (const row of tables) {
        const firstCell = row.querySelector('td:first-child');
        if (firstCell && firstCell.textContent.includes(searchTerm)) {
            // Scroll zur Zeile
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Highlight-Klasse hinzufügen
            row.classList.add('highlight-flash');

            // Nach 2 Sekunden entfernen
            setTimeout(() => {
                row.classList.remove('highlight-flash');
            }, 2000);

            break;
        }
    }
}

/**
 * Toggle für den floating Agentur Chat
 */
function toggleAgenturChat() {
    const widget = document.getElementById('agenturChatWidget');
    const toggle = document.getElementById('agenturChatToggle');

    if (widget.style.display === 'none' || widget.style.display === '') {
        widget.style.display = 'flex';
        toggle.style.display = 'none';
    } else {
        widget.style.display = 'none';
        toggle.style.display = 'flex';
    }
}

/**
 * Versteckt den Agentur Chat komplett (beim Verlassen der Agentursicht)
 */
function hideAgenturChat() {
    const widget = document.getElementById('agenturChatWidget');
    const toggle = document.getElementById('agenturChatToggle');
    if (widget) widget.style.display = 'none';
    if (toggle) toggle.style.display = 'none';
}

/**
 * Toggle für weitere Potentiale in der Übersicht
 */
function toggleWeiterePotentiale() {
    const liste = document.getElementById('weiterePotentialeListe');
    const toggle = document.querySelector('.weitere-potentiale-toggle');

    if (liste.style.display === 'none' || liste.style.display === '') {
        liste.style.display = 'block';
        toggle.classList.add('expanded');
        toggle.querySelector('span:not(.weitere-badge)').textContent = 'Weitere Potentiale ausblenden';
    } else {
        liste.style.display = 'none';
        toggle.classList.remove('expanded');
        toggle.querySelector('span:not(.weitere-badge)').textContent = 'Weitere Potentiale anzeigen';
    }
}

/**
 * Zeigt neue Potentiale mit Ladeanimation und wechselt dann zum Potentiale-Tab
 */
function showNeuePotentiale() {
    // Prüfen ob Chat geschlossen ist (display = 'none' oder '')
    const chatWidget = document.getElementById('agenturChatWidget');
    if (chatWidget && (chatWidget.style.display === 'none' || chatWidget.style.display === '')) {
        // Chat ist geschlossen - öffnen
        toggleAgenturChat();
        // Kurz warten bis Chat geöffnet ist
        setTimeout(() => {
            showNeuePotentialeContent();
        }, 300);
        return;
    }

    // Chat ist bereits offen - direkt Inhalt anzeigen
    showNeuePotentialeContent();
}

function showNeuePotentialeContent() {
    const chatBody = document.getElementById('agenturChatBody');
    if (!chatBody) {
        console.error('agenturChatBody nicht gefunden!');
        return;
    }

    // Welcome message entfernen falls vorhanden
    const welcome = chatBody.querySelector('.agentur-chat-welcome');
    if (welcome) {
        welcome.style.display = 'none';
    }

    // User-Nachricht hinzufügen
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user-message';
    userMsg.innerHTML = '<div class="message-content">Neue Potentiale?</div>';
    chatBody.appendChild(userMsg);

    // Typing-Indikator hinzufügen
    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-message bot-message typing-indicator';
    typingMsg.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>`;
    chatBody.appendChild(typingMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Nach 1.5 Sekunden: Potentiale nacheinander anzeigen
    setTimeout(() => {
        // Typing-Indikator entfernen
        typingMsg.remove();

        // Bot-Antwort Container erstellen
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-message bot-message';
        botMsg.innerHTML = '<div class="message-content"><strong>Aktuelle Top-Potentiale:</strong><br><br></div>';
        chatBody.appendChild(botMsg);
        chatBody.scrollTop = chatBody.scrollHeight;

        const messageContent = botMsg.querySelector('.message-content');

        // Potentiale nacheinander einblenden - MRH vs B2B vs AO
        var potentiale;
        const isMRHMode = typeof viewMode !== 'undefined' && viewMode === 'mrh';
        if (isMRHMode) {
            potentiale = [
                {
                    name: 'Rhein-Main Maschinenbau',
                    title: 'bAV fehlt (340 MA)',
                    desc: 'Cross-Sell Insurance → Benefits: geschätztes Potential 85k bAV-Volumen/Jahr'
                },
                {
                    name: 'Rhein-Main Maschinenbau',
                    title: 'Renewal BH 01.04.2026',
                    desc: '420k Prämie — Allianz hat 15% Erhöhung angekündigt'
                },
                {
                    name: 'Hessenlog Spedition',
                    title: 'bAV fehlt (210 MA)',
                    desc: 'Einfaches Bindungsmodell gegen Fluktuation möglich'
                },
                {
                    name: 'DigiCore Solutions',
                    title: 'Kreditversicherung prüfen',
                    desc: 'SaaS-Forderungen international — Finance Cross-Sell'
                },
                {
                    name: 'Rhein-Main Verkehr',
                    title: 'Renewal Flotte + BH ÖPNV 01.07.2026',
                    desc: '1,45 Mio. Prämie — größtes Renewal des Halbjahres'
                }
            ];
        } else if (typeof maklerModus !== 'undefined' && maklerModus) {
            potentiale = [
                {
                    name: 'Klinikum Lippetal',
                    title: 'Umwelthaftpflicht fehlt',
                    desc: 'Labor & Gefahrstoffe nicht versichert – hohe Priorität'
                },
                {
                    name: 'Klinikum Lippetal',
                    title: 'Cyber-Renewal in 30 Tagen',
                    desc: 'Hiscox-Vertrag läuft 31.03.2026 aus – Erneuerung einleiten'
                },
                {
                    name: 'Reha-Klinik Teutoburg',
                    title: 'Cyberversicherung fehlt',
                    desc: 'Patientendaten ungeschützt – dringend absichern'
                },
                {
                    name: 'Ev. Landeskirche Teutoburg',
                    title: 'Cyber-Rahmenvertrag',
                    desc: 'Kirchenverwaltungen nur teilweise versichert – 12,5 Mio. € Bestand'
                },
                {
                    name: 'Teutoburger Maschinenbau',
                    title: '3 Renewals in 90 Tagen',
                    desc: '680.000 € Prämienvolumen – Verhandlungen vorbereiten'
                }
            ];
        } else if (typeof viewMode !== 'undefined' && (viewMode === 'bank-retail' || viewMode === 'bank-fk' || viewMode === 'bank-vw')) {
            potentiale = [
                {
                    name: 'Klaus Fischer',
                    title: 'Anschlussfinanzierung DZ HYP',
                    desc: 'Zinsbindung läuft 09/2026 aus. Restschuld €185.000 – Forward-Darlehen anbieten'
                },
                {
                    name: 'Sandra Müller',
                    title: 'VR-FinanzPlan fehlt',
                    desc: 'Premium-Kundin ohne ganzheitliche Beratung – Cross-Selling-Potential €1.800'
                },
                {
                    name: 'Stefan Braun',
                    title: 'Kontokonsolidierung (FIDA)',
                    desc: 'Hauptkonto bei N26 + Depots extern – VR-MeinDepot + Wero als Einstieg'
                },
                {
                    name: 'Julia Becker',
                    title: 'Altersvorsorge fehlt',
                    desc: 'NPS 6, kein FinanzPlan – UniProfiRente + R+V BU empfehlen'
                }
            ];
        } else {
            potentiale = [
                {
                    name: 'Peter Schmidt',
                    title: 'Risikoleben fehlt',
                    desc: 'Baufinanzierung €285.000 ohne Absicherung'
                },
                {
                    name: 'Peter Schmidt',
                    title: 'BU-Nachversicherung',
                    desc: 'Nur 41% des Einkommens abgesichert'
                },
                {
                    name: 'Amira König',
                    title: 'Kfz-Wechsel',
                    desc: 'Vertrag läuft bald aus, €200/Jahr Ersparnis möglich'
                },
                {
                    name: 'Thomas Weber',
                    title: 'Risikoleben fehlt',
                    desc: 'Familie unzureichend abgesichert'
                }
            ];
        }

        // Jedes Potential nacheinander mit 400ms Delay einblenden
        potentiale.forEach((potential, index) => {
            setTimeout(() => {
                const item = document.createElement('div');
                item.className = 'chat-customer-item';
                item.style.opacity = '0';
                item.style.transform = 'translateY(10px)';
                item.style.transition = 'all 0.3s ease';
                item.innerHTML = `
                    <strong>${potential.name}</strong> – ${potential.title}<br>
                    <span class="chat-recommendation">${potential.desc}</span>`;
                messageContent.appendChild(item);

                // Fade-in Animation
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 10);

                chatBody.scrollTop = chatBody.scrollHeight;

                // Nach dem letzten Potential: Hinweis, Follow-up Buttons und Tab-Wechsel
                if (index === potentiale.length - 1) {
                    setTimeout(() => {
                        const footer = document.createElement('div');
                        footer.innerHTML = '<br><strong>→ Wechsle zum Potentiale-Tab für vollständige Übersicht...</strong>';
                        messageContent.appendChild(footer);

                        // Follow-up Buttons hinzufügen (wie bei anderen Chat-Antworten)
                        const followUpDiv = document.createElement('div');
                        followUpDiv.innerHTML = `
                            <div class="chat-followup-suggestions">
                                <button onclick="askAgenturQuestion('Welche Verträge laufen in den nächsten 30 Tagen aus?')">Welche Verträge laufen bald aus?</button>
                                <button onclick="askAgenturQuestion('Welche Kunden haben Cross-Selling-Potential?')">Wer hat Cross-Selling-Potential?</button>
                                <button onclick="showNeuePotentiale()">Neue Potentiale?</button>
                                <button onclick="goToSalesReport()">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align: middle; margin-right: 4px;">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                    Vertriebsbericht
                                </button>
                            </div>`;
                        messageContent.appendChild(followUpDiv);
                        chatBody.scrollTop = chatBody.scrollHeight;

                        // Nach 1,5 Sekunden: Zum Potentiale-Tab wechseln
                        setTimeout(() => {
                            if (typeof viewMode !== 'undefined' && viewMode === 'mrh') {
                                if (typeof showMRHTab === 'function') showMRHTab('potentiale');
                            } else if (typeof maklerModus !== 'undefined' && maklerModus) {
                                if (typeof showMaklerTab === 'function') showMaklerTab('potentiale');
                            } else if (typeof viewMode !== 'undefined' && (viewMode === 'bank-retail' || viewMode === 'bank-fk' || viewMode === 'bank-vw')) {
                                if (typeof showBeraterTab === 'function') showBeraterTab('potentiale');
                            } else {
                                showAgenturTab('potential');
                            }
                            // Chat bleibt offen für weitere Interaktionen
                        }, 1500);
                    }, 300);
                }
            }, index * 400);
        });
    }, 1500);
}

/**
 * Navigiert zum Vertriebsbericht in A-03 (Dashboard)
 * mit der aktuellen Agentur gefiltert
 */
function goToSalesReport() {
    const agenturId = currentAgenturIdInOverview || 'VM00001';
    console.log('Navigiere zu Vertriebsbericht für:', agenturId);

    const chatBody = document.getElementById('agenturChatBody');
    if (!chatBody) {
        // Fallback ohne Animation
        if (typeof navigateToSalesReport === 'function') {
            navigateToSalesReport(agenturId);
        }
        return;
    }

    // Welcome message entfernen falls vorhanden
    const welcome = chatBody.querySelector('.agentur-chat-welcome');
    if (welcome) {
        welcome.style.display = 'none';
    }

    // User-Nachricht hinzufügen
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user-message';
    userMsg.innerHTML = '<div class="message-content">Vertriebsbericht</div>';
    chatBody.appendChild(userMsg);

    // Typing-Indikator hinzufügen
    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-message bot-message typing-indicator';
    typingMsg.id = 'salesReportTyping';
    typingMsg.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatBody.appendChild(typingMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Nach kurzer Zeit Bot-Antwort und Navigation
    setTimeout(() => {
        // Typing entfernen
        const typing = document.getElementById('salesReportTyping');
        if (typing) typing.remove();

        // Bot-Antwort hinzufügen
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-message bot-message';
        botMsg.innerHTML = `
            <div class="message-content">
                <strong>Vertriebsbericht wird geladen...</strong><br><br>
                Ich öffne jetzt das Dashboard mit dem Vertriebsbericht für diese Agentur.
            </div>
        `;
        chatBody.appendChild(botMsg);
        chatBody.scrollTop = chatBody.scrollHeight;

        // Nach kurzer Pause navigieren
        setTimeout(() => {
            if (typeof navigateToSalesReport === 'function') {
                navigateToSalesReport(agenturId);
            } else {
                console.error('navigateToSalesReport Funktion nicht gefunden');
                if (typeof openDashboard === 'function') {
                    openDashboard();
                }
            }
        }, 800);
    }, 1500);
}

// Global verfügbar machen
window.goToSalesReport = goToSalesReport;
window.showAgenturTab = showAgenturTab;
window.filterFidaCases = filterFidaCases;
window.togglePotentialDetails = togglePotentialDetails;
window.toggleVertriebsPeriod = toggleVertriebsPeriod;
window.openFormular = openFormular;
window.openAbrechnung = openAbrechnung;
window.sendAgenturChat = sendAgenturChat;
window.askAgenturQuestion = askAgenturQuestion;
window.openKundenDetailFromChat = openKundenDetailFromChat;
window.highlightContractRow = highlightContractRow;
window.openKundenDetailFromFida = openKundenDetailFromFida;
window.toggleAgenturChat = toggleAgenturChat;
window.hideAgenturChat = hideAgenturChat;
window.showNeuePotentiale = showNeuePotentiale;
window.toggleWeiterePotentiale = toggleWeiterePotentiale;

/**
 * Setzt alle Demo-Daten zurück (localStorage löschen + Seite neu laden)
 */
function resetDemoData() {
    localStorage.clear();
    location.reload();
}
window.resetDemoData = resetDemoData;

// Dynamische Daten auch bei direktem Seitenaufruf setzen
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateDynamicDates, 200);
});

window.__registerModule('agentur-overview-features.js');
