// ========================================
// SCREENSHOT ANNOTATION SYSTEM
// ========================================

let currentScreenshotData = null;
let screenshotCanvas = null;
let screenshotCtx = null;
let screenshotImage = null;
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#ef4444';
let drawHistory = [];
let startX, startY;

// Screenshot aufnehmen
async function captureScreenshot() {
    const btn = document.getElementById('screenshotBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="spin"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Wird aufgenommen...';
    btn.disabled = true;

    try {
        // Feedback-Panel kurz ausblenden für sauberen Screenshot
        const feedbackPanel = document.getElementById('feedbackPanel');
        const screenshotModal = document.getElementById('screenshotModal');
        feedbackPanel.style.visibility = 'hidden';

        // Screenshot vom sichtbaren Viewport erstellen (was der User gerade sieht)
        const canvas = await html2canvas(document.body, {
            scale: 2, // Höhere Auflösung für bessere Qualität
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            // Nur den sichtbaren Viewport erfassen
            x: window.scrollX,
            y: window.scrollY,
            width: window.innerWidth,
            height: window.innerHeight,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            ignoreElements: (element) => {
                // Feedback-Panel und Chat-Widget nicht mitaufnehmen
                return element.id === 'feedbackPanel' ||
                       element.id === 'bankenChatWidget' ||
                       element.classList?.contains('banken-chat-toggle');
            }
        });

        feedbackPanel.style.visibility = 'visible';

        // Screenshot im Modal öffnen
        screenshotImage = new Image();
        screenshotImage.onload = function() {
            openScreenshotModal();
        };
        screenshotImage.src = canvas.toDataURL('image/png'); // PNG für beste Qualität

    } catch (error) {
        console.error('Screenshot Fehler:', error);
        showFeedbackNotification('Screenshot konnte nicht erstellt werden');
    }

    btn.innerHTML = originalText;
    btn.disabled = false;
}

// Screenshot-Modal öffnen
function openScreenshotModal() {
    const modal = document.getElementById('screenshotModal');
    const canvas = document.getElementById('screenshotCanvas');

    modal.classList.add('open');

    // Canvas initialisieren
    screenshotCanvas = canvas;
    screenshotCtx = canvas.getContext('2d');

    // Canvas-Größe an Bild anpassen
    canvas.width = screenshotImage.width;
    canvas.height = screenshotImage.height;

    // Bild zeichnen
    screenshotCtx.drawImage(screenshotImage, 0, 0);

    // Zeichen-History zurücksetzen
    drawHistory = [];
    saveDrawState();

    // Event-Listener für Zeichnen
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch-Support
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

// Screenshot-Modal schließen
function closeScreenshotModal() {
    const modal = document.getElementById('screenshotModal');
    modal.classList.remove('open');

    // Event-Listener entfernen
    const canvas = document.getElementById('screenshotCanvas');
    canvas.removeEventListener('mousedown', startDrawing);
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseup', stopDrawing);
    canvas.removeEventListener('mouseout', stopDrawing);
    canvas.removeEventListener('touchstart', handleTouch);
    canvas.removeEventListener('touchmove', handleTouch);
    canvas.removeEventListener('touchend', stopDrawing);
}

// Touch-Events handling
function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = screenshotCanvas.getBoundingClientRect();
    const scaleX = screenshotCanvas.width / rect.width;
    const scaleY = screenshotCanvas.height / rect.height;

    const mouseEvent = {
        offsetX: (touch.clientX - rect.left) * scaleX,
        offsetY: (touch.clientY - rect.top) * scaleY,
        type: e.type === 'touchstart' ? 'mousedown' : 'mousemove'
    };

    if (e.type === 'touchstart') {
        startDrawing(mouseEvent);
    } else {
        draw(mouseEvent);
    }
}

// Zeichnen starten
function startDrawing(e) {
    isDrawing = true;
    const rect = screenshotCanvas.getBoundingClientRect();
    const scaleX = screenshotCanvas.width / rect.width;
    const scaleY = screenshotCanvas.height / rect.height;

    // Immer skalieren - offsetX/offsetY sind relativ zur Anzeigegröße
    const clientX = e.offsetX !== undefined ? e.offsetX : (e.clientX - rect.left);
    const clientY = e.offsetY !== undefined ? e.offsetY : (e.clientY - rect.top);
    startX = clientX * scaleX;
    startY = clientY * scaleY;

    if (currentTool === 'pen') {
        screenshotCtx.beginPath();
        screenshotCtx.moveTo(startX, startY);
    }
}

// Zeichnen
function draw(e) {
    if (!isDrawing) return;

    const rect = screenshotCanvas.getBoundingClientRect();
    const scaleX = screenshotCanvas.width / rect.width;
    const scaleY = screenshotCanvas.height / rect.height;

    // Immer skalieren - offsetX/offsetY sind relativ zur Anzeigegröße
    const clientX = e.offsetX !== undefined ? e.offsetX : (e.clientX - rect.left);
    const clientY = e.offsetY !== undefined ? e.offsetY : (e.clientY - rect.top);
    const x = clientX * scaleX;
    const y = clientY * scaleY;

    screenshotCtx.strokeStyle = currentColor;
    screenshotCtx.lineWidth = 4;
    screenshotCtx.lineCap = 'round';
    screenshotCtx.lineJoin = 'round';

    if (currentTool === 'pen') {
        screenshotCtx.lineTo(x, y);
        screenshotCtx.stroke();
    } else if (['rect', 'circle', 'arrow'].includes(currentTool)) {
        // Für Formen: Bei jedem Move das Canvas wiederherstellen und Form neu zeichnen
        restoreLastState();
        drawShape(startX, startY, x, y);
    }
}

// Zeichnen beenden
function stopDrawing(e) {
    if (isDrawing) {
        isDrawing = false;
        saveDrawState();
    }
}

// Form zeichnen
function drawShape(x1, y1, x2, y2) {
    screenshotCtx.strokeStyle = currentColor;
    screenshotCtx.lineWidth = 4;
    screenshotCtx.lineCap = 'round';
    screenshotCtx.lineJoin = 'round';

    if (currentTool === 'rect') {
        screenshotCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else if (currentTool === 'circle') {
        const radiusX = Math.abs(x2 - x1) / 2;
        const radiusY = Math.abs(y2 - y1) / 2;
        const centerX = x1 + (x2 - x1) / 2;
        const centerY = y1 + (y2 - y1) / 2;

        screenshotCtx.beginPath();
        screenshotCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        screenshotCtx.stroke();
    } else if (currentTool === 'arrow') {
        // Linie zeichnen
        screenshotCtx.beginPath();
        screenshotCtx.moveTo(x1, y1);
        screenshotCtx.lineTo(x2, y2);
        screenshotCtx.stroke();

        // Pfeilspitze
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 20;

        screenshotCtx.beginPath();
        screenshotCtx.moveTo(x2, y2);
        screenshotCtx.lineTo(
            x2 - headLength * Math.cos(angle - Math.PI / 6),
            y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        screenshotCtx.moveTo(x2, y2);
        screenshotCtx.lineTo(
            x2 - headLength * Math.cos(angle + Math.PI / 6),
            y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        screenshotCtx.stroke();
    }
}

// Zeichenzustand speichern
function saveDrawState() {
    drawHistory.push(screenshotCanvas.toDataURL());
}

// Letzten Zustand wiederherstellen (für Live-Preview von Formen)
function restoreLastState() {
    if (drawHistory.length > 0) {
        const img = new Image();
        img.src = drawHistory[drawHistory.length - 1];
        screenshotCtx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
        screenshotCtx.drawImage(img, 0, 0);
    }
}

// Rückgängig machen
function undoDrawing() {
    if (drawHistory.length > 1) {
        drawHistory.pop(); // Aktuellen Zustand entfernen
        const img = new Image();
        img.onload = function() {
            screenshotCtx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
            screenshotCtx.drawImage(img, 0, 0);
        };
        img.src = drawHistory[drawHistory.length - 1];
    }
}

// Alles löschen (zurück zum Original)
function clearDrawing() {
    screenshotCtx.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);
    screenshotCtx.drawImage(screenshotImage, 0, 0);
    drawHistory = [];
    saveDrawState();
}

// Werkzeug wählen
function setDrawTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.screenshot-tool').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tool === tool) {
            btn.classList.add('active');
        }
    });

    // Bei Text-Tool: Prompt anzeigen
    if (tool === 'text') {
        showFeedbackNotification('Klicke auf die Stelle, wo der Text erscheinen soll');
        screenshotCanvas.onclick = function(e) {
            if (currentTool === 'text') {
                const text = prompt('Text eingeben:');
                if (text) {
                    const rect = screenshotCanvas.getBoundingClientRect();
                    const scaleX = screenshotCanvas.width / rect.width;
                    const scaleY = screenshotCanvas.height / rect.height;
                    // Immer skalieren
                    const clientX = e.offsetX !== undefined ? e.offsetX : (e.clientX - rect.left);
                    const clientY = e.offsetY !== undefined ? e.offsetY : (e.clientY - rect.top);
                    const x = clientX * scaleX;
                    const y = clientY * scaleY;

                    screenshotCtx.font = 'bold 24px Arial';
                    screenshotCtx.fillStyle = currentColor;
                    screenshotCtx.fillText(text, x, y);
                    saveDrawState();
                }
            }
        };
    } else {
        screenshotCanvas.onclick = null;
    }
}

