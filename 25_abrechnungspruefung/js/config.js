/**
 * Alpha Provisionsanalyse-System - Configuration
 * ==============================================
 * Zentrale Konfigurationsdatei für alle Konstanten und Einstellungen
 */

const CONFIG = {
  // OpenAI API Configuration
  OPENAI: {
    BASE_URL: 'https://api.openai.com/v1',
    MODELS: {
      PRIMARY: 'gpt-4o',  // Changed from gpt-5 to gpt-4o (currently available)
      FALLBACK: ['gpt-4-turbo', 'gpt-4'],
    },
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.2, // Niedrig für präzise Analysen
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // ms
    TIMEOUT: 60000, // 60 seconds
  },

  // Rate Limiting
  RATE_LIMIT: {
    MAX_CONCURRENT: 5,
    MAX_PER_MINUTE: 50,
    DELAY_BETWEEN_REQUESTS: 100, // ms
  },

  // File Upload Configuration
  UPLOAD: {
    MAX_FILES: 100,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
    ACCEPTED_TYPES: ['application/pdf'],
    ACCEPTED_EXTENSIONS: ['.pdf'],
  },

  // IndexedDB Configuration
  DATABASE: {
    NAME: 'AlphaProvisionsDB_v3_fresh', // Neuer Name um Blocking zu vermeiden
    VERSION: 6, // Version 6: Vollständige AI-Integration - Transaction-Level Anomalieerkennung
    STORES: {
      ABRECHNUNGEN: 'abrechnungen',
      AGENTUREN: 'agenturen',
      TRANSAKTIONEN: 'transaktionen',
    },
  },

  // Analysis Configuration
  ANALYSIS: {
    HISTORICAL_MONTHS: 12, // Anzahl historischer Monate für Vergleich
    RISK_THRESHOLDS: {
      GREEN_MAX: 1,
      YELLOW: 2,
      ORANGE: 3,
      RED_MIN: 4,
    },
    DEVIATION_THRESHOLDS: {
      PROVISION_PERCENT: 20, // % Abweichung als auffällig
      STORNO_POINTS: 5, // Prozentpunkte Erhöhung als auffällig
    },
  },

  // Cost Estimation (per analysis)
  COSTS: {
    GPT_5: {
      INPUT_TOKEN_PRICE: 0.000005,
      OUTPUT_TOKEN_PRICE: 0.000015,
      AVG_COST_PER_ANALYSIS: 0.03,
    },
    GPT_4O: {
      INPUT_TOKEN_PRICE: 0.0000025,
      OUTPUT_TOKEN_PRICE: 0.00001,
      AVG_COST_PER_ANALYSIS: 0.015,
    },
    GPT_4_TURBO: {
      INPUT_TOKEN_PRICE: 0.00001,
      OUTPUT_TOKEN_PRICE: 0.00003,
      AVG_COST_PER_ANALYSIS: 0.02,
    },
  },

  // UI Configuration
  UI: {
    TOAST_DURATION: 5000, // ms
    PROGRESS_UPDATE_INTERVAL: 500, // ms
    ANIMATION_DURATION: 300, // ms
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    API_KEY: 'alpha_openai_api_key',
    SETTINGS: 'alpha_settings',
    THEME: 'alpha_theme',
  },

  // Branchenbenchmarks für Provisionen
  BENCHMARKS: {
    PROVISION_RATES: {
      leben: { min: 0.03, max: 0.05, name: 'Leben' },
      sach: { min: 0.10, max: 0.15, name: 'Sach' },
      kranken: { min: 0.04, max: 0.08, name: 'Kranken' },
      kfz: { min: 0.12, max: 0.18, name: 'Kfz' },
    },
    STORNO_RATES: {
      NORMAL_MAX: 10, // %
      WARNING_THRESHOLD: 12, // %
      CRITICAL_THRESHOLD: 15, // %
    },
    NEUGESCHAEFT_BESTAND_RATIO: {
      MIN: 0.25, // 25%
      MAX: 0.45, // 45%
    },
  },

  // PDF Parsing Patterns
  PATTERNS: {
    AGENTUR_ID: /(?:Agentur|AG|ID)[\s:]*(\d{3,})/i,
    PERIODE: /(\d{1,2})\/(\d{4})|(\d{4})-(\d{2})|Q([1-4])\/(\d{4})/i,
    BETRAG: /(?:EUR|€)?\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g,
    PROZENT: /(\d{1,3}(?:,\d{1,2})?)\s*%/g,
  },

  // Demo Configuration
  DEMO: {
    ENABLED: true,
    PROCESSING_DELAY: 1500, // ms - simulierte Verarbeitungsdauer
  },

  // Error Messages
  ERRORS: {
    NO_API_KEY: 'Bitte konfigurieren Sie zuerst Ihren OpenAI API-Key.',
    INVALID_API_KEY: 'Der API-Key ist ungültig. Bitte überprüfen Sie Ihre Eingabe.',
    FILE_TOO_LARGE: 'Datei ist zu groß. Maximum: 10MB',
    INVALID_FILE_TYPE: 'Nur PDF-Dateien sind erlaubt.',
    TOO_MANY_FILES: 'Maximale Anzahl von 100 Dateien überschritten.',
    NETWORK_ERROR: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
    RATE_LIMIT: 'API-Rate-Limit erreicht. Bitte warten Sie einen Moment.',
    PARSING_ERROR: 'Fehler beim Lesen der PDF-Datei.',
    DATABASE_ERROR: 'Fehler beim Zugriff auf die Datenbank.',
  },

  // Success Messages
  SUCCESS: {
    API_KEY_SAVED: 'API-Key erfolgreich gespeichert.',
    API_KEY_VALID: 'API-Key ist gültig und funktioniert.',
    ANALYSIS_COMPLETE: 'Analyse erfolgreich abgeschlossen.',
    EXPORT_COMPLETE: 'Export erfolgreich erstellt.',
    IMPORT_COMPLETE: 'Daten erfolgreich importiert.',
    DATABASE_CLEARED: 'Alle Daten wurden gelöscht.',
  },
};

