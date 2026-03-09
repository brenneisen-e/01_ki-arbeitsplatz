// ========================================
// UPLOAD MODUS
// ========================================

var uploadModeActive = true; // Standardmäßig aktiviert

function toggleUploadMode() {
    const toggle = document.getElementById('uploadModeToggle');
    const hint = document.getElementById('uploadModeHint');
    const body = document.body;

    uploadModeActive = toggle ? toggle.checked : true;

    if (uploadModeActive) {
        body.classList.add('upload-mode-active');
        if (hint) hint.style.display = 'block';
        console.log('Upload-Modus aktiviert');
    } else {
        body.classList.remove('upload-mode-active');
        if (hint) hint.style.display = 'none';
        console.log('Upload-Modus deaktiviert');
    }
}

// Upload-Modus beim Start aktivieren
function initUploadMode() {
    const toggle = document.getElementById('uploadModeToggle');
    if (toggle) {
        toggle.checked = true;
    }
    document.body.classList.add('upload-mode-active');
    const hint = document.getElementById('uploadModeHint');
    if (hint) hint.style.display = 'block';
    uploadModeActive = true;
    console.log('Upload-Modus standardmäßig aktiviert');
}

// Logo Upload
function triggerLogoUpload() {
    if (!uploadModeActive) {
        console.log('Upload-Modus nicht aktiv');
        return;
    }
    document.getElementById('logoUploadInput').click();
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const logoImg = document.getElementById('uploadedLogo');
        const placeholder = document.getElementById('logoPlaceholder');

        logoImg.src = e.target.result;
        logoImg.style.display = 'block';
        placeholder.style.display = 'none';

        // Speichern im localStorage
        safeLocalSet('customLogo', e.target.result);
        console.log('Logo hochgeladen und gespeichert');
    };
    reader.readAsDataURL(file);
}

// Profilbild Upload (für Agentur und Kunden)
function triggerProfileUpload(vermittlerId) {
    // Kein uploadModeActive Check - Foto kann immer geändert werden
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        handleProfileUpload(e, vermittlerId);
    };
    input.click();
}

