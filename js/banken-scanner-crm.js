// ========================================
// DOCUMENT SCANNER FUNCTIONS
// ========================================

let uploadedFile = null;
let uploadedFileData = null;

function openDocumentScanner() {
    const modal = document.getElementById('documentScannerModal');
    if (modal) {
        modal.classList.add('active');
        resetScanner();
    }
}

function closeDocumentScanner() {
    const modal = document.getElementById('documentScannerModal');
    if (modal) {
        modal.classList.remove('active');
        resetScanner();
    }
}

function resetScanner() {
    uploadedFile = null;
    uploadedFileData = null;

    // Reset to step 1
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    const step1 = document.getElementById('scanner-step-1');
    if (step1) step1.classList.add('active');

    // Reset upload area
    const uploadPreview = document.getElementById('uploadPreview');
    const dropZone = document.getElementById('dropZone');
    if (uploadPreview) uploadPreview.style.display = 'none';
    if (dropZone) dropZone.style.display = 'block';
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = document.getElementById('dropZone');
    if (dropZone) dropZone.classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Ungültiges Dateiformat. Bitte PDF, JPG, PNG oder TIFF verwenden.', 'error');
        return;
    }

    uploadedFile = file;

    // Show preview
    const dropZone = document.getElementById('dropZone');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImage = document.getElementById('previewImage');
    const fileName = document.getElementById('fileName');

    if (dropZone) dropZone.style.display = 'none';
    if (uploadPreview) uploadPreview.style.display = 'block';
    if (fileName) fileName.textContent = file.name;

    // Create preview based on file type
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedFileData = e.target.result;
            if (previewImage) previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        // PDF - show placeholder
        if (previewImage) previewImage.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIiB2aWV3Qm94PSIwIDAgMjAwIDI1MCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNmOGZhZmMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI0MCIgZmlsbD0iI2RjMjYyNiI+UERG PC90ZXh0Pjwvc3ZnPg==';
        uploadedFileData = 'pdf-placeholder';
    }
}

function removeUpload() {
    uploadedFile = null;
    uploadedFileData = null;

    const dropZone = document.getElementById('dropZone');
    const uploadPreview = document.getElementById('uploadPreview');

    if (dropZone) dropZone.style.display = 'block';
    if (uploadPreview) uploadPreview.style.display = 'none';
}

function openCamera() {
    showNotification('Kamera-Funktion wird in einer zukünftigen Version verfügbar sein.', 'info');
}

function startAIRecognition() {
    if (!uploadedFile) {
        showNotification('Bitte laden Sie zuerst ein Dokument hoch.', 'error');
        return;
    }

    // Move to step 2
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    const step2 = document.getElementById('scanner-step-2');
    if (step2) step2.classList.add('active');

    // Set recognition image
    const recognitionImage = document.getElementById('recognitionImage');
    if (recognitionImage && uploadedFileData) {
        recognitionImage.src = uploadedFileData !== 'pdf-placeholder' ? uploadedFileData : document.getElementById('previewImage').src;
    }

    // Simulate AI recognition
    setTimeout(() => {
        const recognitionStatus = document.getElementById('recognitionStatus');
        const recognizedFields = document.getElementById('recognizedFields');

        if (recognitionStatus) recognitionStatus.style.display = 'none';
        if (recognizedFields) recognizedFields.style.display = 'block';

        // Fill in sample recognized data
        document.getElementById('rec-name').value = 'Schmidt Elektronik GmbH';
        document.getElementById('rec-address').value = 'Industriestr. 45, 38112 Braunschweig';
        document.getElementById('rec-iban').value = 'DE89 3704 0044 0532 0130 00';
        document.getElementById('rec-amount').value = '€ 8.450,00';
        document.getElementById('rec-due-date').value = '2025-10-15';

        showNotification('Dokumentenanalyse abgeschlossen', 'success');
    }, 2000);
}

function goToStep2() {
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    const step2 = document.getElementById('scanner-step-2');
    if (step2) step2.classList.add('active');
}