// Farbe wählen
function setDrawColor(color) {
    currentColor = color;
    document.querySelectorAll('.screenshot-color').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.color === color) {
            btn.classList.add('active');
        }
    });
}

// Screenshot speichern und zum Feedback hinzufügen
function saveAnnotatedScreenshot() {
    currentScreenshotData = screenshotCanvas.toDataURL('image/jpeg', 0.92); // Höhere Qualität

    // Vorschau anzeigen
    const preview = document.getElementById('screenshotPreview');
    const thumbnail = document.getElementById('screenshotThumbnail');

    thumbnail.src = currentScreenshotData;
    preview.style.display = 'flex';

    // Modal schließen
    closeScreenshotModal();

    showFeedbackNotification('Screenshot hinzugefügt!');
}

// Screenshot bearbeiten
function editScreenshot() {
    if (currentScreenshotData) {
        screenshotImage = new Image();
        screenshotImage.onload = function() {
            openScreenshotModal();
        };
        screenshotImage.src = currentScreenshotData;
    }
}

// Screenshot entfernen
function removeScreenshot() {
    currentScreenshotData = null;
    const preview = document.getElementById('screenshotPreview');
    preview.style.display = 'none';
}

// submitFeedback erweitern für Screenshot
const originalSubmitFeedback = typeof submitFeedback === 'function' ? submitFeedback : null;

