/**
 * Bestandsübertragung - ESM Entry Point
 * Lädt alle Module und initialisiert die Anwendung
 */

// Re-export aller Module für externe Verwendung
export * as Storage from './storage.js';
export * as Extractor from './extractor.js';
export * as Matcher from './matcher.js';
export * as DemoData from './demo-data.js';
export * as Export from './export.js';
export * as UI from './ui.js';
export * as App from './app.js';

// Import für Initialisierung
import { init, refreshData } from './app.js';
import * as Storage from './storage.js';
import * as UI from './ui.js';
import * as Export from './export.js';
import * as DemoData from './demo-data.js';
import * as Matcher from './matcher.js';
import * as Extractor from './extractor.js';

/**
 * Initialisiert die Bestandsübertragung-Anwendung
 */
export function initBestandApp() {
    init();
}

// Auto-Initialisierung wenn DOM bereit
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM ist bereits geladen
    init();
}

// Globale Exports für Kompatibilität mit bestehenden Scripts
if (typeof window !== 'undefined') {
    window.BestandApp = { init, refreshData };
    window.initBestandApp = init;

    // Legacy-Kompatibilität: Module als globale Variablen
    window.Storage = Storage;
    window.UI = UI;
    window.Export = Export;
    window.DemoData = DemoData;
    window.Matcher = Matcher;
    window.Extractor = Extractor;
}

export default {
    init,
    refreshData,
    Storage,
    UI,
    Export,
    DemoData,
    Matcher,
    Extractor
};
