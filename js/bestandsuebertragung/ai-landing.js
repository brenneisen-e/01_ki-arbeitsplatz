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

        for (const vorgang of result.analysis.vorgaenge) {
            const mvStatus = vorgang.maklervollmacht?.vorhanden
                ? (vorgang.maklervollmacht.unterschrieben ? '✓ unterschrieben' : '○ nicht unterschrieben')
                : '✕ fehlt';

            html += `
                <div class="vorgang-card">
                    <div class="vorgang-header">
                        <span class="vorgang-kunde">${escapeHtml(vorgang.kunde || 'Unbekannt')}</span>
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
                        <div class="detail-row">
                            <span class="detail-label">Maklervollmacht:</span>
                            <span class="detail-value mv-status">${mvStatus}</span>
                        </div>
                    </div>
                    ${vorgang.fehlende_infos?.length ? `
                        <div class="vorgang-missing">
                            <strong>Fehlend:</strong> ${vorgang.fehlende_infos.join(', ')}
                        </div>
                    ` : ''}
                    ${vorgang.notizen ? `
                        <div class="vorgang-notes">${escapeHtml(vorgang.notizen)}</div>
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
                status: mapStatus(vorgang.status),
                notes: [
                    vorgang.notizen,
                    vorgang.maklervollmacht?.anmerkung,
                    vorgang.fehlende_infos?.length ? `Fehlend: ${vorgang.fehlende_infos.join(', ')}` : null
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
    removeFile
};

// Global export
if (typeof window !== 'undefined') {
    window.AILanding = { init, removeFile };
}
