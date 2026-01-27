# kiarbeitsplatz

Dashboard-Plattform fuer Vertriebssteuerung im Versicherungs- und Finanzbereich. Interaktive KPIs, geografische Visualisierungen, KI-Chat und modularer Aufbau.

Refactored von [VSTEike](https://github.com/brenneisen-e/VSTEike) (Stand: Januar 2026).

## Module

| Modul | Beschreibung |
|-------|-------------|
| **Versicherungs-Dashboard** | 9 KPIs mit Charts, Kartenansicht und Agentur-Tabelle |
| **Banken-Modul** | Collections Management, CRM, Kundensegmentierung |
| **Risikoscoring** | Vermittler-Bewertung auf Basis von 20+ Parametern |
| **Bestandsuebertragung** | Portfolio-Transfer-Validierung und -Management |
| **PMO-Toolbox** | Projektmanagement fuer Transformationsprogramme (Gantt, Kanban, PPTX-Export) |
| **Provisionssimulation** | Vergleich Alpha/Beta-Provisionsmodelle |

## Tech-Stack

- **Frontend**: HTML, CSS, JavaScript (kein Framework)
- **Charts**: Chart.js 4.4, D3.js 7.8
- **Karten**: Leaflet.js 1.9 (Regierungsbezirk-Ebene)
- **Export**: html2canvas, jsPDF
- **KI-Chat**: API-Anbindung (konfigurierbar, siehe docs/API_SETUP.md)

## Projektstruktur

```
kiarbeitsplatz/
|
|-- index.html                      Haupt-Dashboard + Landing Page
|-- Provisionssimulation.html       Standalone-Seiten
|-- Risikoscoring_vDraft.html
|-- csv-generator.html              Test-Daten Generator
|
|-- css/
|   |-- variables.css               Design-Tokens (Farben, Spacing, Shadows)
|   |-- shared.css                  Gemeinsame Styles
|   |-- styles.css                  Dashboard-Styles
|   |-- [modul].css                 Je ein Stylesheet pro Modul
|   +-- pmo-modules/                PMO CSS-Submodule
|
|-- js/
|   |-- main.js                     Dashboard-Initialisierung
|   |-- config.js                   KPI-Definitionen, Faktoren
|   |-- data.js                     State-Management, Daten-Aggregation
|   |-- utils.js                    Hilfsfunktionen
|   |-- charts.js                   Chart.js Wrapper
|   |-- tables.js                   Tabellen-Rendering
|   |-- chat.js                     KI-Chat (Dashboard)
|   |-- landing.js                  Landing Page + Chat
|   |-- banken.js                   Banken-Modul
|   |-- banken-chat.js              Chat (Banken)
|   |-- map-counties.js             Regierungsbezirk-Karte (Leaflet)
|   |-- sales-report.js             Vertriebsbericht
|   |-- agentur-overview.js         Agentur-Profil
|   |-- ...                         Weitere Modul-Dateien
|   |
|   |-- bestandsuebertragung/       Bestandsuebertragung-Modul
|   |   |-- index.js                Entry-Point
|   |   |-- app.js                  Applikationslogik
|   |   |-- ui.js                   UI-Rendering
|   |   |-- ai-processor.js         KI-Analyse
|   |   +-- ...                     Export, Matching, Demo-Daten
|   |
|   |-- banken/
|   |   +-- feedback.js             Feedback-System
|   |
|   |-- modules/                    ES6-Module (Migration in Arbeit)
|   |   |-- *.esm.js               Modul-Pendants der Kernlogik
|   |   +-- pmo/                    PMO-Submodule
|   |
|   +-- bestand-*.js                Legacy Bestandsuebertragung
|
|-- partials/                       HTML-Templates (per fetch eingebunden)
|   |-- banken-module.html          Banken Container
|   |-- banken/                     Banken Sub-Komponenten (8 Templates)
|   |-- bestandsuebertragung-module.html
|   |-- pmo-toolbox-module.html
|   +-- risikoscoring-module.html
|
|-- assets/
|   |-- geo/                        GeoJSON (Regierungsbezirke)
|   +-- images/
|
|-- cloudflare/                     Hosting-Konfiguration (optional)
|
|-- data/
|   +-- mock-data.csv               Beispieldaten
|
+-- docs/                           Projekt-Dokumentation
```

## Lokale Entwicklung

```bash
# HTTP-Server starten
python3 -m http.server 8000

# oder mit npx
npx serve .
```

Dann `http://localhost:8000` im Browser oeffnen.

Die Anwendung laeuft vollstaendig lokal im Browser. Fuer die KI-Chat-Funktion wird ein API-Endpoint benoetigt (siehe [API_SETUP.md](./docs/API_SETUP.md)).

## CSS Design-System

`css/variables.css` definiert die zentralen Design-Tokens:

```css
/* Farben */
--primary: #C8102E;              /* Markenfarbe */
--secondary: #0F172A;            /* Dunkel */
--brand-gradient-start: #667eea;
--brand-gradient-end: #764ba2;

/* Status-Farben */
--status-export-bereit: #16A34A;
--status-zu-validieren: #2563EB;
--status-wiedervorlage: #D97706;
--status-abgelehnt: #DC2626;

/* 8px Spacing Grid */
--space-1: 4px;  --space-2: 8px;  --space-4: 16px;  --space-8: 32px;
```

## Dokumentation

| Datei | Inhalt |
|-------|--------|
| [CHANGELOG.md](./docs/CHANGELOG.md) | Aenderungshistorie |
| [FEATURE_CHECKLIST.md](./docs/FEATURE_CHECKLIST.md) | Feature-Checkliste |
| [ES6_MIGRATION_STRATEGY.md](./docs/ES6_MIGRATION_STRATEGY.md) | ES6-Modul-Migration |
| [API_SETUP.md](./docs/API_SETUP.md) | API-Konfiguration |
| [OPTIMIZATIONS.md](./docs/OPTIMIZATIONS.md) | Performance-Hinweise |

## Lizenz

Privates Repository. Alle Rechte vorbehalten.
