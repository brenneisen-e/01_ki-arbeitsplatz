# README_ANALYSE.md – Vollstaendige Projektanalyse KI-Arbeitsplatz

> **Stand:** 2026-03-10
> **Fokus:** Module A-02 (Vermittler-Overview) und A-10 (Kunden-Detailansicht)
> **Sprache:** Deutsch

---

## 1. Projektuebersicht

### 1.1 Projektbeschreibung

Das Projekt "KI-Arbeitsplatz" (auch "KI Vertriebsarbeitsplatz") ist eine Single-Page-Application (SPA) fuer den Versicherungs- und Bankenvertrieb. Es handelt sich um einen Prototyp/Demo-Arbeitsplatz, der verschiedene Module fuer unterschiedliche Vertriebskanaele und Funktionen bereitstellt. Die Anwendung nutzt KI-Integration (Anthropic Claude API) fuer Chat-Funktionen und intelligente Beratungsunterstuetzung.

### 1.2 Gesamte Datei-/Ordnerstruktur

```
kiarbeitsplatz/
├── index.html                          # Haupt-SPA (alle Module in einer Datei)
├── csv-generator.html                  # Standalone CSV-Generator Tool
├── Provisionssimulation.html           # Standalone Provisionssimulations-Tool
├── Risikoscoring_vDraft.html           # Standalone Risikoscoring (Draft)
├── _headers                            # Cloudflare Headers
├── _redirects                          # Cloudflare Redirects
├── .gitignore
│
├── css/                                # Stylesheets
│   ├── styles.css                      # Haupt-Stylesheet
│   ├── shared.css                      # Gemeinsame Styles
│   ├── variables.css                   # CSS-Variablen
│   ├── agentur-fachkonzept.css         # Agentur-Ansicht Styles
│   ├── am-prod-mode.css               # Asset Management Prod-Modus
│   ├── asset-management.css            # Asset Management Modul
│   ├── banken.css                      # Banken-Modul Styles
│   ├── banking-berater.css             # B-02/B-10 Banking Berater Styles
│   ├── bestandsuebertragung-vst.css    # Bestandsuebertragung
│   ├── bezahlen-tx.css                 # Bezahlen-Transaktionen
│   ├── bgav-umstellung.css             # BGAV Umstellung
│   ├── clv.css                         # Customer Lifetime Value
│   ├── cv-scanner.css                  # CV Scanner
│   ├── finanzplanung.css               # Finanzplanung
│   ├── guided-tour.css                 # Guided Tour
│   ├── hr-pipeline.css                 # HR Pipeline
│   ├── kommunikation-display.css       # Kommunikations-Display
│   ├── kunden-detail.css               # Kunden-Detail (A-10)
│   ├── kunde-sticky-bar.css            # Kunden Sticky Bar
│   ├── makler.css                      # Makler-Modul
│   ├── mrh-trowe.css                   # MRH Trowe (Gewerbe 360)
│   ├── nps.css                         # Net Promoter Score
│   ├── pmo-toolbox.css                 # PMO Toolbox
│   ├── potentiale-display.css          # Potentiale-Anzeige
│   ├── provisionssimulation.css        # Provisionssimulation
│   ├── risikoscoring.css               # Risikoscoring
│   ├── sales-report.css                # Sales Report
│   ├── screen-recorder.css             # Screen Recorder
│   ├── stammdaten-extras.css           # Stammdaten Extras
│   ├── user-profile.css                # User Profile
│   ├── versicherungs-1x1.css           # Versicherungs-1x1
│   └── pmo-modules/                    # PMO Untermodule
│       ├── _index.css
│       ├── pmo-dashboard.css
│       ├── pmo-kpi-cards.css
│       ├── pmo-valuemap.css
│       └── pmo-warnings.css
│
├── js/                                 # JavaScript
│   ├── main.js                         # Haupt-Initialisierung
│   ├── router.js                       # Hash-basierte URL-Navigation
│   ├── landing-core.js                 # Landing Page: Auto-Zoom, API-Config, CSV-Upload
│   ├── landing-chat.js                 # Landing Page: Chat, Voice, Dual-View
│   ├── landing-regions.js              # Landing Page: Regionen-Abfragen
│   ├── landing-modules.js              # Landing Page: Modul-Management, Settings
│   ├── landing-data.js                 # Landing Page: CSV-Laden, Filter, Beispielfragen
│   ├── landing-upload.js               # Landing Page: Upload-Modus, Potentialanalyse
│   ├── config.js                       # API-Konfiguration (Anthropic)
│   ├── data.js                         # Stammdaten & Mock-Daten
│   ├── charts.js                       # Chart-Rendering
│   ├── tables.js                       # Tabellen-Rendering
│   ├── utils.js                        # Hilfsfunktionen
│   ├── chat.js                         # KI-Chat (Versicherung)
│   ├── agentur-overview-core.js        # A-02 Core: Overview, Tabs, KPIs
│   ├── agentur-overview-tables.js      # A-02 Tabellen: Mock-Daten, Vertraege
│   ├── agentur-overview-features.js    # A-02 Features: FIDA, Chat, Potentiale
│   ├── agentur-overview-banking.js     # A-02/B-02: Banking-Berater-Modus
│   ├── kunden-detail-core.js           # A-10 Core: Navigation, Sticky-Bar
│   ├── kunden-detail-data.js           # A-10 Daten: Mock-Kunden, fillKundenDetail
│   ├── kunden-detail-features.js       # A-10 Features: Tier-Formular, Angebote, Tabs
│   ├── kunden-detail-banking.js        # A-10/B-10: Bank-Kundendaten, fillBankKundenDetail
│   ├── makler-modus.js                 # A-02b Modus-Toggle & Apply
│   ├── makler-kunden.js                # A-02b Kundenliste & Detail
│   ├── makler-b2b.js                   # A-02b B2B-Rendering
│   ├── makler-overview.js              # A-02b Uebersicht, Renewals, Potentiale
│   ├── mrh-trowe-modes.js              # A-02c View-Mode, Finance-Mode, Modus-Anwendung
│   ├── mrh-trowe-render.js             # A-02c MRH-Rendering, Dashboards
│   ├── mrh-trowe-detail.js             # A-02c Kunden-Detail, Navigation
│   ├── potentiale.js                   # Potentialanalyse (A-05)
│   ├── finanzplanung.js                # Finanzplanung (A-09)
│   ├── banken-feedback.js              # B-01: Modul-State, Feedback-System
│   ├── banken-module.js                # B-01: Screenshot, Modul-Loader/Switcher
│   ├── banken-dashboard.js             # B-01: Dashboard-Tabs, Filter, Navigation
│   ├── banken-customer-detail.js       # B-01: Kunden-Detail Modal (Teil 1)
│   ├── banken-customer-detail2.js      # B-01: Kunden-Detail Modal (Teil 2)
│   ├── banken-actions.js               # B-01: Kunden-Aktionen, Aufgaben
│   ├── banken-charts.js                # B-01: Dashboard-Charts, NPL
│   ├── banken-activities.js            # B-01: Aktivitaeten, Benachrichtigungen
│   ├── banken-scanner-crm.js           # B-01: Dokumenten-Scanner, CRM-Profil
│   ├── banken-export.js                # B-01: Dashboard-Export
│   ├── banken-config-pdf.js            # B-01: Kunden-Config, PDF-Agent
│   ├── banken-chat.js                  # Banken KI-Chat
│   ├── bgav-umstellung.js              # BGAV Umstellung (A-12)
│   ├── am-prod-mode.js                 # Asset Management Prod-Modus (IIFE, 1858 Zeilen)
│   ├── asset-management.js             # Asset Management Modul (IIFE, 2474 Zeilen)
│   ├── risikoscoring-data.js           # R-01 Daten: Verteilungen, Berechnungen
│   ├── risikoscoring-ui.js             # R-01 UI: Rendering, Events, Exports
│   ├── provisionssimulation.js         # Provisionssimulation
│   ├── clv.js                          # Customer Lifetime Value (unifiziert)
│   ├── nps-display.js                  # NPS Display
│   ├── sales-report.js                 # Sales Report
│   ├── cv-scanner.js                   # CV Scanner
│   ├── hr-pipeline-core.js             # H-01 Core: State, Demo-Daten, Utilities
│   ├── hr-pipeline-bewerber.js         # H-01 Bewerber: Profil-Upload, Job-Matching
│   ├── hr-pipeline-arbeitgeber.js      # H-01 Arbeitgeber: Dashboard, Screening
│   ├── hr-pipeline-overlays.js         # H-01 Overlays: Interviews, Chat
│   ├── hc-cockpit-data.js              # HR-Cockpit: Datenstrukturen, Metriken
│   ├── hc-cockpit-ui.js                # HR-Cockpit: UI-Rendering, KI-Empfehlungen
│   ├── versicherungs-1x1.js            # Versicherungs-1x1 (V-01, IIFE, 2561 Zeilen)
│   ├── bezahlen.js                     # Bezahlen-Modul
│   ├── kommunikation-display.js        # Kommunikations-Display
│   ├── guided-tour.js                  # Guided Tour
│   ├── screen-recorder.js              # Screen Recorder
│   ├── screenshot.js                   # Screenshot-Funktion
│   ├── speaker-notes.js                # Speaker Notes (Teleprompter)
│   ├── autocomplete.js                 # Autocomplete
│   ├── map-counties.js                 # Karten-Darstellung
│   ├── names.js                        # Namens-Generierung
│   ├── page-id-tracker.js              # Page ID Tracking System
│   ├── user-mode.js                    # User Mode Verwaltung
│   ├── parent-keyboard-relay.js        # Keyboard Event Relay
│   ├── parent-mouse-relay.js           # Mouse Event Relay
│   ├── parent-scroll-relay.js          # Scroll Event Relay
│   ├── parent-wheel-relay.js           # Wheel Event Relay
│   ├── bestandsuebertragung/           # Bestandsuebertragung (T-01)
│   │   ├── index.js
│   │   ├── app.js
│   │   ├── ai-landing.js
│   │   ├── ai-processor.js
│   │   ├── demo-data.js
│   │   ├── demo-files.js
│   │   ├── export.js
│   │   ├── extractor.js
│   │   ├── matcher.js
│   │   ├── storage.js
│   │   └── ui.js
│   ├── banken/                         # Banken Untermodule
│   │   └── feedback.js
│   └── modules/                        # ES6 Module
│       ├── main.esm.js
│       ├── config.esm.js
│       ├── state.esm.js
│       ├── data-functions.esm.js
│       ├── charts.esm.js
│       ├── map.esm.js
│       ├── tables.esm.js
│       ├── utils.esm.js
│       ├── pmo-toolbox.esm.js
│       └── pmo/
│           ├── _index.js
│           ├── pmo-milestones.js
│           ├── pmo-tabs.js
│           └── pmo-valuemap.js
│
├── partials/                           # HTML Partials (eingebundene Module)
│   ├── banken-module.html
│   ├── bestandsuebertragung-module.html
│   ├── cv-scanner-module.html
│   ├── hr-pipeline-module.html
│   ├── pmo-toolbox-module.html
│   ├── risikoscoring-module.html
│   ├── versicherungs-1x1-module.html
│   └── banken/                         # Banken-Partials
│       ├── header.html
│       ├── crm-profile-view.html
│       ├── modal-customer-detail.html
│       ├── modal-document-scanner.html
│       ├── section-aufgaben.html
│       ├── section-npl.html
│       ├── section-segmentierung.html
│       └── section-stage2.html
│
├── assets/                             # Statische Assets
│   ├── images/                         # Bilder & Logos
│   ├── geo/                            # GeoJSON fuer Karten
│   └── video/                          # Demo-Videos
│
├── data/                               # Datendateien
│   ├── mock-data.csv                   # Mock CSV-Daten
│   ├── dashboard_data_*.csv            # Dashboard-Daten
│   └── versicherungs-1x1/
│       └── chapters.json               # Versicherungs-1x1 Kapitel
│
├── docs/                               # Dokumentation & PDFs
│   ├── FACHKONZEPT_B02_B10.md          # Fachkonzept B-02/B-10
│   ├── AM-01-Prod-Modus-Uebersicht.md
│   ├── API_SETUP.md
│   ├── CHANGELOG.md
│   ├── CLOUDFLARE_DEPLOYMENT.md
│   ├── FEATURE_CHECKLIST.md
│   └── ... (weitere Docs & PDFs)
│
├── cloudflare/                         # Cloudflare Worker & Setup
│   ├── feedback-worker.js
│   ├── SETUP.md
│   ├── setup.sh
│   └── setup-cloudflare.js
│
├── cv/                                 # CV/Lebenslauf-Modul
│   ├── cv-builder.html
│   └── max-berger-cv.html
│
├── kreditanalyse/                      # Kreditanalyse (React/Vite App)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/                 # React Components
│   │   ├── context/                    # AppContext
│   │   ├── data/                       # Daten (Branchen, Ratings, etc.)
│   │   ├── hooks/                      # Custom Hooks (useAI)
│   │   └── utils/                      # Utilities
│   └── dist/                           # Build-Output
│
└── versicherungswissen/                # Versicherungswissen Markdown-Dateien
    ├── 01_Der_Markt_im_Ueberblick_Research.md
    ├── Kapitel_04_Vertriebswege_Research.md
    └── compass_artifact_*.md           # Compass Artefakte
```

