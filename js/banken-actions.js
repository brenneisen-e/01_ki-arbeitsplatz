// ========================================
// NEW: Customer Actions
// ========================================

// Start Mahnprozess
function startMahnprozess(customerId) {
    showNotification(`Mahnprozess für ${customerId} gestartet`, 'info');
    console.log('Starting Mahnprozess:', customerId);
}

// Sell Case
function sellCase(customerId) {
    showNotification(`Fall ${customerId} zum Verkauf markiert`, 'warning');
    console.log('Selling case:', customerId);
}

// Write Off
function writeOff(customerId) {
    showNotification(`Fall ${customerId} zur Abschreibung vorgemerkt`, 'error');
    console.log('Writing off:', customerId);
}

// Schedule Call
function scheduleCall(customerId) {
    showNotification(`Anruf für ${customerId} geplant`, 'success');
    console.log('Scheduling call:', customerId);
}

// Create Agreement
function createAgreement(customerId) {
    showNotification(`Vereinbarung für ${customerId} wird erstellt`, 'info');
    console.log('Creating agreement:', customerId);
}

// View Agreement
function viewAgreement(customerId) {
    showNotification(`Vereinbarung für ${customerId} wird geladen`, 'info');
    console.log('Viewing agreement:', customerId);
}

// Show Full Letter (Kommunikation tab)
function showFullLetter(letterId) {
    // Define letter content based on ID
    const letters = {
        'mahnung-1': {
            title: '1. Mahnung - Freundliche Zahlungserinnerung',
            date: '15.10.2025',
            content: `
                <div class="full-letter-header">
                    <div class="letter-sender">
                        <strong>Musterbank AG</strong><br>
                        Forderungsmanagement<br>
                        Bankstraße 123<br>
                        60311 Frankfurt am Main
                    </div>
                    <div class="letter-recipient">
                        <strong>Mueller GmbH</strong><br>
                        Herr Hans Mueller<br>
                        Musterstraße 123<br>
                        38100 Braunschweig
                    </div>
                </div>
                <div class="letter-date">Frankfurt, 15.10.2025</div>
                <div class="letter-subject"><strong>1. Mahnung - Freundliche Zahlungserinnerung</strong></div>
                <div class="letter-text">
                    <p>Sehr geehrter Herr Mueller,</p>
                    <p>bei der Durchsicht unserer Konten haben wir festgestellt, dass folgende Zahlung noch aussteht:</p>
                    <p><strong>Offener Betrag: € 2.500,00</strong><br>
                    Vertragsnummer: BMK-2018-0456789<br>
                    Fälligkeitsdatum: 01.10.2025</p>
                    <p>Sicher handelt es sich nur um ein Versehen. Bitte überweisen Sie den ausstehenden Betrag bis zum <strong>25.10.2025</strong> auf unser Konto.</p>
                    <p>Sollten Sie die Zahlung bereits veranlasst haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.</p>
                    <p>Bei Fragen stehen wir Ihnen gerne unter der Rufnummer 0800 123 456 zur Verfügung.</p>
                    <p>Mit freundlichen Grüßen<br><br>
                    Ihr Forderungsmanagement<br>
                    Musterbank AG</p>
                </div>
            `
        },
        'mahnung-2': {
            title: '2. Mahnung - Zahlungserinnerung',
            date: '01.11.2025',
            content: `
                <div class="full-letter-header">
                    <div class="letter-sender">
                        <strong>Musterbank AG</strong><br>
                        Forderungsmanagement<br>
                        Bankstraße 123<br>
                        60311 Frankfurt am Main
                    </div>
                    <div class="letter-recipient">
                        <strong>Mueller GmbH</strong><br>
                        Herr Hans Mueller<br>
                        Musterstraße 123<br>
                        38100 Braunschweig
                    </div>
                </div>
                <div class="letter-date">Frankfurt, 01.11.2025</div>
                <div class="letter-subject"><strong>2. Mahnung - Zahlungserinnerung</strong></div>
                <div class="letter-text">
                    <p>Sehr geehrter Herr Mueller,</p>
                    <p>leider haben wir bis heute keinen Zahlungseingang zu unserer 1. Mahnung vom 15.10.2025 feststellen können.</p>
                    <p><strong>Offener Betrag: € 5.000,00</strong> (inkl. Mahngebühren € 15,00)<br>
                    Vertragsnummer: BMK-2018-0456789</p>
                    <p>Wir bitten Sie dringend, den offenen Betrag bis zum <strong>15.11.2025</strong> zu begleichen.</p>
                    <p>Sollte die Zahlung nicht fristgerecht erfolgen, behalten wir uns vor, weitere rechtliche Schritte einzuleiten.</p>
                    <p>Mit freundlichen Grüßen<br><br>
                    Ihr Forderungsmanagement<br>
                    Musterbank AG</p>
                </div>
            `
        },
        'mahnung-3': {
            title: 'Letzte Mahnung - Außergerichtliche Aufforderung',
            date: '15.11.2025',
            content: `
                <div class="full-letter-header">
                    <div class="letter-sender">
                        <strong>Musterbank AG</strong><br>
                        Inkasso-Abteilung<br>
                        Bankstraße 123<br>
                        60311 Frankfurt am Main
                    </div>
                    <div class="letter-recipient">
                        <strong>Mueller GmbH</strong><br>
                        Herr Hans Mueller<br>
                        Musterstraße 123<br>
                        38100 Braunschweig
                    </div>
                </div>
                <div class="letter-date">Frankfurt, 15.11.2025</div>
                <div class="letter-subject"><strong>LETZTE MAHNUNG - Außergerichtliche Zahlungsaufforderung</strong></div>
                <div class="letter-text">
                    <p>Sehr geehrter Herr Mueller,</p>
                    <p>trotz mehrfacher Aufforderung ist die ausstehende Forderung in Höhe von <strong>€ 7.500,00</strong> nicht beglichen worden.</p>
                    <p>Wir fordern Sie hiermit <strong>letztmalig</strong> auf, den offenen Betrag bis zum <strong>25.11.2025</strong> zu begleichen.</p>
                    <p><strong>Forderungsaufstellung:</strong><br>
                    Hauptforderung: € 7.500,00<br>
                    Zinsen (5,75% p.a.): € 145,30<br>
                    Mahngebühren: € 45,00<br>
                    <strong>Gesamtbetrag: € 7.690,30</strong></p>
                    <p>Sollte die Zahlung nicht fristgerecht eingehen, sehen wir uns gezwungen, den Fall <strong>ohne weitere Ankündigung</strong> an ein Inkassounternehmen zu übergeben und gerichtliche Schritte einzuleiten.</p>
                    <p>Mit freundlichen Grüßen<br><br>
                    Inkasso-Abteilung<br>
                    Musterbank AG</p>
                </div>
            `
        },
        'email-kunde-1': {
            title: 'E-Mail vom Kunden',
            date: '20.10.2025',
            content: `
                <div class="email-header">
                    <div class="email-meta">
                        <strong>Von:</strong> h.mueller@mueller-gmbh.de<br>
                        <strong>An:</strong> forderungsmanagement@musterbank.de<br>
                        <strong>Datum:</strong> 20.10.2025, 16:42<br>
                        <strong>Betreff:</strong> Re: Zahlungserinnerung
                    </div>
                </div>
                <div class="letter-text" style="background: #f8fafc; border-left: 3px solid #3b82f6;">
                    <p>Sehr geehrte Damen und Herren,</p>
                    <p>vielen Dank für Ihr Schreiben vom 15.10.2025.</p>
                    <p>Aufgrund von Liquiditätsengpässen in unserem Unternehmen ist es uns derzeit leider nicht möglich, die volle Rate zu begleichen. Wir hatten in den letzten Monaten unvorhergesehene Ausgaben und einen Umsatzrückgang.</p>
                    <p>Wir bitten daher um Verständnis und möchten eine Ratenzahlungsvereinbarung beantragen. Wir können ab dem 15.11.2025 monatlich € 1.500,00 zahlen, bis die offene Forderung beglichen ist.</p>
                    <p>Bitte teilen Sie uns mit, ob dies möglich ist.</p>
                    <p>Mit freundlichen Grüßen<br>
                    Hans Mueller<br>
                    Geschäftsführer<br>
                    Mueller GmbH</p>
                </div>
            `
        }
    };

    const letter = letters[letterId];
    if (!letter) {
        showNotification('Dokument nicht gefunden', 'error');
        return;
    }

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'letter-modal-overlay';
    overlay.innerHTML = `
        <div class="letter-modal">
            <div class="letter-modal-header">
                <h3>${letter.title}</h3>
                <button class="letter-modal-close" onclick="closeLetterModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="letter-modal-body">
                ${letter.content}
            </div>
            <div class="letter-modal-footer">
                <button class="btn-secondary" onclick="closeLetterModal()">Schließen</button>
                <button class="btn-primary" onclick="printLetter('${letterId}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Drucken
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeLetterModal();
        }
    });

    // Close on ESC
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeLetterModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// Close letter modal
function closeLetterModal() {
    const overlay = document.querySelector('.letter-modal-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Print letter
function printLetter(letterId) {
    showNotification('Dokument wird gedruckt...', 'info');
    // In a real app, this would trigger print
    console.log('Printing letter:', letterId);
}

// Open CRM Profile from customer modal
function openCrmFromModal() {
    // Close the modal first
    closeCustomerDetail();

    // Then open CRM profile
    setTimeout(() => {
        openCrmProfile('K-2024-0001');
    }, 300);
}

// ========================================
// NEW: Task Management
// ========================================

// Filter Aufgaben
function filterAufgaben(filter) {
    // Update active button
    document.querySelectorAll('.aufgaben-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    // Filter task items
    const items = document.querySelectorAll('.aufgabe-item');
    items.forEach(item => {
        const status = item.dataset.status;
        if (filter === 'alle') {
            item.style.display = '';
        } else if (filter === status) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    // Update pagination info
    const visibleCount = document.querySelectorAll('.aufgabe-item:not([style*="display: none"])').length;
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `Zeige 1-${visibleCount} von ${visibleCount} Aufgaben`;
    }

    console.log('Filtering tasks:', filter, 'visible:', visibleCount);
}

// Reschedule Task
function rescheduleTask(taskId) {
    showNotification(`Aufgabe ${taskId} wird verschoben`, 'info');
    console.log('Rescheduling task:', taskId);
}


// Exports
window.startMahnprozess = startMahnprozess;
window.sellCase = sellCase;
window.writeOff = writeOff;
window.scheduleCall = scheduleCall;
window.createAgreement = createAgreement;
window.viewAgreement = viewAgreement;
window.showFullLetter = showFullLetter;
window.closeLetterModal = closeLetterModal;
window.printLetter = printLetter;
window.openCrmFromModal = openCrmFromModal;
window.filterAufgaben = filterAufgaben;
window.rescheduleTask = rescheduleTask;
window.__registerModule('banken-actions.js');
