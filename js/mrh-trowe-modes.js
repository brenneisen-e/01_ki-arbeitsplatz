// js/mrh-trowe.js - Gewerbemakler 360° Modus
// PE-gestützter Konsolidierer: Insurance + Benefits + Finance

// ========================================
// GLOBAL VIEW MODE STATE
// ========================================
var viewMode = 'ao'; // 'ao' | 'ecclesia' | 'mrh' | 'bank-retail' | 'bank-fk' | 'bank-vw'
var financeMode = 'closed'; // 'closed' | 'open' — Open Finance = alle Institute sichtbar
var selectedInsurer = 'ergo'; // Currently selected insurance company

// ========================================
// INSURER CONFIGURATION
// ========================================
var insurerConfig = {
    'ergo': {
        name: 'ERGO',
        domain: 'ergo.de',
        primary: '#6B1C2A',
        primaryDark: '#4A1320',
        primaryLight: '#8B2A3A',
        headerBg: '#6B1C2A',
        headerAccent: '#D4A574',
        activeTabBg: '#D4A574',
        dropdownActive: '#fdf2f2',
        dropdownActiveText: '#6B1C2A'
    },
    'allianz': {
        name: 'Allianz',
        domain: 'allianz.de',
        primary: '#003781',
        primaryDark: '#002D6B',
        primaryLight: '#1F78D1',
        headerBg: '#003781',
        headerAccent: '#1F78D1',
        activeTabBg: '#1F78D1',
        dropdownActive: '#eff6ff',
        dropdownActiveText: '#1e40af'
    },
    'axa': {
        name: 'AXA',
        domain: 'axa.de',
        primary: '#00008F',
        primaryDark: '#000066',
        primaryLight: '#3032C1',
        headerBg: '#00008F',
        headerAccent: '#FF1721',
        activeTabBg: '#3032C1',
        dropdownActive: '#eef2ff',
        dropdownActiveText: '#3730a3'
    },
    'zurich': {
        name: 'Zurich',
        domain: 'zurich.de',
        primary: '#003399',
        primaryDark: '#002266',
        primaryLight: '#4A90D9',
        headerBg: '#003399',
        headerAccent: '#4A90D9',
        activeTabBg: '#4A90D9',
        dropdownActive: '#eff6ff',
        dropdownActiveText: '#1e3a8a'
    },
    'generali': {
        name: 'Generali',
        domain: 'generali.de',
        primary: '#C8102E',
        primaryDark: '#A00E24',
        primaryLight: '#E04050',
        headerBg: '#B8001C',
        headerAccent: '#E04050',
        activeTabBg: '#E04050',
        dropdownActive: '#fef2f2',
        dropdownActiveText: '#991b1b'
    },
    'hdi': {
        name: 'HDI',
        domain: 'hdi.de',
        primary: '#007E3A',
        primaryDark: '#005E2A',
        primaryLight: '#2ECC71',
        headerBg: '#007E3A',
        headerAccent: '#2ECC71',
        activeTabBg: '#2ECC71',
        dropdownActive: '#f0fdf4',
        dropdownActiveText: '#166534'
    },
    'rv': {
        name: 'R+V',
        domain: 'ruv.de',
        primary: '#004899',
        primaryDark: '#003466',
        primaryLight: '#FFC72C',
        headerBg: '#004899',
        headerAccent: '#FFC72C',
        activeTabBg: '#FFC72C',
        dropdownActive: '#eff6ff',
        dropdownActiveText: '#1e40af'
    },
    'signal-iduna': {
        name: 'Signal Iduna',
        domain: 'signal-iduna.de',
        primary: '#0033A0',
        primaryDark: '#002680',
        primaryLight: '#FFD100',
        headerBg: '#0033A0',
        headerAccent: '#FFD100',
        activeTabBg: '#FFD100',
        dropdownActive: '#eff6ff',
        dropdownActiveText: '#1e3a8a'
    },
    'gothaer': {
        name: 'Gothaer',
        domain: 'gothaer.de',
        primary: '#009640',
        primaryDark: '#007830',
        primaryLight: '#00B84D',
        headerBg: '#009640',
        headerAccent: '#00B84D',
        activeTabBg: '#00B84D',
        dropdownActive: '#f0fdf4',
        dropdownActiveText: '#166534'
    },
    'debeka': {
        name: 'Debeka',
        domain: 'debeka.de',
        primary: '#003D7C',
        primaryDark: '#002D5C',
        primaryLight: '#4A8BC2',
        headerBg: '#003D7C',
        headerAccent: '#4A8BC2',
        activeTabBg: '#4A8BC2',
        dropdownActive: '#eff6ff',
        dropdownActiveText: '#1e3a8a'
    }
};

// Contract product sets per insurer (typical products each insurer offers)
var insurerProducts = {
    'ergo': ['ERGO', 'ERGO Direkt', 'DKV'],
    'allianz': ['Allianz', 'Allianz Direct'],
    'axa': ['AXA', 'AXA Easy'],
    'zurich': ['Zurich', 'Zurich Connect'],
    'generali': ['Generali', 'CosmosDirekt'],
    'hdi': ['HDI', 'Hannoversche'],
    'rv': ['R+V', 'KRAVAG', 'Condor'],
    'signal-iduna': ['Signal Iduna', 'ADAC Versicherung'],
    'gothaer': ['Gothaer', 'Janitos'],
    'debeka': ['Debeka']
};