### 1.3 Moduluebersicht

| Modul-Praefix | Modul | Beschreibung |
|---|---|---|
| M-01 | Landing Page | Hauptstartseite / Modulauswahl. **NEU (v19):** Seitentitel "KI-Vertriebsarbeitsplatz" mit SVG-Icon (gruener Checkmark-Kreis) oberhalb der Modul-Tabs (`welcome-page-title`) |
| A-01 | Agentur-Auswahl | Vermittler-Auswahl (Landing im Versicherungsmodul) |
| **A-02** | **Vermittler-Overview (AO)** | **Agentursicht mit KPI, Kundenliste, Tabs** |
| A-02b | Vermittler B2B | Makler B2B Ansicht (Ecclesia) |
| A-02c | Vermittler Gewerbe 360 | MRH Trowe Gewerbemakler |
| A-03 | Gesamtsicht/Dashboard | 9 KPI-Boxen Dashboard |
| A-04 | Kunden-Uebersicht | Tabellen-Ansicht der Kunden |
| A-05 | Potentialanalyse | Potentialanalyse & FIDA Cases |
| A-08 | KI-Chat Versicherung | Chat mit Mock-Daten |
| A-09 | Finanzplanung | Finanzplanungs-Tool |
| **A-10** | **Kunden-Detailansicht** | **Einzelkunden-Detail mit Vertraegen, KI-Beratung** |
| A-10b | Kunden-Detail B2B | B2B Kunden-Detail |
| A-10c | Kunden-Detail Gewerbe | Gewerbe 360 Kunden-Detail |
| A-11 | BGAV Uebersicht | Vermittler-Tabelle + Charts |
| A-12 | BGAV Simulation | Provisions-Rechner |
| B-01 | Banken Segmentierung | Banken-Modul Hauptseite |
| **B-02** | **Berater-Uebersicht (VR Retail)** | **Banking Berater-Overview (Restant)** |
| B-02b | Berater Firmenkunde | Banking Berater FK |
| B-02c | Berater Vermoegen | Banking Berater PB |
| **B-10** | **Kunden-Detail Bank** | **Banking Kunden-Detail (Restant)** |
| B-10b | Kunden-Detail FK | Banking Firmenkunden-Detail |
| B-10c | Kunden-Detail PB | Banking Private Banking Detail |
| AM-01 | Asset Management | Asset Management Modul |
| R-01 | Risikoscoring | Scoring Dashboard |
| T-01 | Bestandsuebertragung | Portfolio Transfer Tool |
| P-01 | PMO Toolbox | Projekt-Management Office |
| H-01 | HR Pipeline | Recruiting & Bewerbermanagement |
| V-01 | Versicherungs-1x1 | Versicherungs-Grundlagen |
| K-01 | KI-Kreditanalyse | React-basierte Kreditanalyse |

### 1.4 Dateizuordnung zu A-02, A-10, B-02, B-10

#### A-02 (Vermittler-Overview)
| Datei | Beschreibung |
|---|---|
| `js/agentur-overview-core.js` | A-02 Core: showAgenturOverview, Tabs, KPIs (643 Zeilen) |
| `js/agentur-overview-tables.js` | A-02 Tabellen: Mock-Daten, Vertraege, Filter (557 Zeilen) |
| `js/agentur-overview-features.js` | A-02 Features: Billing, FIDA, Chat, Potentiale (1076 Zeilen) |
| `js/agentur-overview-banking.js` | A-02/B-02 Banking-Berater-Modus (1174 Zeilen) |
| `js/makler-modus.js` | A-02b Makler Modus-Toggle (781 Zeilen) |
| `js/makler-kunden.js` | A-02b Kundenliste & Detail (510 Zeilen) |
| `js/makler-b2b.js` | A-02b B2B-Rendering (594 Zeilen) |
| `js/makler-overview.js` | A-02b Uebersicht & Potentiale (412 Zeilen) |
| `js/mrh-trowe-modes.js` | A-02c View-Modes (614 Zeilen) |
| `js/mrh-trowe-render.js` | A-02c Rendering & Dashboards (621 Zeilen) |
| `js/mrh-trowe-detail.js` | A-02c Kunden-Detail (399 Zeilen) |
| `css/agentur-fachkonzept.css` | A-02 Styling |
| `css/makler.css` | A-02b Styling |
| `css/mrh-trowe.css` | A-02c Styling |
| `index.html` (Zeilen ~1900-4200) | A-02 HTML-Struktur |

#### A-10 (Kunden-Detailansicht)
| Datei | Beschreibung |
|---|---|
| `js/kunden-detail-core.js` | A-10 Core: Navigation, Sticky-Bar (524 Zeilen) |
| `js/kunden-detail-data.js` | A-10 Daten: Mock-Kunden, fillKundenDetail (558 Zeilen) |
| `js/kunden-detail-features.js` | A-10 Features: Tier-Form, Angebote, Tabs (485 Zeilen) |
| `js/kunden-detail-banking.js` | A-10/B-10 Bank-Kundendaten (1021 Zeilen) |
| `js/finanzplanung.js` | A-09/A-10 Finanzplanung |
| `js/clv.js` | Customer Lifetime Value (unifiziert: Versicherung + Banking) |
| `css/kunden-detail.css` | A-10 Styling |
| `css/finanzplanung.css` | Finanzplanung Styling |
| `css/kunde-sticky-bar.css` | Sticky Bar Styling |
| `index.html` (Zeilen ~4200-7400) | A-10 HTML-Struktur |

#### B-02 (Berater-Uebersicht Banking) – Restant
| Datei | Beschreibung |
|---|---|
| `js/agentur-overview-banking.js` | B-02 Logik (ehemals agentur-overview.js ab Zeile ~2280) |
| `css/banking-berater.css` | B-02/B-10 eigene Styles |
| `index.html` (Zeilen ~7374-7700) | B-02 HTML-Struktur |
| `docs/FACHKONZEPT_B02_B10.md` | Fachkonzept-Dokumentation |

#### B-10 (Kunden-Detail Bank) – Restant
| Datei | Beschreibung |
|---|---|
| `js/kunden-detail-banking.js` | B-10 Logik (ehemals kunden-detail.js ab Zeile ~1568, jetzt eigene Datei) |
| `css/banking-berater.css` | B-02/B-10 eigene Styles |
| `index.html` (Zeilen ~7415-7655) | B-10 HTML (teilweise auskommentiert) |
| `js/page-id-tracker.js` | Page ID Mapping fuer B-10 |
| `js/router.js` | Routing fuer B-10 |

---

## 2. Modul A-02 – Vermittler-Overview (Detailanalyse)

### 2.1 Zweck, Zielgruppe & Kontext

**Zweck:** Zentrale Uebersichtsseite fuer einen einzelnen Versicherungsvermittler (Agenturbetrieb). Zeigt alle relevanten KPIs, Kundenlisten, Vertragsdaten und Qualitaetskennzahlen.

**Zielgruppe:** Vertriebsleiter, Agenturinhaber, Aussendienst-Fuehrungskraefte

**Kontext im Gesamtsystem:**
- Erreichbar ueber Route `/agentur` (Hash `#/agentur`)
- Page-ID: `A-02`
- Lebt innerhalb des `versicherungModule`-Containers
- Einstieg erfolgt typischerweise ueber Landing Page (M-01) → Versicherungsmodul → Agentur-Auswahl (A-01) → A-02
- Varianten: A-02b (Makler B2B / Ecclesia), A-02c (Gewerbe 360 / MRH Trowe)
- B-02 (Banking Berater) ist KEIN separates Modul, sondern als View-Mode in agentur-overview.js integriert

**Hauptdatei:** `js/agentur-overview.js` (ca. 3.400+ Zeilen)
**HTML-Bereich:** `index.html` Zeilen ~1900-4200 (Container `#agenturOverview`)
**CSS:** `css/agentur-fachkonzept.css`

### 2.2 Screens, Views & Tabs

#### 2.2.1 Haupt-Container
- `#agenturOverview` – Gesamter A-02 Bereich, wird via `style.display` ein-/ausgeblendet

#### 2.2.2 Header-Bereich
- Vermittler-Profilbild (Avatar mit Initialen)
- Name, Vermittler-ID, Standort
- Stammdaten-Button (oeffnet Stammdaten-Overlay)
- Dropdown zur Vermittler-Auswahl (`#agenturDropdown`)
- KPI-Cockpit mit 9 Boxen (siehe 2.6.1)

#### 2.2.3 Tab-System (Hauptnavigation)
Das Tab-System wird ueber `showAgenturTab(tabName)` gesteuert. Verfuegbare Tabs:

| Tab-Name | DOM-ID | Beschreibung |
|---|---|---|
| `uebersicht` | `#agenturTabUebersicht` | Standard-Tab: Cockpit-KPIs, Aktivitaeten |
| `neugeschaeft` | `#agenturTabNeugeschaeft` | Neugeschaeft-Vertragstabelle mit Filtern |
| `bestand` | `#agenturTabBestand` | Bestandsvertraege mit Zeitraum-Filter |
| `storno` | `#agenturTabStorno` | Storno-Vertraege mit Typ-Filter |
| `provision` | `#agenturTabProvision` | Provisionsabrechnung & Diagramme |
| `qualitaet` | `#agenturTabQualitaet` | Qualitaetskennzahlen & Bewertungen |
| `kunden` | `#agenturTabKunden` | Kundenliste mit Suchfunktion |
| `potentiale` | `#agenturTabPotentiale` | Vertriebspotentiale & FIDA Cases |
| `kommunikation` | `#agenturTabKommunikation` | Kommunikationshistorie |

#### 2.2.4 Overlays & Modals
- **Stammdaten-Overlay** (`#stammdatenOverlay`): Detaillierte Vermittler-Stammdaten
- **Vertrags-Detail-Modal** (`#vertragDetailModal`): Einzelvertrags-Ansicht bei Klick auf Tabellenzeile
- **Billing-Check Modal** (`#billingCheckModal`): Abrechnungspruefung
- **KI-Chat Panel** (`#agenturChatPanel`): Chat-Bereich fuer Vermittler-spezifische Fragen

### 2.3 Klickstrecken & User Flows

#### Flow 1: Grundnavigation
```
Landing (M-01) → Modul "Versicherung" waehlen → Agentur-Auswahl (A-01)
  → Vermittler auswaehlen → showAgenturOverview(vermittlerId)
  → loadAgenturData() → fillHeader() + fillCockpitKPIs() + showAgenturTab('uebersicht')
```

#### Flow 2: Tab-Wechsel
```
A-02 Uebersicht → Klick auf Tab-Button → showAgenturTab(tabName)
  → Alle Tab-Contents ausblenden → Gewaehlten Tab einblenden
  → Tab-spezifische Befuellung aufrufen (z.B. fillNeugeschaeftTab())
```

#### Flow 3: Vertrags-Detail
```
A-02 Tab "Neugeschaeft"/"Bestand"/"Storno" → Klick auf Tabellenzeile
  → openVertragDetail(vertrag) → Modal mit Vertragsdetails oeffnen
  → "Schliessen" oder Klick ausserhalb → closeVertragDetail()
```

#### Flow 4: Kunde oeffnen (A-02 → A-10)
```
A-02 Tab "Kunden" → Klick auf Kundenzeile → openKundenDetail(kundenId)
  → A-02 ausblenden → A-10 einblenden → Kundendaten laden
```

#### Flow 5: Vermittler wechseln
```
A-02 → Dropdown "#agenturDropdown" → anderen Vermittler waehlen
  → showAgenturOverview(neueVermittlerId) → Daten neu laden
```

#### Flow 6: Zurueck zur Auswahl
```
A-02 → "Zurueck"-Button → backFromAgentur()
  → A-02 ausblenden → Agentur-Auswahl (A-01) einblenden
```

