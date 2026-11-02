(function(){var r=['safeLocalGet'];var m=r.filter(function(f){return typeof window[f]==='undefined'});if(m.length)console.debug('[user-mode.js] Fehlende Deps:',m.join(', '),'← Lade utils.js zuerst!');})();
// js/user-mode.js - User Mode Switching (Vertrieb / PVA) + Profile
// Extracted from landing.js for modularity

// USER MODE SWITCHING (Vertrieb / PVA)
// ========================================

// Aktueller Modus
let currentUserMode = 'vertrieb'; // 'vertrieb' oder 'pva'

// Toggle Profile Dropdown
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    const arrow = document.getElementById('profileArrow');

    if (dropdown && arrow) {
        dropdown.classList.toggle('show');
        arrow.classList.toggle('open');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const switcher = document.getElementById('userProfileSwitcher');
    const dropdown = document.getElementById('profileDropdown');
    const arrow = document.getElementById('profileArrow');

    if (switcher && dropdown && !switcher.contains(event.target)) {
        dropdown.classList.remove('show');
        if (arrow) arrow.classList.remove('open');
    }
});

// Switch User Mode
function switchUserMode(mode) {
    currentUserMode = mode;

    // Update profile display
    const profileName = document.getElementById('profileName');
    const profileRole = document.getElementById('profileRole');
    const checkVertrieb = document.getElementById('checkVertrieb');
    const checkPva = document.getElementById('checkPva');

    if (mode === 'vertrieb') {
        if (profileName) profileName.textContent = 'Eike Brenneisen';
        if (profileRole) profileRole.textContent = 'Vertriebssteuerung';
        if (checkVertrieb) checkVertrieb.style.display = 'block';
        if (checkPva) checkPva.style.display = 'none';
    } else if (mode === 'pva') {
        if (profileName) profileName.textContent = 'Anja Schneider';
        if (profileRole) profileRole.textContent = 'Sales Operations';
        if (checkVertrieb) checkVertrieb.style.display = 'none';
        if (checkPva) checkPva.style.display = 'block';
    }

    // Update profile avatar based on mode
    updateProfileAvatar(mode);

    // Update navigation boxes
    updateNavigationBoxes(mode);

    // Close dropdown
    const dropdown = document.getElementById('profileDropdown');
    const arrow = document.getElementById('profileArrow');
    if (dropdown) dropdown.classList.remove('show');
    if (arrow) arrow.classList.remove('open');

    // Update welcome message
    updateWelcomeMessage(mode);
}

// Update Navigation Boxes based on mode
function updateNavigationBoxes(mode) {
    const navBoxContainer = document.querySelector('.navigation-boxes');
    if (!navBoxContainer) return;

    if (mode === 'vertrieb') {
        navBoxContainer.innerHTML = `
            <button class="nav-box" onclick="openAgenturView()">
                <svg class="nav-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Agenturansicht</span>
            </button>
            <button class="nav-box" onclick="openDashboard()">
                <svg class="nav-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                </svg>
                <span>Gesamtübersicht</span>
            </button>
            <button class="nav-box" onclick="openPotentialAnalyse()">
                <svg class="nav-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path>
                    <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                    <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                    <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <span>Potentialanalyse</span>
            </button>
        `;
    } else if (mode === 'pva') {
        navBoxContainer.innerHTML = `
            <button class="nav-box" onclick="openOffeneVorgaenge()">
                <svg class="nav-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>Übersicht offene Vorgänge</span>
            </button>
            <button class="nav-box" onclick="openAbrechnungspruefung()">
                <svg class="nav-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                <span>Abrechnungsprüfung</span>
            </button>
            <button class="nav-box" onclick="openValidierungProvision()">
                <svg class="nav-box-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Validierung Provisionsberechnung</span>
            </button>
        `;
    }
}

// Update Welcome Message based on mode
function updateWelcomeMessage(mode) {
    const chatBubble = document.querySelector('.welcome-message .chat-bubble p strong');
    if (chatBubble) {
        if (mode === 'vertrieb') {
            const userName = safeLocalGet('userName', 'Max');
            chatBubble.textContent = 'Willkommen zurück ' + userName + ', was kann ich für dich tun?';
        } else if (mode === 'pva') {
            chatBubble.textContent = 'Willkommen zurück Anja, was kann ich für dich tun?';
        }
    }
}