// Utility Functions
const UTILS = {
  /**
   * Formatiert Währungsbeträge
   */
  formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Formatiert große Zahlen mit Tausendertrennzeichen
   */
  formatNumber(value) {
    return new Intl.NumberFormat('de-DE').format(value);
  },

  /**
   * Formatiert Prozentangaben
   */
  formatPercent(value, decimals = 1) {
    return new Intl.NumberFormat('de-DE', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  },

  /**
   * Formatiert Provision mit MB-Angabe für KV-Verträge
   */
  formatProvision(txn) {
    const provisionProzent = txn.provision_prozent || 0;

    // Bei KV-Verträgen: Berechne und zeige Monatsbeiträge an
    if (txn.produkt_typ === 'KV' && txn.jahresbeitrag && txn.betrag) {
      const monatsbeitrag = txn.jahresbeitrag / 12;
      const anzahlMB = Math.round((txn.betrag / monatsbeitrag) * 10) / 10;
      return `${provisionProzent}% (${anzahlMB} MB)`;
    }

    // Bei allen anderen Produkten: Nur Prozentsatz
    return `${provisionProzent}%`;
  },

  /**
   * Formatiert Datum
   */
  formatDate(date, format = 'short') {
    const d = new Date(date);
    if (format === 'short') {
      return new Intl.DateTimeFormat('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);
    } else if (format === 'long') {
      return new Intl.DateTimeFormat('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    }
    return d.toISOString();
  },

  /**
   * Formatiert Dateigröße
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Generiert eindeutige ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Bereinigt Zahlenwerte aus deutschen Formaten
   */
  parseGermanNumber(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    // Entferne Tausenderpunkte und ersetze Komma durch Punkt
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
  },

  /**
   * Extrahiert Agentur-ID aus Dateiname oder Text
   */
  extractAgenturId(text) {
    const match = text.match(CONFIG.PATTERNS.AGENTUR_ID);
    return match ? match[1] : null;
  },

  /**
   * Extrahiert Periode aus Text
   */
  extractPeriode(text) {
    const match = text.match(CONFIG.PATTERNS.PERIODE);
    if (!match) return null;

    if (match[1] && match[2]) {
      // MM/YYYY Format
      return `${match[2]}-${match[1].padStart(2, '0')}`;
    } else if (match[3] && match[4]) {
      // YYYY-MM Format
      return `${match[3]}-${match[4]}`;
    } else if (match[5] && match[6]) {
      // Q1/YYYY Format
      const quarter = parseInt(match[5]);
      const month = (quarter * 3).toString().padStart(2, '0');
      return `${match[6]}-${month}`;
    }
    return null;
  },

  /**
   * Berechnet Risiko-Kategorie aus Score
   */
  getRiskCategory(score) {
    const thresholds = CONFIG.ANALYSIS.RISK_THRESHOLDS;
    if (score <= thresholds.GREEN_MAX) return 'gruen';
    if (score === thresholds.YELLOW) return 'gelb';
    if (score === thresholds.ORANGE) return 'orange';
    return 'rot';
  },

  /**
   * Berechnet Risiko-Farbe
   */
  getRiskColor(category) {
    const colors = {
      gruen: '#10B981',
      gelb: '#F59E0B',
      orange: '#F97316',
      rot: '#EF4444',
    };
    return colors[category] || '#6B7280';
  },

  /**
   * Validiert API-Key Format (unterstützt alle OpenAI-Formate)
   */
  isValidApiKey(key) {
    // Alte Format: sk-[32+ chars]
    // Neue Format: sk-proj-[chars mit Unterstrichen]
    // Service Account: sk-svcacct-[chars]
    // Org-spezifisch: sk-[org-id]-[chars]
    // Erlaubt: Buchstaben, Zahlen, Bindestriche UND Unterstriche
    return /^sk-[a-zA-Z0-9\-_]{20,}$/.test(key);
  },

  /**
   * Verschlüsselt API-Key für localStorage (einfache XOR)
   */
  encryptApiKey(key) {
    const salt = 'alpha-provisions-key-2025';
    return btoa(key.split('').map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ salt.charCodeAt(i % salt.length))
    ).join(''));
  },

  /**
   * Entschlüsselt API-Key
   */
  decryptApiKey(encrypted) {
    const salt = 'alpha-provisions-key-2025';
    try {
      return atob(encrypted).split('').map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ salt.charCodeAt(i % salt.length))
      ).join('');
    } catch (e) {
      return null;
    }
  },

  /**
   * Wartet für angegebene Millisekunden
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Debounce-Funktion
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle-Funktion
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
};

// Export für Verwendung in anderen Modulen
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, UTILS };
}
