# kiarbeitsplatz - Financial Service Sales Excellence Platform

[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)
[![Version](https://img.shields.io/badge/Version-v2.0-blue)](https://github.com/brenneisen-e/kiarbeitsplatz)

KI-gestütztes Dashboard für Vertriebssteuerung mit interaktiven KPIs, geografischen Visualisierungen und Datenanalyse.

> **Refactored** von [VSTEike](https://github.com/brenneisen-e/VSTEike) am 2026-01-05

## Features

### Hauptmodule
- **Versicherungs-Dashboard** - 9 KPIs mit interaktiven Charts
- **Banken-Modul** - Collections Management & CRM
- **Risikoscoring** - Vermittler-Bewertung mit 20+ Parametern
- **Bestandsübertragung** - Portfolio Transfer Management
- **PMO-Toolbox** - Projekt-Management für Transformationsprogramme
- **Provisionssimulation** - Alpha/Beta-Modell Vergleich

### Technische Features
- **Geografische Visualisierung** auf Regierungsbezirk-Ebene (Leaflet.js)
- **KI-gestützter Chat** (KI-API Integration)
- **CSV-Import** mit automatischer Datenverarbeitung
- **Responsive Design** für Desktop, Tablet und Mobile
- **Demo-Tour** für Guided Onboarding

## Technologie-Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (kein Framework)
- **Charts**: Chart.js 4.4, D3.js 7.8
- **Maps**: Leaflet.js 1.9
- **Screenshots**: html2canvas, jsPDF
- **Hosting**: Cloudflare Pages
- **KI**: KI-API via Cloudflare Worker

## Projektstruktur

```
kiarbeitsplatz/
├── index.html                    # Haupt-Dashboard & Landing Page
├── Provisionssimulation.html     # Standalone Provisionssimulation
├── Risikoscoring_vDraft.html     # Standalone Risikoscoring
├── csv-generator.html            # Test-Daten Generator
│
├── css/
│   ├── variables.css             # CSS Design System (NEU)
│   ├── shared.css                # Gemeinsame Styles (NEU)
│   ├── styles.css                # Haupt-Styles (7.645 Zeilen)
│   ├── banken.css                # Banken-Modul (12.059 Zeilen)
│   ├── bestandsuebertragung-vst.css
│   ├── provisionssimulation.css
│   ├── risikoscoring.css
│   ├── finanzplanung.css
│   ├── guided-tour.css
│   └── components/               # (Für zukünftige Komponenten)
│
├── js/
│   ├── config.js                 # KPI-Definitionen, Faktoren
│   ├── data.js                   # State & Daten-Aggregation
│   ├── utils.js                  # Utility-Funktionen
│   ├── main.js                   # Dashboard-Logik
│   ├── charts.js                 # Chart.js Wrapper
│   ├── tables.js                 # Tabellen-Rendering
│   ├── chat.js                   # KI-Chat Integration
│   ├── landing.js                # Landing Page (3.535 Zeilen)
│   ├── banken.js                 # Banken-Modul (8.267 Zeilen)
│   ├── banken-chat.js            # Banken Chat
│   ├── risikoscoring.js          # Risikoscoring-Logik
│   ├── provisionssimulation.js   # Provisionsberechnung
│   ├── bestand-*.js              # Bestandsübertragung (7 Dateien)
│   ├── guided-tour.js            # Demo-Tour
│   ├── agentur-overview.js       # Agentur-Übersicht
│   ├── map-counties.js           # Landkreis-Karten
│   ├── finanzplanung.js          # Finanzplanung
│   ├── names.js                  # Namensdatenbank
│   ├── data/                     # (Für zukünftige Daten-Module)
│   └── components/               # (Für zukünftige Komponenten)
│
├── partials/
│   ├── banken-module.html        # Banken Container
│   ├── banken/                   # Banken Sub-Komponenten (8 Dateien)
│   ├── risikoscoring-module.html
│   ├── bestandsuebertragung-module.html
│   └── pmo-toolbox-module.html
│
├── assets/
│   ├── geo/                      # GeoJSON Dateien
│   └── images/                   # Bilder & Icons
│
├── pages/                        # (Für zukünftige Seiten)
├── cloudflare/                   # Cloudflare Worker Scripts
├── data/                         # Mock-Daten
│
├── CHANGELOG.md                  # Änderungshistorie
├── FEATURE_CHECKLIST.md          # Feature-Parität Checkliste
├── ES6_MIGRATION_STRATEGY.md     # ES6 Module Migrationsleitfaden
├── API_SETUP.md                  # API Konfiguration
├── CLOUDFLARE_DEPLOYMENT.md      # Deployment Guide
├── OPTIMIZATIONS.md              # Performance-Optimierungen
├── _headers                      # Security Headers
└── _redirects                    # Routing-Regeln
```

## CSS Design System

Die neue `css/variables.css` definiert ein zentrales Design System:

```css
/* Farben */
--primary: #C8102E;           /* ERGO Red */
--secondary: #0F172A;         /* Dark */
--brand-gradient-start: #667eea;
--brand-gradient-end: #764ba2;

/* Status */
--status-export-bereit: #16A34A;  /* Grün */
--status-zu-validieren: #2563EB;  /* Blau */
--status-wiedervorlage: #D97706;  /* Gelb */
--status-abgelehnt: #DC2626;      /* Rot */

/* Spacing (8px Grid) */
--space-1: 4px;
--space-2: 8px;
--space-4: 16px;
--space-8: 32px;

/* Shadows */
--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl
```

## Lokale Entwicklung

```bash
# Einfacher HTTP Server
python3 -m http.server 8000

# Oder mit npx
npx serve .

# Mit Cloudflare Wrangler (empfohlen)
npx wrangler pages dev .
```

Öffne dann `http://localhost:8000` im Browser.

## Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| [CHANGELOG.md](./CHANGELOG.md) | Alle Änderungen dokumentiert |
| [FEATURE_CHECKLIST.md](./FEATURE_CHECKLIST.md) | Feature-Parität Testliste |
| [ES6_MIGRATION_STRATEGY.md](./ES6_MIGRATION_STRATEGY.md) | ES6 Module Migrationsleitfaden |
| [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) | Deployment-Anleitung |
| [API_SETUP.md](./API_SETUP.md) | API-Konfiguration |
| [OPTIMIZATIONS.md](./OPTIMIZATIONS.md) | Performance-Tipps |

## Deployment

Das Projekt ist für **Cloudflare Pages** optimiert:

1. Repository mit Cloudflare Pages verbinden
2. Build-Befehl: (leer lassen)
3. Output-Verzeichnis: `.`

Siehe [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) für Details.

## Migration History

- **v1.0**: Original VSTEike
- **v2.0**: Refactoring zu kiarbeitsplatz
  - Neue CSS-Architektur (variables.css, shared.css)
  - Dokumentation erweitert
  - Ordnerstruktur vorbereitet für ES6-Module
  - 100% Feature-Parität gewährleistet

## Lizenz

Private Repository - Alle Rechte vorbehalten.
