# ES6 Module Migration Strategy

## Grundprinzip
**"Funktion = heilig. Keine Features brechen."**

Diese Strategie ermöglicht eine schrittweise Migration zu ES6-Modulen,
während 100% Abwärtskompatibilität gewährleistet bleibt.

---

## PHASE 0: Vorbereitung (KRITISCH!)

### 0.1 Backup erstellen
```bash
git checkout -b backup/pre-es6-migration
git push origin backup/pre-es6-migration
```

### 0.2 Test-Suite vorbereiten
Bevor IRGENDEINE Änderung gemacht wird:
1. Manuelle Feature-Checkliste durchgehen (FEATURE_CHECKLIST.md)
2. Screenshots aller Seiten erstellen
3. Alle interaktiven Features dokumentieren

### 0.3 Dual-Mode-Architektur verstehen

Das Projekt wird in einer **Übergangsphase** sowohl:
- Alte Script-Tags (globale Variablen)
- Neue ES6-Module (import/export)

unterstützen. Dies wird durch "Bridge Files" erreicht.

---

## PHASE 1: Foundation Layer (Niedrigstes Risiko)

### 1.1 Neue Modul-Dateien erstellen (NICHT die alten ersetzen!)

**Schritt 1:** Erstelle `js/modules/` Verzeichnis

**Schritt 2:** Erstelle Bridge-Dateien die BEIDE Systeme unterstützen

```javascript
// js/modules/config.esm.js
// ESM Version - exportiert alles

export const kpiDefinitions = [...]; // Kopie aus config.js
export const bundeslandData = {...};
export const segmentFactors = {...};
// ... alle anderen Exporte

// Am Ende: Globale Variablen für Abwärtskompatibilität setzen
if (typeof window !== 'undefined') {
    window.kpiDefinitions = kpiDefinitions;
    window.bundeslandData = bundeslandData;
    // ... etc
}
```

**Schritt 3:** Originale Dateien BEHALTEN (nicht löschen!)

Die `js/config.js` bleibt unverändert und wird weiterhin per Script-Tag geladen.
Die neue `js/modules/config.esm.js` kann parallel von neuen Modulen importiert werden.

---

## PHASE 2: Utility Functions (Niedriges Risiko)

### 2.1 utils.js → utils.esm.js

```javascript
// js/modules/utils.esm.js

export function formatValue(value, unit) {
    // Exakte Kopie aus utils.js
}

export function getMonthName(monthNum) {
    // Exakte Kopie aus utils.js
}

export function parseCSV(csvText) {
    // Exakte Kopie aus utils.js
}

export function toggleDropdown(dropdownId) {
    // Exakte Kopie aus utils.js
}

export function waitForLibraries(callback) {
    // Exakte Kopie aus utils.js
}

// Bridge für globale Variablen
if (typeof window !== 'undefined') {
    window.formatValue = formatValue;
    window.getMonthName = getMonthName;
    window.parseCSV = parseCSV;
    window.toggleDropdown = toggleDropdown;
    window.waitForLibraries = waitForLibraries;
}
```

### 2.2 Testprozedur nach jedem Schritt

1. Lade index.html im Browser
2. Öffne Developer Console - KEINE Errors erlaubt
3. Teste alle KPIs werden angezeigt
4. Teste Filter funktionieren
5. Teste Chat öffnet sich

---

## PHASE 3: Data Layer (Mittleres Risiko)

### 3.1 State Management Modul

