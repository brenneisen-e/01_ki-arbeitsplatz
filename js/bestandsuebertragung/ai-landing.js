/**
 * AI Landing Page - Moderne Upload-Oberfläche mit Claude AI Integration
 * ESM Module
 */

import * as AIProcessor from './ai-processor.js';
import * as Storage from './storage.js';

// State
let uploadedFiles = [];
let analysisResults = [];
let isProcessing = false;

/**
 * AI Landing Page initialisieren
 */
export function init() {
    // API Key laden
    AIProcessor.loadApiKey();

    // Event Listener
    setupEventListeners();

    // UI Status aktualisieren
    updateApiKeyStatus();
}

/**
 * Event Listener einrichten
 */
function setupEventListeners() {
    // API Key Modal
    document.getElementById('aiApiKeyBtn')?.addEventListener('click', openApiKeyModal);
    document.getElementById('aiApiKeyModalClose')?.addEventListener('click', closeApiKeyModal);
    document.getElementById('aiApiKeySave')?.addEventListener('click', saveApiKey);
    document.getElementById('aiApiKeyModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'aiApiKeyModal') closeApiKeyModal();
    });

    // File Upload
    const dropZone = document.getElementById('aiDropZone');
    const fileInput = document.getElementById('aiFileInput');

    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput?.click());
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
    }

    fileInput?.addEventListener('change', handleFileSelect);

    // Action Buttons
    document.getElementById('aiAnalyzeBtn')?.addEventListener('click', startAnalysis);
    document.getElementById('aiExportBtn')?.addEventListener('click', exportResults);
    document.getElementById('aiClearBtn')?.addEventListener('click', clearAll);
    document.getElementById('aiSaveToStorageBtn')?.addEventListener('click', saveToStorage);
}

/**
 * API Key Status anzeigen
 */
function updateApiKeyStatus() {
    const statusEl = document.getElementById('aiApiKeyStatus');
    const analyzeBtn = document.getElementById('aiAnalyzeBtn');

    if (AIProcessor.hasApiKey()) {
        if (statusEl) {
            statusEl.innerHTML = '<span class="status-dot status-active"></span> API verbunden';
            statusEl.className = 'api-status connected';
        }
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
        }
    } else {
        if (statusEl) {
            statusEl.innerHTML = '<span class="status-dot status-inactive"></span> Kein API Key';
            statusEl.className = 'api-status disconnected';
        }
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
        }
    }
}

/**
 * API Key Modal öffnen
 */
function openApiKeyModal() {
    const modal = document.getElementById('aiApiKeyModal');
    const input = document.getElementById('aiApiKeyInput');

    if (modal) {
        modal.style.display = 'flex';
        if (input && AIProcessor.hasApiKey()) {
            input.value = '••••••••••••••••'; // Masked
        }
    }
}

/**
 * API Key Modal schließen
 */
function closeApiKeyModal() {
    const modal = document.getElementById('aiApiKeyModal');
    if (modal) modal.style.display = 'none';
}

/**
 * API Key speichern
 */
function saveApiKey() {
    const input = document.getElementById('aiApiKeyInput');
    const key = input?.value?.trim();

    if (key && !key.includes('•')) {
        AIProcessor.setApiKey(key);
        showToast('API Key gespeichert', 'success');
    }

    closeApiKeyModal();
    updateApiKeyStatus();
}

/**
 * Drag Over Handler
 */
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

/**
 * Drag Leave Handler
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
}

/**
 * Drop Handler
 */
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
}

/**
 * File Select Handler
 */
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
    e.target.value = ''; // Reset für erneute Auswahl
}

/**
 * Dateien hinzufügen
 */
function addFiles(files) {
    const validExtensions = ['.msg', '.eml', '.xlsx', '.xls', '.docx', '.doc', '.pdf'];

    for (const file of files) {
        const ext = '.' + file.name.split('.').pop().toLowerCase();

        if (validExtensions.includes(ext)) {
            // Duplikate vermeiden
            if (!uploadedFiles.find(f => f.name === file.name && f.size === file.size)) {
                uploadedFiles.push(file);
            }
        } else {
            showToast(`${file.name}: Nicht unterstütztes Format`, 'warning');
        }
    }

    renderFileList();
    updateActionButtons();
}

/**
 * Dateiliste rendern
 */
