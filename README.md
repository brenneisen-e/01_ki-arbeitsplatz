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
- **Hosting**: Cloudflare Pages
- **KI-Chat**: API-Anbindung via Cloudflare Worker

## Projektstruktur

```
kiarbeitsplatz/
|
|-- index.html                          Haupt-Dashboard + Landing Page
|-- Provisionssimulation.html           Standalone Provisionssimulation
|-- Risikoscoring_vDraft.html           Standalone Risikoscoring
|-- csv-generator.html                  Test-Daten Generator
|
|-- css/
|   |-- variables.css                   Design-System (Farben, Spacing, Shadows)
|   |-- shared.css                      Gemeinsame Styles
|   |-- styles.css                      Haupt-Dashboard Styles
|   |-- banken.css                      Banken-Modul
|   |-- bestandsuebertragung-vst.css    Bestandsuebertragung
|   |-- pmo-toolbox.css                 PMO-Toolbox
|   |-- provisionssimulation.css        Provisionssimulation
|   |-- risikoscoring.css               Risikoscoring
|   |-- finanzplanung.css               Finanzplanung
|   |-- guided-tour.css                 Demo-Tour
|   |-- sales-report.css                Vertriebsbericht
|   +-- pmo-modules/                    PMO CSS-Submodule
|
|-- js/
|   |-- config.js                       KPI-Definitionen, Faktoren
|   |-- data.js                         State-Management, Daten-Aggregation
|   |-- utils.js                        Hilfsfunktionen
|   |-- main.js                         Dashboard-Initialisierung
|   |-- charts.js                       Chart.js Wrapper (Linie, Bar, Forecast)
|   |-- tables.js                       Tabellen-Rendering (Agentur, Bundesland, Landkreis)
|   |-- chat.js                         KI-Chat fuer Dashboard
|   |-- landing.js                      Landing Page mit Einstellungen und Chat
|   |-- banken.js                       Banken-Modul (CRM, Segmentierung, Prozesse)
|   |-- banken-chat.js                  Chat-Logik fuer Banken-Modul
|   |-- risikoscoring.js                Scoring-Berechnung und -Darstellung
|   |-- provisionssimulation.js         Provisionsberechnung
|   |-- sales-report.js                 Vertriebsbericht mit KI-Zusammenfassung
|   |-- agentur-overview.js             Einzelansicht Agentur-Profil
|   |-- map-counties.js                 Regierungsbezirk-Karte (Leaflet)
|   |-- finanzplanung.js                Finanzplanung-Modul
|   |-- guided-tour.js                  Interaktive Demo-Tour
|   |-- names.js                        Namensdatenbank fuer Demo-Daten
|   |-- page-id-tracker.js              Seitennavigation und Tracking
|   |-- speaker-notes.js                Presenter-Notizen
|   |
|   |-- bestandsuebertragung/           Bestandsuebertragung (neues Modul)
|   |   |-- index.js                    Modul-Entry-Point
|   |   |-- app.js                      Haupt-Applikationslogik
|   |   |-- ui.js                       UI-Rendering
|   |   |-- ai-processor.js             KI-Analyse fuer Dokumente
|   |   |-- ai-landing.js               Upload-Oberflaeche mit KI
|   |   |-- demo-data.js                Demo-Daten
|   |   |-- demo-files.js               Simulierte Dateien
|   |   |-- export.js                   Export-Funktionen
|   |   |-- extractor.js                Daten-Extraktion
|   |   |-- matcher.js                  Matching-Logik
|   |   +-- storage.js                  Persistenz
|   |
|   |-- banken/
|   |   +-- feedback.js                 Feedback-System (Cloudflare-backed)
|   |
|   |-- modules/                        ES6-Module (Migration in Arbeit)
|   |   |-- main.esm.js                 Entry-Point
|   |   |-- config.esm.js               KPI-Definitionen
|   |   |-- state.esm.js                State-Management
|   |   |-- data-functions.esm.js       Daten-Aggregation
|   |   |-- charts.esm.js               Chart-Funktionen
|   |   |-- tables.esm.js               Tabellen-Funktionen
|   |   |-- map.esm.js                  Karten-Funktionen
|   |   |-- utils.esm.js                Hilfsfunktionen
|   |   |-- pmo-toolbox.esm.js          PMO-Toolbox komplett
|   |   +-- pmo/                        PMO-Submodule
|   |
|   +-- bestand-*.js                    Legacy Bestandsuebertragung (7 Dateien)
|
|-- partials/
|   |-- banken-module.html              Banken Container
|   |-- banken/                         Banken Sub-Komponenten
|   |   |-- header.html                 Modul-Header und Navigation
|   |   |-- section-segmentierung.html  Willingness/Ability-Matrix
|   |   |-- section-aufgaben.html       Aufgabenverwaltung
|   |   |-- section-npl.html            NPL-Uebersicht
|   |   |-- section-stage2.html         Stage-2-Faelle
|   |   |-- modal-customer-detail.html  Kunden-Detail-Modal
|   |   |-- modal-document-scanner.html Dokumenten-Scanner
|   |   +-- crm-profile-view.html       CRM-Profilansicht
|   |-- bestandsuebertragung-module.html
|   |-- pmo-toolbox-module.html
|   +-- risikoscoring-module.html
|
|-- assets/
|   |-- geo/                            GeoJSON (Regierungsbezirke)
|   +-- images/                         Bilder und Icons
|
|-- cloudflare/
|   |-- setup.sh                        Cloudflare-Setup-Skript
|   |-- setup-cloudflare.js             Worker-Konfiguration
|   |-- feedback-worker.js              Feedback-API Worker
|   +-- SETUP.md                        Setup-Anleitung
|
|-- data/
|   +-- mock-data.csv                   Beispieldaten
|
+-- docs/
    |-- CHANGELOG.md -> ../CHANGELOG.md
    |-- API_SETUP.md -> ../API_SETUP.md
    |-- CLOUDFLARE_DEPLOYMENT.md -> ../CLOUDFLARE_DEPLOYMENT.md
    |-- ES6_MIGRATION_STRATEGY.md -> ../ES6_MIGRATION_STRATEGY.md
    |-- FEATURE_CHECKLIST.md -> ../FEATURE_CHECKLIST.md
    +-- OPTIMIZATIONS.md -> ../OPTIMIZATIONS.md
```

## Lokale Entwicklung

```bash
# HTTP-Server starten
python3 -m http.server 8000

# oder mit npx
npx serve .

# mit Cloudflare Wrangler (fuer Worker-Funktionen)
npx wrangler pages dev .
```

Dann `http://localhost:8000` im Browser oeffnen.

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

## Deployment

Cloudflare Pages:

1. Repository verbinden
2. Build-Befehl leer lassen
3. Output-Verzeichnis: `.`

Details in [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md).

## Dokumentation

| Datei | Inhalt |
|-------|--------|
| [CHANGELOG.md](./CHANGELOG.md) | Aenderungshistorie |
| [FEATURE_CHECKLIST.md](./FEATURE_CHECKLIST.md) | Feature-Checkliste |
| [ES6_MIGRATION_STRATEGY.md](./ES6_MIGRATION_STRATEGY.md) | ES6-Modul-Migration |
| [API_SETUP.md](./API_SETUP.md) | API-Konfiguration |
| [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) | Deployment-Anleitung |
| [OPTIMIZATIONS.md](./OPTIMIZATIONS.md) | Performance-Hinweise |

## Lizenz

Privates Repository. Alle Rechte vorbehalten.