function goToStep3() {
    document.querySelectorAll('.scanner-step').forEach(step => step.classList.remove('active'));
    const step3 = document.getElementById('scanner-step-3');
    if (step3) step3.classList.add('active');

    // Pre-fill form with recognized data
    document.getElementById('customer-name').value = document.getElementById('rec-name').value;
    document.getElementById('customer-street').value = document.getElementById('rec-address').value.split(',')[0] || '';
    document.getElementById('customer-iban').value = document.getElementById('rec-iban').value;
    document.getElementById('claim-amount').value = parseFloat(document.getElementById('rec-amount').value.replace(/[€\s.]/g, '').replace(',', '.')) || 0;
    document.getElementById('claim-due-date').value = document.getElementById('rec-due-date').value;

    // Set document preview
    const attachedDocPreview = document.getElementById('attachedDocPreview');
    const attachedDocName = document.getElementById('attachedDocName');
    if (attachedDocPreview) attachedDocPreview.src = document.getElementById('recognitionImage').src;
    if (attachedDocName) attachedDocName.textContent = uploadedFile ? uploadedFile.name : 'Dokument';
}

function createCustomerFromScan() {
    showNotification('Kunde wurde erfolgreich angelegt!', 'success');
    closeDocumentScanner();

    // Refresh the customer list or show new customer
    setTimeout(() => {
        showNotification('Neuer Fall wurde zur Segmentierung hinzugefügt.', 'info');
    }, 1000);
}

function showBulkImport() {
    showNotification('Bulk-Import wird vorbereitet...', 'info');
}

// ========================================
// FULL CRM PROFILE FUNCTIONS
// ========================================

function openCrmProfile(customerId, taskContext = null) {
    const crmView = document.getElementById('crmProfileView');
    if (crmView) {
        crmView.classList.add('active');

        // Get full customer data
        const customer = getFullCustomerData(customerId);

        // Update CRM header with customer name
        const crmHeader = crmView.querySelector('.crm-header h2, .crm-customer-name');
        if (crmHeader) {
            crmHeader.textContent = customer.name;
        }

        // Update CRM customer ID
        const crmCustomerId = crmView.querySelector('.crm-customer-id');
        if (crmCustomerId) {
            crmCustomerId.textContent = customerId;
        }

        // Update CRM fields using the same helper approach
        updateCrmFields(crmView, customer);

        // Show/hide task hint box
        const taskHintBox = document.getElementById('crmTaskHint');
        if (taskHintBox) {
            if (taskContext) {
                taskHintBox.style.display = 'block';
                taskHintBox.innerHTML = `
                    <div class="task-hint-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <strong>Offene Aufgabe:</strong> ${taskContext.title}
                    </div>
                    <div class="task-hint-meta">
                        <span class="task-hint-due ${taskContext.overdue ? 'overdue' : ''}">${taskContext.due}</span>
                        <button class="btn-ai-summary" onclick="showAiSummary('${customerId}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"></path>
                                <path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"></path>
                            </svg>
                            KI-Zusammenfassung
                        </button>
                    </div>
                `;
            } else {
                taskHintBox.style.display = 'none';
            }
        }

        console.log('Opening CRM profile for customer:', customerId, customer.name, taskContext ? 'with task' : '');
    }
}

// Update CRM view fields with customer data
function updateCrmFields(crmView, customer) {
    // Helper to find and update by label
    function updateByLabel(labelText, newValue) {
        const rows = crmView.querySelectorAll('.crm-row, .info-row, .detail-row');
        for (const row of rows) {
            const label = row.querySelector('.label, .info-label, .detail-label');
            if (label && label.textContent.trim().toLowerCase().includes(labelText.toLowerCase())) {
                const value = row.querySelector('.value, .info-value, .detail-value');
                if (value) {
                    value.textContent = newValue;
                    return value;
                }
            }
        }
        return null;
    }

    // Update main fields
    updateByLabel('Firmenname', customer.name);
    updateByLabel('Name', customer.name);
    updateByLabel('Rechtsform', customer.rechtsform);
    updateByLabel('Branche', customer.branche);
    updateByLabel('Adresse', customer.adresse);
    updateByLabel('Telefon', customer.telefon);
    updateByLabel('E-Mail', customer.email);
    updateByLabel('Ansprechpartner', customer.ansprechpartner);

    // Update financial data
    updateByLabel('Restschuld', '€' + (customer.restschuld || 0).toLocaleString('de-DE'));
    updateByLabel('Gesamtforderung', '€' + (customer.gesamtforderung || 0).toLocaleString('de-DE'));

    // Update status badges
    const statusBadges = crmView.querySelectorAll('.status-badge, .segment-badge');
    statusBadges.forEach(badge => {
        if (customer.status === 'Bezahlt') {
            badge.textContent = 'Abgeschlossen';
            badge.className = badge.className.replace(/danger|warning|inkasso/g, 'success');
        }
    });
}

