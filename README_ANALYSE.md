# README_ANALYSE.md — Vollständige Projektanalyse KI-Arbeitsplatz

**Erstellt:** 09.03.2026
**Fokus:** Module A-02 (Vermittler-Übersicht), A-10 (Kunden-Detail), Restanten-Check B-02/B-10
**Sprache:** Deutsch

---

## Inhaltsverzeichnis

1. [Projektübersicht](#1-projektübersicht)
2. [Modul A-02 Detailanalyse](#2-modul-a-02-detailanalyse)
3. [Modul A-10 Detailanalyse](#3-modul-a-10-detailanalyse)
4. [Restanten-Check B-02/B-10](#4-restanten-check-b-02b-10)
5. [Modulübergreifende Abhängigkeiten](#5-modulübergreifende-abhängigkeiten)
6. [Konfiguration & Dependencies](#6-konfiguration--dependencies)
7. [Beobachtungen](#7-beobachtungen)

---

## 1. Projektübersicht

### 1.1 Architektur

Der KI-Arbeitsplatz ist eine **Vanilla-JavaScript Single-Page Application (SPA)** ohne Framework. Navigation erfolgt über **hash-basiertes Routing** (`router.js`). Die Anwendung läuft vollständig im Browser — es gibt kein Backend. Alle Daten sind **Mock-Daten**, die in den jeweiligen JS-Dateien hardcodiert sind. Einzige Ausnahme: Der KI-Chat auf T-05 (Dokumentenassistent) nutzt die echte Claude API über einen Cloudflare Worker.

**Hosting:** Cloudflare Pages (`kiarbeitsplatz.pages.dev`)

### 1.2 Dateistruktur

```
kiarbeitsplatz/
├── index.html                  (7721 Zeilen — Haupt-SPA-Container)
├── js/
│   ├── router.js               (316 Z. — Hash-Routing)
│   ├── main.js                 (Initialisierung, Event-Listener)
│   ├── landing.js              (Startseite M-01)
│   ├── config.js               (148 Z. — KPI-Definitionen, Bundesland-Daten)
│   ├── data.js                 (443 Z. — Globaler State, Filter, Datenaggregation)
│   ├── utils.js                (148 Z. — Formatierung, CSV-Parser, Dropdown)
│   ├── agentur-overview.js     (3429 Z. — A-02 + B-02 zusammengeführt)
│   ├── kunden-detail.js        (2533 Z. — A-10 + B-10 zusammengeführt)
│   ├── makler.js               (2297 Z. — A-02b/A-10b Ecclesia B2B)
│   ├── mrh-trowe.js            (1634 Z. — A-02c/A-10c Gewerbemakler 360°)
│   ├── chat.js                 (1448 Z. — KI-Chat, Mock + API)
│   ├── charts.js               (Chart.js-Diagramme)
│   ├── tables.js               (Tabellen-Rendering)
│   ├── map-counties.js         (Leaflet-Karte)
│   ├── clv.js                  (Customer Lifetime Value)
│   ├── nps-display.js          (NPS → 5-Sterne)
│   ├── potentiale.js           (Potenzial-Impulse)
│   ├── kommunikation-display.js(Kommunikations-Historie)
│   ├── finanzplanung.js        (Renten-Simulator)
│   ├── autocomplete.js         (Such-Vorschläge)
│   ├── user-mode.js            (420 Z. — Profil-Umschaltung)
│   ├── page-id-tracker.js      (483 Z. — Page-ID-System)
│   ├── banken.js               (Banken-Modul B-01)
│   ├── banken-chat.js          (Banking-Chat)
│   ├── bezahlen.js             (Bezahl-Transaktionen)
│   ├── risikoscoring.js        (R-01 Risikoscoring)
│   ├── sales-report.js         (Sales Steering Report)
│   ├── bgav-umstellung.js      (A-11/A-12 BGAV)
│   ├── hr-pipeline.js          (H-01 HR Pipeline)
│   ├── asset-management.js     (AM-01 Asset Management)
│   ├── am-prod-mode.js         (AM Produktionsmodus)
│   ├── provisionssimulation.js (Provisions-Simulation)
│   ├── guided-tour.js          (Geführte Tour)
│   ├── screenshot.js           (Screenshot-Funktion)
│   ├── screen-recorder.js      (Bildschirmaufnahme)
│   ├── speaker-notes.js        (Referenten-Notizen)
│   ├── cv-scanner.js           (CV-Scanner HR)
│   ├── versicherungs-1x1.js    (V-01 Versicherungs-1×1)
│   ├── names.js                (Namensgenerator)
│   ├── parent-wheel-relay.js   (iFrame-Relay)
│   ├── parent-scroll-relay.js  (iFrame-Relay)
│   ├── parent-keyboard-relay.js(iFrame-Relay)
│   └── parent-mouse-relay.js   (iFrame-Relay)
├── css/                        (31 Stylesheets)
│   ├── variables.css, shared.css, styles.css  (Basis)
│   ├── agentur-fachkonzept.css (A-02 Styles)
│   ├── kunden-detail.css       (A-10 Styles)
│   ├── banking-berater.css     (B-02/B-10 Styles)
│   ├── makler.css              (Ecclesia B2B Styles)
│   ├── mrh-trowe.css           (MRH Trowe Styles)
│   └── ... (27 weitere CSS-Module)
└── docs/
    ├── README_A02_A10.md       (veraltet — referenziert nicht mehr existierende Dateien)
    ├── README_B02_B10.md       (veraltet — referenziert berater-overview.js)
    └── FACHKONZEPT_B02_B10.md  (153 Z. — Konzeptdokument Banking)
```

**Gesamtumfang:** ~43 JavaScript-Dateien, ~31 CSS-Dateien, 1 HTML-Datei

### 1.3 Routing-System

Das Routing (`router.js`, 316 Zeilen) basiert auf `window.location.hash`. Jede Route hat:
- `view`: interner View-Name
- `pageId`: Page-ID für Tracking (z.B. A-02, B-10)
- `title`: Anzeige-Titel

**Alle Routen:**

| Route | View | Page-ID | Titel |
|---|---|---|---|
| `/` bzw. `/landing` | landing | M-01 | Startseite |
| `/dashboard` | dashboard | A-03 | Gesamtübersicht |
| `/agentur` | agentursicht | A-02 | Vermittler-Ansicht |
| `/agentur-b2b` | agentursicht-b2b | A-02b | Vermittler B2B |
| `/agentur-gewerbe` | agentursicht-mrh | A-02c | Vermittler Gewerbe 360° |
| `/potentialanalyse` | potentialanalyse | A-05 | Potentialanalyse |
| `/kundendetail` | kundendetail | A-10 | Kunden-Detail |
| `/kundendetail-b2b` | kundendetail-b2b | A-10b | Kunden-Detail B2B |
| `/kundendetail-gewerbe` | kundendetail-mrh | A-10c | Kunden-Detail Gewerbe 360° |
| `/bgav-uebersicht` | bgav-uebersicht | A-11 | BGAV Übersicht |
| `/bgav-umstellung` | bgav-umstellung | A-12 | BGAV Simulation |
| `/banken` | banken | B-01 | Banken |
| `/berater` | berater-retail | B-02 | Berater Retail |
| `/berater-firmenkunde` | berater-firmenkunde | B-02b | Berater Firmenkunde |
| `/berater-vermoegen` | berater-vermoegen | B-02c | Berater Vermögen |
| `/kundendetail-bank` | kundendetail-bank | B-10 | Kunden-Detail Bank |
| `/kundendetail-bank-fk` | kundendetail-bank-fk | B-10b | Kunden-Detail FK |
| `/kundendetail-bank-pb` | kundendetail-bank-pb | B-10c | Kunden-Detail PB |
| `/asset-management` | asset-management | AM-01 | Asset Management |
| `/risikoscoring` | risikoscoring | R-01 | Risikoscoring |
| `/bestandsuebertragung` | bestandsuebertragung | T-01 | Bestandsübertragung |
| `/pmo-toolbox` | pmo-toolbox | P-01 | PMO Toolbox |
| `/hr-pipeline` | hr-pipeline | H-01 | HR Pipeline |
| `/versicherungs-1x1` | versicherungs-1x1 | V-01 | Versicherungs-1×1 |
| `/kreditanalyse` | kreditanalyse | K-01 | KI-Kreditanalyse |

**Deep-Link-Fallbacks** für kontextabhängige Views (benötigen ausgewählten Kunden):
- `kundendetail` → `agentursicht`
- `kundendetail-b2b` → `agentursicht-b2b`
- `kundendetail-mrh` → `agentursicht-mrh`
- `kundendetail-bank` → `berater-retail`
- `kundendetail-bank-fk` → `berater-firmenkunde`
- `kundendetail-bank-pb` → `berater-vermoegen`

### 1.4 View-Mode-System

Die zentrale View-Mode-Steuerung liegt in `mrh-trowe.js`. Globale Variable:

```javascript
var viewMode = 'ao'; // 'ao' | 'ecclesia' | 'mrh' | 'bank-retail' | 'bank-fk' | 'bank-vw'
```

**6 Modi:**

| Modus | Beschreibung | A-02 Variante | A-10 Variante |
|---|---|---|---|
| `ao` | Privatkundenvertrieb (AO) | Standard A-02 | Standard A-10 |
| `ecclesia` | Industriemakler (Ecclesia B2B) | A-02b (makler.js) | A-10b (makler.js) |
| `mrh` | Gewerbemakler 360° (MRH Trowe) | A-02c (mrh-trowe.js) | A-10c (mrh-trowe.js) |
| `bank-retail` | VR Retail | B-02 (agentur-overview.js) | B-10 (kunden-detail.js) |
| `bank-fk` | VR Firmenkunde | B-02b (agentur-overview.js) | B-10b (kunden-detail.js) |
| `bank-vw` | VR Vermögen | B-02c (agentur-overview.js) | B-10c (kunden-detail.js) |

### 1.5 Page-ID-Tracking

`page-id-tracker.js` (483 Zeilen) implementiert ein dynamisches Page-ID-System. Es nutzt einen `MutationObserver` zur automatischen Erkennung von Seitenänderungen.

**Page-ID-Präfixe:**
- **M** — Main (Startseite, Navigation)
- **A** — Versicherung (A-01 bis A-12)
- **B** — Banken (B-01 bis B-10c)
- **P** — PMO Toolbox
- **R** — Risikoscoring
- **T** — Bestandsübertragung
- **H** — HR Pipeline
- **AM** — Asset Management
- **V** — Versicherungs-1×1
- **K** — Kreditanalyse

---

## 2. Modul A-02 Detailanalyse

### 2.1 Dateizuordnung

Das Modul A-02 (Vermittler-Übersicht) ist über **vier** Dateien verteilt:

| Datei | Zeilen | Verantwortlichkeit |
|---|---|---|
| `agentur-overview.js` | 1–2275 | A-02 AO-Modus (Privatkundenvertrieb) |
| `agentur-overview.js` | 2277–3429 | B-02 Banken-Modus (zusammengeführt) |
| `makler.js` | 2297 | A-02b Ecclesia B2B-Modus |
| `mrh-trowe.js` | 1634 | A-02c MRH Trowe Gewerbemakler 360° |

### 2.2 Globale State-Variablen (A-02)

```javascript
// agentur-overview.js
let currentAgenturIdInOverview = null;  // Aktuelle Agentur-ID (z.B. 'VM00001')

// mrh-trowe.js
var viewMode = 'ao';          // Globaler View-Modus
var financeMode = 'closed';   // Open-Finance-Modus ('closed'|'open')

// makler.js
var maklerModus = false;      // Legacy-Toggle (delegiert an setViewMode)

// agentur-overview.js (Banking-Bereich, ab Zeile 2277)
var bankViewMode = localStorage.getItem('bankViewMode') || 'retail'; // 'retail'|'firmenkunde'|'vermoegen'
var currentBeraterTab = 'kundenstamm';  // Aktiver Tab in B-02
```

**localStorage-Persistenz:**
- `viewMode` — Gespeicherter View-Modus
- `bankViewMode` — Banking-Untermodus
- `maklerModus` — Legacy-Flag
- `profileImage` — Profilbild (Base64)

### 2.3 Funktionsverzeichnis A-02 AO-Modus (agentur-overview.js, Zeile 1–2275)

#### Haupt-Einstiegsfunktion

| Funktion | Zeile | Beschreibung |
|---|---|---|
| `showAgenturOverview(vermittlerId)` | ~18 | **Haupteinstieg.** Versteckt alle anderen Pages, zeigt `#agenturOverview`, öffnet Agentur-Chat automatisch, ruft `loadAgenturData()` auf, dispatcht `viewChanged`-Event |

#### Datenlade-Funktionen

| Funktion | Beschreibung |
|---|---|
| `loadAgenturData(vermittlerId)` | Lädt Mock-Daten für die Agentur, befüllt Header (Foto, Name, ID, Kontaktdaten), rendert KPIs, Tabs, Charts |
| `fillAgenturHeader(agentData)` | Setzt Vermittler-Name, ID, Foto, Kontaktdaten in den Header |
| `fillAgenturKPIs(agentData)` | Rendert die 6 KPI-Kacheln (Bestand, Neugeschäft, Storno, NPS, Potenzial, CLV) |

#### Tab-Navigation

| Funktion | Beschreibung |
|---|---|
| `switchAgenturTab(tabId)` | Wechselt zwischen Tabs: `kundenstamm`, `bestandsanalyse`, `potenziale`, `kommunikation`, `performance` |
| `renderKundenstammTab()` | Rendert Kundenliste mit Such- und Filterfunktion |
| `renderBestandsanalyseTab()` | Rendert Vertragsbestand mit Segmentierung (Leben, Kranken, Schaden, Kfz) |
| `renderPotenzialeTab()` | Rendert Potenzialanalyse mit Cross-Selling-Impulsen |
| `renderKommunikationTab()` | Rendert Kommunikationshistorie (E-Mails, Anrufe, Termine) |
| `renderPerformanceTab()` | Rendert Performance-Charts mit Chart.js |

#### Kundenbestand-Tabelle

| Funktion | Beschreibung |
|---|---|
| `renderKundenTable(customers)` | Rendert Kundentabelle mit Sortierung und Filterung |
| `filterKundenTable(searchTerm)` | Filtert Kundentabelle nach Suchbegriff |
| `sortKundenTable(column, direction)` | Sortiert Kundentabelle nach Spalte |
| `openKundenFromAgentur(kundeId)` | Öffnet Kunden-Detail (A-10) aus der Kundenliste |

#### Vertragsbestand

| Funktion | Beschreibung |
|---|---|
| `renderVertragsbestand(contracts)` | Rendert Vertragsliste mit Versicherer-Logos |
| `filterVertraege(segment)` | Filtert Verträge nach Segment |

#### KI-Chat (Agentur-Assistent)

| Funktion | Beschreibung |
|---|---|
| `toggleAgenturChat()` | Öffnet/schließt das Chat-Widget |
| `sendAgenturMessage(message)` | Sendet Nachricht an den Agentur-Chat |
| `getAgenturChatResponse(message)` | **Regelbasiert (Mock).** Verwendet Pattern-Matching, KEINE echte Claude-API. Erkennt Schlagwörter wie "Storno", "Cross-Selling", "Performance" und generiert passende Antworten |
| `appendAgenturMessage(role, content)` | Fügt Nachricht ins Chat-Widget ein |
| `showAgenturChatSuggestions()` | Zeigt vordefinierte Vorschläge (z.B. "Stornogefährdete Kunden", "Cross-Selling-Potenziale") |

#### Export-Funktionen

| Funktion | Beschreibung |
|---|---|
| `exportAgenturPDF()` | Exportiert Agentur-Übersicht als PDF (jsPDF + html2canvas) |
| `exportAgenturPPTX()` | Exportiert als PPTX (JSZip) |

#### Chart-Rendering

| Funktion | Beschreibung |
|---|---|
| `renderAgenturBestandChart(data)` | Bestandsentwicklung als Liniendiagramm |
| `renderAgenturSegmentChart(data)` | Segmentverteilung als Doughnut-Chart |
| `renderAgenturPerformanceChart(data)` | Performance-Verlauf als Balkendiagramm |
| `renderSpartenPieChart(data)` | Spartenverteilung als Kreisdiagramm |

### 2.4 Mock-Daten A-02 AO

**Kundenbestand-Verträge (`kundenBestandVertraege`):** 25 Verträge mit Feldern:
- `id`, `kunde`, `kundeId`, `versicherer`, `sparte`, `typ`, `beitrag`, `ablauf`, `status`, `provision`

**Beispiel:** `{ kunde: 'Müller, Thomas', versicherer: 'Allianz', sparte: 'Leben', beitrag: 245.50, status: 'aktiv' }`

**Kunden für Kundenstamm:** 11 Kunden mit vollständigen Profildaten (Name, Adresse, Geburtsdatum, Vertragsanzahl, Bestandswert, NPS, CLV, Potenzial-Score)

### 2.5 Funktionsverzeichnis A-02b Ecclesia B2B (makler.js)

| Funktion | Beschreibung |
|---|---|
| `toggleMaklerModus()` | Legacy-Toggle, delegiert an `setViewMode('ecclesia')` |
| `applyMaklerModus()` | Blendet AO-KPIs aus, zeigt Makler-KPIs, passt Tabs an |
| `showMaklerTab(tabId)` | **Lazy Rendering** — Generiert Tab-Inhalt erst beim ersten Öffnen. Tabs: `uebersicht`, `institutionen`, `potenziale`, `kommunikation`, `performance` |
| `renderMaklerUebersicht()` | Übersichts-Dashboard mit institutionellen KPIs |
| `renderMaklerInstitutionen()` | Liste institutioneller Kunden nach Segmenten |
| `renderMaklerPotenziale()` | Cross-Selling-Potenziale für B2B-Kunden |
| `openMaklerKundenDetail(kundeId)` | Öffnet B2B-Kundendetail (A-10b), transformiert die A-10-Seite |
| `fillMaklerDetail(kunde)` | Befüllt A-10b mit B2B-spezifischen Daten |
| `closeMaklerDetail()` | Schließt B2B-Detail, stellt A-02-Ansicht wieder her |

**Mock-Daten Ecclesia:**
- 15 institutionelle Kunden in 5 Segmenten: Kommunen, Sozialwirtschaft, Gesundheitswesen, Kirche, Bildung
- 10 Potenzial-Einträge für B2B-Cross-Selling

### 2.6 Funktionsverzeichnis A-02c MRH Trowe Gewerbemakler 360° (mrh-trowe.js)

| Funktion | Beschreibung |
|---|---|
| `setViewMode(mode)` | **Zentrale Umschaltfunktion** für alle 6 Modi. Speichert in localStorage, passt URL-Hash an, ruft `applyViewMode()` auf |
| `applyViewMode()` | Wendet den Modus an: blendet KPIs, Tabs, Badges ein/aus |
| `showMRHTab(tabId)` | **Lazy Rendering.** Tabs: `uebersicht`, `kunden`, `potenziale`, `kommunikation`, `performance` |
| `renderMRHUebersicht()` | Dashboard mit 3-Säulen-Modell (Insurance, Benefits, Finance) |
| `renderMRHKunden()` | Kundenliste mit 3-Säulen-Kennzeichnung |
| `renderMRHPotenziale()` | Cross-Selling über die 3 Säulen |
| `openMRHKundenDetail(kundeId)` | Öffnet MRH-Kundendetail (A-10c) |
| `fillMRHDetail(kunde)` | Befüllt A-10c mit 3-Säulen-spezifischen Daten |
| `closeMRHDetail()` | Schließt MRH-Detail |
| `toggleFinanceMode()` | Schaltet zwischen `closed` und `open` (Open Finance) |

**3-Säulen-Modell:**
1. **Insurance** — Versicherungen (Industrieversicherung, D&O, Cyber)
2. **Benefits** — Mitarbeiter-Benefits (bAV, bKV, Gruppenunfall)
3. **Finance** — Finanzierung (M&A-Beratung, Factoring, Kredit)

**Mock-Daten MRH:** 7+ Gewerbekunden mit 3-Säulen-Struktur, je Säule: Volumen, Verträge, Potenzial

### 2.7 Click-Pfade A-02

**Pfad 1: Landing → A-02 (AO)**
```
M-01 (Landing) → Klick auf Vermittler in Tabelle → showAgenturOverview('VM00001')
→ URL: #/agentur → Page-ID: A-02
→ Tabs: Kundenstamm | Bestandsanalyse | Potenziale | Kommunikation | Performance
→ Klick auf Kunde in Kundenstamm → openKundenFromAgentur('K001') → A-10
```

**Pfad 2: View-Mode-Wechsel → A-02b (Ecclesia)**
```
A-02 → View-Mode-Dropdown → "Makler B2B" → setViewMode('ecclesia')
→ URL: #/agentur-b2b → Page-ID: A-02b
→ Tabs: Übersicht | Institutionen | Potenziale | Kommunikation | Performance
→ Klick auf Institution → openMaklerKundenDetail('MK001') → A-10b
```

**Pfad 3: View-Mode-Wechsel → A-02c (MRH)**
```
A-02 → View-Mode-Dropdown → "Gewerbemakler 360°" → setViewMode('mrh')
→ URL: #/agentur-gewerbe → Page-ID: A-02c
→ 3-Säulen-Badges: Insurance | Benefits | Finance
→ Tabs: Übersicht | Kunden | Potenziale | Kommunikation | Performance
→ Klick auf Gewerbekunde → openMRHKundenDetail('GK001') → A-10c
```

**Pfad 4: View-Mode-Wechsel → B-02 (Banking)**
```
A-02 → View-Mode-Dropdown → "VR Retail" → setViewMode('bank-retail')
→ URL: #/berater → Page-ID: B-02
→ showBeraterOverview() in agentur-overview.js (ab Zeile 2277)
→ Tabs: Kundenstamm | Neugeschäft | Portfolioanalyse | Kommunikation
→ Klick auf Bank-Kunde → openBankKundenDetail('BK001') → B-10
```

---

## 3. Modul A-10 Detailanalyse

### 3.1 Dateizuordnung

| Datei | Zeilen | Verantwortlichkeit |
|---|---|---|
| `kunden-detail.js` | 1–1508 | A-10 AO-Modus (Privatkundenversicherung) |
| `kunden-detail.js` | 1509–2533 | B-10 Banken-Modus (zusammengeführt) |
| `makler.js` | (Funktionen) | A-10b Ecclesia B2B-Detail |
| `mrh-trowe.js` | (Funktionen) | A-10c MRH Trowe Gewerbe-Detail |

**Wichtig:** Alle 6 Varianten (A-10, A-10b, A-10c, B-10, B-10b, B-10c) nutzen dasselbe HTML-Element `#kundenDetailPage` in `index.html`. Die Seite wird je nach Modus dynamisch transformiert.

### 3.2 Globale State-Variablen (A-10)

```javascript
// kunden-detail.js
var versichererLogoDomains = { ... };  // 50+ Versicherer → Domain-Mappings für logo.dev
// (Kein dedizierter globaler State — der aktuelle Kunde wird über Funktionsparameter übergeben)
```

### 3.3 Funktionsverzeichnis A-10 AO-Modus (kunden-detail.js, Zeile 1–1508)

#### Haupt-Einstiegsfunktionen

| Funktion | Beschreibung |
|---|---|
| `openKundenDetail(kundeId, source)` | **Haupteinstieg.** Versteckt A-02, zeigt `#kundenDetailPage`, ruft `fillKundenDetail()` auf. `source` bestimmt Zurück-Navigation |
| `closeKundenDetail()` | Schließt A-10, zeigt vorherige Seite (A-02 oder Dashboard) |

#### Datenbefüllung

| Funktion | Beschreibung |
|---|---|
| `fillKundenDetail(kundeId)` | Befüllt alle Bereiche: Stammdaten, Sticky-Bar, Vertragsübersicht, Potenziale, CLV, NPS, Kommunikation |
| `fillStammdaten(kunde)` | Setzt Name, Adresse, Geburtsdatum, Kontaktdaten |
| `fillStickyBar(kunde)` | Befüllt die fixierte Leiste oben: Foto, Name, Segment, Key-KPIs |
| `fillVertragsübersicht(kunde)` | Rendert Vertragstabelle mit Versicherer-Logos (über `versichererLogoDomains` + logo.dev CDN) |

#### Tab-Navigation

| Funktion | Beschreibung |
|---|---|
| `switchKundenTab(tabId)` | Tabs: `stammdaten`, `vertraege`, `potenziale`, `kommunikation`, `finanzplanung`, `clv` |

#### Vertragsanzeige

| Funktion | Beschreibung |
|---|---|
| `renderVertragDetail(vertragId)` | Zeigt Einzelvertragsdetails in Modal |
| `renderVertragTimeline(vertragId)` | Zeigt Vertragsverlauf als Timeline |
| `getVersichererLogo(versicherer)` | Liefert Logo-URL über logo.dev CDN: `https://img.logo.dev/{domain}?token=...` |

#### Potenziale & Impulse

| Funktion | Beschreibung |
|---|---|
| `renderKundenPotenziale(kunde)` | Zeigt Cross-Selling-Impulse (aus `potentiale.js`) |
| `renderNächsteBestAction(kunde)` | Berechnet und zeigt die wichtigste nächste Aktion |

#### Finanzplanung

| Funktion | Beschreibung |
|---|---|
| `renderFinanzplanungTab(kunde)` | Einbettung des Renten-Simulators (aus `finanzplanung.js`) |

#### CLV-Berechnung

| Funktion | Beschreibung |
|---|---|
| `renderCLVTab(kunde)` | Customer Lifetime Value Berechnung und Visualisierung (aus `clv.js`) |

#### Export

| Funktion | Beschreibung |
|---|---|
| `exportKundenDetailPDF()` | Exportiert Kunden-Detail als PDF |

### 3.4 Mock-Daten A-10 AO

**11 Kunden mit vollständigen Profilen:**

| ID | Name | Segment | Verträge | Bestand | NPS | CLV |
|---|---|---|---|---|---|---|
| K001 | Müller, Thomas | Leben, Schaden | 4 | €2.340 | 72 | €45.600 |
| K002 | Schmidt, Anna | Kranken, Leben | 3 | €1.890 | 85 | €38.200 |
| K003 | Weber, Michael | Kfz, Schaden | 5 | €3.120 | 45 | €52.100 |
| ... | (8 weitere) | ... | ... | ... | ... | ... |

Jeder Kunde hat: Stammdaten (Name, Adresse, Geburtsdatum, Telefon, E-Mail), Vertragsliste, Potenzial-Score, Kommunikationshistorie, CLV-Parameter (11 Werte), NPS-Bewertung.

**50+ Versicherer-Logo-Mappings** in `versichererLogoDomains`:
- Versicherungen: Allianz, ERGO, VHV, Helvetia, AXA, Nürnberger, Hiscox, HUK-Coburg, Zurich, HDI, R+V, Generali, Gothaer, Debeka, ARAG, Kravag, Swiss Life, etc.
- Banken: Sparkasse (+ Filialen), Volksbank (+ Filialen), ING, DKB, DWS, N26, Trade Republic, Commerzbank, Deutsche Bank, Comdirect, Targobank, etc.

### 3.5 Funktionsverzeichnis A-10b Ecclesia B2B (makler.js)

| Funktion | Beschreibung |
|---|---|
| `openMaklerKundenDetail(kundeId)` | Transformiert `#kundenDetailPage` für B2B: Ersetzt Tabs (→ Policen, Schäden, Ausschreibungen, Kontakte), Dropdown, Sticky Bar |
| `fillMaklerDetail(kunde)` | Befüllt mit institutionellen Daten: Branche, Mitarbeiterzahl, Prämienvolumen, Rahmenverträge |
| `renderMaklerPolicenTab(kunde)` | Policen-Übersicht mit Laufzeiten und Prämien |
| `renderMaklerSchaedenTab(kunde)` | Schadenhistorie mit Reserven und Regulierung |
| `renderMaklerAusschreibungenTab(kunde)` | Laufende Ausschreibungen und Erneuerungen |
| `renderMaklerKontakteTab(kunde)` | Ansprechpartner der Institution |
| `closeMaklerDetail()` | Stellt A-02b-Ansicht wieder her |

### 3.6 Funktionsverzeichnis A-10c MRH Trowe Gewerbe (mrh-trowe.js)

| Funktion | Beschreibung |
|---|---|
| `openMRHKundenDetail(kundeId)` | Transformiert `#kundenDetailPage` für 3-Säulen-Modell |
| `fillMRHDetail(kunde)` | Befüllt mit 3-Säulen-Daten je Kunde |
| `renderMRHInsuranceTab(kunde)` | Säule 1: Versicherungen (Industrie, D&O, Cyber) |
| `renderMRHBenefitsTab(kunde)` | Säule 2: Benefits (bAV, bKV, Gruppenunfall) |
| `renderMRHFinanceTab(kunde)` | Säule 3: Finanzierung (M&A, Factoring, Kredit) |
| `closeMRHDetail()` | Stellt A-02c-Ansicht wieder her |

### 3.7 Tab-Vergleich A-10 über alle Modi

| Tab-Position | A-10 (AO) | A-10b (Ecclesia) | A-10c (MRH) | B-10 (Bank) |
|---|---|---|---|---|
| 1 | Stammdaten | Policen | Insurance | Übersicht |
| 2 | Verträge | Schäden | Benefits | Konten & Depots |
| 3 | Potenziale | Ausschreibungen | Finance | FIDA |
| 4 | Kommunikation | Kontakte | Kommunikation | Impulse |
| 5 | Finanzplanung | — | Performance | CLV |
| 6 | CLV | — | — | Kommunikation |

### 3.8 Click-Pfade A-10

**Pfad 1: A-02 → A-10 (AO-Privatkundendetail)**
```
A-02 (Kundenstamm-Tab) → Klick auf Kundenzeile → openKundenFromAgentur('K001')
→ openKundenDetail('K001', 'agentur')
→ URL: #/kundendetail → Page-ID: A-10
→ Tabs: Stammdaten | Verträge | Potenziale | Kommunikation | Finanzplanung | CLV
→ Sticky-Bar oben mit Foto, Name, Key-KPIs
→ Zurück-Button → closeKundenDetail() → zurück zu A-02
```

**Pfad 2: A-02b → A-10b (B2B-Kundendetail)**
```
A-02b (Institutionen-Tab) → Klick auf Institution → openMaklerKundenDetail('MK001')
→ URL: #/kundendetail-b2b → Page-ID: A-10b
→ Tabs: Policen | Schäden | Ausschreibungen | Kontakte
→ Zurück → closeMaklerDetail() → zurück zu A-02b
```

**Pfad 3: A-02c → A-10c (MRH-Kundendetail)**
```
A-02c (Kunden-Tab) → Klick auf Gewerbekunde → openMRHKundenDetail('GK001')
→ URL: #/kundendetail-gewerbe → Page-ID: A-10c
→ 3-Säulen-Tabs: Insurance | Benefits | Finance | Kommunikation | Performance
→ Zurück → closeMRHDetail() → zurück zu A-02c
```

**Pfad 4: B-02 → B-10 (Banking-Kundendetail)**
```
B-02 (Kundenstamm-Tab) → Klick auf Bank-Kunde → openBankKundenDetail('BK001')
→ adaptA10ForBankMode() → transformiert #kundenDetailPage
→ URL: #/kundendetail-bank → Page-ID: B-10
→ Tabs: Übersicht | Konten & Depots | FIDA | Impulse | CLV | Kommunikation
→ Zurück → restoreA10InsuranceMode() → zurück zu B-02
```

### 3.9 Versicherer-Logo-System

Das Logo-System nutzt den Dienst **logo.dev** über CDN:
```
https://img.logo.dev/{domain}?token=pk_OCPEqFGOT5ulHMN4BcMKgA&size=64
```

Ablauf:
1. Versicherer-Name wird aus Vertragsdaten gelesen
2. `versichererLogoDomains[name]` liefert die Domain (z.B. `'allianz.de'`)
3. Domain wird in die logo.dev-URL eingesetzt
4. Fallback: Generisches Platzhalter-Icon bei unbekanntem Versicherer

---

## 4. Restanten-Check B-02/B-10

### 4.1 Befund: Keine separaten Dateien mehr

Die Module B-02 (Berater-Übersicht) und B-10 (Kunden-Detail Bank) existieren **NICHT** mehr als eigenständige Dateien. Die ehemals separaten Dateien:
- ~~`berater-overview.js`~~ → **zusammengeführt in `agentur-overview.js`** (ab Zeile 2277)
- ~~`kunden-detail-bank.js`~~ → **zusammengeführt in `kunden-detail.js`** (ab Zeile 1509)

**Beweis in `index.html` (Zeile 7693):**
```html
<!-- berater-overview.js and kunden-detail-bank.js merged into agentur-overview.js and kunden-detail.js -->
```

### 4.2 B-02 Banking-Funktionen (agentur-overview.js, ab Zeile 2277)

#### State-Variablen

```javascript
var bankViewMode = localStorage.getItem('bankViewMode') || 'retail';
var currentBeraterTab = 'kundenstamm';
```

#### Funktionsverzeichnis B-02

| Funktion | Beschreibung |
|---|---|
| `showBeraterOverview(vermittlerId)` | **Haupteinstieg B-02.** Zeigt `#beraterOverviewPage`, lädt Banking-Daten |
| `setBankViewMode(mode)` | Wechselt Banking-Untermodus: `retail`, `firmenkunde`, `vermoegen` |
| `switchBeraterTab(tabId)` | Tabs: `kundenstamm`, `neugeschaeft`, `portfolio`, `kommunikation` |
| `renderBankKundenRetail()` | Rendert Retail-Kundenliste (12 Kunden) |
| `renderBankKundenFK()` | Rendert Firmenkundenliste (8 Kunden) |
| `renderBankKundenVW()` | Rendert Vermögenskunden (6 Kunden) |
| `renderBankNeugeschaeft()` | Rendert Neugeschäft-Pipeline |
| `renderBankPortfolio()` | Portfolio-Analyse mit Charts |
| `openBankKundenDetail(kundeId)` | Öffnet Banking-Kundendetail → B-10 |
| `getBeraterChatResponse(message)` | **Regelbasiert (Mock).** Pattern-Matching für Banking-Kontext |
| `toggleBeraterChat()` | Öffnet/schließt Banking-Chat-Widget |
| `sendBeraterMessage(message)` | Sendet Nachricht an Banking-Chat |

#### Mock-Daten B-02

| Datenstruktur | Anzahl | Beschreibung |
|---|---|---|
| `bankKundenRetail` | 12 Kunden | Privatkunden mit Girokonto, Sparplan, Baufinanzierung |
| `bankKundenFK` | 8 Kunden | Firmenkunden mit Geschäftskonto, Kredit, Leasing |
| `bankKundenVW` | 6 Kunden | Vermögenskunden mit Depot, Vermögensverwaltung |
| `bankNeugeschaeft` | 12 Einträge | Neugeschäft-Pipeline nach Status |

### 4.3 B-10 Banking-Detail-Funktionen (kunden-detail.js, ab Zeile 1509)

#### Architekturbesonderheit: Seitenwiederverwendung

B-10 nutzt **dieselbe HTML-Seite** wie A-10 (`#kundenDetailPage`). Die Transformation erfolgt durch:

```javascript
adaptA10ForBankMode()    // Transformiert A-10 → B-10 (ersetzt Tabs, KPIs, Sticky-Bar)
restoreA10InsuranceMode() // Stellt A-10 Original wieder her
```

Das HTML-Element `#kundenDetailBankPage` in `index.html` ist ein **leerer Stub** mit `display: none !important` — es wird NIE angezeigt.

#### Funktionsverzeichnis B-10

| Funktion | Beschreibung |
|---|---|
| `adaptA10ForBankMode()` | Transformiert die A-10-Seite für Banking: ändert Tabs, KPIs, entfernt Versicherungs-Elemente |
| `restoreA10InsuranceMode()` | Revertiert alle Änderungen, stellt A-10 Original wieder her |
| `fillBankKundenDetail(kundeId)` | Befüllt mit Banking-Daten: Konten, Depots, Kredite, Transaktionen |
| `fillBankUebersicht(kunde)` | Tab 1: Übersicht mit Vermögensübersicht, Key-KPIs |
| `fillBankKontenDepots(kunde)` | Tab 2: Konten & Depots mit Salden und Transaktionen |
| `fillBankFida(kunde)` | Tab 3: FIDA (Financial Data Access) — zeigt bankfremde Kontodaten |
| `fillBankImpulse(kunde)` | Tab 4: Vertriebsimpulse basierend auf Banking-Daten |
| `calculateBankCLV(kunde)` | Tab 5: Customer Lifetime Value für Banking-Kunden |
| `fillBankKommunikation(kunde)` | Tab 6: Kommunikationshistorie (Termine, Anrufe, Mails) |

#### Mock-Daten B-10

**`bankMockKunden`:** 12 Banking-Kunden mit:
- Stammdaten (Name, Adresse, Geburtsdatum, Segment)
- Konten (Girokonto, Sparkonto, Tagesgeld) mit Salden und IBAN
- Depots mit Positionen (Aktien, Fonds, ETFs) und Kurswerten
- Kredite (Baufinanzierung, Ratenkredit) mit Restschuld und Zinssatz
- Transaktionshistorie (letzte 20 Transaktionen)
- FIDA-Daten (bankfremde Konten bei Drittinstituten)

### 4.4 Routing-Delegation für B-02/B-10

In `router.js` werden die Banking-Routen wie folgt aufgelöst:

```javascript
'/berater':             { view: 'berater-retail',       pageId: 'B-02' }
'/berater-firmenkunde': { view: 'berater-firmenkunde',  pageId: 'B-02b' }
'/berater-vermoegen':   { view: 'berater-vermoegen',    pageId: 'B-02c' }
'/kundendetail-bank':   { view: 'kundendetail-bank',    pageId: 'B-10' }
'/kundendetail-bank-fk':{ view: 'kundendetail-bank-fk', pageId: 'B-10b' }
'/kundendetail-bank-pb':{ view: 'kundendetail-bank-pb', pageId: 'B-10c' }
```

Die Navigation zu B-02 ruft intern `showBeraterOverview('VM00001')` + `setViewMode('bank-retail')` auf. Die Navigation zu B-10 ruft `openBankKundenDetail()` + `adaptA10ForBankMode()` auf.

### 4.5 Zusammenfassung Restanten-Check

| Aspekt | Status |
|---|---|
| Separate `berater-overview.js` | **Nicht vorhanden** — vollständig in `agentur-overview.js` integriert |
| Separate `kunden-detail-bank.js` | **Nicht vorhanden** — vollständig in `kunden-detail.js` integriert |
| `#kundenDetailBankPage` (HTML) | **Leerer Stub** mit `display: none !important` — wird nie verwendet |
| Routen B-02, B-02b, B-02c | **Funktional** — delegieren an `showBeraterOverview()` in `agentur-overview.js` |
| Routen B-10, B-10b, B-10c | **Funktional** — nutzen `#kundenDetailPage` mit `adaptA10ForBankMode()` |
| `docs/README_B02_B10.md` | **Veraltet** — referenziert `berater-overview.js` und `kunden-detail-bank.js` die nicht mehr existieren |
| `docs/README_A02_A10.md` | **Veraltet** — referenziert alte Dateistruktur |

---

## 5. Modulübergreifende Abhängigkeiten

### 5.1 Abhängigkeitsgraph

```
                    ┌──────────────────┐
                    │   mrh-trowe.js   │
                    │  (setViewMode)   │
                    └───────┬──────────┘
                            │ steuert
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐   ┌───────────────┐
│ agentur-      │  │  makler.js    │   │ kunden-       │
│ overview.js   │  │  (Ecclesia)   │   │ detail.js     │
│ (A-02 + B-02) │  │  (A-02b/10b) │   │ (A-10 + B-10) │
└───────┬───────┘  └───────┬───────┘   └───────┬───────┘
        │                  │                   │
        │    ┌─────────────┼───────────────────┘
        │    │             │
        ▼    ▼             ▼
┌───────────────────────────────────────────────┐
│            Gemeinsame Abhängigkeiten          │
├───────────────────────────────────────────────┤
│ config.js    │ KPI-Definitionen, Bundesland   │
│ data.js      │ Globaler State, Filter         │
│ utils.js     │ Formatierung, CSV-Parser       │
│ clv.js       │ CLV-Berechnung (A-10, B-10)   │
│ potentiale.js│ Impulse (A-10, A-10b, A-10c)  │
│ nps-display.js│ NPS-Anzeige (A-10)           │
│ kommunikation-display.js │ Alle Modi         │
│ finanzplanung.js │ Renten-Simulator (A-10)   │
│ autocomplete.js │ Suche (A-02, B-02)         │
│ chart.js (CDN)│ Alle Chart-Rendering         │
│ router.js    │ Hash-basierte Navigation       │
│ page-id-tracker.js │ Page-ID-Zuordnung       │
└───────────────────────────────────────────────┘
```

### 5.2 Dateiübergreifende Funktionsaufrufe

| Aufrufende Datei | Aufgerufene Funktion | Definiert in |
|---|---|---|
| `agentur-overview.js` | `openKundenDetail()` | `kunden-detail.js` |
| `agentur-overview.js` | `openBankKundenDetail()` | `kunden-detail.js` |
| `makler.js` | `openMaklerKundenDetail()` → transformiert `#kundenDetailPage` | `makler.js` (intern) |
| `mrh-trowe.js` | `openMRHKundenDetail()` → transformiert `#kundenDetailPage` | `mrh-trowe.js` (intern) |
| `mrh-trowe.js` | `setViewMode()` → ruft `applyMaklerModus()` | `makler.js` |
| `mrh-trowe.js` | `setViewMode()` → ruft `showBeraterOverview()` | `agentur-overview.js` |
| `kunden-detail.js` | `calculateCLV()` | `clv.js` |
| `kunden-detail.js` | `renderNPS()` | `nps-display.js` |
| `kunden-detail.js` | `renderPotentiale()` | `potentiale.js` |
| `kunden-detail.js` | `renderKommunikation()` | `kommunikation-display.js` |
| `kunden-detail.js` | `renderFinanzplanung()` | `finanzplanung.js` |
| `router.js` | `showAgenturOverview()` | `agentur-overview.js` |
| `router.js` | `showBeraterOverview()` | `agentur-overview.js` |
| `router.js` | Diverse `open*Detail()` | jeweilige Dateien |

### 5.3 Geteilte DOM-Elemente

| DOM-Element | Genutzt von | Zweck |
|---|---|---|
| `#kundenDetailPage` | A-10, A-10b, A-10c, B-10, B-10b, B-10c | Einziges Kunden-Detail-Container — wird je Modus transformiert |
| `#agenturOverview` | A-02, A-02b, A-02c | Agentur-Übersicht (Tabs werden je Modus ein-/ausgeblendet) |
| `#beraterOverviewPage` | B-02, B-02b, B-02c | Banking-Berater-Übersicht |
| `#versicherungModule` | Alle Versicherungs-Views | Modul-Container für Versicherung |
| `#bankenModule` | Alle Banking-Views | Modul-Container für Banken |
| `#viewModeDropdown` | Alle Modi | Globales View-Mode-Dropdown |

### 5.4 Event-System

| Event | Dispatcher | Listener | Zweck |
|---|---|---|---|
| `viewChanged` | Diverse open/show-Funktionen | `page-id-tracker.js` | Page-ID-Update |
| `hashchange` | Browser | `router.js` | URL-Routing |
| `popstate` | Browser | `router.js` | History-Navigation |
| `click` (document) | Browser | `mrh-trowe.js` | Schließt View-Mode-Dropdown bei Klick außerhalb |

---

## 6. Konfiguration & Dependencies

### 6.1 CDN-Bibliotheken (in index.html)

| Bibliothek | Version | CDN | Zweck |
|---|---|---|---|
| Leaflet | 1.9.4 | cdnjs.cloudflare.com | Kartenvisualisierung (Dashboard A-03) |
| Chart.js | 4.4.0 | cdn.jsdelivr.net | Diagramme (Balken, Linie, Doughnut, Radar) |
| D3.js | 7.8.5 | cdnjs.cloudflare.com | Datenvisualisierung, Sankey-Diagramme |
| d3-sankey | 0.12.3 | cdn.jsdelivr.net | Sankey-Flow-Diagramme |
| html2canvas | 1.4.1 | cdnjs.cloudflare.com | Screenshot-Funktion |
| jsPDF | 2.5.1 | cdnjs.cloudflare.com | PDF-Export |
| JSZip | 3.10.1 | cdnjs.cloudflare.com | PPTX-Export (ZIP-basiert) |

### 6.2 Externe Dienste

| Dienst | URL | Zweck |
|---|---|---|
| Claude API (Cloudflare Worker) | `https://vst-claude-api.eike-3e2.workers.dev` | KI-Chat (nur T-05 echte API, Rest Mock) |
| logo.dev | `https://img.logo.dev/{domain}?token=pk_OCPEqFGOT5ulHMN4BcMKgA` | Versicherer-/Banken-Logos |
| billingcheck.pages.dev | (extern) | PVA-Modus: Billing-Check-App |
| provisions-analyzer.pages.dev | (extern) | PVA-Modus: Provisions-Analyse |

### 6.3 Claude API Konfiguration

```javascript
window.CLAUDE_WORKER_URL = 'https://vst-claude-api.eike-3e2.workers.dev';
window.CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
// max_tokens: 2000 (im Worker konfiguriert)
```

**Mock-Modus-Logik:**
- `shouldUseMockMode()` prüft, ob `#documentAssistantContainer` (T-05) sichtbar ist
- **Nur T-05** nutzt die echte Claude-API
- **Alle anderen Chats** (Dashboard A-03, Agentur-Chat A-02, Berater-Chat B-02) verwenden regelbasiertes Pattern-Matching

### 6.4 KPI-Konfiguration (config.js)

9 definierte KPIs:

| ID | Titel | Einheit | YTD |
|---|---|---|---|
| `neugeschaeft` | Neugeschäftsvolumen | currency | ja |
| `bestand` | Bestandsvolumen | currency | nein |
| `storno` | Stornoquote | percent | ja |
| `nps` | NPS Score | score | nein |
| `risiko` | Risikoscore | score | nein |
| `combined` | Combined Ratio | percent | nein |
| `ergebnis` | Gesamtergebnis | currency | ja |
| `underwriting` | Underwriting Qualität | percent | nein |
| `deckungsbeitrag` | Deckungsbeitrag | currency | ja |

### 6.5 Bundesland-Konfiguration (config.js)

16 Bundesländer mit:
- `baseFactor`: Gewichtungsfaktor (0.55 bis 1.45)
- `seasonPattern`: 12 Monatsfaktoren
- `volatility`: Schwankungsbreite (0.10 bis 0.30)

**Höchste Faktoren:** Hamburg (1.45), Bayern (1.40), Baden-Württemberg (1.35)
**Niedrigste Faktoren:** Mecklenburg-Vorpommern (0.55), Brandenburg (0.65), Sachsen-Anhalt (0.68)

### 6.6 CSS-Module (31 Dateien)

| CSS-Datei | Modul |
|---|---|
| `variables.css` | CSS Custom Properties (Farben, Abstände, Schriften) |
| `shared.css` | Gemeinsame Basis-Styles |
| `styles.css` | Haupt-Stylesheet (Dashboard, Tabellen, Layout) |
| `agentur-fachkonzept.css` | A-02 Agentur-Übersicht |
| `kunden-detail.css` | A-10 Kunden-Detail |
| `kunde-sticky-bar.css` | A-10 Sticky-Bar |
| `banking-berater.css` | B-02/B-10 Banking |
| `makler.css` | A-02b/A-10b Ecclesia B2B |
| `mrh-trowe.css` | A-02c/A-10c MRH Trowe |
| `clv.css` | CLV-Visualisierung |
| `nps.css` | NPS-Sterne-Anzeige |
| `potentiale-display.css` | Potenzial-Karten |
| `kommunikation-display.css` | Kommunikations-Timeline |
| `finanzplanung.css` | Renten-Simulator |
| `banken.css` | B-01 Banken-Modul |
| `bezahlen-tx.css` | Transaktionsanzeige |
| `risikoscoring.css` | R-01 Risikoscoring |
| `bestandsuebertragung-vst.css` | T-01 Bestandsübertragung |
| `sales-report.css` | Sales Report |
| `hr-pipeline.css` | H-01 HR Pipeline |
| `asset-management.css` | AM-01 Asset Management |
| `am-prod-mode.css` | AM Produktionsmodus |
| `provisionssimulation.css` | Provisions-Simulation |
| `guided-tour.css` | Geführte Tour |
| `user-profile.css` | Benutzerprofil |
| `stammdaten-extras.css` | Stammdaten-Erweiterungen |
| `screen-recorder.css` | Bildschirmaufnahme |
| `bgav-umstellung.css` | A-11/A-12 BGAV |
| `versicherungs-1x1.css` | V-01 Versicherungs-1×1 |
| `cv-scanner.css` | CV-Scanner |
| `pmo-toolbox.css` | P-01 PMO Toolbox |

### 6.7 localStorage-Nutzung

| Key | Gesetzt von | Zweck |
|---|---|---|
| `viewMode` | `mrh-trowe.js` | Aktiver View-Modus (ao/ecclesia/mrh/bank-*) |
| `bankViewMode` | `agentur-overview.js` | Banking-Untermodus (retail/firmenkunde/vermoegen) |
| `maklerModus` | `makler.js` | Legacy Makler-Flag |
| `profileImage` | `user-mode.js` | Profilbild (Base64 komprimiert) |
| `userMode` | `user-mode.js` | Benutzer-Modus (Vertrieb/PVA) |
| `claude_api_token` | Benutzer | Fallback API-Key (falls kein Worker) |

---

## 7. Beobachtungen

### 7.1 Positive Aspekte

1. **Modulare Struktur trotz Vanilla JS:** Die klare Aufteilung in spezialisierte JS-Dateien ermöglicht gute Übersicht trotz fehlendem Framework.

2. **Konsistentes View-Mode-System:** Die zentrale `setViewMode()`-Funktion in `mrh-trowe.js` steuert sauber alle 6 Modi mit einem einzigen Dropdown.

3. **Lazy Rendering:** Ecclesia- und MRH-Tabs werden erst beim ersten Öffnen gerendert, was die initiale Ladezeit reduziert.

4. **Seitenwiederverwendung A-10/B-10:** Das Pattern `adaptA10ForBankMode()`/`restoreA10InsuranceMode()` vermeidet HTML-Duplikation, erfordert aber sorgfältige Zustandsverwaltung.

5. **Deep-Link-Support:** Der Router unterstützt direkte URL-Aufrufe mit Fallback-Logik und Retry-Mechanismus (100ms, 500ms, 1500ms, 3000ms).

6. **Umfangreiche Mock-Daten:** Die 50+ Versicherer-Logos, 11 AO-Kunden, 12 Banking-Kunden, 15 B2B-Kunden und 7 MRH-Kunden bilden realistische Szenarien ab.

### 7.2 Risiken und Verbesserungspotenziale

1. **Dateigröße:** `agentur-overview.js` (3429 Zeilen), `kunden-detail.js` (2533 Zeilen) und `makler.js` (2297 Zeilen) sind sehr groß. Die Zusammenführung von B-02/B-10 hat dies verschärft. Ein Bundler/Build-System (z.B. Vite, esbuild) würde Module ermöglichen, ohne die Dateigröße manuell managen zu müssen.

2. **Globaler Scope:** Alle Funktionen und Variablen liegen im globalen `window`-Scope. Nur `router.js` nutzt ein IIFE. Namenskollisionen sind möglich bei weiterer Erweiterung.

3. **Veraltete Dokumentation:** `docs/README_A02_A10.md` und `docs/README_B02_B10.md` referenzieren die nicht mehr existierenden Dateien `berater-overview.js` und `kunden-detail-bank.js`. Diese Docs sollten aktualisiert oder entfernt werden.

4. **Keine Tests:** Es gibt keine Unit-Tests, Integrationstests oder End-to-End-Tests. Bei der Komplexität der View-Mode-Umschaltung und DOM-Transformation wäre zumindest ein grundlegendes Testframework empfehlenswert.

5. **Mock-Daten hart kodiert:** Alle Mock-Daten sind in den JS-Dateien eingebettet statt in separaten JSON-Dateien. Änderungen an den Testdaten erfordern Editieren der Logik-Dateien.

6. **Chat-System Dual-Modus:** Das Nebeneinander von echtem API-Chat (T-05) und Mock-Chat (überall sonst) ist funktional, aber potentiell verwirrend für Nutzer, die den Unterschied nicht kennen.

7. **DOM-Transformation-Risiko:** Die Technik `adaptA10ForBankMode()` / `restoreA10InsuranceMode()` ist fragil — wenn die Rücktransformation nicht alle Änderungen revertiert, bleibt die Seite in einem inkonsistenten Zustand.

8. **Leerer HTML-Stub:** `#kundenDetailBankPage` in `index.html` hat `display: none !important` und wird nie verwendet. Dies ist ein Überbleibsel der alten Architektur und kann entfernt werden.

9. **CSS-Versionierung manuell:** Cache-Busting erfolgt über manuelle Query-Parameter (`?v=20260309`). Ein Build-System mit automatischem Hashing wäre zuverlässiger.

10. **Keine Fehlerbehandlung bei CDN-Ausfall:** Außer für Leaflet (5-Sekunden-Timeout in `utils.js`) gibt es keine Fallback-Logik für den Fall, dass CDN-Bibliotheken nicht laden.

### 7.3 Architektur-Empfehlungen

1. **Module System einführen:** Migration zu ES-Modulen (`import`/`export`) mit einem Bundler würde den globalen Scope bereinigen und Tree-Shaking ermöglichen.

2. **Mock-Daten extrahieren:** Alle Mock-Daten in `data/`-Verzeichnis als JSON-Dateien auslagern.

3. **Docs aktualisieren:** `README_B02_B10.md` und `README_A02_A10.md` auf den aktuellen Stand bringen oder durch dieses Dokument ersetzen.

4. **Leeren Stub entfernen:** `#kundenDetailBankPage` aus `index.html` entfernen, da es nie verwendet wird.

5. **State Management:** Ein zentrales State-Objekt (ähnlich `data.js`, aber umfassender) würde die verteilte Zustandsverwaltung über globale Variablen und localStorage konsolidieren.

---

*Ende der Analyse. Stand: 09.03.2026*