#### Flow 7: KI-Chat
```
A-02 → Chat-Icon klicken → Chat-Panel oeffnen
  → Nachricht eingeben → sendAgenturChat()
  → getAgenturChatResponse() (Mock) → Antwort anzeigen
```

#### Flow 8: FIDA Cases filtern
```
A-02 Tab "Potentiale" → Dropdown "FIDA Case" → filterFidaCases(caseType)
  → Tabelle gefiltert anzeigen
```

### 2.4 Funktionen & Handler (vollstaendig)

#### 2.4.1 Haupt-Einstiegsfunktionen

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `showAgenturOverview(vermittlerId)` | ~25 | Haupteinstieg: Blendet andere Seiten aus, zeigt A-02, ruft `loadAgenturData()` |
| `loadAgenturData(vermittlerId)` | ~80 | Laedt Vermittlerdaten, ruft alle fill-Funktionen, initialisiert Tabs |
| `openAgenturView()` | ~15 | Wrapper fuer Router-Navigation, ruft `showAgenturOverview()` |

#### 2.4.2 Header & Cockpit

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `fillHeader()` | ~180 | Befuellt Header mit Vermittler-Name, ID, Standort, Avatar |
| `fillCockpitKPIs()` | ~230 | Rendert 9 KPI-Boxen mit Werten, Trends, Sparklines |
| `updateDynamicDates()` | ~140 | Setzt alle Datumsanzeigen relativ zum aktuellen Datum |

#### 2.4.3 Tab-Befuellung

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `showAgenturTab(tabName)` | ~300 | Tab-Switching: blendet Inhalte ein/aus, aktiviert Tab-Button |
| `fillNeugeschaeftTab()` | ~450 | Neugeschaeft-Tab: Tabelle mit Mock-Vertraegen, Filter-Dropdowns |
| `fillBestandTab()` | ~550 | Bestand-Tab: Bestandsvertraege mit Zeitraum-Filter |
| `fillStornoTab()` | ~650 | Storno-Tab: Storno-Vertraege mit Typ-Filter (Frueh/Spaetstorno) |
| `fillProvisionTab()` | ~750 | Provisions-Tab: Abrechnung, Charts (Chart.js Bar/Doughnut) |
| `fillQualitaetTab()` | ~850 | Qualitaets-Tab: Scoring-Werte, Ampel-Anzeigen |
| `fillStammdaten()` | ~950 | Stammdaten-Overlay mit Kontaktdaten, Bankverbindung etc. |

#### 2.4.4 Vertragstabellen

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `generateMockVertraege()` | ~1050 | Erzeugt Mock-Vertraege aus `kundenBestandVertraege`-Array |
| `fillNeugeschaeftTable(data)` | ~1150 | Rendert Neugeschaeft-Tabelle in DOM |
| `fillBestandTable(data)` | ~1200 | Rendert Bestand-Tabelle in DOM |
| `fillStornoTable(data)` | ~1250 | Rendert Storno-Tabelle in DOM |
| `filterVertraegeSparte(sparte)` | ~1300 | Filtert Vertraege nach Sparte (Leben, Kranken, etc.) |
| `filterStornoTyp(typ)` | ~1350 | Filtert nach Storno-Typ (Fruehstorno, Spaetstorno) |
| `searchVertraege(query)` | ~1400 | Textsuche ueber Vertraege (Name, Vertragsnr.) |
| `filterBestandZeitraum(zeitraum)` | ~1450 | Zeitraumfilter fuer Bestandsvertraege |
| `openVertragDetail(vertrag)` | ~1500 | Oeffnet Modal mit Einzelvertragsdetails |
| `closeVertragDetail()` | ~1550 | Schliesst Vertragsdetail-Modal |

#### 2.4.5 Potentiale & FIDA

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `filterFidaCases(caseType)` | ~1600 | Filtert FIDA/Open Finance Cases nach Typ |
| `togglePotentialDetails(element)` | ~1650 | Klappt Potential-Details auf/zu (Accordion) |
| `toggleBeraterPotentialDetail(detailId, cardEl)` | ~575 (banking) | Klappt Potentiale-Detail-Panel auf/zu auf B-02 Potentiale-Tab (inkl. Herleitung + Aktionen) |
| `toggleVertriebsPeriod(period)` | ~1700 | Wechselt Zeitraum fuer Vertriebspotentiale |

#### 2.4.6 Navigation & Sonstiges

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `backFromAgentur()` | ~1750 | Zurueck zur Agentur-Auswahl (A-01) |
| `openBillingCheck()` | ~1800 | Oeffnet Abrechnungspruefungs-Modal |
| `closeBillingCheck()` | ~1830 | Schliesst Abrechnungspruefung |
| `openFormular(typ)` | ~1860 | Platzhalter fuer Banking-Formulare (nicht implementiert) |

#### 2.4.7 KI-Chat (A-02)

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `sendAgenturChat()` | ~1900 | Sendet Chat-Nachricht, ruft `getAgenturChatResponse()` |
| `askAgenturQuestion(frage)` | ~1950 | Quick-Action: Vordefinierte Frage an Chat senden |
| `getAgenturChatResponse(nachricht)` | ~2000 | Mock-Response-Generator: Keyword-basiert (Storno, Provision, etc.) |

#### 2.4.8 B-02 Banking-Berater Funktionen (ab Zeile ~2277)

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `showBeraterOverview(vermittlerId)` | ~2350 | B-02 Einstieg: Zeigt Banking-Berater-Uebersicht |
| `fillBeraterHeader()` | ~2420 | Header mit Berater-Profil (Maria Musterfrau) |
| `setBankViewMode(mode)` | ~2480 | Wechselt zwischen retail/fk/vw, speichert in localStorage |
| `showBeraterTab(tabName)` | ~2530 | Tab-Wechsel im B-02 Modus |
| `fillBeraterStammdaten()` | ~2580 | Berater-Stammdaten (Bankspezifisch) |
| `fillBeraterNeugeschaeft()` | ~2630 | Neugeschaeft mit Verbundpartner-Produkten |
| `fillBeraterErtraege()` | ~2680 | Ertragsanalyse (Zins/Provision/Gebuehr) |
| `fillBeraterQualitaet()` | ~2730 | Qualitaetskennzahlen Banking |
| `fillBeraterPotentiale()` | ~2780 | Cross-Selling & Verbundpartner-Potentiale |
| `fillBeraterWeiterePotentiale()` | ~2830 | Erweiterte Potentiale |
| `fillBeraterKreditportfolio()` | ~2880 | Kreditportfolio (nur FK-Modus) |
| `fillBeraterBranchenmix()` | ~2930 | Branchenmix-Analyse (nur FK-Modus) |
| `fillBeraterPortfolio()` | ~2980 | Depot-/Vermoegens-Portfolio (nur VW-Modus) |
| `fillBeraterPerformance()` | ~3030 | Performance-Kennzahlen (nur VW-Modus) |
| `fillBeraterNachfolge()` | ~3080 | Nachfolgeplanung (nur VW-Modus) |
| `fillBeraterKundenTable()` | ~3130 | Kundentabelle je nach bankViewMode |
| `filterBeraterKunden(query)` | ~3180 | Suche/Filter fuer Banking-Kunden |
| `toggleBeraterPeriod(period)` | ~3220 | Zeitraum-Toggle fuer B-02 KPIs |

#### 2.4.9 B-02 ↔ A-10 Bruecken-Funktionen

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `openBankKundenDetail(kundenId)` | ~3260 | Oeffnet A-10 im Banking-Modus (KEINE eigene B-10 Seite) |
| `populateA10BankDropdown(kunden)` | ~3290 | Befuellt A-10 Dropdown mit Banking-Kunden |
| `adaptA10ForBankMode(kundenId)` | ~3310 | Passt A-10 fuer Banking an: Header/Tabs, **Kundenfoto** (aus `bankKundenFotos`), **CLV** (via `calculateBankCLV()`), **Kinder-Badges**, **Kunden-ID** |
| `adaptA10HeaderTabsForBank()` | ~3340 | Aendert Tab-Beschriftungen (Vertraege→Produkte, etc.) |
| `navigateToBeraterTabFromA10()` | ~3370 | Zurueck von A-10 zu B-02 |
| `restoreA10InsuranceMode()` | ~3390 | Stellt A-10 Versicherungs-Modus wieder her |
| `restoreA10InsuranceDropdown()` | ~3410 | Stellt A-10 Versicherungs-Dropdown wieder her |
| `restoreA10InsuranceHeaderTabs()` | ~3430 | Stellt A-10 Versicherungs-Tabs wieder her |

#### 2.4.10 B-02 KI-Chat

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `sendBeraterChatMessage()` | ~3450 | Chat im Banking-Kontext |
| `getBeraterChatResponse(msg)` | ~3480 | Mock-Responses: Top-5-Kunden, Finanzplan, FIDA, Verbundpartner, Abwanderungsrisiko |

### 2.5 State Management

#### 2.5.1 Globale State-Variablen (agentur-overview.js)

| Variable | Typ | Default | Beschreibung |
|---|---|---|---|
| `currentAgenturIdInOverview` | String/null | `null` | Aktuell angezeigte Vermittler-ID |
| `bankViewMode` | String | `localStorage` oder `'retail'` | Banking View-Mode: `retail`, `fk`, `vw` |
| `currentBeraterTab` | String | `'uebersicht'` | Aktiver Tab in B-02 |
| `mockNeugeschaeft` | Array | `[]` | Generierte Neugeschaeft-Vertraege |
| `mockBestand` | Array | `[]` | Generierte Bestandsvertraege |
| `mockStorno` | Array | `[]` | Generierte Storno-Vertraege |

#### 2.5.2 State aus anderen Dateien

| Variable | Datei | Beschreibung |
|---|---|---|
| `state.currentView` | `js/data.js` | Aktuelle Hauptansicht der SPA |
| `state.filters.*` | `js/data.js` | Globale Filter (Jahr, Silo, Segmente, Produkte) |
| `state.agentur` | `js/data.js` | Ausgewaehlte Agentur-ID |

#### 2.5.3 Persistierung
- `bankViewMode` wird in `localStorage` gespeichert (Key: `bankViewMode`)
- Alle anderen State-Variablen sind rein In-Memory (gehen bei Reload verloren)
- Deep-Link-Unterstuetzung ueber Router: URL-Hash speichert aktuelle Route

### 2.6 Datenstrukturen & Mock-Daten

#### 2.6.1 KPI-Definitionen (aus config.js)

9 KPI-Boxen im Cockpit, definiert in `kpiDefinitions`:

| KPI-Key | Label | Beschreibung |
|---|---|---|
| `neugeschaeft` | Neugeschaeft | Neue Vertraege (Anzahl + Beitragssumme) |
| `bestand` | Bestand | Bestandsvertraege gesamt |
| `storno` | Storno | Stornoquote in % |
| `nps` | NPS | Net Promoter Score |
| `risiko` | Risiko | Risiko-Score |
| `combined` | Combined Ratio | Schaden-Kosten-Quote |
| `ergebnis` | Ergebnis | Ergebnis-Kennzahl |
| `underwriting` | Underwriting | Underwriting-Ergebnis |
| `deckungsbeitrag` | Deckungsbeitrag | Deckungsbeitrag in EUR |

Jede KPI-Box hat: Wert, Trend-Pfeil (auf/ab), Vergleichswert Vorjahr, SVG-Icon, Sparkline.

#### 2.6.2 Kunden-Bestandsvertraege (Mock-Daten)

`kundenBestandVertraege` Array (35 Eintraege, KD00001-KD00035):
```
{
  kundenId: "KD00001",
  vertraege: [
    {
      nr: "V-2024-001234",
      sparte: "Leben",
      produkt: "Risikolebensversicherung",
      beitrag: 125.50,
      beginn: "2024-01-15",
      status: "aktiv"
    },
    ...
  ]
}
```

Sparten: Leben, Kranken, Schaden/Unfall, Kfz, Haftpflicht, Hausrat, Wohngebaeude, Rechtsschutz, Unfall

#### 2.6.3 Kunden-Mapping

`kundenMapping` – Zuordnung KD-IDs zu Kundennamen (KD00001-KD00010):
```
{
  "KD00001": "Thomas Mueller",
  "KD00002": "Sabine Schmidt",
  ...
}
```

#### 2.6.4 Banking-Kundendaten (B-02 Bereich)