function handleProfileUpload(event, vermittlerId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        // Speichern im localStorage
        safeLocalSet('profileImage_' + vermittlerId, e.target.result);

        // Je nach Kontext das richtige Element aktualisieren
        if (vermittlerId === 'kunde') {
            // Kunden-Foto auf der Kundendetail-Seite
            const kundenFoto = document.querySelector('.kunden-foto');
            if (kundenFoto) {
                kundenFoto.innerHTML = `<img src="${e.target.result}" alt="Kundenfoto" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            }
            console.log('Kundenfoto gespeichert');
        } else {
            // Bild in Agenturansicht aktualisieren
            const photoContainer = document.getElementById('agenturPhoto');
            if (photoContainer) {
                photoContainer.innerHTML = `<img src="${e.target.result}" alt="Profilbild">`;
            }
            console.log('Profilbild gespeichert für:', vermittlerId);
        }
    };
    reader.readAsDataURL(file);
}

// Agentur Photo Upload (direkt auf der Agenturübersicht-Seite)
function triggerAgenturPhotoUpload() {
    // Kein uploadModeActive Check - Foto kann immer geändert werden
    document.getElementById('agenturPhotoInput').click();
}

function handleAgenturPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        // Korrekter Element-Name: agenturPhotoImgSmall
        const photoImg = document.getElementById('agenturPhotoImgSmall');
        const placeholder = document.querySelector('.agentur-photo-placeholder-small');

        if (photoImg) {
            photoImg.src = e.target.result;
            photoImg.style.display = 'block';
        }
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        // Speichern im localStorage
        safeLocalSet('agenturPhoto', e.target.result);
        console.log('Agentur-Foto hochgeladen und gespeichert');
    };
    reader.readAsDataURL(file);
}

// Gespeichertes Logo laden (mit Fallback auf assets/images-config.json)
async function loadSavedImages() {
    // Versuche zuerst, die Konfigurationsdatei zu laden
    let configImages = { logo: null, profile: null };
    try {
        const response = await fetch('assets/images/images-config.json');
        if (response.ok) {
            configImages = await response.json();
        }
    } catch (e) {
        console.log('Keine images-config.json gefunden, nutze Fallbacks');
    }

    // Logo laden: localStorage > config > default SVG
    const savedLogo = safeLocalGet('customLogo', null);
    const logoImg = document.getElementById('uploadedLogo');
    const logoPlaceholder = document.getElementById('logoPlaceholder');

    if (logoImg && logoPlaceholder) {
        if (savedLogo) {
            logoImg.src = savedLogo;
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        } else if (configImages.logo) {
            logoImg.src = configImages.logo;
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        } else {
            // Fallback: Standard-Logo aus assets
            logoImg.src = 'assets/images/default-logo.svg';
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        }
    }

    // Agentur Photo laden: localStorage > config > default SVG
    const savedAgenturPhoto = safeLocalGet('agenturPhoto', null);
    const photoImg = document.getElementById('agenturPhotoImg');
    const photoPlaceholder = document.querySelector('.agentur-photo-placeholder');

    if (photoImg) {
        if (savedAgenturPhoto) {
            photoImg.src = savedAgenturPhoto;
            photoImg.style.display = 'block';
            if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        } else if (configImages.profile) {
            photoImg.src = configImages.profile;
            photoImg.style.display = 'block';
            if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        } else {
            // Fallback: Standard-Profilbild für Maria Musterfrau
            photoImg.src = 'assets/images/maria-musterfrau.png';
            photoImg.style.display = 'block';
            if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        }
    }

    // AUCH das kleine Agentur-Foto im Header laden
    const photoImgSmall = document.getElementById('agenturPhotoImgSmall');
    const photoPlaceholderSmall = document.querySelector('.agentur-photo-placeholder-small');

    if (photoImgSmall) {
        if (savedAgenturPhoto) {
            photoImgSmall.src = savedAgenturPhoto;
            photoImgSmall.style.display = 'block';
            if (photoPlaceholderSmall) photoPlaceholderSmall.style.display = 'none';
        } else if (configImages.profile) {
            photoImgSmall.src = configImages.profile;
            photoImgSmall.style.display = 'block';
            if (photoPlaceholderSmall) photoPlaceholderSmall.style.display = 'none';
        } else {
            // Fallback: Standard-Profilbild für Maria Musterfrau
            photoImgSmall.src = 'assets/images/maria-musterfrau.png';
            photoImgSmall.style.display = 'block';
            if (photoPlaceholderSmall) photoPlaceholderSmall.style.display = 'none';
        }
    }
}

// Exportiere hochgeladene Bilder für GitHub
function exportImagesForGitHub() {
    const images = {};

    const logo = safeLocalGet('customLogo', null);
    if (logo) images.logo = logo;

    const photo = safeLocalGet('agenturPhoto', null);
    if (photo) images.photo = photo;

    if (Object.keys(images).length === 0) {
        alert('Keine hochgeladenen Bilder gefunden.');
        return;
    }

    // Download als JSON
    const blob = new Blob([JSON.stringify(images, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uploaded-images.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Bilder exportiert für GitHub');
}

// ========================================
// POTENTIALANALYSE
// ========================================

let currentPotentialFilter = null;

function openPotentialAnalyse() {
    console.log('Potentialanalyse öffnen...');

    // Verstecke alle Seiten
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'none';
    const kundenDetail = document.getElementById('kundenDetailPage');
    if (kundenDetail) kundenDetail.style.display = 'none';
    const bgavPage = document.getElementById('bgavUmstellungPage');
    if (bgavPage) bgavPage.style.display = 'none';

    // Zeige Potentialanalyse
    document.getElementById('potentialAnalysePage').style.display = 'block';

    // Reset Filter
    currentPotentialFilter = null;
    updatePotentialFilter();

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'potentialanalyse' }
    }));

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/potentialanalyse');
}

function openPotentialAnalyseWithFilter(productId, productName) {
    console.log('Potentialanalyse öffnen mit Filter:', productId);

    // Verstecke alle Seiten
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    const agenturOverview = document.getElementById('agenturOverview');
    if (agenturOverview) agenturOverview.style.display = 'none';
    const kundenDetail = document.getElementById('kundenDetailPage');
    if (kundenDetail) kundenDetail.style.display = 'none';

    // Zeige Potentialanalyse
    document.getElementById('potentialAnalysePage').style.display = 'block';

    // Setze Filter
    currentPotentialFilter = productId;
    const filterSelect = document.getElementById('potentialProductFilter');
    if (filterSelect) {
        filterSelect.value = productId;
    }
    updatePotentialFilter();

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'potentialanalyse' }
    }));
}

function closePotentialAnalyse() {
    document.getElementById('potentialAnalysePage').style.display = 'none';
    document.getElementById('landingPage').style.display = 'flex';
    currentPotentialFilter = null;

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'landing' }
    }));
}

function showEigeneDaten() {
    document.getElementById('eigeneDatenContainer').style.display = 'block';
    document.getElementById('fidaContainer').style.display = 'none';
    document.getElementById('eigeneDatenBtn').classList.add('active');
    document.getElementById('fidaBtn').classList.remove('active');

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'eigeneDaten' }
    }));
}

function showFidaDaten() {
    // Open Finance erweitert die eigenen Daten - beide anzeigen
    document.getElementById('eigeneDatenContainer').style.display = 'block';
    document.getElementById('fidaContainer').style.display = 'block';
    document.getElementById('eigeneDatenBtn').classList.remove('active');
    document.getElementById('fidaBtn').classList.add('active');

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { module: 'versicherung', view: 'fidaCases' }
    }));
}

function updatePotentialFilter() {
    const filter = currentPotentialFilter;

    // Wenn kein Filter aktiv ist, gruppierte Ansicht zeigen
    if (!filter) {
        renderGroupedPotentials('eigeneDatenTable');
        renderGroupedPotentials('fidaTable');
    } else {
        // Bei aktivem Filter: Flache Ansicht mit Filter
        renderFlatPotentials('eigeneDatenTable', filter);
        renderFlatPotentials('fidaTable', filter);
    }

    // Update aktiven Filter-Button
    const filterBtns = document.querySelectorAll('.potential-filter-btn');
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
}

// Rendert die Tabelle mit Gruppierung nach Hauptsegmenten (Leben, Kranken, SHU, Kfz)
function renderGroupedPotentials(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    // Header in gruppierter Ansicht ausblenden
    const thead = table.querySelector('thead');
    if (thead) thead.style.display = 'none';

    // Sammle alle Original-Zeilen (ohne Gruppen-Zeilen)
    const originalRows = Array.from(tbody.querySelectorAll('tr:not(.potential-group-row)'));
    if (originalRows.length === 0) return;

    // Speichere Original-HTML falls noch nicht geschehen
    if (!tbody.dataset.originalHtml) {
        tbody.dataset.originalHtml = tbody.innerHTML;
    }

    // Mapping von Produkten zu Hauptsegmenten
    const productToSegment = {
        // Leben
        'bu': 'leben',
        'leben': 'leben',
        'altersvorsorge': 'leben',
        // Kranken
        'pflege': 'kranken',
        'kranken': 'kranken',
        // SHU (Sach/Haftpflicht/Unfall)
        'hausrat': 'shu',
        'haftpflicht': 'shu',
        'unfall': 'shu',
        'rechtsschutz': 'shu',
        'sach': 'shu',
        'wohngebaeude': 'shu',
        // Kfz
        'kfz': 'kfz'
    };

    // Hauptsegment-Namen, Reihenfolge und Icons
    const mainSegments = {
        'leben': {
            name: 'Leben',
            order: 1,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'
        },
        'kranken': {
            name: 'Kranken',
            order: 2,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>'
        },
        'shu': {
            name: 'Sach / Haftpflicht / Unfall',
            order: 3,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
        },
        'kfz': {
            name: 'Kfz',
            order: 4,
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"></path><path d="M3 17h2m14 0h2M5 17H3v-4l2-5h10l4 5v4h-2"></path></svg>'
        }
    };

    // Parse Original-HTML und gruppiere
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = '<table><tbody>' + tbody.dataset.originalHtml + '</tbody></table>';
    const rows = Array.from(tempDiv.querySelectorAll('tr'));

    const groups = {};

    rows.forEach(row => {
        const badge = row.querySelector('.potential-badge');
        if (badge) {
            // Finde Produkt-Klasse
            const classes = Array.from(badge.classList);
            const product = classes.find(c => c !== 'potential-badge') || 'sonstige';

            // Mappe zu Hauptsegment
            const mainSegment = productToSegment[product] || 'shu';

            if (!groups[mainSegment]) {
                groups[mainSegment] = [];
            }

            // Ermittle Priorität
            const priorityEl = row.querySelector('.priority');
            let priority = 'medium';
            if (priorityEl) {
                if (priorityEl.classList.contains('high')) priority = 'high';
                else if (priorityEl.classList.contains('low')) priority = 'low';
            }

            // Ermittle Kundenname für Sortierung
            const firstCell = row.querySelector('td');
            const kundenName = firstCell ? firstCell.textContent.trim() : '';

            groups[mainSegment].push({
                html: row.outerHTML,
                priority: priority,
                kundenName: kundenName,
                product: product
            });
        }
    });

    // Sortiere Segmente nach definierter Reihenfolge
    const sortedSegments = Object.keys(groups).sort((a, b) => {
        const orderA = mainSegments[a]?.order || 99;
        const orderB = mainSegments[b]?.order || 99;
        return orderA - orderB;
    });

    // Ermittle Spaltenanzahl aus Tabellen-Header
    const colCount = table.querySelectorAll('thead th').length || 5;

    // Baue neue Tabellen-Struktur
    let newHtml = '';

    sortedSegments.forEach(segment => {
        const items = groups[segment];

        // Sortiere Vorgänge alphabetisch nach Kundenname
        items.sort((a, b) => a.kundenName.localeCompare(b.kundenName));

        // Zähle Prioritäten
        const highCount = items.filter(i => i.priority === 'high').length;
        const mediumCount = items.filter(i => i.priority === 'medium').length;
        const lowCount = items.filter(i => i.priority === 'low').length;

        const segmentInfo = mainSegments[segment] || { name: segment, icon: '' };

        // Gruppen-Zeile
        newHtml += `
            <tr class="potential-group-row" data-segment="${segment}" onclick="togglePotentialGroup(this)">
                <td colspan="${colCount}">
                    <div class="group-toggle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        <span class="segment-badge segment-${segment}">${segmentInfo.icon || ''}${segmentInfo.name}</span>
                        <span class="group-count">${items.length}</span>
                        <div class="group-priorities">
                            ${highCount > 0 ? `<span class="priority-count high">${highCount} Hoch</span>` : ''}
                            ${mediumCount > 0 ? `<span class="priority-count medium">${mediumCount} Mittel</span>` : ''}
                            ${lowCount > 0 ? `<span class="priority-count low">${lowCount} Niedrig</span>` : ''}
                        </div>
                    </div>
                </td>
            </tr>
        `;

        // Detail-Zeilen
        items.forEach(item => {
            // Füge Klasse für versteckte Zeilen hinzu - berücksichtige existierende class-Attribute
            let rowHtml = item.html;
            if (rowHtml.includes('class="')) {
                // Existierende class erweitern
                rowHtml = rowHtml.replace(/class="([^"]*)"/, `class="$1 potential-detail-row" data-segment="${segment}"`);
            } else {
                // Neue class hinzufügen
                rowHtml = rowHtml.replace('<tr', `<tr class="potential-detail-row" data-segment="${segment}"`);
            }
            newHtml += rowHtml;
        });
    });

    tbody.innerHTML = newHtml;
}

// Rendert die Tabelle flach (ohne Gruppierung) mit optionalem Filter
function renderFlatPotentials(tableId, filter) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    // Header bei gefilterter Ansicht wieder einblenden
    const thead = table.querySelector('thead');
    if (thead) thead.style.display = '';

    // Stelle Original-HTML wieder her falls vorhanden
    if (tbody.dataset.originalHtml) {
        tbody.innerHTML = tbody.dataset.originalHtml;
    }

    // Wende Filter an
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        if (!filter) {
            row.style.display = '';
        } else {
            const badge = row.querySelector('.potential-badge');
            if (badge && badge.classList.contains(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// Toggle Gruppen-Zeilen ein/aus
function togglePotentialGroup(groupRow) {
    const segment = groupRow.dataset.segment;
    const isExpanded = groupRow.classList.contains('expanded');

    groupRow.classList.toggle('expanded');

    // Finde alle Detail-Zeilen dieser Gruppe
    const table = groupRow.closest('table');
    const detailRows = table.querySelectorAll(`.potential-detail-row[data-segment="${segment}"]`);

    detailRows.forEach(row => {
        row.classList.toggle('visible', !isExpanded);
    });
}

function filterPotentials(productId) {
    currentPotentialFilter = productId === 'alle' ? null : productId;
    updatePotentialFilter();
}

// Globale Funktion für Toggle
window.togglePotentialGroup = togglePotentialGroup;

// ========================================
// VERSICHERUNGS-1×1 MODULE
// ========================================

let versicherungs1x1Loaded = false;

async function openVersicherungs1x1() {
    console.log('Versicherungs-1×1 öffnen...');

    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) landingPage.style.display = 'none';

    // Hide main app if visible
    const mainApp = document.getElementById('mainApp');
    if (mainApp) mainApp.style.display = 'none';

    // Hide other modules
    ['bankenModule', 'assetModule', 'cvScannerModule', 'risikoscoringModule',
     'bestandsuebertragungModule', 'pmoToolboxModule', 'hrPipelineModule',
     'beraterOverviewPage', 'kundenDetailBankPage'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Show versicherungs-1x1 module
    const v1x1Module = document.getElementById('versicherungs1x1Module');
    if (v1x1Module) {
        v1x1Module.style.display = 'block';

        // Load content if not already loaded
        if (!versicherungs1x1Loaded) {
            try {
                const response = await fetch('partials/versicherungs-1x1-module.html');
                if (response.ok) {
                    const html = await response.text();
                    v1x1Module.innerHTML = html;
                    versicherungs1x1Loaded = true;

                    // Initialize the module
                    if (typeof V1x1 !== 'undefined' && V1x1.init) {
                        V1x1.init();
                    }
                    console.log('Versicherungs-1×1 Modul geladen');
                } else {
                    v1x1Module.innerHTML = '<div class="error-message">Fehler beim Laden des Versicherungs-1×1-Moduls</div>';
                }
            } catch (error) {
                console.error('Error loading Versicherungs-1×1 module:', error);
                v1x1Module.innerHTML = '<div class="error-message">Fehler beim Laden des Versicherungs-1×1-Moduls</div>';
            }
        } else {
            // Module already loaded — re-init display
            if (typeof V1x1 !== 'undefined' && V1x1.init) {
                V1x1.init();
            }
        }
    }

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/versicherungs-1x1');
}

function closeVersicherungs1x1() {
    console.log('Versicherungs-1×1 schließen...');

    // Hide versicherungs-1x1 module
    const v1x1Module = document.getElementById('versicherungs1x1Module');
    if (v1x1Module) v1x1Module.style.display = 'none';

    // Show landing page (use flex for proper centering)
    const landingPage = document.getElementById('landingPage');
    if (landingPage) landingPage.style.display = 'flex';

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/landing');
}

// ========================================
window.__registerModule('landing-upload.js');