// ========================================
// BANK CONFIGURATION
// ========================================
var selectedBank = 'vr'; // Currently selected bank group
var bankConfig = {
    'vr': {
        name: 'VR / Volksbank',
        domain: 'volksbank.de',
        primary: '#003399',
        primaryDark: '#002266',
        headerBg: '#003399',
        headerAccent: '#FF6600',
        activeTabBg: '#FF6600',
        labels: { retail: 'Banking-Retail', fk: 'Banking-Firmenkunde', vw: 'Banking-Vermögen' }
    },
    'sparkasse': {
        name: 'Sparkasse',
        domain: 'sparkasse.de',
        primary: '#FF0000',
        primaryDark: '#CC0000',
        headerBg: '#CC0000',
        headerAccent: '#FF4444',
        activeTabBg: '#FF4444',
        labels: { retail: 'Sparkasse Retail', fk: 'Sparkasse Firmenkunde', vw: 'Sparkasse Verm\u00F6gen' }
    },
    'commerzbank': {
        name: 'Commerzbank',
        domain: 'commerzbank.de',
        primary: '#FFD700',
        primaryDark: '#D4B400',
        headerBg: '#003D2E',
        headerAccent: '#FFD700',
        activeTabBg: '#FFD700',
        labels: { retail: 'CBK Retail', fk: 'CBK Firmenkunde', vw: 'CBK Wealth Management' }
    },
    'deutsche-bank': {
        name: 'Deutsche Bank',
        domain: 'db.com',
        primary: '#0018A8',
        primaryDark: '#001280',
        headerBg: '#0018A8',
        headerAccent: '#4A72D9',
        activeTabBg: '#4A72D9',
        labels: { retail: 'DB Retail', fk: 'DB Firmenkunde', vw: 'DB Wealth Management' }
    },
    'dkb': {
        name: 'DKB',
        domain: 'dkb.de',
        primary: '#004F9F',
        primaryDark: '#003D7C',
        headerBg: '#004F9F',
        headerAccent: '#00B2A9',
        activeTabBg: '#00B2A9',
        labels: { retail: 'DKB Retail', fk: 'DKB Firmenkunde', vw: 'DKB Verm\u00F6gen' }
    },
    'ing': {
        name: 'ING',
        domain: 'ing.de',
        primary: '#FF6200',
        primaryDark: '#CC4E00',
        headerBg: '#FF6200',
        headerAccent: '#FFB380',
        activeTabBg: '#FFB380',
        labels: { retail: 'ING Retail', fk: 'ING Firmenkunde', vw: 'ING Verm\u00F6gen' }
    },
    'targobank': {
        name: 'Targobank',
        domain: 'targobank.de',
        primary: '#003B7E',
        primaryDark: '#002D60',
        headerBg: '#003B7E',
        headerAccent: '#00A3E0',
        activeTabBg: '#00A3E0',
        labels: { retail: 'Targo Retail', fk: 'Targo Firmenkunde', vw: 'Targo Verm\u00F6gen' }
    },
    'apobank': {
        name: 'apoBank',
        domain: 'apobank.de',
        primary: '#003D7C',
        primaryDark: '#002D5C',
        headerBg: '#003D7C',
        headerAccent: '#7DB928',
        activeTabBg: '#7DB928',
        labels: { retail: 'apoBank Retail', fk: 'apoBank Firmenkunde', vw: 'apoBank Verm\u00F6gen' }
    }
};

// ========================================
// BANK SELECTION
// ========================================
function setBank(bankKey) {
    if (!bankConfig[bankKey]) return;
    selectedBank = bankKey;

    // Auto-switch to bank mode if currently in insurance mode
    if (viewMode.indexOf('bank-') !== 0) {
        setViewMode('bank-retail');
        return; // setViewMode calls setBank again via applyViewMode
    }

    var cfg = bankConfig[bankKey];

    // Update banking mode labels in dropdown
    var bankModes = { 'bank-retail': 'retail', 'bank-fk': 'fk', 'bank-vw': 'vw' };
    for (var mode in bankModes) {
        viewModeLabels[mode] = cfg.labels[bankModes[mode]];
        var btn = document.querySelector('.view-mode-dropdown-item[data-mode="' + mode + '"]');
        if (btn) {
            // Update text content but keep the SVG
            var svg = btn.querySelector('svg');
            btn.textContent = ' ' + cfg.labels[bankModes[mode]];
            if (svg) btn.insertBefore(svg, btn.firstChild);
        }
    }

    // Update current label if in bank mode
    if (viewMode.indexOf('bank-') === 0) {
        var label = document.getElementById('viewModeLabel');
        if (label) label.textContent = viewModeLabels[viewMode];

        // Apply bank theming to header
        var header = document.querySelector('.agentur-header-new');
        if (header) header.style.background = cfg.headerBg;

        var style = document.getElementById('insurerDynamicStyle');
        if (!style) {
            style = document.createElement('style');
            style.id = 'insurerDynamicStyle';
            document.head.appendChild(style);
        }
        style.textContent =
            '.agentur-header-new .agentur-tab.active { background: ' + cfg.activeTabBg + ' !important; }' +
            '.agentur-photo-small { background: linear-gradient(135deg, ' + cfg.headerAccent + ' 0%, ' + cfg.primary + ' 100%) !important; }' +
            '.bank-dropdown-item.active { background: #eff6ff !important; color: #1e40af !important; }';
    }

    // Update header logo for bank
    var logoImg = document.getElementById('insurerLogoImg');
    var logoFallback = document.getElementById('insurerLogoFallback');
    if (logoImg) {
        var logoUrl = (typeof getVersichererLogoUrl === 'function')
            ? getVersichererLogoUrl(cfg.name, 120)
            : '';
        if (logoUrl) {
            logoImg.src = logoUrl;
            logoImg.alt = cfg.name;
            logoImg.style.display = '';
            logoImg.onerror = function() {
                logoImg.style.display = 'none';
                if (logoFallback) {
                    logoFallback.style.display = 'flex';
                    logoFallback.textContent = cfg.name.substring(0, 2).toUpperCase();
                    logoFallback.style.background = cfg.primary;
                }
            };
            if (logoFallback) logoFallback.style.display = 'none';
        } else if (logoFallback) {
            logoImg.style.display = 'none';
            logoFallback.style.display = 'flex';
            logoFallback.textContent = cfg.name.substring(0, 2).toUpperCase();
            logoFallback.style.background = cfg.primary;
        }
    }

    // Update active state in bank dropdown
    document.querySelectorAll('.bank-dropdown-item').forEach(function(item) {
        item.classList.toggle('active', item.dataset.bank === bankKey);
    });

    var bankLabel = document.getElementById('selectedBankLabel');
    if (bankLabel) bankLabel.textContent = cfg.name;

    safeLocalSet('selectedBank', bankKey);
    console.log('Bank gewechselt: ' + cfg.name);
}
window.setBank = setBank;

// Load bank grid logos dynamically
function loadBankGridLogos() {
    if (typeof getVersichererLogoUrl !== 'function') return;
    document.querySelectorAll('.bank-dropdown-item[data-bank]').forEach(function(btn) {
        var key = btn.dataset.bank;
        var cfg = bankConfig[key];
        if (!cfg) return;
        var url = getVersichererLogoUrl(cfg.name, 80);
        if (!url) return;
        if (btn.querySelector('img')) return;
        var img = document.createElement('img');
        img.src = url;
        img.alt = cfg.name;
        img.className = 'insurer-grid-logo';
        img.onerror = function() { img.remove(); };
        img.onload = function() {
            var fallback = btn.querySelector('.insurer-icon-fallback');
            if (fallback) fallback.style.display = 'none';
        };
        btn.insertBefore(img, btn.firstChild);
    });
}

