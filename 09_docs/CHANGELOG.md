# Changelog

Alle wesentlichen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [2.0.0] - 2026-01-05

### Refactoring: VSTEike → kiarbeitsplatz

#### Hinzugefügt

**CSS-Architektur:**
- `css/variables.css` - Zentrales CSS Design System mit ~130 Variablen
  - Farbpalette (Primary, Secondary, Status Colors)
  - Spacing-System (4px-64px Grid)
  - Typography-Skalierung
  - Shadow-System (7 Stufen)
  - Border-Radius-System
  - Transition-Timings

- `css/shared.css` - Gemeinsame wiederverwendbare Styles
  - Konsolidierte Keyframe-Animationen (fadeIn, slideUp, pulse, shimmer, spin)
  - Utility-Klassen (Flexbox, Gap, Text-Truncate)
  - Basis-Button-Styles (.btn, .btn--primary, .btn--secondary)
  - Basis-Card-Styles (.card, .card--elevated, .card--interactive)
  - Form-Styles (.input)
  - Badge/Tag-Styles (.badge--success, .badge--warning, etc.)
  - Responsive-Helpers

**Ordnerstruktur:**
- `pages/` - Verzeichnis für zukünftige neue HTML-Seiten
- `css/components/` - Verzeichnis für komponenten-spezifische CSS
- `js/data/` - Verzeichnis für Daten-Module
- `js/components/` - Verzeichnis für wiederverwendbare JS-Komponenten

**Dokumentation:**
- `FEATURE_CHECKLIST.md` - Vollständige Feature-Checkliste für Regressionstests
- `CHANGELOG.md` - Diese Datei

#### Geändert

- `index.html` - CSS-Imports erweitert um variables.css und shared.css
  - Load Order: variables.css → shared.css → styles.css → [module CSS]

#### Beibehalten (Feature-Parität)

Die folgenden Dateien wurden NICHT verändert, um 100% Funktionskompatibilität zu gewährleisten:

**JavaScript (25 Dateien):**
- `js/config.js` - KPI-Definitionen, Bundesland-Daten, Faktoren
- `js/data.js` - State-Management, Daten-Aggregation
- `js/utils.js` - Utility-Funktionen
- `js/main.js` - Dashboard-Logik
- `js/charts.js` - Chart.js-Integration
- `js/tables.js` - Tabellen-Rendering
- `js/chat.js` - KI-Chat-Integration
- `js/landing.js` - Landing Page & Module-Switching
- `js/banken.js` - Banken-Modul (8.267 Zeilen)
- `js/banken-chat.js` - Banken Chat
- `js/risikoscoring.js` - Risikoscoring-Logik
- `js/provisionssimulation.js` - Provisionsberechnung
- `js/bestand-*.js` - Bestandsübertragung-Module (7 Dateien)
- `js/guided-tour.js` - Demo-Tour
- `js/agentur-overview.js` - Agentur-Übersicht
- `js/map-counties.js` - Landkreis-Karten
- `js/finanzplanung.js` - Finanzplanung
- `js/names.js` - Namensdatenbank

**CSS (7 Dateien):**
- `css/styles.css` - Haupt-Styles (7.645 Zeilen)
- `css/banken.css` - Banken-Modul (12.059 Zeilen)
- `css/bestandsuebertragung-vst.css` - Bestandsübertragung (3.361 Zeilen)
- `css/provisionssimulation.css` - Provision (1.446 Zeilen)
- `css/risikoscoring.css` - Risiko (1.118 Zeilen)
- `css/finanzplanung.css` - Finanz (1.069 Zeilen)
- `css/guided-tour.css` - Tour (629 Zeilen)

**HTML (17 Dateien):**
- `index.html` - Haupt-Dashboard
- `Provisionssimulation.html` - Standalone Provisionssimulation
- `Risikoscoring_vDraft.html` - Standalone Risikoscoring
- `csv-generator.html` - CSV-Generator
- `partials/*.html` - Alle Partial-Templates (13 Dateien)

#### Technische Entscheidungen

1. **Keine ES6-Module:** Das Projekt verwendet globale Variablen über Script-Tags.
   Ein Refactoring zu ES6-Modulen würde alle Abhängigkeiten brechen.

2. **CSS-Variablen ZUSÄTZLICH:** Die neuen CSS-Variablen in variables.css
   ergänzen die bestehenden Variablen in bestandsuebertragung-vst.css.
   Beide Definitionen bleiben erhalten für Abwärtskompatibilität.

3. **Animationen DUPLIZIERT:** Die Keyframe-Animationen in shared.css sind
   zusätzlich zu den bestehenden Animationen in den Modul-CSS-Dateien.
   Dies stellt sicher, dass keine Animation fehlt.

4. **Standalone-HTML NICHT verschoben:** Provisionssimulation.html,
   Risikoscoring_vDraft.html und csv-generator.html bleiben im Root,
   da sie aktiv von landing.js und _headers referenziert werden.

---

## [1.0.0] - Ursprüngliche Version

Original VSTEike Codebase von https://github.com/brenneisen-e/VSTEike

### Features
- Versicherungs-Dashboard mit 9 KPIs
- Banken-Modul (Collections Management)
- Risikoscoring-Modul
- Bestandsübertragung-Modul
- PMO-Toolbox
- Provisionssimulation
- CSV-Generator
- KI-Chat-Integration (KI-API)
- Landkreis-Karten (Leaflet)
- Charts (Chart.js)
- Demo-Tour