function renderFileList() {
    const container = document.getElementById('aiFileList');
    if (!container) return;

    if (uploadedFiles.length === 0) {
        container.innerHTML = '<p class="empty-message">Keine Dateien hochgeladen</p>';
        return;
    }

    container.innerHTML = uploadedFiles.map((file, index) => {
        const ext = file.name.split('.').pop().toLowerCase();
        const icon = getFileIcon(ext);
        const size = formatFileSize(file.size);

        return `
            <div class="file-item" data-index="${index}">
                <span class="file-icon">${icon}</span>
                <div class="file-info">
                    <span class="file-name">${escapeHtml(file.name)}</span>
                    <span class="file-size">${size}</span>
                </div>
                <button class="file-remove" onclick="window.AILanding.removeFile(${index})">×</button>
            </div>
        `;
    }).join('');
}

/**
 * Datei-Icon ermitteln
 */
function getFileIcon(ext) {
    const icons = {
        'msg': '✉',
        'eml': '✉',
        'xlsx': '▦',
        'xls': '▦',
        'docx': '▤',
        'doc': '▤',
        'pdf': '▥'
    };
    return icons[ext] || '▢';
}

/**
 * Dateigröße formatieren
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Datei entfernen
 */
export function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
    updateActionButtons();
}

/**
 * Action Buttons aktualisieren
 */
function updateActionButtons() {
    const analyzeBtn = document.getElementById('aiAnalyzeBtn');
    const exportBtn = document.getElementById('aiExportBtn');
    const saveBtn = document.getElementById('aiSaveToStorageBtn');
    const clearBtn = document.getElementById('aiClearBtn');

    const hasFiles = uploadedFiles.length > 0;
    const hasResults = analysisResults.length > 0 && analysisResults.some(r => r.success);
    const hasApiKey = AIProcessor.hasApiKey();

    if (analyzeBtn) analyzeBtn.disabled = !hasFiles || !hasApiKey || isProcessing;
    if (exportBtn) exportBtn.disabled = !hasResults;
    if (saveBtn) saveBtn.disabled = !hasResults;
    if (clearBtn) clearBtn.disabled = !hasFiles && !hasResults;
}

/**
 * Analyse starten
 */
async function startAnalysis() {
    if (uploadedFiles.length === 0 || !AIProcessor.hasApiKey()) return;

    isProcessing = true;
    updateActionButtons();
    showProgress(true);

    try {
        analysisResults = await AIProcessor.processBatch(uploadedFiles, updateProgress);
        renderResults();
        showToast('Analyse abgeschlossen', 'success');
    } catch (error) {
        showToast('Fehler bei der Analyse: ' + error.message, 'error');
    } finally {
        isProcessing = false;
        showProgress(false);
        updateActionButtons();
    }
}

/**
 * Progress anzeigen
 */
function showProgress(show) {
    const progressEl = document.getElementById('aiProgress');
    if (progressEl) {
        progressEl.style.display = show ? 'block' : 'none';
    }
}

/**
 * Progress aktualisieren
 */
function updateProgress(info) {
    const progressText = document.getElementById('aiProgressText');
    const progressBar = document.getElementById('aiProgressBar');

    if (progressText) {
        progressText.textContent = `${info.current}/${info.total}: ${info.filename}`;
    }

    if (progressBar) {
        const percent = (info.current / info.total) * 100;
        progressBar.style.width = percent + '%';
    }
}

/**
 * Ergebnisse rendern
 */