```javascript
// js/modules/state.esm.js

// Zentraler State
export const state = {
    filters: {
        year: '2025',
        silo: 'alle',
        segments: ['alle'],
        products: ['alle'],
        agentur: 'alle'
    },
    selectedStates: new Set(),
    selectedCounties: new Set(),
    selectedAgenturen: new Set(),
    charts: {},
    fullscreenChart: null,
    useUploadedData: false,
    uploadedData: null,
    timeNavigation: {},
    currentView: 'dashboard',
    currentTableView: 'bundeslaender',
    selectedAgentur: null,
    tableSort: {
        column: null,
        direction: 'asc'
    }
};

// Daily data store
export let dailyRawData = null;

export function setDailyRawData(data) {
    dailyRawData = data;
    // Bridge für globale Variable
    if (typeof window !== 'undefined') {
        window.dailyRawData = data;
    }
}

// Bridge für globale Variablen
if (typeof window !== 'undefined') {
    window.state = state;
}
```

### 3.2 Data Functions Modul

```javascript
// js/modules/data-functions.esm.js

import { state, dailyRawData } from './state.esm.js';
import { kpiDefinitions } from './config.esm.js';

export function aggregateDailyToMonthly(dailyData) {
    // Exakte Kopie aus data.js
}

export function getFilteredData() {
    // Exakte Kopie aus data.js
}

export function getAgenturen() {
    // Exakte Kopie aus data.js
}

// ... alle anderen Funktionen

// Bridge
if (typeof window !== 'undefined') {
    window.aggregateDailyToMonthly = aggregateDailyToMonthly;
    window.getFilteredData = getFilteredData;
    window.getAgenturen = getAgenturen;
    // ... etc
}
```

---

## PHASE 4: UI Components (Höheres Risiko)

### 4.1 Charts Modul

```javascript
// js/modules/charts.esm.js

import { state } from './state.esm.js';
import { formatValue } from './utils.esm.js';
import { kpiDefinitions } from './config.esm.js';
import { getFilteredData } from './data-functions.esm.js';

let currentFullscreenKpiId = null;

export function createChart(kpiId, data, view, kpi, timeRange, offset) {
    // Exakte Kopie aus charts.js
}

export function navigateTime(kpiId, direction) {
    // Exakte Kopie
}

// ... alle anderen Funktionen

// Bridge
if (typeof window !== 'undefined') {
    window.createChart = createChart;
    window.navigateTime = navigateTime;
    // ... etc
}
```

### 4.2 Entry Point erstellen

```javascript
// js/modules/main.esm.js - NEUER Entry Point

// Importiere alle Module
import './config.esm.js';
import './utils.esm.js';
import './state.esm.js';
import './data-functions.esm.js';
import './charts.esm.js';
// ... etc

console.log('ES6 Modules loaded successfully');
```

---

## PHASE 5: HTML Integration

### 5.1 Dual-Load Strategie in index.html

```html
<!-- ALTE Script-Tags (BEHALTEN!) -->
<script src="js/config.js"></script>
<script src="js/utils.js"></script>
<script src="js/data.js"></script>
<!-- ... alle anderen -->

<!-- NEUE ES6 Module (ZUSÄTZLICH!) -->
<script type="module" src="js/modules/main.esm.js"></script>
```

### 5.2 Feature Detection

```javascript
// Am Anfang von main.esm.js
if (!('noModule' in HTMLScriptElement.prototype)) {
    console.warn('ES6 Modules not supported, falling back to global scripts');
}
```

### 5.3 Graceful Degradation

Alte Browser ohne ES6-Support nutzen weiterhin die globalen Script-Tags.
Moderne Browser laden zusätzlich die ES6-Module.

---

## PHASE 6: Schrittweise Migration (OPTIONAL)

### 6.1 Nachdem alles funktioniert: Alte Scripts entfernen

**NUR wenn die ES6-Module 100% getestet sind:**

1. Entferne alte Script-Tags aus index.html
2. Entferne Bridge-Code aus ESM-Dateien
3. Lösche alte JS-Dateien

### 6.2 Reihenfolge der Löschung

1. utils.js → Testen → Commit
2. config.js → Testen → Commit
3. data.js → Testen → Commit
4. charts.js → Testen → Commit
5. tables.js → Testen → Commit
6. main.js → Testen → Commit
7. chat.js → Testen → Commit
8. landing.js → Testen → Commit
9. Modul-spezifische Dateien