// ========================================
// INSURER SELECTION
// ========================================
function setInsurer(insurerKey) {
    if (!insurerConfig[insurerKey]) return;
    selectedInsurer = insurerKey;

    // Auto-switch to insurance mode if currently in bank mode
    if (viewMode.indexOf('bank-') === 0) {
        setViewMode('ao');
        return; // setViewMode calls setInsurer again via applyViewMode
    }

    var cfg = insurerConfig[insurerKey];

    // Update CSS custom properties for theming
    var root = document.documentElement;
    root.style.setProperty('--primary', cfg.primary);
    root.style.setProperty('--primary-dark', cfg.primaryDark);
    root.style.setProperty('--primary-light', cfg.primaryLight);

    // Update header background color
    var header = document.querySelector('.agentur-header-new');
    if (header) header.style.background = cfg.headerBg;

    // Update active tab color
    var style = document.getElementById('insurerDynamicStyle');
    if (!style) {
        style = document.createElement('style');
        style.id = 'insurerDynamicStyle';
        document.head.appendChild(style);
    }
    style.textContent =
        '.agentur-header-new .agentur-tab.active { background: ' + cfg.activeTabBg + ' !important; }' +
        '.agentur-photo-small { background: linear-gradient(135deg, ' + cfg.headerAccent + ' 0%, ' + cfg.primary + ' 100%) !important; }' +
        '.view-mode-dropdown-item.active { background: ' + cfg.dropdownActive + ' !important; color: ' + cfg.dropdownActiveText + ' !important; }' +
        '.view-mode-dropdown-item.active svg { stroke: ' + cfg.dropdownActiveText + ' !important; }' +
        '.insurer-dropdown-item.active { background: ' + cfg.dropdownActive + ' !important; color: ' + cfg.dropdownActiveText + ' !important; }';

    // Update insurer logo in header (use getVersichererLogoUrl if available)
    var logoImg = document.getElementById('insurerLogoImg');
    var logoFallback = document.getElementById('insurerLogoFallback');
    if (logoImg) {
        var logoUrl = (typeof getVersichererLogoUrl === 'function')
            ? getVersichererLogoUrl(cfg.name, 120)
            : 'https://img.logo.dev/' + cfg.domain + '?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=120&format=png';
        logoImg.src = logoUrl;
        logoImg.alt = cfg.name;
        logoImg.style.display = '';
        logoImg.onerror = function() {
            logoImg.style.display = 'none';
            if (logoFallback) {
                logoFallback.style.display = 'flex';
                logoFallback.textContent = cfg.name.substring(0, 2).toUpperCase();
                logoFallback.style.background = cfg.primary;
            }
        };
        if (logoFallback) logoFallback.style.display = 'none';
    }

    // Update active state in insurer dropdown
    document.querySelectorAll('.insurer-dropdown-item').forEach(function(item) {
        item.classList.toggle('active', item.dataset.insurer === insurerKey);
    });

    // Update dropdown toggle to show insurer name
    var insurerLabel = document.getElementById('selectedInsurerLabel');
    if (insurerLabel) insurerLabel.textContent = cfg.name;

    // Re-generate contract data with new insurer
    if (typeof updateContractsForInsurer === 'function') {
        updateContractsForInsurer(insurerKey);
    }

    safeLocalSet('selectedInsurer', insurerKey);
    console.log('Versicherer gewechselt: ' + cfg.name);

    // A-10 Kunden-Detail aktualisieren falls sichtbar
    if (typeof updateKundenDetailInsurer === 'function') {
        updateKundenDetailInsurer();
    }
}
window.setInsurer = setInsurer;

// Load logos into the insurer grid dynamically (same approach as kunden-detail)
function loadInsurerGridLogos() {
    if (typeof getVersichererLogoUrl !== 'function') return;
    var buttons = document.querySelectorAll('.insurer-dropdown-item[data-insurer]');
    buttons.forEach(function(btn) {
        var key = btn.dataset.insurer;
        var cfg = insurerConfig[key];
        if (!cfg) return;
        var url = getVersichererLogoUrl(cfg.name, 80);
        if (!url) return;
        // Only add img if not already present
        if (btn.querySelector('img')) return;
        var img = document.createElement('img');
        img.src = url;
        img.alt = cfg.name;
        img.className = 'insurer-grid-logo';
        img.onerror = function() { img.remove(); };
        img.onload = function() {
            // Hide fallback text, show logo
            var fallback = btn.querySelector('.insurer-icon-fallback');
            if (fallback) fallback.style.display = 'none';
        };
        btn.insertBefore(img, btn.firstChild);
    });
}

// Restore saved insurer + bank on page load
function restoreInsurer() {
    var saved = safeLocalGet('selectedInsurer', null);
    if (saved && insurerConfig[saved]) {
        setInsurer(saved);
    }
    var savedBank = safeLocalGet('selectedBank', null);
    if (savedBank && bankConfig[savedBank]) {
        setBank(savedBank);
    }
    // Load grid logos after a short delay to ensure getVersichererLogoUrl is available
    setTimeout(function() {
        loadInsurerGridLogos();
        loadBankGridLogos();
    }, 500);
}

// Call restore after DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreInsurer);
} else {
    setTimeout(restoreInsurer, 300);
}

// Dropdown label map
var viewModeLabels = {
    'ao': 'Privatkunde (AO)',
    'ecclesia': 'Makler B2B',
    'mrh': 'Gewerbemakler 360\u00B0',
    'bank-retail': 'Banking Retail',
    'bank-fk': 'Banking Firmenkunde',
    'bank-vw': 'Banking Verm\u00F6gen'
};

function toggleViewModeDropdown() {
    var menu = document.getElementById('viewModeMenu');
    var toggle = document.getElementById('viewModeToggle');
    if (!menu) return;
    var isOpen = menu.style.display !== 'none';
    menu.style.display = isOpen ? 'none' : 'block';
    if (toggle) toggle.classList.toggle('open', !isOpen);
}
window.toggleViewModeDropdown = toggleViewModeDropdown;

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    var dropdown = document.getElementById('viewModeDropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        var menu = document.getElementById('viewModeMenu');
        var toggle = document.getElementById('viewModeToggle');
        if (menu) menu.style.display = 'none';
        if (toggle) toggle.classList.remove('open');
    }
});

function setViewMode(mode) {
    viewMode = mode;

    // Update dropdown label, icon, and active item
    var label = document.getElementById('viewModeLabel');
    if (label) label.textContent = viewModeLabels[mode] || mode;
    var icon = document.getElementById('viewModeIcon');
    if (icon) {
        if (mode.indexOf('bank-') === 0) {
            icon.innerHTML = '<rect x="3" y="10" width="18" height="11" rx="2"></rect><path d="M12 2L2 10h20L12 2z"></path>';
        } else {
            icon.innerHTML = '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>';
        }
    }
    document.querySelectorAll('.view-mode-dropdown-item').forEach(function(item) {
        item.classList.toggle('active', item.dataset.mode === mode);
    });

    // Close dropdown
    var menu = document.getElementById('viewModeMenu');
    var toggle = document.getElementById('viewModeToggle');
    if (menu) menu.style.display = 'none';
    if (toggle) toggle.classList.remove('open');

    // Backward compat: keep maklerModus in sync
    if (typeof maklerModus !== 'undefined') {
        maklerModus = (mode === 'ecclesia');
    }

    // Apply correct theming for the mode
    if (mode.indexOf('bank-') === 0) {
        // Bank mode: apply selected bank theming
        setBank(selectedBank);
    } else {
        // Insurance mode: apply selected insurer theming
        setInsurer(selectedInsurer);
    }

    applyViewMode();

    // Close A-10 if open and update URL based on which page is visible
    var a10 = document.getElementById('kundenDetailPage');
    if (a10 && a10.style.display !== 'none') {
        if (typeof closeKundenDetail === 'function') closeKundenDetail();
    }

    // Update URL to reflect the active view mode on A-02
    var agenturPage = document.getElementById('agenturOverview');
    if (agenturPage && agenturPage.style.display !== 'none' && window.AppRouter) {
        var routeMap = {
            'ao': '/agentur', 'ecclesia': '/agentur-b2b', 'mrh': '/agentur-gewerbe',
            'bank-retail': '/berater', 'bank-fk': '/berater-firmenkunde', 'bank-vw': '/berater-vermoegen'
        };
        AppRouter.navigate(routeMap[mode] || '/agentur');
    }

    safeLocalSet('viewMode', mode);
}
window.setViewMode = setViewMode;