**Retail-Kunden** (`bankKundenRetail`, 12 Eintraege, KDB001-KDB012):
```
{
  name: "Julia Braun",
  id: "KDB001",
  geb: "1985-03-12",
  beruf: "Lehrerin",
  ort: "Gießen",
  segment: "Komfort",
  produkte: ["Girokonto", "Sparkonto", "Depot"],
  ertrag: 1250,
  finanzplan: true,
  letztKontakt: "2024-11-15",
  avatarBg: "#4A90D9",
  nps: 8,
  kinder: 2,
  email: "julia.braun@email.de",
  telefon: "0641-XXX",
  adresse: "Marktstr. 12, 35390 Gießen",
  arbeitgeber: "Landkreis Gießen",
  familienstand: "verheiratet",
  risikoscore: "niedrig",
  bonitaet: "A+"
}
```

**Firmenkunden** (`bankKundenFK`, 8 Eintraege, FKB001-FKB008):
```
{
  name: "Metzgerei Schneider GmbH",
  id: "FKB001",
  branche: "Lebensmittel",
  ort: "Wetzlar",
  kreditvol: 450000,
  rating: "BBB+",
  mitarbeiter: 12,
  ertrag: 8500
}
```

**Vermoegenskunden** (`bankKundenVW`, 6 Eintraege, PBB001-PBB006):
```
{
  name: "Dr. Heinrich von Trott",
  id: "PBB001",
  ort: "Bad Nauheim",
  aum: 2800000,         // Assets under Management
  depot: 1500000,
  nachfolge: true,       // Nachfolgeplanung benoetigt
  stiftung: false,
  ertrag: 42000
}
```

**Neugeschaeft Banking** (`bankNeugeschaeft`, 12 Eintraege):
```
{
  kunde: "Julia Braun",
  produkt: "R+V Riester-Rente",
  partner: "R+V Versicherung",    // Verbundpartner
  volumen: 150,
  datum: "2024-11-20",
  status: "abgeschlossen"
}
```

#### 2.6.5 Berater-Profildaten

`beraterData` Objekt:
```
{
  name: "Maria Musterfrau",
  id: "VB-40210",
  filiale: "Volksbank Mittelhessen eG",
  standort: "Gießen",
  position: "Privatkundenberaterin",
  seit: "2018",
  kunden: 245,
  ertrag: 385000,
  ...
}
```

### 2.7 API-Calls & KI-Integration

#### 2.7.1 Chat-System (Mock-Modus)

A-02 nutzt **ausschliesslich Mock-Responses** (kein echter API-Call):

- `getAgenturChatResponse(nachricht)` – Keyword-basierte Mock-Antworten:
  - Keywords "storno"/"kuendigung" → Storno-Analyse-Antwort
  - Keywords "provision"/"abrechnung" → Provisions-Auskunft
  - Keywords "neugeschaeft"/"vertrieb" → Vertriebsempfehlung
  - Keywords "kunde"/"beratung" → Beratungshinweise
  - Fallback → Allgemeine Hilfe-Antwort

- `getBeraterChatResponse(msg)` – Banking-Mock-Antworten:
  - "top 5"/"beste kunden" → Kundenliste mit Ertraegen
  - "finanzplan"/"finanzcheck" → Finanzplanungs-Hinweise
  - "open finance"/"fida" → FIDA/PSD3-Informationen
  - "verbundpartner"/"cross selling" → R+V, Union Investment, Schwäbisch Hall Empfehlungen
  - "abwanderung"/"risiko" → Abwanderungsrisiko-Analyse

#### 2.7.2 Keine echten API-Calls

A-02 macht **keine** direkten API-Calls an den Cloudflare Worker (`vst-claude-api.eike-3e2.workers.dev`). Der echte API-Call ist nur im allgemeinen Chat (chat.js, Modul T-05) aktiv.

### 2.8 UI/Layout pro Screen

#### 2.8.1 Gesamtlayout A-02
```
+--------------------------------------------------+
| Header: Avatar | Name | ID | Standort | Dropdown |
+--------------------------------------------------+
| KPI-Cockpit: 9 Boxen (3x3 Grid)                 |
| [NG] [Bestand] [Storno] [NPS] [Risiko]          |
| [Combined] [Ergebnis] [UW] [DB]                 |
+--------------------------------------------------+
| Tab-Navigation:                                   |
| [Uebersicht|NG|Bestand|Storno|Provision|...]     |
+--------------------------------------------------+
| Tab-Content (wechselt je nach aktivem Tab):       |
| - Tabellen mit Sortierung/Filterung              |
| - Charts (Chart.js)                              |
| - Karten (Leaflet)                               |
+--------------------------------------------------+
| Chat-Panel (einblendbar, rechts unten)           |
+--------------------------------------------------+
```

#### 2.8.2 Tab "Neugeschaeft"
- Filter-Leiste: Sparten-Dropdown, Zeitraum, Freitextsuche
- Tabelle: Vertragsnr., Kunde, Sparte, Produkt, Beitrag, Beginn, Status
- Klick auf Zeile → Vertragsdetail-Modal

#### 2.8.3 Tab "Bestand"
- Filter: Zeitraum-Auswahl (Monat/Quartal/Jahr)
- Tabelle: Vertragsnr., Kunde, Sparte, Produkt, Beitrag, Laufzeit, Status
- Bestandsentwicklungs-Chart (Chart.js Line)

#### 2.8.4 Tab "Storno"
- Filter: Storno-Typ (Fruehstorno < 1 Jahr, Spaetstorno > 1 Jahr)
- Tabelle: Vertragsnr., Kunde, Sparte, Stornodatum, Grund, Beitragsverlust
- Stornoquoten-Chart

#### 2.8.5 Tab "Provision"
- Uebersicht: Gesamtprovision, AP/BP-Aufschluesselung
- Bar-Chart: Monatliche Provisionsentwicklung
- Doughnut-Chart: Provisionsverteilung nach Sparte

#### 2.8.6 Tab "Kunden"
- Suchfeld mit Live-Filter
- Tabelle: Name, Kunden-ID, Segment, Vertragsanzahl, Beitragssumme, Letzter Kontakt
- Klick auf Zeile → Navigation zu A-10 (Kunden-Detail)

#### 2.8.7 Tab "Potentiale"
- FIDA Cases Dropdown-Filter
- Accordion-Elemente fuer einzelne Potentiale
- Vertriebsperioden-Toggle (Monat/Quartal/Jahr)
- **NEU (v19):** Aufklappbare Detail-Panels pro Potential-Item (wie A-10 Impulse):
  - Klick auf Potential-Card oeffnet/schliesst Detail-Panel (`toggleBeraterPotentialDetail()`)
  - Detail-Panel zeigt: Herleitung (Datenquelle, Kunde, erkannte Situation, empfohlenes Produkt, erwarteter Ertrag)
  - Aktions-Buttons: "Kunde oeffnen" (→ A-10) und "Termin vereinbaren"
  - Expand-Pfeil rotiert 180° bei Auf-/Zuklappen

---

## 3. Modul A-10 – Kunden-Detailansicht (Detailanalyse)

### 3.1 Zweck, Zielgruppe & Kontext

**Zweck:** Detailansicht fuer einen einzelnen Versicherungskunden. Zeigt Stammdaten, Vertraege, Open Finance (FIDA) Daten, Beratungsimpulse, CLV-Analyse, Kommunikationshistorie und KI-gestuetzte Produktempfehlungen.

**Zielgruppe:** Versicherungsvermittler, Berater im Kundenkontakt

**Kontext im Gesamtsystem:**
- Erreichbar ueber Route `/kundendetail` (Hash `#/kundendetail`)
- Page-ID: `A-10`
- Lebt innerhalb des `versicherungModule`-Containers
- Einstieg erfolgt ueber A-02 (Kundenliste) oder A-05 (Potentialanalyse)
- Varianten: A-10b (B2B), A-10c (Gewerbe 360)
- B-10 (Banking Kunden-Detail) ist als separater Bereich in derselben Datei integriert (ab Zeile ~1512)

**Hauptdatei:** `js/kunden-detail.js` (ca. 2.534 Zeilen)
**HTML-Bereich:** `index.html` Zeilen ~4200-7400 (Container `#kundenDetailPage`)
**CSS:** `css/kunden-detail.css`, `css/kunde-sticky-bar.css`

### 3.2 Screens, Views & Tabs

#### 3.2.1 Haupt-Container
- `#kundenDetailPage` – Gesamter A-10 Bereich, per `style.display` gesteuert
- CSS-Klassen: `makler-view` oder `ao-view` (je nach Vermittlermodus)
- Kann auch `bank-mode` Klasse tragen (wenn von B-02 aufgerufen)

#### 3.2.2 Shared Header
- Vermittler-Foto + Name (vom A-02 uebernommen)
- Vermittler-ID
- Kunden-Dropdown (`#kundenSwitchSelect`) zum Kundenwechsel ohne Zuruecknavigation
- Finance-Mode-Toggle (`#a10FinanceModeToggle`): `closed` / `open` (Open Finance)

#### 3.2.3 Kunden-Profil-Bereich
- Kundenfoto (aus Adobe Stock oder SVG-Fallback)
- Name, Geburtsdatum, Adresse, Telefon, E-Mail
- Beruf, Familienstand, Arbeitgeber, Beschaeftigt seit
- Kinder-Badges
- Haustier-Info (mit Popup-Formular, localStorage-Persistierung)
- NPS-Score (1-10 Sterne, Popup mit Detailkategorien)
- Risikoscore (0-100, Farbbalken + Tooltip mit Risikofaktoren)
- Bonitaetsscore (0-100, Farbbalken)

#### 3.2.4 Tab-System (Hauptnavigation)
Gesteuert ueber `switchKundenTab(tabName)`:

| Tab-Name | DOM-ID | Beschreibung |
|---|---|---|
| `stammdaten` | `#tabStammdaten` | Standard-Tab: Stammdaten + CLV + Scores + Haustier |
| `vertraege` | `#tabVertraege` | Betreute Vertraege + Schadenhistorie |
| `fida` | `#tabFida` | Open Finance / FIDA mit 4 Bedarfsfeldern (Bezahlen, Sparen, Absichern, Finanzieren) |
| `impulse` | `#tabImpulse` | Vertriebspotentiale: Whitespots + Anpassungsbedarfe mit Angebots-Dropdown |
| `finanzplanung` | `#tabFinanzplanung` | Liquiditaets-Dashboard, Sparziele, Rentensimulator mit Szenario-Vergleich |
| `kommunikation` | `#tabKommunikation` | Kommunikationshistorie-Timeline (E-Mail, Brief, Telefon) |

**Hinweis:** Der FIDA-Tab hat die CSS-Klasse `open-finance-only` und wird nur im Open-Finance-Modus angezeigt.

#### 3.2.5 Stammdaten-Varianten (kontextabhaengig)
- `#privatStammdaten` – Standard Privatkunden-Stammdaten (immer sichtbar)
- `#maklerStammdaten` – B2B Makler-Stammdaten (Branche, Segment, Mitarbeitende, Jahresumsatz, etc.) – hidden
- `#mrhStammdatenA10` – Gewerbemakler 360° Stammdaten (Branche, Specialty, Gesellschaftsform, etc.) – hidden

#### 3.2.6 Overlays & Modals
- **NPS-Detail-Popup** (`#npsDetailPopup`): Aufschluesselung nach 5 Kategorien
- **Tier-Popup** (`#tierPopup` + `#tierPopupOverlay`): Haustier-Eingabeformular
- **Tarifvergleich-Modal** (`#tarifvergleichModal`): Vergleichstabelle verschiedener Versicherer
- **Angebot-Context-Menu**: Dropdown mit "PDF erstellen", "Entwurf speichern", "Tarifvergleich"
- **Angebot-Toast** (`#angebotToast`): Feedback-Toast fuer Angebotsaktionen

#### 3.2.7 Sticky Bar
- Fixierte Leiste am unteren Bildschirmrand
- Zeigt: Kundenname, Kunden-ID, NPS-Sterne, CLV-Wert, Segment
- Wird via `updateKundeStickyBar()` aktualisiert

### 3.3 Klickstrecken & User Flows

#### Flow 1: Kunde oeffnen (aus A-02)
```
A-02 Tab "Kunden" → Klick auf Kundenzeile
  → openKundenDetail(kundenName, vermittlerId)
  → Pruefe FIDA-Status aus Potentialanalyse
  → Merke Herkunfts-View (previousViewBeforeKundenDetail)
  → Verstecke alle anderen Seiten
  → Zeige kundenDetailPage
  → fillKundenDetail() → Stammdaten + Vertraege + CLV + NPS
  → updateKundenSharedHeader() → Vermittler-Info
  → initKundenFidaState() → FIDA ein/aus
  → syncA10FinanceToggle() → Finance-Mode synchronisieren
```