// Show AI Summary for customer
function showAiSummary(customerId) {
    showNotification('KI-Zusammenfassung wird erstellt...', 'info');

    // Simulate AI loading
    setTimeout(() => {
        const summary = `
            <div class="ai-summary-modal">
                <div class="ai-summary-header">
                    <div class="ai-summary-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        <span>KI-Zusammenfassung für ${customerId}</span>
                    </div>
                    <button onclick="this.closest('.ai-summary-modal').remove()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="ai-summary-content">
                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Kundenprofil
                    </h4>
                    <p>Der Kunde zeigt eine <strong>moderate Zahlungsbereitschaft</strong> (Willingness: 45%) bei <strong>eingeschränkter Zahlungsfähigkeit</strong> (Ability: 35%). Die Kommunikation war bisher konstruktiv.</p>

                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Aktivitäten (letzte 30 Tage)
                    </h4>
                    <ul>
                        <li>3 Telefonkontakte (2 erfolgreich, 1 nicht erreicht)</li>
                        <li>1 Zahlungsvereinbarung getroffen</li>
                        <li>Teilzahlung i.H.v. €1.200 eingegangen</li>
                    </ul>

                    <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Empfohlene nächste Schritte
                    </h4>
                    <ol>
                        <li><strong>Telefonat führen</strong> - Zahlungsvereinbarung nachfassen</li>
                        <li><strong>Ratenzahlung prüfen</strong> - Kunde hat Interesse signalisiert</li>
                        <li><strong>Dokumentation aktualisieren</strong> - Finanzielle Situation erfassen</li>
                    </ol>
                </div>
            </div>
        `;

        // Add modal to page
        const modalContainer = document.createElement('div');
        modalContainer.className = 'ai-summary-overlay';
        modalContainer.innerHTML = summary;
        modalContainer.onclick = (e) => {
            if (e.target === modalContainer) modalContainer.remove();
        };
        document.body.appendChild(modalContainer);
    }, 1500);
}

function closeCrmProfile() {
    const crmView = document.getElementById('crmProfileView');
    if (crmView) {
        crmView.classList.remove('active');
    }
}

function showCrmSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.crm-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeNav = document.querySelector(`.crm-nav-item[onclick="showCrmSection('${sectionName}')"]`);
    if (activeNav) activeNav.classList.add('active');

    // Update sections
    document.querySelectorAll('.crm-section').forEach(section => {
        section.classList.remove('active');
    });
    const activeSection = document.getElementById('crm-' + sectionName);
    if (activeSection) activeSection.classList.add('active');
}

// Toggle expandable document
function toggleDocument(docId) {
    const docItem = document.getElementById(docId);
    if (docItem) {
        // Toggle expanded class
        docItem.classList.toggle('expanded');

        // Optionally close other expanded documents
        document.querySelectorAll('.document-item.expanded').forEach(item => {
            if (item.id !== docId) {
                item.classList.remove('expanded');
            }
        });
    }
}

// Download document
function downloadDocument(docId) {
    showNotification(`Dokument ${docId} wird heruntergeladen...`, 'info');
    // In production, this would trigger actual file download
}