// ========================================
// OPEN / CLOSED FINANCE MODE
// ========================================
function setFinanceMode(mode) {
    financeMode = mode;

    // Update toggle buttons
    document.querySelectorAll('.finance-mode-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.fmode === mode);
    });

    // Toggle Open Finance badge on page
    var badge = document.getElementById('openFinanceBadge');
    if (mode === 'open') {
        // Show Open Finance elements
        document.querySelectorAll('.open-finance-only').forEach(function(el) { el.style.display = ''; });
        document.querySelectorAll('.closed-finance-only').forEach(function(el) { el.style.display = 'none'; });
        // Badge removed – the Open/Closed Finance toggle in the header is sufficient
        if (badge) badge.remove();
    } else {
        // Show Closed Finance elements
        document.querySelectorAll('.open-finance-only').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('.closed-finance-only').forEach(function(el) { el.style.display = ''; });
        if (badge) badge.remove();
    }

    safeLocalSet('financeMode', mode);
}
window.setFinanceMode = setFinanceMode;

function applyViewMode() {
    if (viewMode === 'ao') {
        applyAOModus();
    } else if (viewMode === 'ecclesia') {
        if (typeof maklerModus !== 'undefined') maklerModus = true;
        if (typeof applyMaklerModus === 'function') applyMaklerModus();
    } else if (viewMode === 'mrh') {
        applyMRHModus();
    } else if (viewMode.indexOf('bank-') === 0) {
        applyBankModus(viewMode);
    }
}
window.applyViewMode = applyViewMode;

// Helper: hide all banking KPIs and tab content
function hideBankingElements() {
    ['bankRetailKpis','bankFkKpis','bankVwKpis'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    // Hide banking tab contents
    document.querySelectorAll('[id^="berater-tab-"]').forEach(function(el) {
        el.classList.remove('active');
    });
    // Hide banking tabs in header
    var headerTabs = document.querySelector('.agentur-page-new .agentur-header-tabs');
    if (headerTabs) {
        headerTabs.querySelectorAll('.agentur-tab-bank-retail, .agentur-tab-bank-fk, .agentur-tab-bank-vw').forEach(function(el) { el.style.display = 'none'; });
        headerTabs.querySelectorAll('.agentur-tab-divider.agentur-tab-bank-retail, .agentur-tab-divider.agentur-tab-bank-fk, .agentur-tab-divider.agentur-tab-bank-vw').forEach(function(el) { el.style.display = 'none'; });
    }
}

// Helper: hide all insurance KPIs and tab content
function hideInsuranceElements() {
    var privatKpis = document.querySelector('.agentur-page-new > .cockpit-kpis:not(#maklerKpis):not(#mrhKpis):not([id^="bank"])');
    if (privatKpis) privatKpis.style.display = 'none';
    var maklerKpis = document.getElementById('maklerKpis');
    if (maklerKpis) maklerKpis.style.display = 'none';
    var mrhKpis = document.getElementById('mrhKpis');
    if (mrhKpis) mrhKpis.style.display = 'none';
    var mrhBadges = document.getElementById('mrhSaeulenBadges');
    if (mrhBadges) mrhBadges.style.display = 'none';
    // Hide insurance tabs
    var headerTabs = document.querySelector('.agentur-page-new .agentur-header-tabs');
    if (headerTabs) {
        headerTabs.querySelectorAll('.agentur-tab:not(.agentur-tab-makler):not(.agentur-tab-mrh):not([class*="bank-"])').forEach(function(el) {
            el.style.display = 'none';
        });
        headerTabs.querySelectorAll('.agentur-tab-divider:not(.agentur-tab-makler):not(.agentur-tab-mrh):not([class*="bank-"])').forEach(function(el) {
            el.style.display = 'none';
        });
        headerTabs.querySelectorAll('.agentur-tab-makler').forEach(function(el) { el.style.display = 'none'; });
        headerTabs.querySelectorAll('.agentur-tab-mrh').forEach(function(el) { el.style.display = 'none'; });
    }
    // Hide insurance tab contents
    document.querySelectorAll('.makler-tab-content').forEach(function(el) { el.classList.remove('active'); });
    document.querySelectorAll('.mrh-tab-content').forEach(function(el) { el.classList.remove('active'); });
    // Hide insurance tab-* contents
    ['tab-uebersicht','tab-stammdaten','tab-neugeschaeft','tab-bestand','tab-storno','tab-provision','tab-qualitaet','tab-kundenliste','tab-potential','tab-kundenliste-makler','tab-kundenliste-mrh'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { el.classList.remove('active'); el.style.display = 'none'; }
    });
}

// Helper: show insurance tab content elements
function showInsuranceTabContents() {
    ['tab-uebersicht','tab-stammdaten','tab-neugeschaeft','tab-bestand','tab-storno','tab-provision','tab-qualitaet','tab-kundenliste','tab-potential'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = '';
    });
}