#### Flow 2: Kunde oeffnen (aus A-05 Potentialanalyse)
```
A-05 → Klick auf Kunden-Potential
  → openKundenDetail(kundenName, vermittlerId)
  → previousViewBeforeKundenDetail = 'potentialanalyse'
  → fidaActiveInPotentialAnalyse wird geprueft
  → Wenn FIDA aktiv war → automatisch in A-10 aktivieren
```

#### Flow 3: Tab-Wechsel
```
A-10 → Klick auf Tab-Button → switchKundenTab(tabName)
  → Alle Tab-Contents deaktivieren → Tab einblenden
  → Tab-spezifische Lazy-Render:
    - 'fida' → renderBezahlenContent()
    - 'impulse' → renderImpulseContent()
    - 'kommunikation' → renderKommContent()
```

#### Flow 4: Vermittlermodus wechseln (Makler ↔ AO)
```
A-10 → Toggle-Button Makler/AO
  → switchVermittlerMode(mode)
  → Produktvorschlaege umschalten (Makler-Vergleich vs. ERGO-Empfehlung)
  → Open Finance Tabelle anpassen (ERGO-Zeilen ein/ausblenden)
  → CSS-Klasse auf kundenDetailPage setzen
```

#### Flow 5: Tarifvergleich
```
A-10 → Produktempfehlung → "Angebot erstellen" Dropdown
  → toggleAngebotMenu() → Context-Menü anzeigen
  → angebotAction('vergleich', ...) → openTarifvergleich(produkt)
  → Modal mit Vergleichstabelle (4 Versicherer je Produkt)
```

#### Flow 6: Zurueck-Navigation
```
A-10 → "Zurueck"-Button → closeKundenDetail()
  → previousViewBeforeKundenDetail entscheidet Ziel:
    - 'landing' → Landing Page (M-01)
    - 'beraterOverview' → B-02 (Banking) + restoreA10InsuranceMode()
    - 'agentursicht' → A-02 Vermittler-Overview
    - Default → A-05 Potentialanalyse
  → URL-Route aktualisieren
```

#### Flow 7: Kunden wechseln (Dropdown)
```
A-10 → Kunden-Dropdown → switchKundeDropdown(kundenName)
  → Pruefe bank-mode:
    - Ja → openBankKundenDetail(kundenName)
    - Nein → openKundenDetail(kundenName, vermittlerId)
```

#### Flow 8: Haustier erfassen
```
A-10 Stammdaten → "Haustier hinzufuegen" Hint → openTierPopup(false)
  → Tierart waehlen (Hund/Katze) → onTierArtChange()
  → Name + Alter eingeben → saveTierInfo()
  → localStorage speichern → showSavedTierDisplay()
```

#### Flow 9: Zu Vertriebsbericht navigieren
```
A-10 → Button "Vertriebsbericht"
  → goToSalesReportFromKundenDetail()
  → A-10 ausblenden → navigateToSalesReport(agenturId)
```

### 3.4 Funktionen & Handler (vollstaendig)

#### 3.4.1 Haupt-Einstiegsfunktionen

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `openKundenDetail(kundenName, vermittlerId)` | ~111 | Haupteinstieg: FIDA-Check, View-Herkunft merken, Seiten verstecken/zeigen |
| `closeKundenDetail()` | ~303 | Navigation zurueck, erkennt Herkunfts-View automatisch |
| `fillKundenDetail(kundenName, vermittlerId)` | ~533 | Befuellt alle Stammdaten, Vertraege, CLV, NPS, Scores aus mockKunden |
| `updateKundenSharedHeader(kundenName, vermittlerId)` | ~373 | Kopiert Vermittler-Info/Foto in A-10 Header |
| `switchKundeDropdown(kundenName)` | ~440 | Kundenwechsel per Dropdown (erkennt bank-mode) |

#### 3.4.2 FIDA & Finance-Mode

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `initKundenFidaState()` | ~192 | Synchronisiert FIDA-Status aus Potentialanalyse |
| `syncA10FinanceToggle()` | ~215 | Synchronisiert Finance-Mode-Toggle mit globalem `financeMode` |
| `toggleKundenFida()` | ~1500 | Legacy: Wechselt zum FIDA-Tab |

#### 3.4.3 Vermittlermodus

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `switchVermittlerMode(mode)` | ~228 | Wechselt Makler/AO, passt Produktvorschlaege und Tabelle an |
| `updateOpenFinanceTable(mode)` | ~277 | Blendet ERGO-Zeilen im AO-Modus aus |

#### 3.4.4 Logo-Helper

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `getVersichererLogoUrl(name, size)` | ~74 | Gibt Logo-URL via logo.dev API zurueck |
| `versichererLogoImg(name, size)` | ~90 | Erzeugt `<img>`-Tag mit Versicherer-Logo |

#### 3.4.5 NPS-Anzeige

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `showNpsDetail()` | ~455 | Zeigt NPS-Detail-Popup (positioniert relativ zum Trigger) |
| `hideNpsDetail()` | ~475 | Versteckt NPS-Detail-Popup |

#### 3.4.6 Sticky Bar

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `updateKundeStickyBar(name, id, nps, clv, segment)` | ~484 | Aktualisiert fixierte Leiste am unteren Rand |

#### 3.4.7 Navigation

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `navigateToAgenturTab(tabName)` | ~416 | Zurueck zu A-02 mit spezifischem Tab |
| `goToSalesReportFromKundenDetail()` | ~514 | Navigiert zum Vertriebsbericht |
| `filterKundenliste(searchText)` | ~500 | Live-Filter fuer Kundenliste |

#### 3.4.8 Tab-Navigation

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `switchKundenTab(tabName)` | ~1341 | Tab-Wechsel mit Lazy-Rendering fuer fida/impulse/kommunikation |
| `toggleImpulsDetail(impulsId)` | ~1379 | Accordion fuer Beratungsimpulse |

#### 3.4.9 Kommunikation

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `viewKommunikation(kommId)` | ~1397 | Zeigt Kommunikationsdetail (alert-basiert, 4 Mock-Eintraege) |

#### 3.4.10 Angebot erstellen

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `toggleAngebotMenu(event, btn)` | ~1208 | Oeffnet/schliesst Context-Menü fuer Angebotsaktionen |
| `closeAllAngebotMenus()` | ~1233 | Schliesst alle offenen Angebotsmenüs |
| `angebotAction(typ, el)` | ~1240 | Fuehrt Angebotsaktion aus: 'pdf', 'entwurf', 'vergleich' |
| `showAngebotToast(type, message)` | ~1259 | Toast-Notification fuer Angebotsaktionen |
| `openTarifvergleich(produkt, empfehlung)` | ~1272 | Oeffnet Modal mit Tarifvergleichstabelle |
| `closeTarifvergleich()` | ~1300 | Schliesst Tarifvergleich-Modal |
| `getTarifData(produkt)` | ~1307 | Gibt Mock-Tarifdaten zurueck (4 Sets: RLV, Fonds-RV, Kfz, BU) |

#### 3.4.11 Haustier-Formular (localStorage-Persistierung)

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `getTierStorageKey()` | ~1068 | Generiert localStorage-Key pro Kunde |
| `initTierForm()` | ~1080 | Laedt gespeicherte Tier-Info aus localStorage |
| `onTierArtChange()` | ~1090 | Zeigt Detail-Felder bei Tierart-Auswahl |
| `saveTierInfo()` | ~1098 | Speichert Tier-Info in localStorage |
| `showSavedTierDisplay(data)` | ~1115 | Zeigt gespeicherte Tier-Info als Badge |
| `openTierPopup(isEdit)` | ~1137 | Oeffnet Tier-Eingabe-Popup (neu/bearbeiten) |
| `closeTierPopup()` | ~1175 | Schliesst Tier-Popup |
| `removeTierInfo()` | ~1183 | Loescht Tier-Info aus localStorage |

#### 3.4.12 B-10 Banking-Funktionen (ab Zeile ~1512)

| Funktion | Zeile (ca.) | Beschreibung |
|---|---|---|
| `fillBankKundenDetail(kundenName)` | ~1924 | Haupteinstieg B-10: Befuellt alle Banking-Kundendaten |
| `setTextById(id, text)` | ~2044 | Helper: Setzt Textinhalt eines Elements |
| `adjustColor(hex, amount)` | ~2049 | Helper: Passt Hex-Farbwert an |
| `calculateBankCLV(kd, retailData)` | ~2057 | CLV-Berechnung fuer Banking-Kunden |
| `fillBankStickyBar(name, retail, kd, clv)` | ~2069 | Banking Sticky Bar befuellen |
| `switchBankKundenTab(tabName)` | ~2106 | Tab-Wechsel in B-10 (6 Tabs) |
| `fillBankKonten(kd)` | ~2131 | Kontentabelle befuellen |
| `fillBankFida(kd)` | ~2147 | FIDA-Tab: Consent-Status, Drittbank-Daten, Bedarfsfelder |
| `fillBankImpulse(kundenName, kd, retailData)` | ~2297 | Beratungsimpulse generieren (regelbasiert) |
| `fillBankFinanzplanung(kd)` | ~2469 | Finanzplanung: Liquiditaet, Sparziele |
| `fillBankKommunikation(kd)` | ~2503 | Kommunikationshistorie befuellen |

### 3.5 State Management

#### 3.5.1 Globale State-Variablen (kunden-detail.js)

| Variable | Typ | Default | Beschreibung |
|---|---|---|---|
| `fidaActiveInPotentialAnalyse` | Boolean | `false` | War FIDA in A-05 aktiv? (Sync zu A-10) |
| `previousViewBeforeKundenDetail` | String | `'potentialanalyse'` | Herkunfts-View fuer Zurueck-Navigation |
| `currentKundenVermittlerId` | String/null | `null` | Aktuelle Vermittler-ID im Kontext |
| `currentVermittlerMode` | String | `'ao'` | Makler oder AO (Ausschliesslichkeit) |

#### 3.5.2 Externe State-Abhaengigkeiten

| Variable | Quelle | Beschreibung |
|---|---|---|
| `financeMode` | `landing.js` / `localStorage` | `'closed'` oder `'open'` (Open Finance Modus) |
| `bankKundenRetail` | `agentur-overview.js` | Retail-Kundenliste fuer B-10 Querverweise |

#### 3.5.3 Persistierung
- **Tier-Info**: `localStorage` (Key: `tierInfo_<kundenName>`)
- **Finance-Mode**: `localStorage` (Key: `financeMode`)
- **Agentur-Foto**: `localStorage` (Key: `agenturPhoto`)
- Alle anderen State-Variablen sind rein In-Memory

### 3.6 Datenstrukturen & Mock-Daten

#### 3.6.1 Versicherer-Logo-Mapping

`versichererLogoDomains` Objekt (72 Eintraege) – Mapping Versicherer-Name → Domain fuer logo.dev API:
- Versicherer: Allianz, ERGO, VHV, Helvetia, Alte Leipziger, AXA, etc.
- Banken: Sparkasse, Volksbank, ING, DKB, Commerzbank, Deutsche Bank, etc.
- Genossenschaftlicher Verbund: R+V, Union Investment, Schwaebisch Hall, DZ HYP, etc.

#### 3.6.2 Versicherungs-Kundendaten (mockKunden)

`mockKunden` Objekt (11 Kunden mit vollstaendigen Profilen):

| Kunde | Beruf | Risikoscore | NPS | Besonderheit |
|---|---|---|---|---|
| Peter Schmidt | Angestellter | 35 (Mittel) | 9 (Promoter) | Schadenhistorie, Risikosport (FIDA) |
| Amira Koenig | Lehrerin | 22 (Niedrig) | 7 (Passive) | Geschieden, 1 Kind |
| Thomas Weber | Software-Entwickler | 28 (Niedrig) | 8 (Promoter) | Ledig, Katze |
| Anna Hoffmann | Marketing-Managerin | 15 (Niedrig) | 10 (Promoter) | 2 Kleinkinder |
| Michael Braun | Geschaeftsfuehrer | 55 (Mittel) | 4 (Detractor) | Hund, hoher Versicherungsbedarf |
| Lisa Mueller | Aerztin | 20 (Niedrig) | 7 (Passive) | KfW-Studienkredit (FIDA) |
| Klaus Meier | Selbststaendig | 30 (Niedrig) | 9 (Promoter) | Handwerker, Betriebshaftpflicht |
| Matthias Engel | IT-Consultant | 18 (Niedrig) | 6 (Passive) | BU-Unterdeckung erkannt |
| Christian Bauer | Projektmanager | 25 (Niedrig) | 8 (Promoter) | Keine BU vorhanden (FIDA) |
| Martin Wolf | Dachdecker | 12 (Niedrig) | 3 (Detractor) | Hochrisiko-Beruf, keine BU |
| Eva Hartmann | Grafikdesignerin | 10 (Niedrig) | 9 (Promoter) | Selbststaendig, KfW-Kredit |