// Feedback System beim Laden initialisieren
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initFeedbackSystem, 500);
});

// Component registry for the modular Banken system
const BANKEN_COMPONENTS = [
    'header',
    'section-segmentierung',
    'section-npl',
    'section-stage2',
    'section-aufgaben',
    'modal-customer-detail',
    'modal-document-scanner',
    'crm-profile-view'
];

// Load a single component
async function loadComponent(componentName) {
    try {
        const response = await fetch(`partials/banken/${componentName}.html`);
        if (response.ok) {
            return await response.text();
        }
        console.warn(`Component ${componentName} could not be loaded`);
        return `<!-- Component ${componentName} failed to load -->`;
    } catch (error) {
        console.warn(`Error loading component ${componentName}:`, error);
        return `<!-- Component ${componentName} error -->`;
    }
}

// Load all components and inject into placeholders
async function loadBankenComponents(container) {
    const componentPlaceholders = container.querySelectorAll('[data-component]');

    // Load all components in parallel for better performance
    const loadPromises = Array.from(componentPlaceholders).map(async (placeholder) => {
        const componentName = placeholder.getAttribute('data-component');
        const html = await loadComponent(componentName);
        placeholder.outerHTML = html;
    });

    await Promise.all(loadPromises);
    console.log(`Loaded ${componentPlaceholders.length} components`);
}

// Show loading progress bar with modern animation
function showLoadingProgress(container) {
    container.innerHTML = `
        <div class="banken-loading-screen">
            <div class="banken-loading-logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
            </div>
            <h2 class="banken-loading-title">Collections Management</h2>
            <p class="banken-loading-subtitle">Forderungsmanagement wird vorbereitet</p>
            <div class="banken-loading-progress-wrapper">
                <div class="banken-loading-progress-track">
                    <div class="banken-loading-progress-bar" id="bankenProgressBar"></div>
                </div>
                <div class="banken-loading-progress-details">
                    <span class="banken-loading-status" id="bankenLoadingStatus">Initialisiere...</span>
                    <span class="banken-loading-percent" id="bankenLoadingPercent">0%</span>
                </div>
            </div>
        </div>
    `;
}

// Update loading progress for Banken module
function updateLoadingProgress(percent, text) {
    const bar = document.getElementById('bankenProgressBar');
    const statusEl = document.getElementById('bankenLoadingStatus');
    const percentEl = document.getElementById('bankenLoadingPercent');

    if (bar) bar.style.width = `${percent}%`;
    if (statusEl) statusEl.textContent = text;
    if (percentEl) percentEl.textContent = `${Math.round(percent)}%`;
}

