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
export * as AIProcessor from './ai-processor.js';
export * as AILanding from './ai-landing.js';
export * as SlidePptxExport from './slide-pptx-export.js';

// Import für Initialisierung
import { init, refreshData } from './app.js';
import * as Storage from './storage.js';
import * as UI from './ui.js';
import * as Export from './export.js';
import * as DemoData from './demo-data.js';
import * as Matcher from './matcher.js';
import * as Extractor from './extractor.js';
import * as AIProcessor from './ai-processor.js';
import * as AILanding from './ai-landing.js';
import './slide-pptx-export.js';

/**
 * Initialisiert die Bestandsübertragung-Anwendung
 */
export function initBestandApp() {
    init();
    AILanding.init();
}

// Keine Auto-Initialisierung: die Anwendung wird erst initialisiert,
// wenn openBestandsuebertragung() in landing.js window.initBestandApp() aufruft.
// Die HTML-Struktur wird per fetch() lazy-loaded.

// Globale Exports für Kompatibilität mit bestehenden Scripts
if (typeof window !== 'undefined') {
    window.BestandApp = { init, refreshData };
    window.initBestandApp = initBestandApp;

    // Legacy-Kompatibilität: Module als globale Variablen
    window.Storage = Storage;
    window.UI = UI;
    window.Export = Export;
    window.DemoData = DemoData;
    window.Matcher = Matcher;
    window.Extractor = Extractor;
    window.AIProcessor = AIProcessor;
    window.AILanding = AILanding;
}

export default {
    init,
    refreshData,
    Storage,
    UI,
    Export,
    DemoData,
    Matcher,
    Extractor,
    AIProcessor,
    AILanding
};