---

## DATEIEN-ZUORDNUNG

### Neue Modul-Struktur

```
js/
├── modules/                    # NEU: ES6 Module
│   ├── config.esm.js          # KPI-Definitionen, Faktoren
│   ├── utils.esm.js           # Utility-Funktionen
│   ├── state.esm.js           # State Management
│   ├── data-functions.esm.js  # Datenzugriff
│   ├── charts.esm.js          # Chart-Rendering
│   ├── tables.esm.js          # Tabellen-Logik
│   ├── map.esm.js             # Karten-Logik
│   ├── chat.esm.js            # Chat-Widget
│   ├── landing.esm.js         # Landing Page
│   └── main.esm.js            # Entry Point
│
├── modules/features/           # Feature-Module
│   ├── banken.esm.js
│   ├── risikoscoring.esm.js
│   ├── bestandsuebertragung.esm.js
│   └── pmo-toolbox.esm.js
│
└── [alte Dateien bleiben]     # Für Abwärtskompatibilität
```

---

## RISIKOMATRIX

| Datei | Risiko | Grund | Empfehlung |
|-------|--------|-------|------------|
| config.js | Niedrig | Nur Daten, keine DOM-Manipulation | Früh migrieren |
| utils.js | Niedrig | Pure Functions | Früh migrieren |
| data.js | Mittel | State Management | Nach utils.js |
| charts.js | Mittel | Chart.js-Abhängigkeit | Nach data.js |
| main.js | Hoch | Event-Listener, DOM | Spät migrieren |
| landing.js | Hoch | 3500 Zeilen, viele Features | Zuletzt migrieren |
| banken.js | Sehr Hoch | 8200 Zeilen, komplex | Optional |

---

## CHECKLISTE PRO MIGRATIONSSCHRITT

- [ ] Neue ESM-Datei erstellt
- [ ] Alle Funktionen kopiert (NICHT geändert!)
- [ ] Export-Statements hinzugefügt
- [ ] Import-Statements für Abhängigkeiten hinzugefügt
- [ ] Bridge-Code für globale Variablen hinzugefügt
- [ ] Browser-Test: Keine Console-Errors
- [ ] Feature-Test: Alle Features funktionieren
- [ ] Git Commit erstellt
- [ ] Rollback-Plan dokumentiert

---

## ROLLBACK-STRATEGIE

Bei JEDEM Problem:

```bash
# Zur letzten funktionierenden Version zurück
git checkout HEAD~1 -- js/

# Oder komplett zum Backup
git checkout backup/pre-es6-migration
```

---

## ZEITPLAN-EMPFEHLUNG

| Phase | Dauer | Risiko |
|-------|-------|--------|
| Phase 0: Vorbereitung | 1 Tag | Keins |
| Phase 1: Foundation | 1 Tag | Niedrig |
| Phase 2: Utilities | 0.5 Tag | Niedrig |
| Phase 3: Data Layer | 1 Tag | Mittel |
| Phase 4: UI Components | 2 Tage | Mittel-Hoch |
| Phase 5: HTML Integration | 0.5 Tag | Mittel |
| Phase 6: Cleanup (Optional) | 2 Tage | Hoch |

**Gesamtdauer:** 8-10 Tage für vollständige Migration

---

## FAZIT

Diese Strategie ermöglicht eine **risikoarme, schrittweise Migration**:

1. **Kein Breaking Change:** Alte Scripts bleiben erhalten
2. **Parallel-Betrieb:** Beide Systeme funktionieren gleichzeitig
3. **Inkrementell:** Ein Modul nach dem anderen
4. **Testbar:** Nach jedem Schritt vollständiger Test
5. **Rückrollbar:** Jeder Schritt kann rückgängig gemacht werden

Die Migration kann jederzeit pausiert werden, ohne dass Features brechen.