Jeder Kundendatensatz enthaelt:
```
{
  geburtsdatum, adresse, telefon, email, beruf, familienstand,
  arbeitgeber, beschaeftigtSeit, tiere,
  risikoscore (0-100), risikoDetails (Array), bonitaetsscore (0-100),
  kinder: [{ name, alter }],
  nps: { score, kategorie, datum, kampagne, details: [{ name, wert }] },
  vertraege: [{ typ, versicherer, details, praemie, beginn, status }],
  fidaVertraege: [{ anbieter, typ, info }],
  schadenhistorie: [{ datum, sparte, beschreibung, status, betrag, versicherer }]
}
```

#### 3.6.3 Kundenfotos-Mapping

`kundenFotos` (4 Eintraege) – Mapping Kundenname → Adobe Stock Bild:
- Peter Schmidt, Amira Koenig, Thomas Weber, Sabine Danzig

#### 3.6.4 Tarifvergleichs-Daten

`tarifSets` (4 Produkte mit je 4 Tarifen):
- Risikolebensversicherung: Hannoversche, CosmosDirekt, HUK-Coburg, ERGO
- Fondsgebundene Rentenversicherung: Alte Leipziger, Condor, Allianz, Zurich
- Kfz-Versicherung: HDI, HUK-Coburg, Allianz, VHV
- BU-Nachversicherung: ERGO, Alte Leipziger, HDI, Nuernberger

Jeder Tarif: `{ versicherer, tarif, beitrag, leistung, rating (1-5), empfohlen }`

#### 3.6.5 Kommunikations-Mockdaten

4 Kommunikationseintraege (fuer viewKommunikation):
- E-Mail: Kfz-Vertrag laeuft aus
- Brief: Open Finance Datenfreigabe
- Telefonat: Rueckruf Altersvorsorge
- E-Mail: Willkommen bei Open Finance

#### 3.6.6 Banking-Kundendaten (B-10 Bereich, ab Zeile ~1517)

`bankMockKunden` Objekt (12 Kunden mit vollstaendigen Banking-Profilen):

| Kunde | Beruf | Bonitaet | NPS | Besonderheit |
|---|---|---|---|---|
| Klaus Fischer | Maschinenbau-Ingenieur | 82 | 9 | Baufi-Anschluss 09/2026 |
| Sandra Mueller | Aerztin | 91 | 7 | Festgeld, hohes Sparpotential |
| Markus Wagner | Lehrer | 75 | 8 | Bausparvertrag, Riester |
| Julia Becker | Marketing-Managerin | 88 | 6 | Wenig Produkte, kein FIDA |
| Peter Hoffmann | Steuerberater | 79 | 9 | Hohes Vermoegen, Nachfolge |
| Andrea Lang | Steuerberaterin | 85 | 8 | Kanzlei-Erweiterung |
| Thomas Klein | Handwerksmeister | 68 | 7 | KfW-Foerderkredit |
| Monika Richter | Lehrerin | 80 | 8 | Familie, Kindersparen |
| Stefan Braun | IT-Consultant | 92 | 5 | Detractor, Multi-Depot (FIDA) |
| Katharina Wolf | Architektin | 84 | 9 | Baufi + Bauspar, Geschaeftskonto |
| Juergen Peters | Geschaeftsfuehrer | 76 | 8 | Grosskunde, Nachfolgeplanung |
| Sabine Kraus | Apothekerin | 87 | 7 | Apobank (FIDA), Depot-Wechsel |

Bankkundenstruktur (erweitert gegenueber Versicherung):
```
{
  ... // Basis-Stammdaten wie Versicherung
  nettoeinkommen: Number,
  konten: [{ produkt, details, saldo, eroeffnung, status }],
  fidaVertraege: [{ institut, typ, info, consent, gueltig }],
  sparenGeldmarkt: [{ produkt, anbieter, volumen, zinssatz, laufzeit }],
  sparenKapitalmarkt: [{ produkt, anbieter, volumen, sparrate, performance, quelle }],
  versicherungenEigen: [{ versicherung, anbieter, deckung, tarifart, leistungen[], praemie, vertrag }],
  versicherungenFremd: [{ versicherung, anbieter, deckung, tarifart, leistungen[], selbstbehalt, praemie, kuendigung }],
  finanzierungen: [{ kredit, kreditgeber, ursprung, restschuld, zinssatz, rate, laufzeit, absicherung, hinweis }],
  kommunikation: [{ typ, datum, betreff, inhalt, status }],
  avatarBg, foto
}
```

### 3.7 API-Calls & KI-Integration

#### 3.7.1 Kein direkter API-Call

A-10 macht **keine** echten API-Calls. Alle Daten sind Mock-Daten.

#### 3.7.2 Externe Dienste

- **logo.dev API**: `https://img.logo.dev/<domain>?token=pk_H7vb5Y2lTsW47U4Xq-w3HA` – Versicherer/Banken-Logos
  - Token ist hartcodiert (Public Key fuer logo.dev Free Tier)
  - Fallback: `onerror="this.style.display='none'"` (Logo wird bei Fehler ausgeblendet)

#### 3.7.3 B-10 Impulsgenerierung

Die B-10 Impulse werden **regelbasiert** generiert (nicht KI-basiert):
- Kein VR-FinanzPlan → Impuls "FinanzPlan erstellen"
- FIDA-Daten vorhanden → Impuls "Cross-Selling aus Open Finance"
- Keine FIDA-Daten → Impuls "FIDA-Consent einholen"
- Weniger als 4 Produkte → Impuls "Produktbreite erhoehen"
- NPS <= 6 → Impuls "Kundenzufriedenheit verbessern"
- Baufinanzierung vorhanden → Impuls "Anschlussfinanzierung pruefen"
- Immer: Impuls "Altersvorsorge pruefen"

Impulse enthalten `herleitung[]` mit Datenquelle, erkannter Situation und Empfehlung.
Quelle wird als "Truuco Impulsmanager / genoGPT" dargestellt.

### 3.8 UI/Layout pro Screen

#### 3.8.1 Gesamtlayout A-10
```
+----------------------------------------------------------+
| Shared Header: Vermittler-Foto | Name | ID | Dropdown   |
+----------------------------------------------------------+
| Kunden-Profil                                            |
| +------+  Name, Geburtsdatum, Adresse                   |
| | Foto |  Telefon, E-Mail, Beruf, Familienstand          |
| +------+  Arbeitgeber, Kinder, Haustier                  |
|            NPS [★★★★★★★★★☆] | Risiko [████░░] 35       |
|            Bonitaet [████████░░] 82                       |
+----------------------------------------------------------+
| Toggle: [AO/Makler] | Finance-Mode: [Closed/Open]       |
+----------------------------------------------------------+
| Tab-Navigation:                                           |
| [Stammdaten|Vertraege|FIDA|Impulse|Finanzplanung|Komm.]  |
+----------------------------------------------------------+
| Tab-Content (wechselt):                                   |
| - Vertragstabelle (eigene + FIDA-Fremdvertraege)         |
| - Produktempfehlungen (Makler vs. AO)                    |
| - CLV-Anzeige (Customer Lifetime Value)                  |
| - Schadenhistorie                                        |
+----------------------------------------------------------+
| Sticky Bar: Name | ID | NPS | CLV | Segment             |
+----------------------------------------------------------+
```

#### 3.8.2 Tab "Stammdaten"
- Kunden-Profilfoto + Name + Kunden-ID
- CLV-Badge im Header (Wert + Segment + Trend)
- Info-Grid: Geburtsdatum, Adresse, Telefon, E-Mail, Beruf, Familienstand, Kinder, Arbeitgeber, Haustier
- Risikoscore + Bonitaetsscore (Balken-Anzeige)
- NPS-Score mit Detail-Popup
- CLV-Detail-Card: Gesamt-CLV, Segment, Haltedauer, Storno-Risiko, Herleitung
- Kontextabhaengig: Makler-Stammdaten oder Gewerbe-360-Stammdaten (hidden)

#### 3.8.3 Tab "Vertraege"
- Betreute Vertraege Tabelle (`#betreuteVertraegeTable`): Typ, Versicherer (mit Logo), Details, Praemie, Beginn, Status
- Spalte "Versicherer" nur im Makler-Modus sichtbar (`.makler-only-col`)
- Schadenhistorie Karte (`#schadenhistorieCard`, hidden wenn leer): Datum, Sparte, Beschreibung, Status, Betrag
- Produktvorschlaege (Makler: Multi-Versicherer-Vergleich; AO: ERGO-Empfehlung)

#### 3.8.4 Tab "FIDA/Open Finance"
- Consent-Status Grid: Status, Erteilt am, Gueltig bis, Datenquellen
- Externe Verkuepfungen Tabelle (Banken, Versicherer)
- 4 Bedarfsfelder als Cards:
  - **Bezahlen:** Nettoeinkommen, Ausgaben, Freies Einkommen (via `bezahlen.js`)
  - **Sparen & Vorsorgen:** Geldmarkt + Kapitalmarkt Tabellen
  - **Absichern:** Eigene + Wettbewerber-Versicherungen
  - **Finanzieren:** Baudarlehen, Konsumentenkredite mit Warnhinweisen

#### 3.8.5 Tab "Impulse"
- **Whitespots (Neugeschaeft):** Risikoleben, Fondspolice – mit Angebots-Dropdown
- **Anpassungsbedarfe (Aenderungsgeschaeft):** Kfz, BU, Hausrat, Konsumentenkredit
- Jeder Impuls: Icon, Titel, Prioritaet-Badge, Volumen-Badge, Provisions-Badge
- Expandierbar: Herleitung-Grid + Vergleichstabelle (Bestehend vs. Angebot) + Aktionen
- Angebots-Context-Menu: PDF generieren, Als Entwurf speichern, Tarifvergleich starten

#### 3.8.6 Tab "Finanzplanung"
- **Liquiditaets-Dashboard:** Einnahmen vs. Ausgaben Balkendiagramm, Freies Einkommen
- **Sparziele:** 3 Beispielziele (Auto, Eigenkapital Immo, Rentenluecke) mit Fortschrittsbalken
- **Rentenluecken-Simulator** (`#rentenSimulatorCard`):
  - 3 interaktive Range-Slider: Rentenalter (60-67), Wunschrente (1500-4000), Rendite (2-8%)
  - Visualisierung: Gesetzliche Rente vs. Rentenluecke vs. Wunschrente
  - Ergebnisse: Kapitalbedarf, Bereits angespart, Sparrate-Bedarf
  - Aktionen: Angebot erstellen, Termin vereinbaren
- **Szenario-Vergleich:** Canvas-Chart (`#szenarioChart`) mit 3 Szenarien (konservativ/moderat/optimistisch)

#### 3.8.7 Tab "Kommunikation"
- Options-Switcher fuer verschiedene Darstellungsformen
- Timeline-Darstellung mit Typ-Icons (E-Mail, Brief, Telefon, Termin)
- Jeder Eintrag: Typ, Datum, Betreff, Status-Badge, `onclick: viewKommunikation()`

---

## 4. Restanten-Check: B-02 und B-10

### 4.1 Architektonische Entscheidung

B-02 und B-10 sind **keine eigenstaendigen Module**, sondern in A-02 bzw. A-10 integrierte View-Modi. Die Architekturentscheidung war bewusst: Statt separater Dateien werden die Banking-Funktionen als Erweiterungen der Versicherungsmodule implementiert.

| Aspekt | A-02/A-10 (Versicherung) | B-02/B-10 (Banking) |
|---|---|---|
| Eigene JS-Datei | Nein (gemeinsam) | Nein (gemeinsam) |
| Eigene HTML-Seite | `#agenturOverview` / `#kundenDetailPage` | `#beraterOverviewPage` (kein eigenes DOM!) / `#kundenDetailBankPage` |
| Eigene CSS-Datei | `agentur-fachkonzept.css` / `kunden-detail.css` | `banking-berater.css` (nur Color-Overrides) |
| Routing | `/agentur` / `/kundendetail` | `/berater` / `/kundendetail-bank` |
| Page-IDs | A-02 / A-10 | B-02 / B-10 |

### 4.2 B-02 Berater-Uebersicht – Status

#### 4.2.1 JavaScript (in agentur-overview.js, ab Zeile ~2277)