// Update Profile Avatar based on mode
function updateProfileAvatar(mode) {
    console.log('updateProfileAvatar aufgerufen für Modus:', mode);
    const profileAvatarImg = document.getElementById('profileAvatarImg');
    if (!profileAvatarImg) {
        return;
    }

    const savedImage = safeLocalGet('userProfileImage_' + mode, null);
    console.log('Gespeichertes Bild vorhanden:', savedImage ? 'JA (' + savedImage.substring(0, 50) + '...)' : 'NEIN');

    if (savedImage) {
        profileAvatarImg.src = savedImage;
        console.log('Haupt-Avatar auf gespeichertes Bild gesetzt');
    } else {
        profileAvatarImg.src = 'assets/images/default-profile.svg';
        console.log('Haupt-Avatar auf Standard-Bild gesetzt');
    }
}

// ========================================
// USER PROFILE IMAGE UPLOAD
// ========================================

let currentUploadTarget = 'vertrieb'; // Which user profile to upload to

// Trigger upload from main profile avatar
function triggerUserProfileUpload(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    currentUploadTarget = currentUserMode;
    console.log('Trigger Upload für:', currentUploadTarget);

    const input = document.getElementById('userProfileUpload');
    if (input) {
        input.click();
    } else {
        console.error('Upload input nicht gefunden');
    }
}

// Trigger upload from dropdown avatar
function triggerUserProfileUploadFor(mode, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    currentUploadTarget = mode;
    console.log('Trigger Upload für (dropdown):', currentUploadTarget);

    const input = document.getElementById('userProfileUploadDropdown');
    if (input) {
        input.click();
    } else {
        console.error('Dropdown Upload input nicht gefunden');
    }
}

// Handle upload from main profile
function handleUserProfileUpload(event) {
    console.log('Handle Upload Event');
    const file = event.target.files[0];
    if (file) {
        console.log('Datei ausgewählt:', file.name);
        processUserProfileImage(file, currentUploadTarget);
    }
    event.target.value = '';
}

// Handle upload from dropdown
function handleUserProfileUploadDropdown(event) {
    console.log('Handle Dropdown Upload Event');
    const file = event.target.files[0];
    if (file) {
        console.log('Datei ausgewählt:', file.name);
        processUserProfileImage(file, currentUploadTarget);
    }
    event.target.value = '';
}

// Process and save user profile image (mit Komprimierung)
function processUserProfileImage(file, mode) {
    const reader = new FileReader();
    reader.onload = function(e) {
        // Komprimiere das Bild bevor es gespeichert wird
        compressImage(e.target.result, 150, 0.8, function(compressedData) {
            try {
                // Save to localStorage
                safeLocalSet('userProfileImage_' + mode, compressedData);

                // Update all relevant images
                updateAllUserProfileImages(mode, compressedData);

                console.log(`Profilbild für ${mode} gespeichert (komprimiert)`);
            } catch (error) {
                console.error('Fehler beim Speichern:', error);
                alert('Das Bild konnte nicht gespeichert werden. Bitte versuche ein kleineres Bild.');
            }
        });
    };
    reader.readAsDataURL(file);
}