function renderResults() {
    const container = document.getElementById('aiResults');
    if (!container) return;

    if (analysisResults.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '<div class="results-header"><h3>Analyseergebnisse</h3></div>';

    for (const result of analysisResults) {
        if (!result.success) {
            html += `
                <div class="result-card error">
                    <div class="result-header">
                        <span class="result-icon">✕</span>
                        <span class="result-filename">${escapeHtml(result.filename)}</span>
                    </div>
                    <div class="result-error">${escapeHtml(result.error)}</div>
                </div>
            `;
            continue;
        }

        if (result.type === 'attachment') {
            html += `
                <div class="result-card attachment">
                    <div class="result-header">
                        <span class="result-icon">▢</span>
                        <span class="result-filename">${escapeHtml(result.filename)}</span>
                        <span class="result-badge">Anhang</span>
                    </div>
                </div>
            `;
            continue;
        }

        if (!result.analysis?.vorgaenge) continue;

        html += `
            <div class="result-card success">
                <div class="result-header">
                    <span class="result-icon">✓</span>
                    <span class="result-filename">${escapeHtml(result.filename)}</span>
                    <span class="result-badge">${result.analysis.vorgaenge.length} Vorgänge</span>
                </div>
        `;

        if (result.analysis.zusammenfassung) {
            html += `<div class="result-summary">${escapeHtml(result.analysis.zusammenfassung)}</div>`;
        }

        html += '<div class="vorgaenge-list">';

        for (let vi = 0; vi < result.analysis.vorgaenge.length; vi++) {
            const vorgang = result.analysis.vorgaenge[vi];
            const mv = vorgang.maklervollmacht || {};

            // Build MV status display
            let mvIcon, mvText, mvClass;
            if (mv.als_anhang && mv.unterschrieben === true) {
                mvIcon = '✓'; mvText = 'Vollmacht als Anhang, unterschrieben'; mvClass = 'mv-ok';
            } else if (mv.als_anhang && mv.unterschrieben === false) {
                mvIcon = '△'; mvText = 'Vollmacht als Anhang, NICHT unterschrieben'; mvClass = 'mv-warn';
            } else if (mv.nur_erwaehnt) {
                mvIcon = '○'; mvText = 'Nur erwähnt (nicht beigefügt)'; mvClass = 'mv-warn';
            } else if (mv.als_anhang && mv.unterschrieben === null) {
                mvIcon = '?'; mvText = 'Vollmacht als Anhang, Signatur unklar'; mvClass = 'mv-warn';
            } else if (mv.vorhanden === true) {
                // Backwards-compatible with old format
                mvIcon = mv.unterschrieben ? '✓' : '○';
                mvText = mv.unterschrieben ? 'vorhanden, unterschrieben' : 'vorhanden, nicht unterschrieben';
                mvClass = mv.unterschrieben ? 'mv-ok' : 'mv-warn';
            } else {
                mvIcon = '✕'; mvText = 'Keine Vollmacht'; mvClass = 'mv-missing';
            }

            const mvAnmerkung = mv.anmerkung ? escapeHtml(mv.anmerkung) : '';

            const needsManualCheck = mv.manuell_pruefen === true;
            const resultIdx = analysisResults.indexOf(result);
            const holdBtnId = `hold-${resultIdx}-${vi}`;

            // Build attachment list for this result
            const attachmentNames = result.email?.attachmentNames || [];
            const attachmentTexts = result.email?.attachmentTexts || [];
            const previewId = `preview-${resultIdx}-${vi}`;

            html += `
                <div class="vorgang-card${needsManualCheck ? ' needs-check' : ''}">
                    <div class="vorgang-header">
                        <span class="vorgang-kunde"><span class="kunde-label">Versicherungsnehmer:</span> ${escapeHtml(vorgang.kunde || 'Unbekannt')}</span>
                        <span class="vorgang-status status-${vorgang.status || 'angefragt'}">${escapeHtml(vorgang.status || 'angefragt')}</span>
                    </div>
                    <div class="vorgang-details">
                        <div class="detail-row">
                            <span class="detail-label">VS-Nr:</span>
                            <span class="detail-value">${escapeHtml(vorgang.versicherungsnummer || '-')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Sparte:</span>
                            <span class="detail-value">${escapeHtml(vorgang.sparte || '-')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Makler:</span>
                            <span class="detail-value">${escapeHtml(vorgang.makler || '-')}</span>
                        </div>
                        <div class="detail-row detail-row-full">
                            <span class="detail-label">Maklervollmacht:</span>
                            <span class="detail-value ${mvClass}"><span class="mv-icon">${mvIcon}</span> ${mvText}</span>
                        </div>
                        ${mvAnmerkung ? `
                        <div class="detail-row detail-row-full mv-anmerkung-row">
                            <span class="detail-value mv-anmerkung">${mvAnmerkung}</span>
                        </div>
                        ` : ''}
                    </div>
                    ${attachmentNames.length > 0 ? `
                        <div class="vorgang-attachments">
                            <strong>Anhänge:</strong>
                            <div class="attachment-chips">
                                ${attachmentNames.map((name, ai) => {
                                    const hasPreview = attachmentTexts.some(t => t.filename === name);
                                    return `<span class="attachment-chip${hasPreview ? ' has-preview' : ''}"${hasPreview ? ` onclick="window.AILanding.showAttachmentPreview(${resultIdx}, '${escapeHtml(name).replace(/'/g, "\\'")}')"` : ''}>
                                        <span class="attachment-chip-icon">${getAttachmentIcon(name)}</span>
                                        ${escapeHtml(name)}
                                        ${hasPreview ? '<span class="attachment-preview-btn" title="Vorschau"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></span>' : ''}
                                    </span>`;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${vorgang.fehlende_infos?.length ? `
                        <div class="vorgang-missing">
                            <strong>Fehlend:</strong> ${vorgang.fehlende_infos.join(', ')}
                        </div>
                    ` : ''}
                    ${vorgang.notizen ? `
                        <div class="vorgang-notes">${escapeHtml(vorgang.notizen)}</div>
                    ` : ''}
                    ${needsManualCheck ? `
                        <div class="vorgang-actions">
                            <button class="btn-hold" id="${holdBtnId}" onclick="window.AILanding.toggleHold('${holdBtnId}', ${resultIdx}, ${vi})">
                                <span class="hold-icon">⏸</span> Auf Hold – manuell prüfen
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        html += '</div></div>';
    }

    container.innerHTML = html;
}

/**
 * Ergebnisse exportieren
 */
function exportResults() {
    if (analysisResults.length === 0) return;

    const count = AIProcessor.exportToExcel(analysisResults);
    showToast(`${count} Vorgänge exportiert`, 'success');
}

/**
 * Ergebnisse in Storage speichern
 */
function saveToStorage() {
    if (analysisResults.length === 0) return;

    let savedCount = 0;

    for (const result of analysisResults) {
        if (!result.success || !result.analysis?.vorgaenge) continue;

        for (const vorgang of result.analysis.vorgaenge) {
            const caseData = {
                kunde: {
                    name: vorgang.kunde || '',
                    confidence: 0.9,
                    source: 'ai'
                },
                versicherungsnummer: {
                    value: vorgang.versicherungsnummer || '',
                    confidence: 0.9,
                    source: 'ai'
                },
                sparte: vorgang.sparte || '',
                makler: {
                    name: vorgang.makler || '',
                    email: vorgang.maklerEmail || ''
                },
                gueltigkeitsdatum: vorgang.gueltigkeitsdatum ? {
                    value: vorgang.gueltigkeitsdatum,
                    confidence: 0.8,
                    source: 'ai'
                } : null,
                status: vorgang._onHold ? 'wiedervorlage' : mapStatus(vorgang.status),
                notes: [
                    vorgang.notizen,
                    vorgang.maklervollmacht?.anmerkung,
                    vorgang.fehlende_infos?.length ? `Fehlend: ${vorgang.fehlende_infos.join(', ')}` : null,
                    vorgang._onHold ? 'Auf Hold gesetzt – manuelle Prüfung erforderlich' : null
                ].filter(Boolean).join('\n'),
                workflow: {
                    mailReceived: new Date().toISOString(),
                    mailUploaded: new Date().toISOString(),
                    kiRecognized: new Date().toISOString()
                },
                statusHistory: [{
                    date: new Date().toISOString(),
                    from: null,
                    to: mapStatus(vorgang.status),
                    note: 'Aus KI-Analyse erstellt'
                }],
                aiAnalysis: {
                    maklervollmacht: vorgang.maklervollmacht,
                    onHold: vorgang._onHold || false,
                    sourceFile: result.filename,
                    analyzedAt: new Date().toISOString()
                }
            };

            Storage.saveCase(caseData);
            savedCount++;
        }
    }

    showToast(`${savedCount} Vorgänge gespeichert`, 'success');
    updateActionButtons();
}

/**
 * Status mappen
 */
function mapStatus(status) {
    const mapping = {
        'angefragt': 'zu-validieren',
        'bestaetigt': 'export-bereit',
        'abgelehnt': 'abgelehnt',
        'in-bearbeitung': 'wiedervorlage'
    };
    return mapping[status] || 'zu-validieren';
}

/**
 * Vorgang auf Hold setzen / Hold aufheben
 */
export function toggleHold(btnId, resultIdx, vorgangIdx) {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    const result = analysisResults[resultIdx];
    if (!result?.analysis?.vorgaenge?.[vorgangIdx]) return;

    const vorgang = result.analysis.vorgaenge[vorgangIdx];
    const isOnHold = vorgang._onHold === true;

    vorgang._onHold = !isOnHold;

    if (vorgang._onHold) {
        btn.innerHTML = '<span class="hold-icon">▶</span> Hold aufheben';
        btn.classList.add('on-hold');
        btn.closest('.vorgang-card')?.classList.add('on-hold');
    } else {
        btn.innerHTML = '<span class="hold-icon">⏸</span> Auf Hold – manuell prüfen';
        btn.classList.remove('on-hold');
        btn.closest('.vorgang-card')?.classList.remove('on-hold');
    }
}

/**
 * Alles löschen
 */
function clearAll() {
    uploadedFiles = [];
    analysisResults = [];
    renderFileList();
    renderResults();
    updateActionButtons();
}

/**
 * Toast anzeigen
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '✔',
        error: '✕',
        warning: '△',
        info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Anhang-Icon basierend auf Dateiendung (monochrome SVG)
 */
function getAttachmentIcon(filename) {
    const ext = (filename || '').split('.').pop().toLowerCase();
    const s = (d) => `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const icons = {
        pdf:  s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'),
        doc:  s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
        docx: s('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
        xls:  s('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/>'),
        xlsx: s('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/>'),
        jpg:  s('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
        jpeg: s('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
        png:  s('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
        eml:  s('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/>'),
        msg:  s('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/>')
    };
    return icons[ext] || s('<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>');
}

/**
 * Anhang-Vorschau anzeigen
 */
export function showAttachmentPreview(resultIdx, filename) {
    const result = analysisResults[resultIdx];
    if (!result?.email?.attachmentTexts) return;

    const att = result.email.attachmentTexts.find(t => t.filename === filename);
    if (!att) {
        showToast('Keine Vorschau verfügbar', 'warning');
        return;
    }

    // Modal erstellen
    let modal = document.getElementById('attachmentPreviewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'attachmentPreviewModal';
        modal.className = 'attachment-modal-overlay';
        document.body.appendChild(modal);
    }

    const typeLabel = att.type === 'word' ? 'Word-Dokument' :
                      att.type === 'excel' ? 'Excel-Tabelle' : 'Anhang';

    // Content rendern je nach Typ
    let bodyHtml;
    if (att.type === 'word') {
        // Word: Absätze als formatierter Text
        const lines = att.content.split('\n');
        bodyHtml = '<div class="attachment-word-preview">' +
            lines.map(line => {
                if (!line.trim()) return '<div class="word-spacer"></div>';
                if (line === line.toUpperCase() && line.length > 3) return `<div class="word-heading">${escapeHtml(line)}</div>`;
                if (line.startsWith('___')) return `<div class="word-line">${escapeHtml(line)}</div>`;
                return `<div class="word-paragraph">${escapeHtml(line)}</div>`;
            }).join('') + '</div>';
    } else if (att.type === 'excel') {
        // Excel: Tabellarisch darstellen
        const values = att.content.split('\n').filter(v => v.trim());
        bodyHtml = '<div class="attachment-excel-preview"><table class="excel-preview-table"><tbody>';
        // Versuche Spaltenstruktur zu erkennen (Header + Daten)
        for (let i = 0; i < values.length; i++) {
            const tag = i === 0 ? 'th' : 'td';
            bodyHtml += `<tr><${tag}>${escapeHtml(values[i])}</${tag}></tr>`;
        }
        bodyHtml += '</tbody></table></div>';
    } else {
        bodyHtml = `<pre class="attachment-modal-content">${escapeHtml(att.content)}</pre>`;
    }

    // Download-Button nur wenn rawBase64 vorhanden
    const downloadBtn = att.rawBase64 ? `<button class="attachment-download-btn" onclick="window.AILanding.downloadAttachment(${resultIdx}, '${escapeHtml(filename).replace(/'/g, "\\'")}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Herunterladen
    </button>` : '';

    modal.innerHTML = `
        <div class="attachment-modal">
            <div class="attachment-modal-header">
                <span class="attachment-modal-icon">${getAttachmentIcon(filename)}</span>
                <span class="attachment-modal-title">${escapeHtml(filename)}</span>
                <span class="attachment-modal-type">${typeLabel}</span>
                ${downloadBtn}
                <button class="attachment-modal-close" onclick="window.AILanding.closeAttachmentPreview()">&times;</button>
            </div>
            <div class="attachment-modal-body">
                ${bodyHtml}
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAttachmentPreview();
    });
}

/**
 * Anhang herunterladen
 */
export function downloadAttachment(resultIdx, filename) {
    const result = analysisResults[resultIdx];
    if (!result?.email?.attachmentTexts) return;

    const att = result.email.attachmentTexts.find(t => t.filename === filename);
    if (!att?.rawBase64) {
        showToast('Download nicht verfügbar', 'warning');
        return;
    }

    try {
        const binary = atob(att.rawBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const mimeType = att.mimeType || 'application/octet-stream';
        const blob = new Blob([bytes], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        showToast('Download fehlgeschlagen', 'error');
    }
}

/**
 * Anhang-Vorschau schließen
 */
export function closeAttachmentPreview() {
    const modal = document.getElementById('attachmentPreviewModal');
    if (modal) modal.style.display = 'none';
}

/**
 * HTML escapen
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Default export
export default {
    init,
    removeFile,
    toggleHold,
    showAttachmentPreview,
    closeAttachmentPreview,
    downloadAttachment
};

// Global export
if (typeof window !== 'undefined') {
    window.AILanding = { init, removeFile, toggleHold, showAttachmentPreview, closeAttachmentPreview, downloadAttachment };
}
