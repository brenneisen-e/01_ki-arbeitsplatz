// js/load-order.js - Modul-Ladereihenfolge Manifest & Validierung
// MUSS als ERSTES Script geladen werden (vor allen anderen JS-Dateien)

window.__LOAD_ORDER = [
    'config.js', 'utils.js', 'data.js',
    'charts.js', 'tables.js', 'map-counties.js', 'main.js',
    'chat.js',
    'agentur-overview-core.js', 'agentur-overview-tables.js',
    'agentur-overview-features.js', 'agentur-overview-banking.js', 'agentur-overview-banking-detail.js',
    'router.js',
    'landing-core.js', 'landing-chat.js', 'landing-regions.js',
    'landing-modules.js', 'landing-data.js', 'landing-upload.js',
    'nps-display.js',
    'kunden-detail-core.js', 'kunden-detail-data.js',
    'kunden-detail-features.js', 'kunden-detail-komm.js', 'kunden-detail-impulse.js',
    'kunden-detail-banking.js', 'kunden-detail-banking-features.js',
    'clv.js', 'bezahlen.js', 'potentiale.js', 'quellen-clustering.js', 'kommunikation-display.js', 'autocomplete.js',
    'user-mode.js', 'makler-modus.js', 'makler-kunden.js', 'makler-b2b.js', 'makler-overview.js',
    'mrh-trowe-modes.js', 'mrh-trowe-render.js', 'mrh-trowe-detail.js',
    'screen-recorder.js', 'screenshot.js',
    'sales-report.js', 'finanzplanung.js',
    'banken-feedback.js', 'banken-module.js', 'banken-dashboard.js',
    'banken-customer-detail.js', 'banken-customer-detail2.js',
    'banken-actions.js', 'banken-charts.js', 'banken-activities.js',
    'banken-scanner-crm.js', 'banken-export.js', 'banken-config-pdf.js', 'banken-chat.js',
    'asset-management.js', 'am-prod-mode.js',
    'risikoscoring-data.js', 'risikoscoring-ui.js',
    'provisionssimulation.js', 'bgav-umstellung.js',
    'hr-pipeline-core.js', 'hr-pipeline-bewerber.js',
    'hr-pipeline-arbeitgeber.js', 'hr-pipeline-overlays.js',
    'hc-cockpit-data.js', 'hc-cockpit-ui.js',
    'versicherungs-1x1.js',
    'page-id-tracker.js', 'speaker-notes.js',
    'guided-tour.js'
];

window.__LOADED = [];

window.__registerModule = function(name) {
    window.__LOADED.push(name);
};

document.addEventListener('DOMContentLoaded', function() {
    var missing = window.__LOAD_ORDER.filter(function(m) {
        return window.__LOADED.indexOf(m) === -1;
    });
    if (missing.length) {
        console.warn('[Load-Order] Nicht geladene Module:', missing);
    }
});