B-02 hat einen **vollstaendigen Funktionssatz** im JavaScript:
- `showBeraterOverview()` – Eigenstaendiger Einstiegspunkt
- `fillBeraterHeader()` – Eigener Header mit Banking-Profil
- `setBankViewMode(mode)` – 3 Modi: `retail`, `fk` (Firmenkunde), `vw` (Vermoegen)
- `showBeraterTab(tabName)` – Eigenstaendiges Tab-System
- 15+ Tab-Befuellungsfunktionen: Stammdaten, Neugeschaeft, Ertraege, Qualitaet, Potentiale, Kreditportfolio, Branchenmix, Portfolio, Performance, Nachfolge, etc.
- `filterBeraterKunden(query)` – Eigene Kundensuche
- `sendBeraterChatMessage()` / `getBeraterChatResponse()` – Eigener Mock-Chat
- Eigene Mock-Daten: `beraterData`, `bankKundenRetail` (12), `bankKundenFK` (8), `bankKundenVW` (6), `bankNeugeschaeft` (12)

#### 4.2.2 HTML

**Kein eigener Container** `#beraterOverviewPage` in index.html gefunden. B-02 rendert seinen Content dynamisch in den bestehenden `#agenturOverview`-Container oder nutzt die A-02 DOM-Struktur mit Banking-Overrides.

Der Chat-Widget fuer B-02 hat eigenes HTML (Zeilen ~7374-7413):
- `#beraterChatToggle` – Floating Chat-Button
- `#beraterChatWidget` – Chat-Panel mit "genoGPT Vertriebs-Assistent" Branding
- Quick-Action Buttons: Top 5 Ertragspotenzial, FinanzPlan-Potenziale, Open Finance Analyse, Verbundpartner, Abwanderungsrisiko

#### 4.2.3 CSS (banking-berater.css)