// Print document
function printDocument(docId) {
    const docItem = document.getElementById(docId);
    if (docItem) {
        const letterPreview = docItem.querySelector('.letter-preview, .contract-summary');
        if (letterPreview) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Dokument drucken</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                        .letter-preview { font-family: Georgia, serif; font-size: 13px; line-height: 1.8; }
                        .letter-header, .letter-recipient { font-size: 12px; margin-bottom: 24px; }
                        .letter-date { text-align: right; font-size: 12px; color: #666; margin-bottom: 24px; }
                        .letter-subject { font-size: 14px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #ccc; }
                        .letter-body p { margin: 0 0 12px 0; }
                        .contract-summary table { width: 100%; border-collapse: collapse; }
                        .contract-summary td { padding: 8px 0; border-bottom: 1px solid #eee; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>${letterPreview.outerHTML}</body>
                </html>
            `);
            printWindow.document.close();
            printWindow.onload = function() {
                printWindow.print();
            };
        }
    }
}

// Upload document
function uploadDocument() {
    showNotification('Dokument-Upload wird geöffnet...', 'info');
}

function crmCall() {
    showNotification('Anruf wird gestartet...', 'info');
}

function crmEmail() {
    showNotification('E-Mail-Vorlage wird geöffnet...', 'info');
}

function crmSchedule() {
    showNotification('Terminplanung wird geöffnet...', 'info');
}

function crmNote() {
    showNotification('Notizfeld wird geöffnet...', 'info');
}

// ========================================
// EDITABLE STAMMDATEN SYSTEM
// ========================================

let stammdatenEditMode = false;

function editStammdaten() {
    stammdatenEditMode = !stammdatenEditMode;

    const stammdatenTab = document.getElementById('tab-stammdaten');
    if (!stammdatenTab) return;

    if (stammdatenEditMode) {
        // Enable edit mode
        enableStammdatenEditMode(stammdatenTab);
        showNotification('Bearbeitungsmodus aktiviert - Klicken Sie auf Felder zum Bearbeiten', 'info');
    } else {
        // Save and disable edit mode
        saveStammdatenChanges(stammdatenTab);
        disableStammdatenEditMode(stammdatenTab);
        showNotification('Änderungen gespeichert', 'success');
    }
}

function enableStammdatenEditMode(container) {
    // Add edit mode class
    container.classList.add('edit-mode');

    // Make value spans editable
    container.querySelectorAll('.stammdaten-row .value').forEach(valueEl => {
        // Skip badges and special elements
        if (valueEl.querySelector('.badge') || valueEl.classList.contains('badge')) return;

        valueEl.contentEditable = 'true';
        valueEl.classList.add('editable');

        // Get the label for this field
        const labelEl = valueEl.previousElementSibling;
        const fieldName = labelEl ? labelEl.textContent.replace(':', '').trim() : '';

        valueEl.dataset.fieldName = fieldName;

        // Highlight on focus
        valueEl.addEventListener('focus', function() {
            this.classList.add('editing');
        });

        valueEl.addEventListener('blur', function() {
            this.classList.remove('editing');
        });
    });

    // Add save/cancel buttons if not already present
    let editControls = container.querySelector('.stammdaten-edit-controls');
    if (!editControls) {
        editControls = document.createElement('div');
        editControls.className = 'stammdaten-edit-controls';
        editControls.innerHTML = `
            <button class="btn-save-stammdaten" onclick="editStammdaten()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Speichern
            </button>
            <button class="btn-cancel-stammdaten" onclick="cancelStammdatenEdit()">
                Abbrechen
            </button>
        `;
        container.insertBefore(editControls, container.firstChild);
    }
    editControls.style.display = 'flex';

    // Add styles if not present
    addStammdatenEditStyles();
}

function disableStammdatenEditMode(container) {
    container.classList.remove('edit-mode');

    container.querySelectorAll('.stammdaten-row .value.editable').forEach(valueEl => {
        valueEl.contentEditable = 'false';
        valueEl.classList.remove('editable', 'editing');
    });

    const editControls = container.querySelector('.stammdaten-edit-controls');
    if (editControls) {
        editControls.style.display = 'none';
    }

    stammdatenEditMode = false;
}

function cancelStammdatenEdit() {
    const stammdatenTab = document.getElementById('tab-stammdaten');
    if (stammdatenTab) {
        // Reload original data
        if (currentCustomerId) {
            const customer = getFullCustomerData(currentCustomerId);
            const modal = document.getElementById('customerDetailModal');
            if (modal) updateStammdatenFields(modal, customer);
        }
        disableStammdatenEditMode(stammdatenTab);
        showNotification('Bearbeitung abgebrochen', 'info');
    }
}

function saveStammdatenChanges(container) {
    if (!currentCustomerId) return;

    container.querySelectorAll('.stammdaten-row .value.editable').forEach(valueEl => {
        const fieldName = valueEl.dataset.fieldName;
        const value = valueEl.textContent.trim();

        if (fieldName && value) {
            saveCustomerStammdaten(currentCustomerId, fieldName, value);
        }
    });
}

function addStammdatenEditStyles() {
    if (document.getElementById('stammdaten-edit-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'stammdaten-edit-styles';
    styles.textContent = `
        .stammdaten-edit-controls {
            display: none;
            gap: 12px;
            padding: 12px 16px;
            background: #fef3c7;
            border-radius: 8px;
            margin-bottom: 16px;
            align-items: center;
        }
        .stammdaten-edit-controls::before {
            content: 'Bearbeitungsmodus aktiv';
            font-size: 13px;
            font-weight: 500;
            color: #92400e;
            flex: 1;
        }
        .btn-save-stammdaten {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
        }
        .btn-save-stammdaten:hover { background: #059669; }
        .btn-cancel-stammdaten {
            padding: 8px 16px;
            background: white;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
        }
        .btn-cancel-stammdaten:hover { background: #f3f4f6; }
        #tab-stammdaten.edit-mode .value.editable {
            background: #fffbeb;
            border: 1px dashed #fbbf24;
            border-radius: 4px;
            padding: 2px 6px;
            margin: -2px -6px;
            cursor: text;
            transition: all 0.2s;
        }
        #tab-stammdaten.edit-mode .value.editable:hover {
            background: #fef3c7;
            border-color: #f59e0b;
        }
        #tab-stammdaten.edit-mode .value.editable.editing {
            background: white;
            border: 2px solid #3b82f6;
            outline: none;
        }
    `;
    document.head.appendChild(styles);
}

// Export edit functions
window.editStammdaten = editStammdaten;
window.cancelStammdatenEdit = cancelStammdatenEdit;

// Update openCustomerDetail to use full CRM view
const originalOpenCustomerDetail = openCustomerDetail;
function openCustomerDetailCRM(customerId) {
    // Use the full CRM profile instead of the modal
    openCrmProfile(customerId);
}

// ========================================
// DEMO CUSTOMER FILE GENERATOR
// ========================================

function generateDemoCustomerFile() {
    // Random demo data
    const demoCustomers = [
        { name: 'Müller Maschinenbau GmbH', street: 'Industriestraße 45', zip: '70173', city: 'Stuttgart', iban: 'DE89 3704 0044 0532 0130 00', amount: 47850.00, dueDate: '2024-10-15', type: 'Gewerbe' },
        { name: 'Hans Schmidt', street: 'Hauptstraße 12', zip: '80331', city: 'München', iban: 'DE91 1000 0000 0123 4567 89', amount: 3420.50, dueDate: '2024-11-01', type: 'Privat' },
        { name: 'Weber & Söhne KG', street: 'Am Marktplatz 8', zip: '50667', city: 'Köln', iban: 'DE75 3705 0198 0012 3456 78', amount: 125000.00, dueDate: '2024-09-30', type: 'Gewerbe' },
        { name: 'Sabine Danzig', street: 'Gartenweg 23', zip: '60311', city: 'Frankfurt', iban: 'DE44 5001 0517 5407 3249 31', amount: 8750.00, dueDate: '2024-10-20', type: 'Privat' },
        { name: 'Autohaus Berger GmbH', street: 'Berliner Allee 100', zip: '40210', city: 'Düsseldorf', iban: 'DE68 2105 0170 0012 3456 78', amount: 89300.00, dueDate: '2024-08-15', type: 'Gewerbe' }
    ];

    const customer = demoCustomers[Math.floor(Math.random() * demoCustomers.length)];
    const today = new Date().toLocaleDateString('de-DE');
    const docNumber = 'INK-' + Date.now().toString().slice(-8);

    // Create canvas for the document
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1130;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header with bank logo placeholder
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(0, 0, 800, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('MUSTERBANK AG', 40, 55);
    ctx.font = '14px Arial';
    ctx.fillText('Forderungsmanagement', 40, 80);

    // Document title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Mahnung / Zahlungsaufforderung', 40, 160);

    // Document number and date
    ctx.font = '12px Arial';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Dokument-Nr.: ${docNumber}`, 550, 140);
    ctx.fillText(`Datum: ${today}`, 550, 160);

    // Customer data section
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40, 200, 720, 180);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(40, 200, 720, 180);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Kundendaten', 60, 230);

    ctx.font = '13px Arial';
    ctx.fillStyle = '#334155';

    const labels = ['Name / Firma:', 'Adresse:', '', 'Kundentyp:', 'IBAN:'];
    const values = [customer.name, customer.street, `${customer.zip} ${customer.city}`, customer.type, customer.iban];

    let y = 260;
    for (let i = 0; i < labels.length; i++) {
        if (labels[i]) {
            ctx.fillStyle = '#64748b';
            ctx.fillText(labels[i], 60, y);
            ctx.fillStyle = '#1e293b';
            ctx.fillText(values[i], 200, y);
        } else {
            ctx.fillStyle = '#1e293b';
            ctx.fillText(values[i], 200, y);
        }
        y += 25;
    }

    // Claim details section
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(40, 410, 720, 150);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 410, 720, 150);

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Forderungsdetails', 60, 445);

    ctx.font = '13px Arial';
    ctx.fillStyle = '#78350f';
    ctx.fillText('Offener Betrag:', 60, 480);
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`€ ${customer.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`, 200, 482);

    ctx.font = '13px Arial';
    ctx.fillText('Fälligkeitsdatum:', 60, 515);
    ctx.font = '14px Arial';
    const dueDateFormatted = new Date(customer.dueDate).toLocaleDateString('de-DE');
    ctx.fillText(dueDateFormatted, 200, 515);

    ctx.fillText('Verzugstage:', 400, 515);
    const daysOverdue = Math.floor((new Date() - new Date(customer.dueDate)) / (1000 * 60 * 60 * 24));
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${Math.max(0, daysOverdue)} Tage`, 500, 515);

    // Text content
    ctx.fillStyle = '#334155';
    ctx.font = '12px Arial';
    const textLines = [
        'Sehr geehrte Damen und Herren,',
        '',
        'trotz unserer vorherigen Zahlungserinnerungen ist der oben genannte Betrag',
        'noch nicht auf unserem Konto eingegangen.',
        '',
        'Wir fordern Sie hiermit auf, den ausstehenden Betrag innerhalb von 10 Tagen',
        'auf das folgende Konto zu überweisen:',
        '',
        'Empfänger: Musterbank AG',
        'IBAN: DE12 3456 7890 1234 5678 90',
        'Verwendungszweck: ' + docNumber,
        '',
        'Bei Nichtzahlung behalten wir uns weitere rechtliche Schritte vor.',
        '',
        'Mit freundlichen Grüßen',
        'Ihr Forderungsmanagement-Team'
    ];

    let textY = 600;
    textLines.forEach(line => {
        ctx.fillText(line, 60, textY);
        textY += 20;
    });

    // Footer
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 1050, 800, 80);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Arial';
    ctx.fillText('Musterbank AG | Bankstraße 1 | 10115 Berlin | Tel: +49 30 12345-0 | forderung@musterbank.de', 40, 1080);
    ctx.fillText('Geschäftsführer: Dr. Maria Musterfrau | Amtsgericht Berlin HRB 12345 | USt-IdNr.: DE123456789', 40, 1095);

    // Add QR code placeholder
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(650, 600, 80, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px Arial';
    ctx.fillText('QR-Code', 670, 645);

    // Download the image
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Demo_Kundenakte_${docNumber}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Demo-Kundenakte erstellt und heruntergeladen!', 'success');
    }, 'image/png');
}

// Scanner Functions
window.generateDemoCustomerFile = generateDemoCustomerFile;
window.openDocumentScanner = openDocumentScanner;
window.closeDocumentScanner = closeDocumentScanner;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.handleFileSelect = handleFileSelect;
window.removeUpload = removeUpload;
window.openCamera = openCamera;
window.startAIRecognition = startAIRecognition;
window.goToStep2 = goToStep2;
window.goToStep3 = goToStep3;
window.createCustomerFromScan = createCustomerFromScan;
window.showBulkImport = showBulkImport;

// CRM Functions
window.openCrmProfile = openCrmProfile;
window.closeCrmProfile = closeCrmProfile;
window.showCrmSection = showCrmSection;
window.showAiSummary = showAiSummary;
window.openTaskCustomer = openTaskCustomer;

// Open customer from task with task context
function openTaskCustomer(customerId, taskTitle, taskDue, isOverdue) {
    openCrmProfile(customerId, {
        title: taskTitle,
        due: taskDue,
        overdue: isOverdue
    });
}
window.crmCall = crmCall;
window.crmEmail = crmEmail;
window.crmSchedule = crmSchedule;
window.crmNote = crmNote;
window.editStammdaten = editStammdaten;

window.__registerModule('banken-scanner-crm.js');