function applyAOModus() {
    if (typeof maklerModus !== 'undefined') maklerModus = false;

    // Hide banking elements
    hideBankingElements();

    // Show insurance tab content elements
    showInsuranceTabContents();

    // KPIs
    var privatKpis = document.querySelector('.agentur-page-new > .cockpit-kpis:not(#maklerKpis):not(#mrhKpis):not([id^="bank"])');
    var maklerKpis = document.getElementById('maklerKpis');
    var mrhKpis = document.getElementById('mrhKpis');
    var mrhBadges = document.getElementById('mrhSaeulenBadges');
    if (privatKpis) privatKpis.style.display = '';
    if (maklerKpis) maklerKpis.style.display = 'none';
    if (mrhKpis) mrhKpis.style.display = 'none';
    if (mrhBadges) mrhBadges.style.display = 'none';

    // Tabs: show AO, hide Makler + MRH + Banking
    var headerTabs = document.querySelector('.agentur-page-new .agentur-header-tabs');
    if (headerTabs) {
        headerTabs.querySelectorAll('.agentur-tab:not(.agentur-tab-makler):not(.agentur-tab-mrh):not([class*="bank-"])').forEach(function(el) {
            el.style.display = '';
        });
        headerTabs.querySelectorAll('.agentur-tab-divider:not(.agentur-tab-makler):not(.agentur-tab-mrh):not([class*="bank-"])').forEach(function(el) {
            el.style.display = '';
        });
        headerTabs.querySelectorAll('.agentur-tab-makler').forEach(function(el) { el.style.display = 'none'; });
        headerTabs.querySelectorAll('.agentur-tab-mrh').forEach(function(el) { el.style.display = 'none'; });
    }

    // Kundenlisten
    var privatListe = document.getElementById('tab-kundenliste');
    var maklerListe = document.getElementById('tab-kundenliste-makler');
    var mrhListe = document.getElementById('tab-kundenliste-mrh');
    if (privatListe) privatListe.style.display = '';
    if (maklerListe) { maklerListe.style.display = 'none'; maklerListe.classList.remove('active'); }
    if (mrhListe) { mrhListe.style.display = 'none'; mrhListe.classList.remove('active'); }

    // Hide MRH/Makler tab contents
    document.querySelectorAll('.makler-tab-content').forEach(function(el) { el.classList.remove('active'); });
    document.querySelectorAll('.mrh-tab-content').forEach(function(el) { el.classList.remove('active'); });

    // Header
    var titleEl = document.getElementById('agenturPageTitle');
    if (titleEl) titleEl.textContent = 'Agentur: Maria Musterfrau';
    var subtitleId = document.getElementById('agenturIdHeader');
    if (subtitleId) {
        var subtitleDiv = subtitleId.parentElement;
        subtitleDiv.innerHTML = '<span id="agenturIdHeader">VM00001</span> | <span id="agenturStatusHeader">Aktiv</span>';
    }
    // Remove subheadline
    var subheadline = document.getElementById('mrhSubheadline');
    if (subheadline) subheadline.style.display = 'none';

    // Photo
    var photoContainer = document.getElementById('agenturPhotoSmall');
    if (photoContainer && photoContainer._origHTML) {
        photoContainer.innerHTML = photoContainer._origHTML;
    }

    // Restore AO chat welcome message
    var chatBody = document.getElementById('agenturChatBody');
    if (chatBody && chatBody._origWelcomeHTML) {
        chatBody.innerHTML = chatBody._origWelcomeHTML;
    }

    if (typeof showAgenturTab === 'function') showAgenturTab('uebersicht');
}
window.applyAOModus = applyAOModus;