Eigenes Stylesheet mit Banking-spezifischen Overrides:
- **Farbvariablen:** `--bank-vr-blue: #003399`, `--bank-vr-orange: #FF6600`
- **3 Segment-Farben:** Retail (blau #2563eb), Firma (gruen #16a34a), PB (gold #d97706)
- **Header-Override:** Blauer Gradient statt Versicherungs-Gradient
- **Tab-Override:** Orangener Active-State statt Standard
- **Eigene Chat-Widget-Styles:** Banking-spezifisches Chat-Design

### 4.3 B-10 Kunden-Detail Bank – Status

#### 4.3.1 JavaScript (in kunden-detail.js, ab Zeile ~1512)

B-10 hat einen **vollstaendigen, eigenstaendigen Funktionssatz**:
- `fillBankKundenDetail(kundenName)` – Eigenstaendiger Einstiegspunkt
- `switchBankKundenTab(tabName)` – Eigenes Tab-System (6 Tabs)
- `fillBankKonten()` – Kontentabelle
- `fillBankFida()` – FIDA mit 4 Bedarfsfeldern (Bezahlen, Sparen, Absichern, Finanzieren)
- `fillBankImpulse()` – Regelbasierte Impulsgenerierung
- `fillBankFinanzplanung()` – Liquiditaet + Sparziele
- `fillBankKommunikation()` – Kommunikationshistorie
- Eigene Mock-Daten: `bankMockKunden` (12 vollstaendige Kundenprofile)

#### 4.3.2 HTML (index.html Zeilen ~7417-7655)

B-10 hat einen **eigenen, vollstaendigen HTML-Container** `#kundenDetailBankPage`:
- **Aber:** `style="display: none !important;" aria-hidden="true"` – permanent ausgeblendet!
- Kommentar in Zeile 7415: `"B-10 removed: Bank customer detail now uses unified A-10 page."`
- Der Container dient als "empty stub for JS compatibility"
- Trotzdem enthaelt er vollstaendiges HTML: Header, Sticky Bar, 6 Tabs (Stammdaten, Konten, FIDA, Impulse, Finanzplanung, Kommunikation)

#### 4.3.3 Bruecken-Mechanismus A-10 ↔ B-10

Statt den separaten B-10 Container zu nutzen, wird die **A-10 Seite fuer Banking adaptiert**:
1. `openBankKundenDetail()` → oeffnet A-10 Seite
2. `adaptA10ForBankMode()` → CSS-Klasse `bank-mode` setzen, Header/Tabs aendern, **Kundenfoto setzen** (aus `bankKundenFotos`), **CLV berechnen/befuellen** (via `calculateBankCLV()`), **Kinder-Badges** anzeigen, **Kunden-ID** aus `bankKundenRetail` uebernehmen
3. `adaptA10HeaderTabsForBank()` → Tab-Labels umschreiben (Vertraege→Produkte, etc.)
4. `restoreA10InsuranceMode()` → Aenderungen rueckgaengig machen bei Ruecknavigation

**Wichtig (v19):** `adaptA10ForBankMode()` schreibt direkt in die generischen A-10 Element-IDs (`kundenName`, `clvHeaderValue`, `.kunden-foto`, etc.), da die `bank`-prefixed IDs (`bankKundenFoto`, `bankClvHeaderValue`) im HTML nicht existieren.

### 4.4 Vergleich B-02/B-10 mit A-02/A-10

#### 4.4.1 Struktureller Vergleich

| Merkmal | A-02 | B-02 | A-10 | B-10 |
|---|---|---|---|---|
| Eigener Container | `#agenturOverview` | Kein eigener | `#kundenDetailPage` | `#kundenDetailBankPage` (hidden!) |
| Tab-Anzahl | 9 Tabs | 7 Tabs (+Divider) | 4 Tabs | 6 Tabs |
| Mock-Kunden | 35 (Vertraege) | 12 Retail + 8 FK + 6 VW | 11 Kunden | 12 Kunden |
| KPI-Boxen | 9 KPIs | 4 KPIs (lt. Fachkonzept) | - | CLV + NPS + Risiko + Bonitaet |
| Chat | Mock (Keyword) | Mock (Keyword) | - | - |
| FIDA-Integration | Optional | Zentral | Optional Tab | Zentrales Feature |
| CLV-Berechnung | - | - | Via `clv.js` | Eigene `calculateBankCLV()` |
| Impulse | - | - | Via `renderImpulseContent()` | Eigene `fillBankImpulse()` (regelbasiert) |

#### 4.4.2 Datenstruktur-Vergleich

| Feld | A-10 mockKunden | B-10 bankMockKunden |
|---|---|---|
| Stammdaten | Standard (Name, Adresse, etc.) | Standard + **Nettoeinkommen** |
| Vertraege | `vertraege[]` (Versicherung) | `konten[]` (Banking) |
| FIDA | `fidaVertraege[]` (Anbieter, Typ, Info) | `fidaVertraege[]` + **consent, gueltig** |
| Absicherung | In Vertraege integriert | Getrennt: `versicherungenEigen[]` + `versicherungenFremd[]` |
| Sparen | - | `sparenGeldmarkt[]` + `sparenKapitalmarkt[]` |
| Finanzierung | - | `finanzierungen[]` (Kredit, Restschuld, Rate) |
| Schadenhistorie | `schadenhistorie[]` | - |
| Kommunikation | `kommunikationen{}` (4 Eintraege, alert-basiert) | `kommunikation[]` (pro Kunde, Timeline-Darstellung) |
| Foto | `kundenFotos{}` (4 Eintraege) | `bankKundenFotos{}` (5 Eintraege) + avatarBg-Fallback |

#### 4.4.3 Funktionale Unterschiede

1. **FIDA als Kernfeature:** In B-10 ist Open Finance das zentrale Feature mit 4 Bedarfsfeldern (Bezahlen, Sparen, Absichern, Finanzieren). In A-10 ist FIDA ein optionaler Tab.

2. **Impuls-Herleitung:** B-10 zeigt fuer jeden Impuls eine detaillierte Herleitung (Datenquelle, erkannte Situation, Empfehlung). A-10 nutzt ein einfacheres Impulssystem.

3. **Finanzplanung:** B-10 hat Liquiditaets-Dashboard und Sparziele. A-10 nutzt `finanzplanung.js` (separates Modul A-09).

4. **Verbundpartner:** B-10 referenziert die genossenschaftlichen Verbundpartner (R+V, Union Investment, Schwaebisch Hall, DZ HYP, easyCredit). A-10 referenziert einzelne Versicherer.

5. **Branding:** B-10 nutzt "genoGPT Vertriebs-Assistent" und "Truuco Impulsmanager". A-10 hat keinen spezifischen KI-Branding.

### 4.5 Fazit Restanten-Check

| Modul | Status | Bewertung |
|---|---|---|
| **B-02** | Aktiv und funktional | Vollstaendig integriert in `agentur-overview.js`. Eigener Chat-Widget, eigene Daten, eigenes CSS. Wird aktiv ueber Router `/berater` angesteuert. |
| **B-10** | HTML deaktiviert, JS aktiv | HTML-Container ist mit `display:none!important` permanent versteckt. JS-Code und Mock-Daten sind vollstaendig vorhanden und funktional. B-10 wird ueber den A-10 Bruecken-Mechanismus (`adaptA10ForBankMode`) genutzt statt ueber den eigenen Container. |

**Technische Schulden:**
- `#kundenDetailBankPage` HTML ist ein "toter" Container (238 Zeilen HTML, nie sichtbar)
- B-10 JS-Funktionen wie `fillBankKundenDetail()` existieren und sind funktional, werden aber nur indirekt ueber den A-10 Adapter genutzt
- Doppelte Kundendaten: B-02 hat `bankKundenRetail` (Kurzform) UND B-10 hat `bankMockKunden` (Langform) fuer teils dieselben Kunden

---

## 5. Moduluebergreifende Abhaengigkeiten

### 5.1 Abhaengigkeitsgraph (A-02, A-10, B-02, B-10)

```
                   ┌─────────────────────────────────────┐
                   │          config.js                   │
                   │  (KPI-Definitionen, Bundesland-Data) │
                   └──────────┬──────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌────────────┐  ┌──────────────┐  ┌───────────┐
     │  data.js   │  │   utils.js   │  │ charts.js │
     │ (state,    │  │ (Formatter,  │  │ (Chart.js │
     │  Filter)   │  │  Helpers)    │  │  Wrapper) │
     └────┬───────┘  └──────┬───────┘  └─────┬─────┘
          │                 │                │
          ▼                 ▼                ▼
     ┌──────────────────────────────────────────────┐
     │          agentur-overview.js                  │
     │  A-02: showAgenturOverview, fillHeader, etc. │
     │  B-02: showBeraterOverview, fillBerater*, etc.│
     └──────┬─────────────────────┬────────────────┘
            │                     │
            │ openKundenDetail()  │ openBankKundenDetail()
            ▼                     ▼
     ┌──────────────────────────────────────────────┐
     │          kunden-detail.js                     │
     │  A-10: fillKundenDetail, switchKundenTab      │
     │  B-10: fillBankKundenDetail, switchBankTab    │
     └──┬──────┬──────┬──────┬──────┬──────────────┘
        │      │      │      │      │
        ▼      ▼      ▼      ▼      ▼
    clv.js  bezahlen  komm.  nps    finanzplanung.js
            .js       display display
                      .js    .js
```

### 5.2 Funktionsuebergreifende Aufrufe

| Aufrufende Datei | Aufgerufene Funktion | Zieldatei | Beschreibung |
|---|---|---|---|
| `agentur-overview.js` | `openKundenDetail()` | `kunden-detail.js` | A-02 → A-10 Navigation |
| `agentur-overview.js` | `openBankKundenDetail()` | `kunden-detail.js` | B-02 → A-10 (Bank-Mode) |
| `agentur-overview.js` | `adaptA10ForBankMode()` | `agentur-overview.js` | A-10 fuer Banking anpassen |
| `kunden-detail.js` | `showAgenturTab()` | `agentur-overview.js` | A-10 → A-02 Tab-Navigation |
| `kunden-detail.js` | `showBeraterTab()` | `agentur-overview.js` | A-10 → B-02 Tab-Navigation |
| `kunden-detail.js` | `restoreA10InsuranceMode()` | `agentur-overview.js` | A-10 Versicherungs-Modus wiederherstellen |
| `kunden-detail.js` | `calculateCLV()` | `clv.js` | CLV-Berechnung |
| `kunden-detail.js` | `renderCLV()` | `clv.js` | CLV-Anzeige |
| `kunden-detail.js` | `renderBezahlenContent()` | `bezahlen.js` | FIDA-Tab Bezahlen |
| `kunden-detail.js` | `renderImpulseContent()` | (inline) | Beratungsimpulse |
| `kunden-detail.js` | `renderKommContent()` | `kommunikation-display.js` | Kommunikation |
| `kunden-detail.js` | `renderNpsStars()` | `nps-display.js` | NPS Sterne-Darstellung |
| `kunden-detail.js` | `navigateToSalesReport()` | `sales-report.js` | Vertriebsbericht |
| `landing.js` | `openAgenturView()` | `agentur-overview.js` | Landing → A-02 |
| `landing.js` | `openPotentialAnalyse()` | `potentiale.js` | Landing → A-05 |
| `router.js` | `showAgenturOverview()` | `agentur-overview.js` | Deep-Link Navigation |
| `router.js` | `setViewMode()` | `agentur-overview.js` | View-Mode setzen |
| `makler.js` | `restoreAOKundenDetail()` | `agentur-overview.js` | Makler → A-10 Restore |
| `mrh-trowe.js` | `restoreMRHKundenDetail()` | `agentur-overview.js` | MRH → A-10 Restore |

### 5.3 Event-basierte Kommunikation

| Event | Dispatcher | Listener | Beschreibung |
|---|---|---|---|
| `viewChanged` | `kunden-detail.js`, `agentur-overview.js` | `page-id-tracker.js` | View-Wechsel fuer Page-ID Tracking |
| `hashchange` | Browser | `router.js` | URL-Aenderung |
| `popstate` | Browser | `router.js` | History-Navigation |

### 5.4 Globale Window-Exports

A-02/A-10/B-02/B-10 exportieren zahlreiche Funktionen auf `window`:

**Aus kunden-detail.js:**
- `window.versichererLogoImg`, `window.getVersichererLogoUrl`
- `window.updateKundenSharedHeader`, `window.syncA10FinanceToggle`
- `window.navigateToAgenturTab`, `window.switchKundeDropdown`
- `window.showNpsDetail`, `window.hideNpsDetail`
- `window.filterKundenliste`, `window.toggleImpulsDetail`
- `window.toggleAngebotMenu`, `window.angebotAction`
- `window.openTarifvergleich`, `window.closeTarifvergleich`
- `window.openTierPopup`, `window.closeTierPopup`, `window.saveTierInfo`, etc.
- `window.fillBankKundenDetail`, `window.switchBankKundenTab`, `window.bankMockKunden`

**Aus agentur-overview.js (B-02):**
- `window.showBeraterOverview`, `window.openBankKundenDetail`
- Alle B-02 Funktionen (implizit ueber globalen Scope)

---

## 6. Konfiguration & Dependencies

### 6.1 CDN-Bibliotheken (geladen via index.html HEAD)

| Bibliothek | Version | CDN | Verwendung |
|---|---|---|---|
| Leaflet | 1.9.4 | cdnjs | Karten-Darstellung (Bundesland-Karte) |
| Chart.js | 4.4.0 | jsdelivr | Balken-, Linien-, Doughnut-Charts |
| D3.js | 7.8.5 | cdnjs | Sankey-Diagramme, Datenvisualisierung |
| d3-sankey | 0.12.3 | jsdelivr | Sankey-Diagramm-Layout |
| html2canvas | 1.4.1 | cdnjs | Screenshot-Funktion |
| jsPDF | 2.5.1 | cdnjs | PDF-Generierung |
| JSZip | 3.10.1 | cdnjs | PPTX-Export (ZIP-basiert) |

### 6.2 Externe APIs

| API | URL | Verwendung | Authentifizierung |
|---|---|---|---|
| Anthropic Claude (via Worker) | `https://vst-claude-api.eike-3e2.workers.dev` | KI-Chat (nur T-05 aktiv) | API-Key im Worker |
| logo.dev | `https://img.logo.dev/<domain>?token=pk_H7vb5Y2lTsW47U4Xq-w3HA` | Versicherer/Banken-Logos | Public Token |

### 6.3 CSS-Dateien Ladereihenfolge

1. `variables.css` – CSS-Custom-Properties (Farben, Spacing, etc.)
2. `shared.css` – Gemeinsame Basis-Styles
3. `styles.css` – Haupt-Stylesheet
4. Modul-spezifische CSS (finanzplanung, banken, etc.)
5. `banking-berater.css` – B-02/B-10 Color-Overrides
6. `kunden-detail.css`, `clv.css`, `agentur-fachkonzept.css` – Modularisierte Styles
7. Weitere Feature-CSS (nps, bezahlen-tx, potentiale-display, etc.)

### 6.4 JavaScript-Ladereihenfolge

Die Reihenfolge ist kritisch (keine Module, alles globaler Scope):

```
1. parent-*-relay.js (4 Event-Relays fuer Iframe-Kommunikation)
2. config.js (Konfiguration, KPI-Definitionen)
3. utils.js (Hilfsfunktionen)
4. data.js (State, Daten-Aggregation)
5. charts.js (Chart.js Wrapper)
6. tables.js (Tabellen-Rendering)
7. map-counties.js (Leaflet-Karte)
8. main.js (Haupt-Initialisierung)
9. chat.js (KI-Chat)
10. agentur-overview.js (A-02 + B-02) ← Muss VOR kunden-detail.js!
11. router.js (Hash-Navigation)
12. landing.js (Landing Page)
13. nps-display.js
14. kunden-detail.js (A-10 + B-10) ← Muss NACH agentur-overview.js!
15. clv.js, bezahlen.js, potentiale.js, kommunikation-display.js, etc.
16. makler.js, mrh-trowe.js (A-02 Varianten)
17. Weitere Module (sales-report, finanzplanung, banken, etc.)
18. page-id-tracker.js (Page ID System)
19. bestandsuebertragung/index.js (als ES6 Module)
20. guided-tour.js
```

**Hinweis:** Zeile 7693 bestaetigt die Merge-Entscheidung:
`"berater-overview.js and kunden-detail-bank.js merged into agentur-overview.js and kunden-detail.js"`

### 6.5 localStorage Keys

| Key | Modul | Typ | Beschreibung |
|---|---|---|---|
| `bankViewMode` | B-02 | String | Banking View-Mode (retail/fk/vw) |
| `financeMode` | Global | String | Open/Closed Finance Modus |
| `agenturPhoto` | A-02 | String (URL) | Vermittler-Foto |
| `tierInfo_<name>` | A-10 | JSON | Haustier-Info pro Kunde |

### 6.6 Deployment

| Aspekt | Detail |
|---|---|
| Plattform | Cloudflare Pages |
| Worker | Cloudflare Worker (`vst-claude-api.eike-3e2.workers.dev`) |
| Headers | `_headers` Datei (Cloudflare) |
| Redirects | `_redirects` Datei (Cloudflare) |
| Build | Kein Build-Prozess fuer Haupt-SPA (plain HTML/JS/CSS). Kreditanalyse hat eigenen Vite-Build. |

---

## 7. Beobachtungen & Empfehlungen

### 7.1 Architektur-Beobachtungen

1. **Monolithische index.html:** Die gesamte SPA lebt in einer einzigen HTML-Datei (~7.500 Zeilen). Alle Module sind als `<div>`-Container integriert, die per `display: none/block` ein- und ausgeblendet werden.

2. **Globaler Scope:** Alle JavaScript-Dateien nutzen den globalen Scope (IIFE bei versicherungs-1x1.js, asset-management.js, am-prod-mode.js). Funktionen werden auf `window` exportiert. Es gibt kein Modul-System (ausser ES6 Module fuer Bestandsuebertragung und PMO Toolbox).

3. **Refactoring Phase 1 (2026-03-09):**
   - Dead Code entfernt: `#kundenDetailBankPage` (238 Zeilen HTML) eliminiert
   - `viewKommunikation` alert() durch Inline-Modal ersetzt
   - `previousViewBeforeKundenDetail` Default auf `null` gesetzt (mit Safe-Fallback)
   - `bankKundenRetail` wird nun zur Laufzeit aus `bankMockKunden` abgeleitet (Single Source of Truth)
   - FIDA-Datenmodell vereinheitlicht: `{ institut, typ, info, consent, gueltig }` fuer alle Kunden
   - CLV-Berechnung konsolidiert in `clv.js` (Versicherung + Banking)

4. **Refactoring Phase 2 – Datei-Splitting (2026-03-09):**
   Alle grossen JS-Dateien wurden in Teildateien aufgeteilt (Ziel: max ~800-1200 Zeilen pro Datei):
   | Original-Datei | Zeilen | Aufgeteilt in | Dateien |
   |---|---|---|---|
   | `banken.js` | 8303 | 11 Dateien | banken-feedback, -module, -dashboard, -customer-detail, -customer-detail2, -actions, -charts, -activities, -scanner-crm, -export, -config-pdf |
   | `landing.js` | 4342 | 6 Dateien | landing-core, -chat, -regions, -modules, -data, -upload |
   | `hr-pipeline.js` | 3858 | 6 Dateien | hr-pipeline-core, -bewerber, -arbeitgeber, -overlays, hc-cockpit-data, hc-cockpit-ui |
   | `agentur-overview.js` | 3450 | 4 Dateien | agentur-overview-core, -tables, -features, -banking |
   | `kunden-detail.js` | 2588 | 4 Dateien | kunden-detail-core, -data, -features, -banking |
   | `makler.js` | 2297 | 4 Dateien | makler-modus, -kunden, -b2b, -overview |
   | `mrh-trowe.js` | 1634 | 3 Dateien | mrh-trowe-modes, -render, -detail |
   | `risikoscoring.js` | 1569 | 2 Dateien | risikoscoring-data, -ui |

   **Nicht aufgeteilt (IIFE-Module):**
   - `versicherungs-1x1.js` (2561 Zeilen) – IIFE mit ~110 internen Cross-Referenzen
   - `asset-management.js` (2474 Zeilen) – IIFE mit geschlossenem Scope
   - `am-prod-mode.js` (1858 Zeilen) – IIFE, unter 25k Token-Grenze

5. **Daten-Synchronisation (geloest):** `bankMockKunden` in `kunden-detail-banking.js` ist Single Source of Truth. `bankKundenRetail` wird per `DOMContentLoaded` in `agentur-overview-core.js` automatisch daraus abgeleitet.

### 7.2 Code-Qualitaet

1. **Konsistente Muster:** Alle fill-Funktionen folgen dem gleichen Muster: DOM-Element per ID holen, Daten aus Mock-Objekt lesen, innerHTML setzen.

2. **Defensive Programmierung:** Durchgehend `if (element)` Checks vor DOM-Manipulation. Fallback-Werte fuer fehlende Daten.

3. **Mock-Modus als Standard:** Alle Chat-Funktionen nutzen Mock-Responses. Nur T-05 (KI-Dokumentenassistent) hat echten API-Zugriff. Dies ist bewusst fuer Demo/Prototyp-Zwecke.

4. **Kein Error-Handling:** Keine try/catch Bloecke, keine Fehlerbehandlung bei API-Calls oder localStorage-Operationen (ausser vereinzeltes `try { JSON.parse } catch`).

### 7.3 Datenmodell-Beobachtungen

1. **Unterschiedliche Kunden-IDs:** Versicherungs-Kunden nutzen `KD00001`-Format, Banking-Kunden `KDB001`-Format, Firmenkunden `FKB001`, Vermoegenskunden `PBB001`. Keine uebergreifende Zuordnung.

2. **Kundenfotos begrenzt:** Nur 4-5 Kunden haben Adobe Stock Fotos. Alle anderen nutzen Initialen-Avatare mit Farbverlauf.

3. **FIDA-Daten unterschiedlich modelliert:**
   - Versicherung: `fidaVertraege: [{ anbieter, typ, info }]` (einfach)
   - Banking: `fidaVertraege: [{ institut, typ, info, consent, gueltig }]` (mit Consent-Management)

### 7.4 Potentielle Verbesserungsbereiche

1. **B-10 HTML aufraemen:** Der tote `#kundenDetailBankPage` Container koennte entfernt werden, da B-10 ueber A-10-Adapter laeuft.

2. **Kundendaten-Konsolidierung:** `bankKundenRetail` und `bankMockKunden` koennten zusammengefuehrt werden, um Datenredundanz zu vermeiden.

3. **Ladereihenfolge:** Die Abhaengigkeit von `agentur-overview.js` vor `kunden-detail.js` ist fragil und nur durch die Scriptreihenfolge in index.html gesichert.

4. **Dateigroesse:** `agentur-overview.js` (3.400+ Zeilen) und `kunden-detail.js` (2.534 Zeilen) koennten durch Auslagerung der Mock-Daten in separate JSON-Dateien schlanker werden.

---

> **Ende der Analyse** | Stand: 2026-03-09 | Erstellt mit Claude Code