// Load Banken module from partial (modular version) - loads in background
async function loadBankenModule() {
    if (bankenModuleLoaded) return;

    const container = document.getElementById('bankenModule');
    if (!container) return;

    // Show loading screen first
    showLoadingProgress(container);

    try {
        // Update progress: Starting
        updateLoadingProgress(10, 'Lade Modul-Template...');

        // Load main shell template
        const response = await fetch('partials/banken-module.html');
        if (response.ok) {
            const html = await response.text();

            updateLoadingProgress(30, 'Template geladen...');

            // Create temporary container to load components
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;

            updateLoadingProgress(50, 'Lade Komponenten...');

            // Load all components in background
            await loadBankenComponents(tempContainer);

            updateLoadingProgress(80, 'Initialisiere Dashboard...');

            // Small delay to show progress animation
            await new Promise(resolve => setTimeout(resolve, 300));

            updateLoadingProgress(100, 'Fertig!');

            // Another small delay before showing content
            await new Promise(resolve => setTimeout(resolve, 200));

            // Set the content once everything is loaded
            container.innerHTML = tempContainer.innerHTML;

            bankenModuleLoaded = true;
            console.log('Banken-Modul geladen');

            // Initialize charts after all content is loaded
            setTimeout(() => {
                initBankenCharts();
                // Initialize Banken Chat
                if (typeof initBankenChat === 'function') {
                    initBankenChat();
                }
                // Initialize Feedback System
                initFeedbackSystem();
                // Sort customer table by priority (most urgent first)
                initCustomerTableSort();
            }, 100);
        } else {
            throw new Error('Failed to load module');
        }
    } catch (error) {
        console.error('Banken-Modul Fehler:', error);
        container.innerHTML = `
            <div class="banken-error-screen">
                <p>Fehler beim Laden. Bitte starte die Anwendung über einen Webserver.</p>
            </div>
        `;
    }
}

// Load all components in parallel (no progress display)
async function loadBankenComponents(container) {
    const componentPlaceholders = container.querySelectorAll('[data-component]');

    // Load all components in parallel for faster loading
    const loadPromises = Array.from(componentPlaceholders).map(async (placeholder) => {
        const componentName = placeholder.getAttribute('data-component');
        const html = await loadComponent(componentName);
        placeholder.outerHTML = html;
    });

    await Promise.all(loadPromises);
    console.log(`Loaded ${componentPlaceholders.length} components`);
}

function switchModule(moduleName) {
    // Update module tabs
    document.querySelectorAll('.module-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.module === moduleName) {
            tab.classList.add('active');
        }
    });

    // Update module content
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.remove('active');
    });

    const targetModule = document.getElementById(moduleName + 'Module');
    if (targetModule) {
        targetModule.classList.add('active');
    }

    // Store current module
    safeLocalSet('currentModule', moduleName);

    // Load Banken module dynamically when first accessed
    if (moduleName === 'banken') {
        loadBankenModule();
    }

    // Load Asset Management module dynamically when first accessed
    if (moduleName === 'asset') {
        if (typeof openAssetManagement === 'function') {
            openAssetManagement();
        }
    }

    // Load Vermögensverwaltung module when first accessed
    if (moduleName === 'vermoegensverwaltung') {
        if (typeof showVVOverview === 'function') {
            showVVOverview();
        }
    }

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('moduleChanged', {
        detail: { module: moduleName }
    }));

    // Update URL route
    if (window.AppRouter && moduleName === 'banken') {
        AppRouter.navigate('/banken');
    } else if (window.AppRouter && moduleName === 'asset') {
        AppRouter.navigate('/asset-management');
    } else if (window.AppRouter && moduleName === 'vermoegensverwaltung') {
        AppRouter.navigate('/vv-overview');
    } else if (window.AppRouter && moduleName === 'versicherung') {
        AppRouter.navigate('/landing');
    }

    console.log('Switched to module:', moduleName);
}

// Initialize module on page load
function initModuleSelector() {
    const savedModule = safeLocalGet('currentModule', 'versicherung');
    switchModule(savedModule);
}

// Exports
window.switchModule = switchModule;
window.initModuleSelector = initModuleSelector;
window.__registerModule('banken-module.js');