// ========================================
// BANKING MODUS (merged from B-02)
// ========================================
function applyBankModus(mode) {
    if (typeof maklerModus !== 'undefined') maklerModus = false;

    // Hide all insurance elements
    hideInsuranceElements();

    // Hide all banking KPIs first
    ['bankRetailKpis','bankFkKpis','bankVwKpis'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Show the correct banking KPIs
    var kpiMap = { 'bank-retail': 'bankRetailKpis', 'bank-fk': 'bankFkKpis', 'bank-vw': 'bankVwKpis' };
    var activeKpi = document.getElementById(kpiMap[mode]);
    if (activeKpi) activeKpi.style.display = '';

    // Tab class mapping
    var tabClassMap = { 'bank-retail': 'agentur-tab-bank-retail', 'bank-fk': 'agentur-tab-bank-fk', 'bank-vw': 'agentur-tab-bank-vw' };
    var headerTabs = document.querySelector('.agentur-page-new .agentur-header-tabs');
    if (headerTabs) {
        // Hide all banking tab sets
        Object.values(tabClassMap).forEach(function(cls) {
            headerTabs.querySelectorAll('.' + cls).forEach(function(el) { el.style.display = 'none'; });
        });
        // Show active banking tab set
        var activeCls = tabClassMap[mode];
        if (activeCls) {
            headerTabs.querySelectorAll('.' + activeCls).forEach(function(el) { el.style.display = ''; });
        }
    }

    // Update header
    var titleEl = document.getElementById('agenturPageTitle');
    if (titleEl) titleEl.textContent = 'Beraterin: Maria Musterfrau';
    var subtitleId = document.getElementById('agenturIdHeader');
    if (subtitleId) {
        var subtitleDiv = subtitleId.parentElement;
        subtitleDiv.innerHTML = '<span id="agenturIdHeader">VB-40210</span> | <span id="agenturStatusHeader">Aktiv</span>';
    }
    var subheadline = document.getElementById('mrhSubheadline');
    if (subheadline) subheadline.style.display = 'none';

    // Map internal mode to bankViewMode for B-02 JS functions
    var bankModeMap = { 'bank-retail': 'retail', 'bank-fk': 'firmenkunde', 'bank-vw': 'vermoegen' };
    if (typeof bankViewMode !== 'undefined') {
        bankViewMode = bankModeMap[mode] || 'retail';
    } else {
        window.bankViewMode = bankModeMap[mode] || 'retail';
    }

    // Fill banking data
    if (typeof fillBeraterKundenTable === 'function') fillBeraterKundenTable();
    if (typeof fillBeraterNeugeschaeft === 'function') fillBeraterNeugeschaeft();
    if (typeof fillBeraterWeiterePotentiale === 'function') fillBeraterWeiterePotentiale();

    // Show banking Übersicht tab
    if (typeof showBeraterTab === 'function') showBeraterTab('uebersicht');
}
window.applyBankModus = applyBankModus;


// ========================================
// MRH SPECIALTY ICONS
// ========================================
var mrhSpecialtyIcons = {
    maschinenbau: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    realEstate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15M9 9v.01M9 12v.01M9 15v.01M9 18v.01M17 9v.01M17 12v.01M17 15v.01M17 18v.01"/></svg>',
    kfzMotor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.28V16h3"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>',
    logistik: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    itHightech: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    healthcare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    rechtsanwaelte: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M12 3v18M3 7l9-4 9 4M3 7v4a9 9 0 009 9 9 9 0 009-9V7"/></svg>',
    bauHandwerk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M2 20h20M4 20V10l8-6 8 6v10"/><path d="M9 20v-6h6v6"/></svg>',
    eventsSport: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><path d="M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>',
    touristik: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
    fineArt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M17 3a2.83 2.83 0 014 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
    wiMA: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M20 6L9 17l-5-5"/></svg>',
    oepnv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M8 6v6M16 6v6M2 12h20M6 18h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zM6 18l-2 2M18 18l2 2"/></svg>',
    privatkunde: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
};


// ========================================
// MRH MOCK-KUNDEN (15+ aus 7+ Specialties)
// ========================================
var mrhKunden = [
    {
        name: 'Rhein-Main Maschinenbau GmbH', id: 'MRH-001', typ: 'B2B',
        specialty: 'Maschinenbau', specialtyClass: 'specialty-maschinenbau', specialtyIcon: mrhSpecialtyIcons.maschinenbau,
        branche: 'Sondermaschinenbau', mitarbeitende: 340, jahresumsatz: '78 Mio. EUR',
        standorte: 'Frankfurt, Hanau, Bratislava', gesellschaftsform: 'GmbH',
        eigentuemer: 'Familienbesitz (3. Generation)',
        keyContacts: ['CFO Markus Schäfer', 'Prokuristin Lisa Wendel (Einkauf)', 'BR-Vors. Jürgen Kalt'],
        beziehungsstatus: 'Bestand', beraterInsurance: 'Frank Moser', beraterBenefits: '—', beraterFinance: 'Nina Hecht',
        insurance: { praemie: 420000, praemieDisplay: '420.000 €', vertraege: 11, renewalDate: '01.04.2026', renewalStatus: 'gelb' },
        benefits: { aktiv: false, bavVolumen: '—', durchdringung: '0%', hinweis: 'Cross-Sell-Potential hoch (340 MA)' },
        finance: { aktiv: true, kreditvers: 'Euler Hermes (Obligo 12 Mio.)', avale: '2 Avale à 500k (Zurich)', leasing: 'CNC-Fräszentrum 1,4 Mio. in Pipeline', courtage: '45.000 €' },
        vertraegeDetail: [
            { sparte: 'Betriebshaftpflicht', versicherer: 'Allianz', praemie: 95000, ds: '1,8 Mio. €', ablauf: '01.04.2026', saeule: 'I' },
            { sparte: 'Sach/Feuer', versicherer: 'Zurich', praemie: 78000, ds: '45 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'Maschinenbruch', versicherer: 'HDI', praemie: 42000, ds: '8 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'D&O', versicherer: 'AIG', praemie: 28000, ds: '5 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'Cyber', versicherer: 'Hiscox', praemie: 35000, ds: '3 Mio. €', ablauf: '30.06.2026', saeule: 'I' },
            { sparte: 'Kfz-Flotte (38 Fzg.)', versicherer: 'Helvetia', praemie: 48000, ds: '—', ablauf: '01.01.2027', saeule: 'I' },
            { sparte: 'Kreditversicherung', versicherer: 'Euler Hermes', praemie: 38000, ds: '12 Mio. Obligo', ablauf: '31.12.2026', saeule: 'F' }
        ],
        schadenhistorie: [
            { jahr: 2025, beschreibung: 'Cyber-Vorfall (abgewehrt)', betrag: 22000 },
            { jahr: 2024, beschreibung: 'Haftpflicht Montageunfall', betrag: 95000 },
            { jahr: 2023, beschreibung: 'Maschinenbruch', betrag: 180000 }
        ],
        deckungsluecken: ['Produktrückruf nicht versichert (Export 25%)', 'Vertrauensschaden fehlt', 'Umwelthaftpflicht DS zu niedrig'],
        timeline: [
            { datum: '10.01.2026', saeule: 'insurance', text: 'Renewal-Gespräch BH vorbereitet', person: 'Frank Moser' },
            { datum: '15.12.2025', saeule: 'finance', text: 'CNC-Leasing-Anfrage eingegangen', person: 'Nina Hecht' },
            { datum: '20.11.2025', saeule: 'insurance', text: 'Cyber-Vorfall gemeldet & reguliert', person: 'Frank Moser' }
        ]
    },
    {
        name: 'Nordpark Projektentwicklung AG', id: 'MRH-003', typ: 'B2B',
        specialty: 'Real Estate', specialtyClass: 'specialty-real-estate', specialtyIcon: mrhSpecialtyIcons.realEstate,
        branche: 'Immobilienentwicklung', mitarbeitende: 45, jahresumsatz: '120 Mio. EUR (Projektvolumen)',
        standorte: 'Frankfurt, Wiesbaden', gesellschaftsform: 'AG (SDAX)', eigentuemer: 'Börsennotiert',
        keyContacts: ['Vorstand Kai Fischer', 'Risikomanagerin Dr. Anna Bergholz'],
        beziehungsstatus: 'Bestand', beraterInsurance: 'Thomas Bergmann', beraterBenefits: 'Katja Lurse', beraterFinance: 'Nina Hecht',
        insurance: { praemie: 680000, praemieDisplay: '680.000 €', vertraege: 9, renewalDate: '30.06.2026', renewalStatus: 'gruen' },
        benefits: { aktiv: true, bavVolumen: '1,2 Mio. €', durchdringung: 'Vorstand + leit. Angestellte', hinweis: 'U-Kasse über Heubeck' },
        finance: { aktiv: true, kreditvers: '—', avale: '8,5 Mio. (Vertragserfüllung, Gewährleistung)', leasing: '—', courtage: '120.000 €' },
        vertraegeDetail: [
            { sparte: 'Bauleistung (4 Projekte)', versicherer: 'Zurich', praemie: 280000, ds: '45 Mio. €', ablauf: 'projektbezogen', saeule: 'I' },
            { sparte: 'D&O', versicherer: 'AIG', praemie: 65000, ds: '10 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'Avale', versicherer: 'Zurich/R+V', praemie: 0, ds: '8,5 Mio. €', ablauf: 'projektbezogen', saeule: 'F' }
        ],
        schadenhistorie: [{ jahr: 2024, beschreibung: 'Bauverzögerung Mainufer HP-Schaden', betrag: 340000 }],
        deckungsluecken: ['Keine Fertigstellungsgarantie-Versicherung für Großprojekt'],
        timeline: [
            { datum: '08.01.2026', saeule: 'finance', text: 'Debt Advisory Projektfinanzierung 35 Mio. gestartet', person: 'Nina Hecht' },
            { datum: '15.11.2025', saeule: 'insurance', text: 'Bauleistungsversicherung neues Projekt abgeschlossen', person: 'Thomas Bergmann' }
        ]
    },
    {
        name: 'Hessenlog Spedition GmbH', id: 'MRH-005', typ: 'B2B',
        specialty: 'Logistik', specialtyClass: 'specialty-logistik', specialtyIcon: mrhSpecialtyIcons.logistik,
        branche: 'Stückgut/Lagerlogistik, 62 LKW', mitarbeitende: 210, jahresumsatz: '48 Mio. EUR',
        standorte: 'Frankfurt', gesellschaftsform: 'GmbH', eigentuemer: 'Familienbesitz',
        keyContacts: ['GF Thomas Ritter', 'Disponentin Sabine Kraft'],
        beziehungsstatus: 'Bestand', beraterInsurance: 'Frank Moser', beraterBenefits: '—', beraterFinance: 'Nina Hecht',
        insurance: { praemie: 280000, praemieDisplay: '280.000 €', vertraege: 6, renewalDate: '01.01.2027', renewalStatus: 'gruen' },
        benefits: { aktiv: false, bavVolumen: '—', durchdringung: '0%', hinweis: 'Hohe Fluktuation — einfaches Modell möglich' },
        finance: { aktiv: true, kreditvers: '—', avale: '—', leasing: '8 neue LKW (2,8 Mio.)', courtage: '28.000 €' },
        vertraegeDetail: [
            { sparte: 'Frachtführerhaftpflicht', versicherer: 'HDI', praemie: 65000, ds: '5 Mio. €', ablauf: '01.01.2027', saeule: 'I' },
            { sparte: 'Kfz-Flotte (62 LKW + 18 Trailer)', versicherer: 'Kravag', praemie: 120000, ds: '—', ablauf: '01.01.2027', saeule: 'I' },
            { sparte: 'Leasing 8 LKW', versicherer: 'FM LeasingPartner', praemie: 0, ds: '2,8 Mio.', ablauf: '31.12.2030', saeule: 'F' }
        ],
        schadenhistorie: [],
        deckungsluecken: ['Keine Ladungsversicherung für temperaturgeführte Transporte'],
        timeline: []
    },
    {
        name: 'DigiCore Solutions GmbH', id: 'MRH-007', typ: 'B2B',
        specialty: 'IT/Hightech', specialtyClass: 'specialty-it-hightech', specialtyIcon: mrhSpecialtyIcons.itHightech,
        branche: 'Software, Cloud, KI-Lösungen', mitarbeitende: 95, jahresumsatz: '18 Mio. EUR',
        standorte: 'Frankfurt', gesellschaftsform: 'GmbH', eigentuemer: 'Gründer 70%, Angel 30%',
        keyContacts: ['CEO Jan Richter', 'COO Maria Santos'],
        beziehungsstatus: 'Wachstum', beraterInsurance: 'Frank Moser', beraterBenefits: 'Katja Lurse', beraterFinance: '—',
        insurance: { praemie: 82000, praemieDisplay: '82.000 €', vertraege: 6, renewalDate: '31.12.2026', renewalStatus: 'gruen' },
        benefits: { aktiv: true, bavVolumen: '380.000 €', durchdringung: '78%', hinweis: 'P·LIVE aktiv, Recruiting-Instrument' },
        finance: { aktiv: false, kreditvers: 'SaaS-Forderungen in Prüfung', avale: '—', leasing: '—', courtage: '—' },
        vertraegeDetail: [
            { sparte: 'IT-Haftpflicht/E&O', versicherer: 'Markel', praemie: 32000, ds: '5 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'Cyber', versicherer: 'Hiscox', praemie: 18000, ds: '3 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'bAV (P·LIVE)', versicherer: 'Zurich', praemie: 0, ds: '380k Volumen', ablauf: 'unbefristet', saeule: 'B' }
        ],
        schadenhistorie: [],
        deckungsluecken: ['Keine IP-Schutzversicherung (Patent-Trolling bei KI-Produkten)'],
        timeline: [
            { datum: '03.01.2026', saeule: 'benefits', text: 'P·LIVE Jahresbericht erstellt — 78% Teilnahme', person: 'Katja Lurse' }
        ]
    },
    {
        name: 'Medicum Rhein-Main MVZ GmbH', id: 'MRH-008', typ: 'B2B',
        specialty: 'Healthcare', specialtyClass: 'specialty-healthcare', specialtyIcon: mrhSpecialtyIcons.healthcare,
        branche: 'MVZ, 8 Standorte, 22 Ärzte', mitarbeitende: 140, jahresumsatz: '—',
        standorte: '8 Standorte Rhein-Main', gesellschaftsform: 'GmbH', eigentuemer: 'Ärztegemeinschaft',
        keyContacts: ['Ärztl. Leitung Dr. Hoffmann', 'Verwaltungsleiterin Kirsten Bauer'],
        beziehungsstatus: 'Bestand', beraterInsurance: 'Thomas Bergmann', beraterBenefits: 'Katja Lurse', beraterFinance: 'Nina Hecht',
        insurance: { praemie: 165000, praemieDisplay: '165.000 €', vertraege: 6, renewalDate: '31.12.2026', renewalStatus: 'gruen' },
        benefits: { aktiv: true, bavVolumen: '890.000 €', durchdringung: 'Ärzte + Verwaltung', hinweis: 'Versorgungswerk-Optimierung' },
        finance: { aktiv: true, kreditvers: '—', avale: '—', leasing: 'Medizintechnik (MRT, CT) 3,2 Mio.', courtage: '48.000 €' },
        vertraegeDetail: [
            { sparte: 'Berufshaftpflicht Ärzte', versicherer: 'HDI', praemie: 72000, ds: '5 Mio. € p.P.', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'Leasing Medizintechnik', versicherer: 'FM LeasingPartner', praemie: 0, ds: '3,2 Mio.', ablauf: '31.12.2030', saeule: 'F' }
        ],
        schadenhistorie: [],
        deckungsluecken: ['Keine Vertrauensschadenversicherung (Abrechnungsbetrug-Risiko)'],
        timeline: []
    },
    {
        name: 'Hessenbau Generalunternehmer GmbH', id: 'MRH-013', typ: 'B2B',
        specialty: 'Bau/Handwerk', specialtyClass: 'specialty-bau-handwerk', specialtyIcon: mrhSpecialtyIcons.bauHandwerk,
        branche: 'Generalunternehmer, Wohn-/Gewerbebau', mitarbeitende: 160, jahresumsatz: '52 Mio. EUR',
        standorte: 'Frankfurt', gesellschaftsform: 'GmbH', eigentuemer: 'Familienbesitz',
        keyContacts: ['GF Ralf Schuster', 'Bauleiter-Team'],
        beziehungsstatus: 'Wachstum', beraterInsurance: 'Frank Moser', beraterBenefits: 'Katja Lurse', beraterFinance: 'Nina Hecht',
        insurance: { praemie: 290000, praemieDisplay: '290.000 €', vertraege: 9, renewalDate: '31.12.2026', renewalStatus: 'gruen' },
        benefits: { aktiv: true, bavVolumen: '320.000 €', durchdringung: 'Im Aufbau über Lurse', hinweis: 'Bindungsinstrument gewerbliche MA' },
        finance: { aktiv: true, kreditvers: '—', avale: '4,2 Mio. (Vertragserfüllung, Gewährleistung)', leasing: 'Baumaschinen 1,8 Mio.', courtage: '65.000 €' },
        vertraegeDetail: [
            { sparte: 'Bauwesenversicherung', versicherer: 'Zurich', praemie: 85000, ds: '25 Mio. €', ablauf: 'projektbezogen', saeule: 'I' },
            { sparte: 'Betriebshaftpflicht Bau', versicherer: 'HDI', praemie: 62000, ds: '10 Mio. €', ablauf: '31.12.2026', saeule: 'I' },
            { sparte: 'Avale', versicherer: 'R+V', praemie: 0, ds: '4,2 Mio.', ablauf: 'projektbezogen', saeule: 'F' },
            { sparte: 'Leasing Baumaschinen', versicherer: 'FM LeasingPartner', praemie: 0, ds: '1,8 Mio.', ablauf: '31.12.2029', saeule: 'F' }
        ],
        schadenhistorie: [],
        deckungsluecken: ['Keine Baufertigstellungsversicherung > 10 Mio.'],
        timeline: [
            { datum: '08.01.2026', saeule: 'benefits', text: 'bAV-Aufbau Phase 2 gestartet', person: 'Katja Lurse' }
        ]
    },
    {
        name: 'Rhein-Main Verkehr GmbH', id: 'MRH-015', typ: 'B2B',
        specialty: 'ÖPNV/SPNV', specialtyClass: 'specialty-oepnv-spnv', specialtyIcon: mrhSpecialtyIcons.oepnv,
        branche: 'ÖPNV, 180 Busse, 3 Straßenbahnlinien', mitarbeitende: 620, jahresumsatz: '95 Mio. EUR',
        standorte: 'Frankfurt', gesellschaftsform: 'GmbH', eigentuemer: 'Kommunal',
        keyContacts: ['Vorstand Klaus Wendt', 'Abt.leit. Versicherung Maria Engel'],
        beziehungsstatus: 'Bestand', beraterInsurance: 'Thomas Bergmann', beraterBenefits: 'Katja Lurse', beraterFinance: 'Nina Hecht',
        insurance: { praemie: 1450000, praemieDisplay: '1,45 Mio. €', vertraege: 8, renewalDate: '01.07.2026', renewalStatus: 'gelb' },
        benefits: { aktiv: true, bavVolumen: '4,8 Mio. €', durchdringung: '620 MA (ZVK + Aufstockung)', hinweis: 'Heubeck-Gutachten jährlich' },
        finance: { aktiv: true, kreditvers: '—', avale: '—', leasing: '20 E-Busse (9,5 Mio.)', courtage: '142.000 €' },
        vertraegeDetail: [
            { sparte: 'Kfz-Flotte (180 Busse + 45 Bahn)', versicherer: 'Kravag/Allianz', praemie: 680000, ds: '—', ablauf: '01.07.2026', saeule: 'I' },
            { sparte: 'Betriebshaftpflicht ÖPNV', versicherer: 'HDI', praemie: 320000, ds: '25 Mio. €', ablauf: '01.07.2026', saeule: 'I' },
            { sparte: 'bAV (ZVK + Aufstockung)', versicherer: 'Heubeck/Allianz', praemie: 0, ds: '4,8 Mio. Volumen', ablauf: 'unbefristet', saeule: 'B' },
            { sparte: 'Leasing 20 E-Busse', versicherer: 'FM LeasingPartner', praemie: 0, ds: '9,5 Mio.', ablauf: '31.12.2033', saeule: 'F' }
        ],
        schadenhistorie: [
            { jahr: 2025, beschreibung: 'Kollision Bus/PKW — Personenschaden', betrag: 85000 },
            { jahr: 2024, beschreibung: 'Vandalismus an 3 Haltestellen', betrag: 42000 }
        ],
        deckungsluecken: ['Keine Betriebsunterbrechung für Cyberangriff auf Leittechnik'],
        timeline: [
            { datum: '15.01.2026', saeule: 'finance', text: 'E-Bus-Leasing Tranche 2 in Verhandlung', person: 'Nina Hecht' },
            { datum: '10.01.2026', saeule: 'insurance', text: 'Renewal-Vorbereitung Flotte/BH gestartet', person: 'Thomas Bergmann' },
            { datum: '01.12.2025', saeule: 'benefits', text: 'Heubeck-Gutachten 2025 abgeschlossen', person: 'Katja Lurse' }
        ]
    }
];


// ========================================
// APPLY MRH MODUS
// ========================================
function applyMRHModus() {
    // Hide banking elements
    hideBankingElements();
    showInsuranceTabContents();

    // KPIs
    var privatKpis = document.querySelector('.agentur-page-new > .cockpit-kpis:not(#maklerKpis):not(#mrhKpis):not([id^="bank"])');
    var maklerKpis = document.getElementById('maklerKpis');
    var mrhKpis = document.getElementById('mrhKpis');
    var mrhBadges = document.getElementById('mrhSaeulenBadges');
    if (privatKpis) privatKpis.style.display = 'none';
    if (maklerKpis) maklerKpis.style.display = 'none';
    if (mrhKpis) mrhKpis.style.display = '';
    if (mrhBadges) mrhBadges.style.display = 'none';

    // Tabs: hide AO + Makler, show MRH
    var headerTabs = document.querySelector('.agentur-page-new .agentur-header-tabs');
    if (headerTabs) {
        headerTabs.querySelectorAll('.agentur-tab:not(.agentur-tab-makler):not(.agentur-tab-mrh)').forEach(function(el) {
            el.style.display = 'none';
        });
        headerTabs.querySelectorAll('.agentur-tab-divider:not(.agentur-tab-makler):not(.agentur-tab-mrh)').forEach(function(el) {
            el.style.display = 'none';
        });
        headerTabs.querySelectorAll('.agentur-tab-makler').forEach(function(el) { el.style.display = 'none'; });
        headerTabs.querySelectorAll('.agentur-tab-mrh').forEach(function(el) {
            el.style.display = el.classList.contains('agentur-tab-divider') ? 'block' : '';
        });
    }

    // Kundenlisten
    var privatListe = document.getElementById('tab-kundenliste');
    var maklerListe = document.getElementById('tab-kundenliste-makler');
    var mrhListe = document.getElementById('tab-kundenliste-mrh');
    if (privatListe) privatListe.style.display = 'none';
    if (maklerListe) { maklerListe.style.display = 'none'; maklerListe.classList.remove('active'); }
    if (mrhListe) mrhListe.style.display = '';

    // Hide AO + Makler tab contents
    document.querySelectorAll('.agentur-tab-content').forEach(function(el) { el.classList.remove('active'); });
    document.querySelectorAll('.makler-tab-content').forEach(function(el) { el.classList.remove('active'); });
    if (privatListe) privatListe.style.display = 'none';

    // Header
    var titleEl = document.getElementById('agenturPageTitle');
    if (titleEl) titleEl.textContent = 'Niederlassung Rhein-Main';
    var subtitleId = document.getElementById('agenturIdHeader');
    if (subtitleId) {
        var subtitleDiv = subtitleId.parentElement;
        subtitleDiv.innerHTML = '<span id="agenturIdHeader">Gewerbemakler 360°</span>';
    }

    // Photo: modern office icon with 360° badge
    var photoContainer = document.getElementById('agenturPhotoSmall');
    if (photoContainer) {
        if (!photoContainer._origHTML) photoContainer._origHTML = photoContainer.innerHTML;
        photoContainer.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" width="22" height="22" style="margin:auto;display:block;"><path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15"/><circle cx="18" cy="8" r="3" fill="rgba(134,188,37,0.8)" stroke="none"/><text x="18" y="9.5" text-anchor="middle" font-size="4" fill="white" stroke="none" font-weight="bold">360</text></svg>';
    }

    // Reset chat welcome message for MRH mode
    var chatBody = document.getElementById('agenturChatBody');
    if (chatBody) {
        // Save original AO welcome if not yet saved
        if (!chatBody._origWelcomeHTML) chatBody._origWelcomeHTML = chatBody.innerHTML;
        chatBody.innerHTML =
            '<div class="agentur-chat-welcome">' +
                '<h4>Gewerbemakler 360° Assistent</h4>' +
                '<p>Fragen Sie mich zu Kunden, Renewals, Bestand oder Potentialen.</p>' +
                '<div class="welcome-examples">' +
                    '<button class="example-btn" onclick="askAgenturQuestion(\'Welche Renewals stehen im Q2 an?\')">Q2 Renewals</button>' +
                    '<button class="example-btn" onclick="showNeuePotentiale()">Neue Potentiale</button>' +
                    '<button class="example-btn" onclick="askAgenturQuestion(\'Zeige Bestandsübersicht\')">Bestand</button>' +
                '</div>' +
            '</div>';
    }

    // Show MRH Übersicht as default
    showMRHTab('uebersicht');
}
window.applyMRHModus = applyMRHModus;
window.__registerModule('mrh-trowe-modes.js');