// Komprimiert ein Bild auf eine maximale Größe
function compressImage(dataUrl, maxSize, quality, callback) {
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Skaliere auf maxSize (Quadrat für Avatar)
        if (width > height) {
            if (width > maxSize) {
                height = Math.round(height * maxSize / width);
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = Math.round(width * maxSize / height);
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Konvertiere zu komprimiertem JPEG
        const compressedData = canvas.toDataURL('image/jpeg', quality);
        console.log(`Bild komprimiert: ${Math.round(dataUrl.length/1024)}KB → ${Math.round(compressedData.length/1024)}KB`);

        callback(compressedData);
    };
    img.src = dataUrl;
}

// Update all profile images for a given mode
function updateAllUserProfileImages(mode, imageData) {
    console.log('Update Bilder für Modus:', mode);

    // Update dropdown option avatar
    const avatarId = mode === 'vertrieb' ? 'optionAvatarVertrieb' : 'optionAvatarPva';
    const optionAvatar = document.getElementById(avatarId);
    console.log('Dropdown Avatar Element:', avatarId, optionAvatar ? 'gefunden' : 'NICHT GEFUNDEN');

    if (optionAvatar) {
        optionAvatar.src = imageData;
        console.log('Dropdown Avatar aktualisiert');
    }

    // Update main profile avatar if this mode is currently active
    if (mode === currentUserMode) {
        const profileAvatarImg = document.getElementById('profileAvatarImg');
        if (profileAvatarImg) {
            profileAvatarImg.src = imageData;
            console.log('Haupt-Avatar aktualisiert');
        }
    } else {
        console.log('Haupt-Avatar nicht aktualisiert (anderer Modus aktiv:', currentUserMode, ')');
    }
}

// Load saved user profile images on page load
function loadUserProfileImages() {
    console.log('loadUserProfileImages aufgerufen');

    // Load Vertrieb profile
    const vertriebImage = safeLocalGet('userProfileImage_vertrieb', null);
    console.log('Vertrieb Bild in localStorage:', vertriebImage ? 'JA' : 'NEIN');
    if (vertriebImage) {
        const optionVertrieb = document.getElementById('optionAvatarVertrieb');
        if (optionVertrieb) {
            optionVertrieb.src = vertriebImage;
            console.log('Vertrieb Dropdown-Avatar geladen');
        }
    }

    // Load PVA profile
    const pvaImage = safeLocalGet('userProfileImage_pva', null);
    console.log('PVA (Anja) Bild in localStorage:', pvaImage ? 'JA' : 'NEIN');
    if (pvaImage) {
        const optionPva = document.getElementById('optionAvatarPva');
        console.log('optionAvatarPva Element:', optionPva ? 'gefunden' : 'NICHT GEFUNDEN');
        if (optionPva) {
            optionPva.src = pvaImage;
            console.log('PVA (Anja) Dropdown-Avatar geladen');
        }
    }

    // Update main avatar for current mode
    updateProfileAvatar(currentUserMode);
}

// PVA Mode Functions

// Offene Vorgänge (placeholder)
function openOffeneVorgaenge() {
    alert('Übersicht offene Vorgänge - In Entwicklung');
}

// Abrechnungsprüfung - Opens in new tab (iframe blocked by target site)
function openAbrechnungspruefung() {
    window.open('https://billingcheck.pages.dev/app', '_blank');
}

// Validierung Provisionsberechnung - Opens in new tab
function openValidierungProvision() {
    window.open('https://provisions-analyzer.pages.dev/', '_blank');
}

// ========================================
// INIT
// ========================================

// Erweitere den DOMContentLoaded
const originalDOMContentLoaded = window.onload;

window.addEventListener('load', function() {
    // Lade gespeicherte Bilder
    loadSavedImages();

    // Upload-Modus standardmäßig aktivieren
    initUploadMode();

    // Setup Autocomplete
    setupAutocomplete();

    // Lade User-Profilbilder
    loadUserProfileImages();
});

// Global verfügbar machen
window.toggleUploadMode = toggleUploadMode;
window.triggerLogoUpload = triggerLogoUpload;
window.handleLogoUpload = handleLogoUpload;
window.triggerProfileUpload = triggerProfileUpload;
window.triggerAgenturPhotoUpload = triggerAgenturPhotoUpload;
window.handleAgenturPhotoUpload = handleAgenturPhotoUpload;
window.openPotentialAnalyse = openPotentialAnalyse;
window.openPotentialAnalyseWithFilter = openPotentialAnalyseWithFilter;
window.closePotentialAnalyse = closePotentialAnalyse;
window.showEigeneDaten = showEigeneDaten;
window.showFidaDaten = showFidaDaten;
window.selectSuggestion = selectSuggestion;
window.selectAgentSuggestion = selectAgentSuggestion;
window.selectPotentialSuggestion = selectPotentialSuggestion;
window.filterPotentials = filterPotentials;
window.openKundenDetail = openKundenDetail;
window.closeKundenDetail = closeKundenDetail;
window.goToSalesReportFromKundenDetail = goToSalesReportFromKundenDetail;
window.toggleKundenFida = toggleKundenFida;
window.initUploadMode = initUploadMode;
window.exportImagesForGitHub = exportImagesForGitHub;
window.toggleProfileDropdown = toggleProfileDropdown;
window.switchUserMode = switchUserMode;
window.openOffeneVorgaenge = openOffeneVorgaenge;
window.openAbrechnungspruefung = openAbrechnungspruefung;
window.openValidierungProvision = openValidierungProvision;
window.triggerUserProfileUpload = triggerUserProfileUpload;
window.triggerUserProfileUploadFor = triggerUserProfileUploadFor;
window.handleUserProfileUpload = handleUserProfileUpload;
window.handleUserProfileUploadDropdown = handleUserProfileUploadDropdown;
window.loadUserProfileImages = loadUserProfileImages;


// ========================================
window.__registerModule('user-mode.js');
