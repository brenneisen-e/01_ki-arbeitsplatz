# B-02 & B-10: Berater- und Kundenansicht (Banking) -- Vollstaendige Dokumentation

> Umfassende Dokumentation aller Ansichten, Tabs, Layouts, Daten, Logiken und des KI-Chatbots
> fuer die Banking-Module im KI-Vertriebsarbeitsplatz (Stand: Maerz 2026)

---

## Inhaltsverzeichnis

1. [Ueberblick](#ueberblick)
2. [Page-ID-System und Namenskonvention](#page-id-system-und-namenskonvention)
3. [Die drei Modi im Detail](#die-drei-modi-im-detail)
4. [B-02 -- Berater-Uebersicht](#b-02----berater-uebersicht)
   - [Layout-Aufbau (Gesamtstruktur)](#b-02-layout-aufbau)
   - [Header-Bereich](#b-02-header-bereich)
   - [KPI-Boxen je Modus](#b-02-kpi-boxen)
   - [B-02 Retail: Kundenliste und Tabs](#b-02-retail-kundenliste)
   - [B-02b Firmenkunde: Kundenliste und Tabs](#b-02b-firmenkunde-kundenliste)
   - [B-02c Vermoegen: Drei-Saeulen-Karten und Kundenliste](#b-02c-vermoegen-kundenliste)
5. [B-10 -- Kunden-Detailansicht](#b-10----kunden-detailansicht)
   - [Layout-Aufbau (Gesamtstruktur)](#b-10-layout-aufbau)
   - [Sticky Bar](#b-10-sticky-bar)
   - [B-10 Retail: Alle 7 Tabs mit Showcase-Daten](#b-10-retail-alle-7-tabs)
     - [Tab: Stammdaten](#b10-retail-tab-stammdaten)
     - [Tab: Konten & Karten](#b10-retail-tab-konten)
     - [Tab: Kredit & Finanzierung](#b10-retail-tab-kredit)
     - [Tab: Wertpapiere & Anlage](#b10-retail-tab-wertpapiere)
     - [Tab: Versicherung & Vorsorge](#b10-retail-tab-versicherung)
     - [Tab: Open Finance / FIDA](#b10-retail-tab-fida)
     - [Tab: Beratungshistorie](#b10-retail-tab-historie)
   - [B-10b Firmenkunde: Alle 7 Tabs](#b-10b-firmenkunde-alle-7-tabs)
     - [Tab: Stammdaten](#b10b-tab-stammdaten)
     - [Tab: Kreditengagement](#b10b-tab-kredit)
     - [Tab: Zahlungsverkehr](#b10b-tab-zv)
     - [Tab: Rating & Risiko](#b10b-tab-rating)
     - [Tab: Foerdermittel](#b10b-tab-foerder)
     - [Tab: Open Finance / FIDA](#b10b-tab-fida)
     - [Tab: Ansprechpartner](#b10b-tab-ansprech)
   - [B-10c Vermoegen: Alle 7 Tabs](#b-10c-vermoegen-alle-7-tabs)
     - [Drei-Saeulen-Karten (oberhalb der Tabs)](#b10c-saeulen-karten)
     - [Tab: Stammdaten](#b10c-tab-stammdaten)
     - [Tab: Depot & Vermoegensverwaltung](#b10c-tab-depot)
     - [Tab: Vorsorge-Check](#b10c-tab-vorsorge)
     - [Tab: Nachfolge](#b10c-tab-nachfolge)
     - [Tab: MiFID & Dokumentation](#b10c-tab-mifid)
     - [Tab: Open Finance / FIDA](#b10c-tab-fida)
     - [Tab: Beziehungs-Timeline](#b10c-tab-timeline)
6. [Open Finance / FIDA -- Das zentrale Feature](#open-finance-fida)
   - [Architektur des FIDA-Panels](#fida-panel-architektur)
   - [FIDA-Daten je Modus](#fida-daten-je-modus)
   - [KI-generierte Handlungsempfehlungen](#ki-empfehlungen)
7. [KI-Chatbot (Banken / Collections)](#ki-chatbot-banken)
   - [Architektur und Funktionsweise](#chatbot-banken-architektur)
   - [Alle abfragbaren Kategorien](#chatbot-banken-kategorien)
   - [Export-Funktionen (Excel, PDF)](#chatbot-banken-export)
   - [Follow-up-Vorschlaege](#chatbot-banken-followups)
8. [Modus-Umschaltung (Technischer Ablauf)](#modus-umschaltung-banking)
9. [Navigationsfluss B-02 zu B-10](#navigationsfluss-banking)
10. [KPI-Vergleich nach Modus](#kpi-vergleich-banking)
11. [Tab-Vergleich nach Modus](#tab-vergleich-banking)
12. [CSS-Design-System](#css-design-system)
13. [Technische Architektur](#technische-architektur-banking)
14. [Dateistruktur](#dateistruktur-banking)
15. [Integration mit anderen Modulen](#integration-banking)
16. [Mock-Daten-Katalog](#mock-daten-katalog-banking)
17. [Mapping: Versicherung → Banking](#mapping-versicherung-banking)

---

## Ueberblick

**B-02** (Berater-Uebersicht) und **B-10** (Kunden-Detailansicht) bilden das Herzstuck des Banking-Moduls im KI-Vertriebsarbeitsplatz. Sie sind die Adaption der bewährten Versicherungsmodule A-02/A-10 fuer den Kontext der Genossenschaftlichen FinanzGruppe (GFG) — entwickelt fuer den Atruvia TechDay unter dem Motto "Open Finance meets KI".

Gemeinsam decken B-02 und B-10 den kompletten Beratungs-Workflow einer Volksbank ab: von der Gesamtbetrachtung eines Beraters mit seinem Kundenstamm (B-02) bis hinunter zum einzelnen Kunden mit Konten, Krediten, Wertpapieren und Open-Finance-Daten (B-10).

Beide Ansichten existieren in **drei Varianten** (Modi), die ueber einen 3-Wege-Toggle im Header umgeschaltet werden. Der Modus bestimmt **alles**: KPIs, Tabs, Kundenlisten, Header-Informationen, Berater-Profile, URL-Route und Page-ID.

### Der entscheidende Unterschied zur Versicherungsversion

In der Versicherungsversion (A-02/A-10) ist Open Finance / FIDA ein optionaler Tab in A-10. In der Banking-Version wird **Open Finance zum zentralen Feature und roten Faden**. Es liefert die Datenbasis, die den KI-Assistenten erst wirklich maechtig macht. FIDA-Daten von Fremdbanken (ING, Trade Republic, Commerzbank, etc.) erzeugen konkrete, actionable Vertriebsanlaesse.

### Uebersichtstabelle

| Page-ID | Ansicht | Modus | Route | JS-Datei |
|---------|---------|-------|-------|----------|
| **B-02** | Berater-Uebersicht | VR Retail | `#/berater` | `berater-overview.js` |
| **B-02b** | Berater-Uebersicht | VR Firmenkunde | `#/berater-firmenkunde` | `berater-overview.js` |
| **B-02c** | Berater-Uebersicht | VR Vermoegen | `#/berater-vermoegen` | `berater-overview.js` |
| **B-10** | Kunden-Detail | VR Retail | `#/kundendetail-bank` | `kunden-detail-bank.js` |
| **B-10b** | Kunden-Detail | VR Firmenkunde | `#/kundendetail-bank-fk` | `kunden-detail-bank.js` |
| **B-10c** | Kunden-Detail | VR Vermoegen | `#/kundendetail-bank-pb` | `kunden-detail-bank.js` |

### Technologie-Stack

| Schicht | Technologie |
|---------|------------|
| Frontend | Vanilla JavaScript (HTML5, CSS3) -- kein Framework |
| Rendering | DOM-Manipulation (innerHTML) mit dynamischem Tab-Aufbau |
| State | `bankViewMode` in localStorage (retail / firmenkunde / vermoegen) |
| Routing | Hash-basiert via `router.js` (`#/berater`, `#/berater-firmenkunde`, etc.) |
| Styling | `css/banking-berater.css` (793 Zeilen, eigenes Design-System) |
| Chat | `banken-chat.js` (Collections Dashboard Chat, keyword-basiert) |
| Page-ID | `page-id-tracker.js` Modul `bankenBerater` |

### Regionale Verankerung

Alle Mock-Daten sind regional in Mittelhessen verankert:
- **Bank:** Volksbank Mittelhessen eG
- **Standorte:** Giessen, Wetzlar, Marburg
- **Berater-Profile:** Thomas Berger (Retail), Carola Weiss (Firmenkunde), Dr. Julia Rademacher (Vermoegen)

---

## Page-ID-System und Namenskonvention

Das Page-ID-System nutzt den Praefix **B** fuer alle Banking-Module. Die Registrierung erfolgt im `page-id-tracker.js` unter dem Modul `bankenBerater`:

```
bankenBerater: {
    'berater-retail':        'B-02',    // Berater-Uebersicht (VR Retail)
    'berater-firmenkunde':   'B-02b',   // Berater-Uebersicht (VR Firmenkunde)
    'berater-vermoegen':     'B-02c',   // Berater-Uebersicht (VR Vermoegen)
    'kundendetail-bank':     'B-10',    // Kunden-Detail Bank (Retail)
    'kundendetail-bank-fk':  'B-10b',   // Kunden-Detail Bank (Firmenkunde)
    'kundendetail-bank-pb':  'B-10c'    // Kunden-Detail Bank (Private Banking)
}
```

### Namensschema

| Praefix | Bedeutung | Beispiel |
|---------|-----------|---------|
| B-0x | Banking Uebersichtsseiten | B-01 = Banken-Dashboard, B-02 = Berater-Uebersicht |
| B-0xb | Banking Sub-Modus Firmenkunde | B-02b = Berater-Uebersicht FK |
| B-0xc | Banking Sub-Modus Vermoegen | B-02c = Berater-Uebersicht PB |
| B-1x | Banking Detailseiten | B-10 = Kunden-Detail |
| B-1xb | Detail Sub-Modus Firmenkunde | B-10b = Kunden-Detail FK |
| B-1xc | Detail Sub-Modus Vermoegen | B-10c = Kunden-Detail PB |

---

## Die drei Modi im Detail

Statt AO / Ecclesia / MRH Trowe (Versicherung) bilden die drei Modi die typischen Vertriebswege der GFG ab:

| Modus | Pendant (Versicherung) | Zielgruppe | Kontext |
|-------|----------------------|------------|---------|
| **VR Retail** | AO (Privatkundenvertrieb) | Privatkundenberater einer Volksbank | Der Standardfall: Ein Berater betreut 300-500 Privatkunden mit Girokonto, Baufi, Wertpapier, Versicherung |
| **VR Firmenkunde** | Ecclesia B2B | Firmenkundenberater | Mittelstaendische Unternehmen mit Kreditlinien, Zahlungsverkehr, Leasing, Auslandsgeschaeft |
| **VR Vermoegen** | MRH Gewerbe 360 | Private Banking / Vermoegensberatung | Vermoegende Privatkunden mit Depot, Vermoegensverwaltung, Nachfolgeplanung, Stiftungen |

### Warum diese drei Modi fuer Atruvia relevant sind

Die GFG hat genau diese drei Vertriebssaeulen:
- **Retail:** Privatkundenberater in der Flaeche (das Massengeschaeft)
- **Firmenkunde:** Firmenkundenberater fuer den regionalen Mittelstand (das Ertragsgeschaeft)
- **Vermoegen:** Private-Banking-Einheiten (das Wachstumsgeschaeft)

Der Toggle demonstriert Atruvia, dass ein und dieselbe Plattform alle drei bedient.

### Modus-Steuerung (technisch)

```javascript
// State in localStorage
var bankViewMode = localStorage.getItem('bankViewMode') || 'retail';

// setBankViewMode('firmenkunde') bewirkt:
// 1. localStorage.setItem('bankViewMode', 'firmenkunde')
// 2. Aktiviert passenden .bank-mode-btn
// 3. Ruft applyBankViewMode() auf
// 4. Dispatcht viewChanged-Event → Page-ID-Tracker aktualisiert auf B-02b
// 5. Aktualisiert URL via AppRouter.navigate('/berater-firmenkunde')
```

### Berater-Profile je Modus

| Modus | Berater | Nr. | Region |
|-------|---------|-----|--------|
| **retail** | Thomas Berger | VB-40210 | Beratungscenter Giessen-Sued |
| **firmenkunde** | Carola Weiss | VB-40210-FK | Firmenkundencenter Mittelhessen |
| **vermoegen** | Dr. Julia Rademacher | PB-Center Giessen | Ganzheitliche Vermoegensbetreuung |

Alle drei gehoeren zur **Volksbank Mittelhessen eG**.

---

## B-02 -- Berater-Uebersicht

### B-02 Layout-Aufbau

Die Berater-Uebersicht ist eine Single-Page-Ansicht mit dynamischem Content. Die gesamte Seite liegt im Container `#beraterOverviewPage` und wird ueber `showBeraterOverview()` sichtbar gemacht.

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (VR-Blau Gradient #003399 → #002266)               │
│  ┌──────┐                                    ┌────────────┐ │
│  │Zurueck│  Thomas Berger                    │VR Retail   │ │
│  │  ←   │  Berater-Nr. VB-40210 | VB MH eG  │VR Firmenk. │ │
│  └──────┘  Beratungscenter Giessen-Sued      │VR Vermoeg. │ │
│                                              └────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  KPI-BOXEN (4 oder 5 je nach Modus)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Kundenstamm│ │Ertrag YTD│ │Cross-Sell│ │FinanzPlan│       │
│  │   412     │ │248,5 Tsd.│ │   2,8    │ │   38%    │       │
│  │Aktive Ku. │ │+8,2% gg. │ │Ziel: 4,0 │ │Ziel: 50% │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│  [Drei-Saeulen-Karten — nur bei Modus VR Vermoegen]        │
├─────────────────────────────────────────────────────────────┤
│  KUNDENLISTE (Tabelle, je Modus andere Spalten)             │
│  ┌────────┬─────────┬────────┬────┬────────┬───────┬──────┐│
│  │ Kunde  │Kunden-Nr│Segment │ Ort│Produkte│Ertrag │FiPlan││
│  ├────────┼─────────┼────────┼────┼────────┼───────┼──────┤│
│  │Hoffmann│PK-10021 │ A-Top  │ GI │   5    │1.850  │  ✓   ││
│  │Kramer  │PK-10034 │ A-Top  │ WZ │   4    │2.100  │  ✓   ││
│  │Mueller │PK-10056 │B-Wachs.│ MR │   3    │  980  │  —   ││
│  │ ...    │  ...    │  ...   │... │  ...   │ ...   │ ...  ││
│  └────────┴─────────┴────────┴────┴────────┴───────┴──────┘│
└─────────────────────────────────────────────────────────────┘
```

### B-02 Header-Bereich

Der Header hat einen **VR-Blau-Gradient** (`linear-gradient(135deg, #003399, #002266)`) mit weisser Schrift.

**Elemente (von links nach rechts):**

1. **Zurueck-Button** — `backFromBeraterOverview()` → navigiert zurueck zur Landing Page
   - Style: `rgba(255,255,255,0.15)` Hintergrund, weisser Rand
   - Enthaelt Pfeil-SVG-Icon
2. **Berater-Info** — Dynamisch je Modus
   - `#beraterHeaderName` → Name des Beraters (z.B. "Thomas Berger")
   - `#beraterHeaderMeta` → Berater-Nr. + Bank + Region
3. **3-Wege-Modus-Selector** — `.bank-view-mode-selector`
   - Drei Buttons: `VR Retail` | `VR Firmenkunde` | `VR Vermoegen`
   - Aktiver Button: VR-Blau (#003399) Hintergrund, weisse Schrift
   - Inaktiv: Transparent, leicht durchscheinend
   - Absolute Positionierung rechts (`right: 80px`)

### B-02 KPI-Boxen

Jeder Modus hat eigene KPI-Karten. Die Sichtbarkeit wird ueber `data-bank-kpi-set` Attribute gesteuert:
- `data-bank-kpi-set="retail"` → nur sichtbar wenn Retail aktiv
- `data-bank-kpi-set="firmenkunde"` → nur sichtbar wenn Firmenkunde aktiv
- `data-bank-kpi-set="vermoegen"` → nur sichtbar wenn Vermoegen aktiv

#### B-02 Retail KPIs (4 Karten)

| # | KPI | Wert | Trend/Ziel | Icon-Klasse | Icon-Farbe |
|---|-----|------|-----------|-------------|-----------|
| 1 | Kundenstamm | 412 | Aktive Kunden | `bank-kunden` | Blau (#2563eb) |
| 2 | Ertrag YTD | 248,5 Tsd. | +8,2% gg. Vorjahr (gruen) | `bank-deposits` | Gruen (#16a34a) |
| 3 | Cross-Selling-Quote | 2,8 | Ziel: 4,0 (orange) | `bank-cross` | Lila (#7c3aed) |
| 4 | VR-FinanzPlan-Quote | 38% | Ziel: 50% (orange) | `bank-kredite` | Orange (#d97706) |

Grid: `repeat(4, 1fr)`, Padding: `24px 32px 16px`

#### B-02b Firmenkunde KPIs (5 Karten)

| # | KPI | Wert | Trend/Ziel | Icon-Klasse | Icon-Farbe |
|---|-----|------|-----------|-------------|-----------|
| 1 | Kreditvolumen | 42,5 Mio. | +6,1% YoY (gruen) | `bank-volumen` | Blau (#2563eb) |
| 2 | Neugeschaeft YTD | 6,8 Mio. | 3x Investition, 2x Betriebsmittel | `bank-firmen` | Gruen (#16a34a) |
| 3 | Provisionsertrag | 385 Tsd. | ZV + Ausland + Leasing | `bank-rating` | Orange (#d97706) |
| 4 | Ausfallrisiko | 1,2% | Benchmark: 2,1% (gruen) | `bank-risiko` | Rot (#dc2626) |
| 5 | Kundenbindung | 96,5% | Benchmark: 94% (gruen) | `bank-kunden` | Blau (#2563eb) |

Grid: `repeat(5, 1fr)`, Padding: `24px 32px 16px`

#### B-02c Vermoegen KPIs (4 Karten)

| # | KPI | Wert | Trend/Ziel | Icon-Klasse | Icon-Farbe |
|---|-----|------|-----------|-------------|-----------|
| 1 | AuM Gesamt | 85,2 Mio. | +12,4% YoY (gruen) | `bank-aum` | Blau (#2563eb) |
| 2 | Provisions-Ertrag WP | 420 Tsd. | Depot + Vermoegensverwaltung | `bank-performance` | Gruen (#16a34a) |
| 3 | Vorsorge-Ertrag | 185 Tsd. | Altersvorsorge + Versicherung | `bank-advisory` | Orange (#d97706) |
| 4 | Gesamt-Ertrag PB | 680 Tsd. | +15,2% gg. Vorjahr (gruen) | `bank-zufluss` | Lila (#7c3aed) |

Grid: `repeat(4, 1fr)`, Padding: `24px 32px 16px`

### KPI-Card Design

Jede KPI-Karte (`.banking-kpi-card`) hat:
- Weisser Hintergrund, `border-radius: 12px`
- Border: `1px solid #e2e8f0`
- Padding: `20px 24px`
- Hover: `box-shadow: 0 4px 12px rgba(0,0,0,0.12)`, `transform: translateY(-2px)`
- Icon-Container: `44x44px`, `border-radius: 10px`, farbiger Hintergrund passend zum Typ
- Drei Text-Zeilen: Label (12px, grau, Uppercase), Wert (24px, fett, schwarz), Trend (12px, farbig)

---

### B-02 Retail: Kundenliste

**Tabellen-Header:**

| Spalte | Ausrichtung | Beschreibung |
|--------|------------|-------------|
| Kunde | links | Name (fett) |
| Kunden-Nr. | links | Format: PK-1xxxx |
| Segment | links | Badge mit Farbkodierung |
| Ort | links | Giessen / Wetzlar / Marburg |
| Produkte | zentriert | Anzahl aktiver Produkte |
| Ertrag YTD | rechts | Betrag in EUR |
| FinanzPlan | zentriert | ✓ (gruen) oder — (grau) |

**Alle 8 Retail-Kunden (Mock-Daten):**

| Name | ID | Segment | Ort | Produkte | Ertrag | FinanzPlan | Baufi |
|------|-----|---------|-----|----------|--------|-----------|-------|
| Markus Hoffmann | PK-10021 | A-Top | Giessen | 5 | 1.850 EUR | Ja | Ja |
| Sabine Kramer | PK-10034 | A-Top | Wetzlar | 4 | 2.100 EUR | Ja | Nein |
| Thomas Mueller | PK-10056 | B-Wachstum | Marburg | 3 | 980 EUR | Nein | Nein |
| Andrea Fischer | PK-10078 | B-Wachstum | Giessen | 3 | 1.200 EUR | Ja | Ja |
| Klaus Weber | PK-10089 | B-Wachstum | Wetzlar | 2 | 760 EUR | Nein | Nein |
| Julia Braun | PK-10102 | C-Basis | Marburg | 2 | 420 EUR | Nein | Nein |
| Michael Schneider | PK-10115 | Abwanderung | Giessen | 1 | 180 EUR | Nein | Nein |
| Petra Lang | PK-10128 | C-Basis | Wetzlar | 2 | 540 EUR | Nein | Nein |

**Segment-Badges (CSS-Klassen und Farben):**

| Segment | CSS-Klasse | Hintergrund | Textfarbe |
|---------|-----------|------------|-----------|
| A-Top | `segment-exklusiv` | #ede9fe | #6d28d9 (Lila) |
| B-Wachstum | `segment-komfort` | #dbeafe | #1e40af (Blau) |
| C-Basis | `segment-basis` | #f1f5f9 | #475569 (Grau) |
| Abwanderung | `segment-basis` | #f1f5f9 | #475569 (Grau) |

**Klick-Verhalten:**
Jede Zeile ist klickbar (`class="clickable-row"`) und ruft `openBankKundenDetail('PK-10021', 'retail')` auf → oeffnet B-10 Kunden-Detail im Retail-Modus.

---

### B-02b Firmenkunde: Kundenliste

**Tabellen-Header:**

| Spalte | Ausrichtung | Beschreibung |
|--------|------------|-------------|
| Firma | links | Firmenname (fett) |
| Kunden-Nr. | links | Format: FK-2xxxx |
| Branche | links | Branchen-Badge mit Farbkodierung |
| Ort | links | Giessen / Wetzlar / Marburg |
| Kreditvolumen | rechts | Formatiert (z.B. "4,2 Mio. EUR") |
| Rating | links | Rating-Badge (AA, A, BBB, etc.) |
| Mitarbeiter | rechts | Anzahl |

**Alle 6 Firmenkunden (Mock-Daten):**

| Firma | ID | Branche | Ort | Kreditvol. | Rating | MA | Umsatz |
|-------|-----|---------|-----|-----------|--------|-----|--------|
| Metallbau Schaefer GmbH | FK-20010 | Handwerk/Bau | Giessen | 4,2 Mio. | A | 85 | 12,5 Mio. |
| TechSolutions Mittelhessen AG | FK-20023 | Dienstleistung/IT | Wetzlar | 2,8 Mio. | AA | 120 | 18,0 Mio. |
| Gasthaus zur Linde KG | FK-20035 | Handel/Gastro | Marburg | 850 Tsd. | BBB | 22 | 2,8 Mio. |
| Agrar Becker OHG | FK-20048 | Landwirtschaft | Giessen | 3,1 Mio. | A | 15 | 4,2 Mio. |
| Dr. med. Karin Engel — Praxisgemeinschaft | FK-20061 | Heilberufe | Wetzlar | 1,2 Mio. | AA | 8 | 1,8 Mio. |
| Wetzlarer Maschinenbau GmbH | FK-20074 | Produktion/Industrie | Wetzlar | 6,8 Mio. | A | 210 | 32,0 Mio. |

**Branchen-Badges (CSS-Klassen und Farben):**

| Branche | CSS-Klasse | Hintergrund | Textfarbe |
|---------|-----------|------------|-----------|
| Handwerk/Bau | `branche-handwerk` | #fed7aa | #c2410c (Orange) |
| Produktion/Industrie | `branche-produktion` | #bfdbfe | #1e40af (Blau) |
| Handel/Gastro | `branche-handel` | #bbf7d0 | #166534 (Gruen) |
| Dienstleistung/IT | `branche-dienstleistung` | #e2e8f0 | #334155 (Dunkelgrau) |
| Landwirtschaft | `branche-landwirtschaft` | #d9f99d | #3f6212 (Oliv) |
| Heilberufe | `branche-heilberufe` | #fbcfe8 | #9f1239 (Pink) |

**Rating-Badges (CSS-Klassen und Farben):**

| Rating | CSS-Klasse | Hintergrund | Textfarbe | Bedeutung |
|--------|-----------|------------|-----------|-----------|
| AAA | `rating-aaa` | #dcfce7 | #166534 | Bestes Rating |
| AA | `rating-aa` | #d9f99d | #3f6212 | Sehr gut |
| A | `rating-a` | #fef3c7 | #92400e | Gut |
| BBB | `rating-bbb` | #fed7aa | #c2410c | Befriedigend |
| BB | `rating-bb` | #fecaca | #991b1b | Spekulativ |
| B | `rating-b` | #fee2e2 | #dc2626 | Hoch spekulativ |
| CCC | `rating-ccc` | #fca5a5 | #7f1d1d | Ausfallgefaehrdet |

**Klick-Verhalten:**
Jede Zeile ruft `openBankKundenDetail('FK-20010', 'firmenkunde')` auf → oeffnet B-10b Kunden-Detail im Firmenkunde-Modus.

---

### B-02c Vermoegen: Drei-Saeulen-Karten und Kundenliste

Im Modus VR Vermoegen erscheint zwischen KPI-Boxen und Kundenliste ein besonderes Element: die **Drei-Saeulen-Karten** (`#beraterSaeulenGrid`). Diese sind nur in diesem Modus sichtbar (`display: grid` vs. `display: none`).

#### Drei-Saeulen-Karten (B-02 Uebersicht)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ │
│  │ Saeule I — Anlage │ │Saeule II —Vorsorge│ │Saeule III—Nachf.  │ │
│  │ (Blau #2563eb)    │ │ (Gruen #16a34a)   │ │ (Gold #d97706)    │ │
│  │                   │ │                   │ │                   │ │
│  │ Depot    42,8 Mio.│ │ Altersv. 18,2 Mio│ │ Testam.  3 Mandate│ │
│  │ VV       28,4 Mio.│ │ Versich.  8,4 Mio.│ │ Generat.  2 aktiv │ │
│  │ Fonds    14,0 Mio.│ │ Stiftung  2 aktiv │ │ Immobilie 4 Obj.  │ │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Saeulen-Card Design:**
- Grid: `repeat(3, 1fr)`, Gap: `20px`
- Weisser Hintergrund, `border-radius: 12px`, `border: 1px solid #e2e8f0`
- Linker Rand farbig: 3px je Saeule
- Hintergrund getoennt: Anlage (#f0f9ff hellblau), Vorsorge (#f0fdf4 hellgruen), Nachfolge (#fffbeb hellgold)
- Ueberschrift (h5): Farbig je Saeule, 14px, fett
- Metriken: Flex-Layout, Label grau (#64748b), Wert fett schwarz (#1e293b)

| Saeule | Farbe | Hintergrund | Metriken |
|--------|-------|------------|----------|
| **I — Anlage** | #2563eb (Blau) | #f0f9ff | Depot: 42,8 Mio. EUR / VV: 28,4 Mio. EUR / Fonds: 14,0 Mio. EUR |
| **II — Vorsorge** | #16a34a (Gruen) | #f0fdf4 | Altersvorsorge: 18,2 Mio. EUR / Versicherung: 8,4 Mio. EUR / Stiftung: 2 aktiv |
| **III — Nachfolge** | #d97706 (Gold) | #fffbeb | Testamentsvollstreckung: 3 Mandate / Generationenberatung: 2 aktiv / Immobilie: 4 Objekte |

#### B-02c Vermoegen: Kundenliste

**Tabellen-Header:**

| Spalte | Ausrichtung | Beschreibung |
|--------|------------|-------------|
| Kunde | links | Name (fett) |
| Kunden-Nr. | links | Format: VK-3xxxx |
| Ort | links | Giessen / Wetzlar / Marburg |
| AuM | rechts | Assets under Management (formatiert) |
| Depot | rechts | Depot-Volumen (formatiert) |
| Nachfolge | zentriert | ✓ (gold) oder — (grau) |
| Stiftung | zentriert | ✓ (lila) oder — (grau) |

**Alle 4 Vermoegenskunden (Mock-Daten):**

| Name | ID | Ort | AuM | Depot | Vorsorge | Nachfolge | Stiftung |
|------|-----|-----|-----|-------|----------|-----------|----------|
| Dr. Heinrich von Stein | VK-30010 | Giessen | 8,2 Mio. | 5,4 Mio. | 1,8 Mio. | Ja | Nein |
| Elisabeth Koenig-Hartmann | VK-30023 | Marburg | 12,5 Mio. | 8,2 Mio. | 2,8 Mio. | Ja | Ja |
| Familie Riedel | VK-30035 | Wetzlar | 4,8 Mio. | 3,1 Mio. | 1,2 Mio. | Nein | Nein |
| Prof. Dr. Ulrich Baumann | VK-30048 | Giessen | 6,2 Mio. | 4,1 Mio. | 1,5 Mio. | Ja | Ja |

**Klick-Verhalten:**
Jede Zeile ruft `openBankKundenDetail('VK-30010', 'vermoegen')` auf → oeffnet B-10c Kunden-Detail im Private-Banking-Modus.

---

### applyBankViewMode() — Was beim Moduswechsel passiert

Die Funktion `applyBankViewMode()` steuert die gesamte UI-Umschaltung:

```javascript
function applyBankViewMode() {
    var mode = bankViewMode; // 'retail' | 'firmenkunde' | 'vermoegen'
    var profile = beraterProfile[mode];

    // 1. Header aktualisieren
    //    → Name, Berater-Nr., Bank, Region

    // 2. KPI-Boxen umschalten
    //    → data-bank-kpi-set="retail" → display: grid/none

    // 3. Tabs umschalten
    //    → data-bank-tab-set="retail" → display: flex/none

    // 4. Drei-Saeulen-Karten (nur vermoegen)
    //    → #beraterSaeulenGrid display: grid/none

    // 5. Kundenlisten umschalten
    //    → data-bank-kunden-set="retail" → display: block/none

    // 6. Tab-Content zuruecksetzen
    //    → Alle .banking-tab-content → active entfernen

    // 7. Kundenliste fuellen
    //    → fillRetailKundenliste() / fillFirmenKundenliste() / fillVermoegenKundenliste()
}
```

Die Funktionen `fillRetailKundenliste()`, `fillFirmenKundenliste()` und `fillVermoegenKundenliste()` erzeugen den HTML-String fuer den jeweiligen `<tbody>` und setzen ihn via `innerHTML`.

---

## B-10 -- Kunden-Detailansicht

### B-10 Layout-Aufbau

Die Kunden-Detailansicht ist eine dynamisch aufgebaute Seite. Nur der Container (`#kundenDetailBankPage`) mit Header, Sticky Bar, Tab-Leiste und Content-Bereich liegt im HTML. Der gesamte Inhalt (Tabs, Tab-Inhalte) wird via JavaScript bei jedem Oeffnen eines Kunden komplett neu erzeugt.

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (VR-Blau Gradient #003399 → #002266)               │
│  ┌────┐                                          ┌───────┐ │
│  │ TB │  Thomas Mueller                          │Zurueck│ │
│  │(Av)│  PK-10056 | Marburg | Berater Th. Berger│  ←    │ │
│  └────┘                                          └───────┘ │
├─────────────────────────────────────────────────────────────┤
│  STICKY BAR (position: sticky, top: 0, z-index: 10)        │
│  Thomas Mueller · PK-10056 | Privatkundenberater Th. Berger│
├─────────────────────────────────────────────────────────────┤
│  TAB-LEISTE (#kdBankTabs)                                   │
│  ┌──────────┬─────────┬────────┬─────────┬────────┬────────┐│
│  │Stammdaten│Konten & │Kredit &│Wertpap. │Versich.│FIDA    ││
│  │ (aktiv)  │ Karten  │Finanz. │& Anlage │& Vors. │(orange)││
│  └──────────┴─────────┴────────┴─────────┴────────┴────────┘│
├─────────────────────────────────────────────────────────────┤
│  TAB-CONTENT (#kdBankContent)                               │
│  [Dynamisch je nach aktivem Tab — siehe unten]              │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### HTML-Grundstruktur (statisch im index.html)

```html
<div id="kundenDetailBankPage" style="display: none;">
  <div class="kunden-detail-bank-page">
    <!-- Header mit Avatar, Name, Meta, Zurueck-Button -->
    <div style="background:linear-gradient(135deg,#003399,#002266);">
      <div id="kdBankAvatar">TB</div>      <!-- Initialen -->
      <h2 id="kdBankHeaderName">...</h2>     <!-- Kundenname -->
      <div id="kdBankHeaderMeta">...</div>   <!-- ID | Ort | Berater -->
      <button onclick="closeBankKundenDetail()">Zurueck</button>
    </div>
    <!-- Sticky Bar -->
    <div id="kdBankStickyBar" class="bank-sticky-bar"></div>
    <!-- Tabs (dynamisch befuellt) -->
    <div id="kdBankTabs" class="banking-detail-tabs"></div>
    <!-- Tab Content (dynamisch befuellt) -->
    <div id="kdBankContent"></div>
  </div>
</div>
```

### B-10 Sticky Bar

Die Sticky Bar bleibt beim Scrollen am oberen Bildrand stehen und zeigt immer den Kunden-Kontext:

- **Name** (fett, 14px, `#1e293b`)
- **Kunden-ID | Berater** (11px, grau `#64748b`)

Design: Weiss, `position: sticky; top: 0`, `border-bottom: 2px solid #e2e8f0`, `box-shadow: 0 2px 8px rgba(0,0,0,0.05)`, `z-index: 10`

### B-10 Tab-Erstellung (dynamisch)

Die Tabs werden bei jedem `fillRetailDetail()` / `fillFirmenkundeDetail()` / `fillVermoegenDetail()` Aufruf komplett neu als HTML erzeugt und in `#kdBankTabs` injiziert. Die Helper-Funktion `buildTabsHtml()` generiert Button-Elemente:

```javascript
// Beispiel: Retail-Tabs
buildTabsHtml([
    { id: 'stammdaten', label: 'Stammdaten' },
    { id: 'konten', label: 'Konten & Karten' },
    { id: 'kredit', label: 'Kredit & Finanzierung' },
    { id: 'wertpapiere', label: 'Wertpapiere & Anlage' },
    { id: 'versicherung', label: 'Versicherung & Vorsorge' },
    { id: 'fida', label: 'Open Finance / FIDA', fida: true },  // Orange hervorgehoben!
    { id: 'historie', label: 'Beratungshistorie' }
]);
```

Der FIDA-Tab hat besonderes Styling: `color: #FF6600; font-weight: 700` (VR-Orange, fett) — das ist bewusst so, um die Aufmerksamkeit auf das Kern-Feature zu lenken.

### Tab-Wechsel: `switchBankDetailTab(tabId)`

```javascript
function switchBankDetailTab(tabId) {
    // 1. Alle Tab-Buttons: .active entfernen/setzen
    //    → #kdBankTabs .banking-detail-tab
    // 2. Alle Content-Bereiche: .active entfernen/setzen
    //    → #kdBankContent .banking-detail-content
    // Aktiver Tab bekommt: color: #003399, border-bottom: 2px #003399
}
```

---

### B-10 Retail: Alle 7 Tabs mit Showcase-Daten

Showcase-Kunde fuer B-10 Retail: **Thomas Mueller** (PK-10056)

#### Tab: Stammdaten

Layout: `.banking-stammdaten-grid` (CSS Grid, `repeat(auto-fill, minmax(220px, 1fr))`)

| Feld | Wert (Thomas Mueller) |
|------|----------------------|
| Name | Thomas Mueller |
| Kunden-Nr. | PK-10056 |
| Geburtsdatum | 08.06.1992 |
| Beruf | Software-Entwickler |
| Familienstand | Ledig |
| Adresse | Universitaetsstr. 8, 35037 Marburg |
| Segment | B-Wachstum |
| VR-FinanzPlan | Nein |

**Design der Info-Items:**
- Label: 11px, fett, grau (#64748b), Uppercase, letter-spacing 0.5px
- Wert: 14px, dunkelgrau (#1e293b), font-weight 500

#### Alle Retail-Stammdaten (Mock-Datenbank)

| Kunden-ID | Geb. | Beruf | Familienstand | Adresse | Girokonto (IBAN) | Saldo | Baufi | Depot | Versicherung |
|-----------|------|-------|---------------|---------|-----------------|-------|-------|-------|-------------|
| PK-10021 | 14.03.1978 | Dipl.-Ingenieur | Verheiratet, 2 Kinder | Ludwigstr. 42, 35390 Giessen | DE42 5139 0000 ... | 12.400 | 185.000 EUR | 28.400 EUR (Trade Rep.) | R+V Hausrat + Kfz HUK24 |
| PK-10034 | 22.11.1985 | Betriebswirtin (MBA) | Ledig | Bahnhofstr. 15, 35578 Wetzlar | DE89 5139 0000 ... | 28.900 | — | 42.100 EUR (DWS) | R+V Komplett-Paket |
| PK-10056 | 08.06.1992 | Software-Entwickler | Ledig | Universitaetsstr. 8, 35037 Marburg | DE15 5139 0000 ... | 5.600 | — | 15.200 EUR (Scalable) | Haftpflicht (HUK) |
| PK-10078 | 30.09.1975 | Lehrerin | Verheiratet, 1 Kind | Schillerstr. 22, 35390 Giessen | DE78 5139 0000 ... | 18.200 | 142.000 EUR | — | R+V Basis-Paket |
| PK-10089 | 17.01.1988 | Kaufmann | Ledig | Gartenstr. 5, 35578 Wetzlar | DE34 5139 0000 ... | 3.400 | — | — | — |
| PK-10102 | 25.04.1996 | Studentin | Ledig | Campusweg 3, 35037 Marburg | DE56 5139 0000 ... | 1.850 | — | — | Haftpflicht |
| PK-10115 | 12.08.1970 | Handwerker | Geschieden | Marktplatz 11, 35390 Giessen | DE90 5139 0000 ... | 450 | — | — | — |
| PK-10128 | 03.12.1982 | Verwaltungsfachangestellte | Verheiratet | Ringstr. 7, 35578 Wetzlar | DE12 5139 0000 ... | 2.100 | — | — | R+V Haftpflicht |

#### Tab: Konten & Karten

Layout: `.bank-kpi-row` (Flex-Layout) + Freitext

**KPI-Boxen:**

| KPI | Wert (Thomas Mueller) | Farb-Klasse |
|-----|----------------------|------------|
| Girokonto | DE15 5139 0000 0056 7890 12 | — |
| Kontostand | 5,6 Tsd. EUR | `positive` (gruen) |
| Produkte | 3 aktiv | `neutral` (blau) |

**Zusatzinfo:**
"Girokonto VR-MeinKonto, EC-Karte (Debit), Kreditkarte VISA Gold" (grau, 13px)

#### Tab: Kredit & Finanzierung

**KPI-Boxen:**

| KPI | Wert (Thomas Mueller) |
|-----|----------------------|
| Baufinanzierung | — (keine) |

Bei Kunden mit Baufi (z.B. Markus Hoffmann PK-10021): "185.000 EUR (Restschuld)"

#### Tab: Wertpapiere & Anlage

**KPI-Boxen:**

| KPI | Wert (Thomas Mueller) | Farb-Klasse |
|-----|----------------------|------------|
| Depot | 15.200 EUR (Scalable) | `neutral` (blau) |

Bei Kunden ohne Depot: "Kein Depot"

#### Tab: Versicherung & Vorsorge

**KPI-Boxen:**

| KPI | Wert (Thomas Mueller) |
|-----|----------------------|
| Versicherungen | Haftpflicht (HUK) |

#### Tab: Open Finance / FIDA

> **Dies ist der Demo-Showstopper — siehe separates Kapitel [Open Finance / FIDA](#open-finance-fida)**

Das FIDA-Panel zeigt externe Finanzdaten anderer Banken/Broker (mit Kunden-Consent) und KI-generierte Handlungsempfehlungen. Details in Kapitel 6.

#### Tab: Beratungshistorie

Timeline-Darstellung mit Datum, Titel und Beschreibung. Jeder Eintrag hat:
- Datum (12px, grau, fett, min-width 80px)
- Blauer Kreis (10x10px, `#003399`)
- Titel (13px, fett, dunkel) + Beschreibung (12px, grau)
- Trennlinie: `border-bottom: 1px solid #f1f5f9`

**Retail-Historie (Mock-Daten):**

| Datum | Titel | Beschreibung |
|-------|-------|-------------|
| 12.02.2026 | VR-FinanzPlan-Gespraech | Ganzheitliche Beratung, Sparplan + Baufi-Sondertilgung besprochen |
| 28.11.2025 | Kreditkarten-Beratung | VISA Gold beantragt, Freischaltung erfolgt |
| 15.09.2025 | Jahresgespraech | Kundenzufriedenheit hoch, Cross-Selling-Potenzial identifiziert |

---

### B-10b Firmenkunde: Alle 7 Tabs

Showcase-Firma: **Metallbau Schaefer GmbH** (FK-20010)

**Header-Anzeige:**
- Avatar: Erster Buchstabe des Firmennamens ("M")
- Name: Metallbau Schaefer GmbH
- Meta: FK-20010 | Giessen | Handwerk/Bau
- Sticky Bar: "FK-Beraterin Carola Weiss"

**Tab-Leiste:**
`Stammdaten | Kreditengagement | Zahlungsverkehr | Rating & Risiko | Foerdermittel | Open Finance / FIDA | Ansprechpartner`

#### Tab: Stammdaten (Firmenkunde)

| Feld | Wert (Metallbau Schaefer GmbH) |
|------|-------------------------------|
| Firma | Metallbau Schaefer GmbH |
| Kunden-Nr. | FK-20010 |
| Branche | Handwerk/Bau |
| Standort | Giessen |
| Mitarbeiter | 85 |
| Jahresumsatz | 12,5 Mio. EUR |
| Rating | A |
| Rechtsform | GmbH |

**Rechtsform-Logik:** Wird dynamisch aus dem Firmennamen abgeleitet:
- Name enthaelt "GmbH" → "GmbH"
- Name enthaelt "AG" → "AG"
- Name enthaelt "OHG" → "OHG"
- Name enthaelt "KG" → "KG"
- Sonst → "Einzelunternehmen"

#### Tab: Kreditengagement

**KPI-Boxen:**

| KPI | Wert | Farb-Klasse |
|-----|------|------------|
| Kreditvolumen | 4,2 Mio. EUR | `neutral` (blau) |
| Rating | A | `positive` (gruen) |
| Sicherheiten | Grundschuld + Buergschaft | — |

**Kredit-Tabelle:**

| Kreditart | Volumen | Zinssatz | Laufzeit | Tilgung |
|-----------|---------|---------|----------|---------|
| Investitionskredit | 2,5 Mio. EUR (60%) | 3,85% | bis 12/2030 | Annuitaet |
| Betriebsmittelkredit | 1,3 Mio. EUR (30%) | 4,20% | revolvierend | endfaellig |
| Kontokorrent | 420 Tsd. EUR (10%) | 6,50% | unbefristet | — |

Die Volumina werden prozentual aus dem Gesamt-Kreditvolumen berechnet (60% / 30% / 10%).

#### Tab: Zahlungsverkehr

**KPI-Boxen:**

| KPI | Wert |
|-----|------|
| ZV-Volumen/Monat | 285 Tsd. EUR |
| SEPA-Lastschriften | 148/Monat |
| Auslandszahlungen | 12/Monat |

(Statische Demo-Werte, identisch fuer alle Firmenkunden)

#### Tab: Rating & Risiko

**KPI-Boxen:**

| KPI | Wert | Farb-Klasse |
|-----|------|------------|
| Rating | A | `positive` (gruen) |
| PD (1 Jahr) | 0,15% | `positive` (gruen) |
| EWB-Quote | 0,0% | `positive` (gruen) |

(PD = Probability of Default, EWB = Einzelwertberichtigung)

#### Tab: Foerdermittel

Textbasierter Tab mit Branchenkontext:

"Aktuelle Foerderprogramme fuer Handwerk/Bau:"
- KfW-Unternehmerkredit (073) — bis 25 Mio. EUR
- KfW-Klimaschutzoffensive (293) — ab 1,03% eff.
- Hessen Mikrodarlehen — bis 25 Tsd. EUR

Die Branchenbezeichnung wird dynamisch aus den Kundendaten eingefuegt.

#### Tab: Open Finance / FIDA (Firmenkunde)

> Siehe separates Kapitel [Open Finance / FIDA](#open-finance-fida)

Zeigt Fremdbank-Daten (Commerzbank, Deutsche Bank, Grenke Leasing, PayPal Business) und KI-Empfehlungen fuer Firmenkundengeschaeft.

#### Tab: Ansprechpartner

| Feld | Wert |
|------|------|
| Geschaeftsfuehrer | Max Schaefer |
| Telefon | +49 641 12345-0 |
| CFO / Finanzen | Dr. Anna Berger |
| E-Mail | info@fk-20010.de |

Die E-Mail wird dynamisch erzeugt: `'info@' + kunde.id.toLowerCase() + '.de'`

---

### B-10c Vermoegen: Alle 7 Tabs

Showcase-Kunde: **Dr. Heinrich von Stein** (VK-30010)

**Header-Anzeige:**
- Avatar: Initialen (z.B. "DH" fuer Dr. Heinrich), max 2 Zeichen
- Name: Dr. Heinrich von Stein
- Meta: VK-30010 | Giessen | Private Banking
- Sticky Bar: "PB-Beraterin Dr. Julia Rademacher"

**Tab-Leiste:**
`Stammdaten | Depot & Vermoegensverwaltung | Vorsorge-Check | Nachfolge | MiFID & Dokumentation | Open Finance / FIDA | Beziehungs-Timeline`

#### Drei-Saeulen-Karten (oberhalb der Tabs)

Beim Oeffnen eines Vermoegen-Kunden werden **oberhalb der Tabs** die Drei-Saeulen-Karten angezeigt. Diese sind kundenindividuell befuellt:

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ │
│  │ Saeule I — Anlage │ │Saeule II —Vorsorge│ │Saeule III—Nachf.  │ │
│  │                   │ │                   │ │                   │ │
│  │ Depot-Vol.        │ │ Vorsorge-Vol.     │ │ Status            │ │
│  │   5,4 Mio. EUR    │ │   1,8 Mio. EUR    │ │   In Planung      │ │
│  │ Performance YTD   │ │ Versorgungsluecke │ │ Stiftung          │ │
│  │   +6,8%           │ │   1.200 EUR/Monat │ │   Nicht geplant   │ │
│  │ Strategie         │ │ Naechster Check   │ │ Testament         │ │
│  │   Ausgewogen      │ │   Q2/2026         │ │   Ausstehend      │ │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Dynamische Werte je Kunde:**

| Saeule | Metrik | Dynamisch | Quelle |
|--------|--------|-----------|--------|
| Anlage | Depot-Volumen | Ja | `kunde.depot` |
| Anlage | Performance YTD | Nein | Statisch "+6,8%" |
| Anlage | Strategie | Nein | Statisch "Ausgewogen" |
| Vorsorge | Vorsorge-Volumen | Ja | `kunde.vorsorge` |
| Vorsorge | Versorgungsluecke | Nein | Statisch "1.200 EUR/Monat" |
| Vorsorge | Naechster Check | Nein | Statisch "Q2/2026" |
| Nachfolge | Status | Ja | `kunde.nachfolge ? 'In Planung' : 'Offen'` |
| Nachfolge | Stiftung | Ja | `kunde.stiftung ? 'Vorhanden' : 'Nicht geplant'` |
| Nachfolge | Testament | Ja | `kunde.nachfolge ? 'Entwurf vorhanden' : 'Ausstehend'` |

#### Tab: Stammdaten (Vermoegen)

| Feld | Wert (Dr. Heinrich von Stein) |
|------|------------------------------|
| Name | Dr. Heinrich von Stein |
| Kunden-Nr. | VK-30010 |
| Standort | Giessen |
| AuM Gesamt | 8,2 Mio. EUR |
| Betreuung seit | 2019 |
| Risikoprofil | Ausgewogen |

#### Tab: Depot & Vermoegensverwaltung

**KPI-Boxen:**

| KPI | Wert | Farb-Klasse |
|-----|------|------------|
| Depot-Volumen | 5,4 Mio. EUR | `neutral` (blau) |
| Performance YTD | +6,8% | `positive` (gruen) |
| Ausschuettungen | 42.500 EUR/Jahr | — |

**Depot-Positionen-Tabelle:**

| Position | ISIN | Anteil | Wert | Performance |
|----------|------|--------|------|-------------|
| Union Investment - UniGlobal | DE0008491051 | 35% | 1,89 Mio. EUR | +8,2% (gruen) |
| DWS Top Dividende | DE0009848119 | 25% | 1,35 Mio. EUR | +5,4% (gruen) |
| Staatsanleihen EUR | DE0001135481 | 20% | 1,08 Mio. EUR | +2,1% (gruen) |
| Immobilienfonds | DE0009807016 | 15% | 810 Tsd. EUR | +3,8% (gruen) |
| Cash-Reserve | — | 5% | 270 Tsd. EUR | — |

Die Werte werden dynamisch aus `kunde.depot * Anteil` berechnet.

#### Tab: Vorsorge-Check

**KPI-Boxen:**

| KPI | Wert | Farb-Klasse |
|-----|------|------------|
| Vorsorge-Volumen | 1,8 Mio. EUR | `neutral` (blau) |
| Versorgungsluecke | 1.200 EUR/Monat | `negative` (rot) |

#### Tab: Nachfolge

**KPI-Boxen:**

| KPI | Wert (Dr. v. Stein) | Farb-Klasse |
|-----|---------------------|------------|
| Nachfolgestatus | In Planung | `positive` (gruen) |
| Stiftung | Nicht geplant | — |

Bei Elisabeth Koenig-Hartmann (VK-30023): Nachfolge = "In Planung" (gruen), Stiftung = "Aktiv" (gruen)
Bei Familie Riedel (VK-30035): Nachfolge = "Offen" (rot), Stiftung = "Nicht geplant"

#### Tab: MiFID & Dokumentation

| Feld | Wert |
|------|------|
| Risikoprofil | Ausgewogen (Stufe 3/5) |
| Letzte Aktualisierung | 15.01.2026 |
| Anlageerfahrung | > 10 Jahre |
| WpHG-Bogen | Aktuell |

(Statische Demo-Werte, identisch fuer alle Vermoegenskunden)

#### Tab: Open Finance / FIDA (Vermoegen)

> Siehe separates Kapitel [Open Finance / FIDA](#open-finance-fida)

Zeigt Fremdbank-Daten (DWS/Deutsche Bank, Allianz Leben, Swiss Life, Flatex) und KI-Empfehlungen fuer Vermoegensberatung.

#### Tab: Beziehungs-Timeline

Timeline-Darstellung (identisches Design wie Retail-Beratungshistorie):

| Datum | Titel | Beschreibung |
|-------|-------|-------------|
| 05.02.2026 | Quartalsgespraech Q1 | Portfolio-Review, Depot-Performance besprochen, Nachfolgeplanung vertagt |
| 18.11.2025 | Stiftungsgruendung | Gemeinnuetzige Stiftung "Bildung Mittelhessen" gegruendet |
| 22.08.2025 | Depot-Rebalancing | Umschichtung: Aktienquote von 65% auf 55% reduziert |
| 10.03.2025 | Erstgespraech Nachfolge | Generationenberatung gestartet, Notar-Termin vereinbart |

---

## Open Finance / FIDA -- Das zentrale Feature

### Warum FIDA das Kern-Feature der Banking-Version ist

In der Versicherungsversion (A-10) ist Open Finance ein optionaler Tab. In der Banking-Version ist es der **rote Faden** und **Demo-Showstopper fuer den Atruvia TechDay**. Die Logik: FIDA (Financial Data Access) erlaubt — mit Kunden-Consent — den Zugriff auf Finanzdaten bei Fremdbanken. Die Volksbank sieht damit das Gesamtbild des Kunden und kann gezielt beraten.

### Die drei Demo-Touchpoints (TechDay-Story)

1. **"So sieht die Datenwelt aus"** → B-10 oeffnen, FIDA-Tab zeigen → Daten von ING, Trade Republic, etc.
2. **"So arbeitet die KI damit"** → KI-Empfehlungen im FIDA-Tab → "Sparplan-Beratung", "R+V Buendelrabatt"
3. **"So sieht das im Berateralltag aus"** → B-02 oeffnen → KI-priorisierte Beratungsanlaesse

### FIDA-Panel Architektur

Das Panel wird durch die Funktion `buildFidaPanel(sources, empfehlungen)` erzeugt:

```
┌─────────────────────────────────────────────────────────────┐
│  OPEN FINANCE / FIDA                   [CONSENT ERTEILT]    │
│  (Dunkler Hintergrund: #0f172a)                             │
├─────────────────────────────────────────────────────────────┤
│  ● Consent-Bar (gruen)                                      │
│  "Kunde hat Datenweitergabe-Consent erteilt (FIDA Art. 5)"  │
│  Letzte Aktualisierung: 01.02.2026                          │
├─────────────────────────────────────────────────────────────┤
│  EXTERNE DATENQUELLEN (Grid, auto-fit, min 200px)           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ ● ING DiBa   │ │ ● Trade Rep. │ │ ● HUK24      │        │
│  │ Gehalt 3.850 │ │ ETF 28.400   │ │ Kfz 820/Jahr │        │
│  │ Signal: ...  │ │ Signal: ...  │ │ Signal: ...  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  KI-GENERIERTE HANDLUNGSEMPFEHLUNGEN                        │
│  ┌──────────────────────────────────────────────────┐       │
│  │ Sparplan-Beratung                       [HIGH]   │       │
│  │ Kunde spart 400 EUR/Monat bei ING...            │       │
│  │ Ertragspotenzial: +1.200 EUR/Jahr (orange)      │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────────┐       │
│  │ VR-FinanzPlan erstellen                 [HIGH]   │       │
│  │ ETF-Portfolio bei Trade Republic...              │       │
│  │ Cross-Selling-Quote: 3,2 → 4,5 (orange)         │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### FIDA-Panel Design (CSS)

| Element | CSS-Klasse | Design |
|---------|-----------|--------|
| Container | `.open-finance-panel` | `#0f172a` (dunkelblau/schwarz), `border-radius: 12px`, Padding 24px |
| Header | `.open-finance-header` | h4 weiss 16px fett + Badge |
| Badge | `.open-finance-badge` | `rgba(255,102,0,0.2)` Hintergrund, VR-Orange Text, 11px, Uppercase |
| Consent-Bar | (inline) | `rgba(34,197,94,0.1)` gruen, gruener Punkt (8x8px, `#22c55e`) |
| Source-Grid | `.open-finance-sources` | `repeat(auto-fit, minmax(200px, 1fr))`, Gap 12px |
| Source-Card | `.of-source-card` | `rgba(255,255,255,0.05)` BG, 1px Border, `border-radius: 8px` |
| Source-Name | `.of-source-name` | Weiss, 13px fett + gruener Status-Punkt (6x6px) |
| Source-Detail | `.of-source-detail` | `rgba(255,255,255,0.6)`, 11px |
| Signal | (inline) | VR-Orange (#FF6600), 11px fett |
| Empfehlung | `.of-ki-recommendation` | `rgba(255,255,255,0.08)` BG, Orange-Border links (3px), `border-radius: 8px` |
| Prioritaet HIGH | `.of-ki-priority.high` | `rgba(239,68,68,0.2)` BG, `#fca5a5` Text |
| Prioritaet MEDIUM | `.of-ki-priority.medium` | `rgba(251,191,36,0.2)` BG, `#fcd34d` Text |
| Potential | `.of-ki-potential` | VR-Orange (#FF6600), 11px fett |

### FIDA-Daten je Modus

#### Retail: Externe Datenquellen

| Bank/Anbieter | Daten | Vertriebssignal |
|--------------|-------|----------------|
| **ING DiBa** | Gehaltseingang 3.850 EUR/Monat, Sparrate 400 EUR/Monat | Sparplan-Potenzial: 4.800 EUR/Jahr ungenutzt |
| **Trade Republic** | ETF-Portfolio: 28.400 EUR (MSCI World, EM, Nasdaq) | VR-FinanzPlan-Anlass: Kein ganzheitlicher Blick |
| **HUK24** | Kfz-Versicherung Vollkasko, 820 EUR/Jahr | R+V Buendelrabatt moeglich (-15%) |
| **Scalable Capital** | Robo-Advisor: 15.200 EUR, Performance +4,2% p.a. | Vermoegensverwaltung ohne persoenliche Beratung |

#### Retail: KI-Empfehlungen

| Titel | Beschreibung | Potenzial | Prio |
|-------|-------------|----------|------|
| **Sparplan-Beratung** | Kunde spart 400 EUR/Monat bei ING. Vorschlag: VR-Sparplan mit Praemien-Vorteil + Sondertilgung Baufi kombinieren. | Ertragspotenzial: +1.200 EUR/Jahr | HIGH |
| **VR-FinanzPlan erstellen** | ETF-Portfolio bei Trade Republic + Robo bei Scalable = 43.600 EUR ohne ganzheitliche Strategie. FinanzPlan-Gespraech anbieten. | Cross-Selling-Quote: 3,2 → 4,5 | HIGH |
| **R+V Buendelrabatt** | Kfz bei HUK24 (820 EUR/Jahr). R+V Buendel mit Hausrat + Haftpflicht spart dem Kunden ca. 120 EUR/Jahr. | Ertragspotenzial: +380 EUR/Jahr | MEDIUM |

#### Firmenkunde: Externe Datenquellen

| Bank/Anbieter | Daten | Vertriebssignal |
|--------------|-------|----------------|
| **Commerzbank** | Betriebsmittelkredit 500 Tsd. EUR, Zinssatz 4,8% | Umschuldungspotenzial: -0,6% bei VR-Konditionen |
| **Deutsche Bank** | Avale/Buergschaften: 1,2 Mio. EUR | Konsolidierung in Gesamtkreditlinie moeglich |
| **Grenke Leasing** | 3 Leasingvertraege, Gesamt 180 Tsd. EUR | VR-Leasing Angebot mit besseren Konditionen |
| **PayPal Business** | Zahlungsverkehr: 42 Tsd. EUR/Monat | VR-Pay Integration vorschlagen |

#### Firmenkunde: KI-Empfehlungen

| Titel | Beschreibung | Potenzial | Prio |
|-------|-------------|----------|------|
| **Kreditlinien konsolidieren** | Betriebsmittelkredit bei Commerzbank + Avale bei Deutsche Bank. Gesamtkonsolidierung in VR-Rahmenkredit spart Zinsen und vereinfacht Reporting. | Kreditvolumen-Potenzial: +1,7 Mio. EUR | HIGH |
| **Foerdermittel-Check** | Investitionsvorhaben 2026 geplant. KfW-Foerdermittel und Landesfoerderung Hessen pruefen. | Foerdervolumen: bis zu 500 Tsd. EUR | MEDIUM |
| **VR-Pay Integration** | PayPal-Zahlungsverkehr 42 Tsd. EUR/Monat. VR-Pay bietet niedrigere Gebuehren + direkte Kontoanbindung. | Einsparung: ca. 3.600 EUR/Jahr | MEDIUM |

#### Vermoegen: Externe Datenquellen

| Bank/Anbieter | Daten | Vertriebssignal |
|--------------|-------|----------------|
| **DWS (Deutsche Bank)** | Depot 2,4 Mio. EUR, Fonds-Schwerpunkt Europa | Konsolidierung in VR-Depot mit Vermoegensverwaltung |
| **Allianz Leben** | Rentenversicherung: Ablauf 2028, Auszahlung ca. 380 Tsd. EUR | Wiederanlage-Strategie planen |
| **Swiss Life** | Ruerup-Rente, Beitrag 12.000 EUR/Jahr | Nachfolgeplanung: Vermoegensuebergang strukturieren |
| **Flatex** | Aktien-Depot: 890 Tsd. EUR, hohe Einzelwert-Konzentration | Diversifikation + Steueroptimierung empfehlen |

#### Vermoegen: KI-Empfehlungen

| Titel | Beschreibung | Potenzial | Prio |
|-------|-------------|----------|------|
| **Depot-Konsolidierung** | DWS-Depot (2,4 Mio.) + Flatex-Aktien (890 Tsd.) ohne einheitliche Strategie. VR-Vermoegensverwaltung mit individueller Allokation vorschlagen. | AuM-Potenzial: +3,3 Mio. EUR | HIGH |
| **Ablaufmanagement Allianz** | Rentenversicherung laeuft 2028 aus (380 Tsd. EUR). Wiederanlage-Strategie jetzt planen: Mischung aus Depot + Immobilie + Stiftung. | Ertragspotenzial: +8.500 EUR/Jahr | HIGH |
| **Nachfolgeplanung starten** | Vermoegen ueber 6 Mio. EUR, keine dokumentierte Nachfolgestrategie. Generationenberatung + Testamentsvollstreckung anbieten. | Mandatspotenzial: Nachfolge-Retainer | MEDIUM |

### Warum die GFG den Consent bekommt

Die Genossenschaftsbanken fuehren bei Vertrauen. Aber Vertrauen allein reicht nicht — der Berater braucht das Werkzeug. Atruvia muss die Schnittstellen in agree21 bauen. Der Prototyp zeigt: Genau dieses Werkzeug existiert.

---

## KI-Chatbot (Banken / Collections)

### Chatbot Banken Architektur

Der Banking-Chat (`banken-chat.js`, 785 Zeilen) ist ein eigenstaendiger Chatbot fuer das **Collections Dashboard** (Forderungsmanagement). Er ist **nicht** identisch mit dem Vertriebs-Chatbot aus A-02/A-10, sondern ein separater, thematisch fokussierter Assistent.

**Hinweis:** Dieser Chat gehoert technisch zum Banken-Modul (B-01), nicht zu B-02/B-10. Er wird hier dokumentiert, weil er Teil des Banking-Oekosystems ist.

**Funktionsweise:**
- Keyword-basiertes Mock-System (kein echtes LLM)
- Eingehende Nachricht → `processBankenQuery(message)` → Regex/Keyword-Matching → vordefinierte Antwort
- 22+ Demo-Kunden im `demoCustomerData` Array
- 7 Demo-Zahlungen im `demoPayments` Array
- Verzoegerung: 800ms Typing-Indikator vor Antwort

### Alle abfragbaren Kategorien

| Kategorie | Trigger-Keywords | Beschreibung |
|-----------|-----------------|-------------|
| **Hoechste Restforderung** | "restforderung", "hoechste", "groesste", "top" + "forderung"/"kunden" | Top-N Kunden sortiert nach Forderungshoehe |
| **Rueckzahlungschance** | "rueckzahlung", "chance", "wahrscheinlich" | Kunden mit niedrigem DPD und Segment "prioritaet" |
| **Laengste Verzugsdauer** | "verzug", "laengste", "aelteste" | Top 5 Kunden sortiert nach DPD (absteigend) |
| **Neue Faelle** | "neue", "neu", "diese woche" | Kunden mit DPD ≤ 14 |
| **Vereinbarungen** | "vereinbarung", "aktive", "bearbeitung" | Kunden mit Status "Vereinbarung" oder Segment "restrukturierung" |
| **Zahlungseingaenge** | "zahlung", "eingang", "bezahlt" | Liste der letzten Zahlungen (demoPayments) |
| **Eskalation** | "eskalation", "inkasso" | Kunden im Segment "eskalation" |
| **Restrukturierung** | "restrukturierung", "stundung" | Kunden im Segment "restrukturierung" |
| **DPD-Filter** | "dpd", "ueberfaellig" + Zahl | Kunden ueber X DPD (Default: 90) |
| **Portfolio-Uebersicht** | "uebersicht", "portfolio", "gesamt" | Gesamtforderung, aktive Faelle, Segmentverteilung |
| **Kunden-Suche** | "kunde", "suche", "finde" + Name | Suche nach Name oder ID |
| **Fallback** | Alles andere | Liste verfuegbarer Abfragen |

### Antwort-Struktur

Jede Chat-Antwort enthaelt:
1. **Icon + Ueberschrift** (fettgedruckt via Markdown `**...**`)
2. **Kunden-Liste** mit klickbaren Links (`chat-customer-link` → `openCustomerDetail()`)
3. **Summen/Statistiken** (wo relevant)
4. **Action-Buttons** zum Navigieren in der Liste
   - "Diese X Kunden in Liste anzeigen" → `showFilteredCustomers()`
   - Segment-Filter → `filterBySegment()`
   - DPD-Bucket-Filter → `filterByDPDBucket()`
5. **Export-Buttons** (Excel + PDF)
6. **Follow-up-Vorschlaege** (6 klickbare Buttons)

### Export-Funktionen

#### Excel-Export (`exportChatToExcel()`)

- Erzeugt CSV-Datei mit BOM (UTF-8 kompatibel fuer Excel)
- Semikolon als Trennzeichen (deutsches Format)
- Dateiname: `{Titel}_{Datum}.csv`
- Drei Datentypen:
  - `customers`: ID, Name, Forderung, DPD, Segment, Status
  - `payments`: ID, Kunde, Betrag, Datum, Art
  - `portfolio`: Kennzahl/Wert-Paare

#### PDF-Export (`exportChatToPdf()`)

- Oeffnet neues Browser-Fenster mit druckoptimiertem HTML
- Eigenes Stylesheet fuer Druck (Arial, Tabellen, Summary-Box)
- Automatischer `window.print()` Aufruf
- Fuellt je nach Datentyp verschiedene Tabellen

### Follow-up-Vorschlaege

Nach jeder Antwort werden 6 klickbare Buttons angezeigt:

| Button-Text | Trigger-Frage |
|------------|---------------|
| Hoechste Restforderung | "Kunden mit hoechster Restforderung" |
| Rueckzahlungschance | "Kunden mit hoechster Rueckzahlungschance" |
| Laengste Verzugsdauer | "Kunden mit laengster Verzugsdauer" |
| Neue Faelle | "Neue Faelle dieser Woche" |
| Vereinbarungen | "Vereinbarungen in Bearbeitung" |
| Portfolio | "Portfolio-Uebersicht" |

### Demo-Kunden im Collections-Chat

22 Kunden in 5 Segmenten:

| Segment | Anzahl | Status | Beschreibung |
|---------|--------|--------|-------------|
| eskalation | 4 | Inkasso | DPD 35-55, hohe Forderungen |
| prioritaet | 6 | Offen/Zusage | DPD 2-25, mittlere Forderungen |
| restrukturierung | 4 | Vereinbarung | DPD 8-28, Ratenzahlung |
| abwicklung | 4 | Abschreibung | DPD 67-105, Verlust |
| abgeschlossen | 7 | Bezahlt | DPD 0, erledigte Faelle |

### Customer-List-Highlighting

Die Funktion `showFilteredCustomers()` hebt Kunden in der bestehenden Tabelle hervor:
- Scrollt zur Tabelle
- Setzt `backgroundColor: rgba(59, 130, 246, 0.2)` (blau)
- Setzt `boxShadow: inset 4px 0 0 #3b82f6` (blauer Balken links)
- Highlighting wird nach 10 Sekunden automatisch entfernt
- Flash-Effekt auf der Sektion: `boxShadow: 0 0 20px rgba(59, 130, 246, 0.5)`

---

## Modus-Umschaltung (Technischer Ablauf)

### B-02: Moduswechsel via setBankViewMode()

```
User klickt "VR Firmenkunde"
       │
       ▼
setBankViewMode('firmenkunde')
       │
       ├── 1. bankViewMode = 'firmenkunde'
       ├── 2. localStorage.setItem('bankViewMode', 'firmenkunde')
       ├── 3. .bank-mode-btn Toggle (active-Klasse)
       ├── 4. applyBankViewMode()
       │      ├── Header: "Carola Weiss" + FK-Meta
       │      ├── KPIs: firmenkundeKpis sichtbar, andere hidden
       │      ├── Tabs: firmenkunde-Tabs sichtbar
       │      ├── Saeulen-Grid: hidden (nur bei vermoegen)
       │      ├── Kundenliste: firmenkunde sichtbar
       │      └── fillFirmenKundenliste()
       │
       ├── 5. dispatchEvent('viewChanged') → Page-ID: B-02b
       └── 6. AppRouter.navigate('/berater-firmenkunde')
```

### B-10: Oeffnen eines Kunden

```
User klickt auf Zeile in B-02 Kundenliste
       │
       ▼
openBankKundenDetail('FK-20010', 'firmenkunde')
       │
       ├── 1. B-02 (#beraterOverviewPage) verstecken
       ├── 2. B-10 (#kundenDetailBankPage) anzeigen
       ├── 3. fillFirmenkundeDetail('FK-20010')
       │      ├── Kunde in bankFirmenKunden Array finden
       │      ├── Header + Avatar fuellen
       │      ├── Sticky Bar fuellen
       │      ├── Tabs generieren (buildTabsHtml)
       │      ├── Alle 7 Tab-Contents als HTML erzeugen
       │      ├── contentArea.innerHTML = html
       │      └── activateFirstTab()
       │
       ├── 4. dispatchEvent('viewChanged') → Page-ID: B-10b
       ├── 5. window._lastBankKundenMode = 'firmenkunde'
       └── 6. window.scrollTo(0, 0)
```

### B-10: Zurueck zu B-02

```
User klickt "Zurueck" in B-10
       │
       ▼
closeBankKundenDetail()
       │
       ├── 1. B-10 (#kundenDetailBankPage) verstecken
       └── 2. showBeraterOverview() → B-02 anzeigen + Modus wiederherstellen
```

---

## Navigationsfluss B-02 zu B-10

```
Landing Page (M-01)
       │
       ├── Klick auf "Banken" Kachel → switchModule('banken') → B-01
       │
       ├── Klick auf "Berater" Kachel oder Route #/berater
       │      │
       │      ▼
       │   B-02 Berater-Uebersicht
       │      │
       │      ├── [VR Retail]     → B-02  → Klick auf Kunde → B-10  (Retail)
       │      ├── [VR Firmenkunde]→ B-02b → Klick auf Firma → B-10b (FK)
       │      └── [VR Vermoegen]  → B-02c → Klick auf Kunde → B-10c (PB)
       │
       └── Deep-Link: #/kundendetail-bank → B-10 direkt (via Router)
```

---

## KPI-Vergleich nach Modus

| KPI-Typ | VR Retail (B-02) | VR Firmenkunde (B-02b) | VR Vermoegen (B-02c) |
|---------|-----------------|----------------------|---------------------|
| KPI 1 | Kundenstamm (412) | Kreditvolumen (42,5 Mio.) | AuM Gesamt (85,2 Mio.) |
| KPI 2 | Ertrag YTD (248,5 Tsd.) | Neugeschaeft YTD (6,8 Mio.) | Provisions-Ertrag WP (420 Tsd.) |
| KPI 3 | Cross-Selling-Quote (2,8) | Provisionsertrag (385 Tsd.) | Vorsorge-Ertrag (185 Tsd.) |
| KPI 4 | VR-FinanzPlan-Quote (38%) | Ausfallrisiko (1,2%) | Gesamt-Ertrag PB (680 Tsd.) |
| KPI 5 | — | Kundenbindung (96,5%) | — |
| Anzahl | 4 | 5 | 4 |
| Grid | 4 Spalten | 5 Spalten | 4 Spalten |

---

## Tab-Vergleich nach Modus

### B-10 Tabs nach Modus

| Tab-Nr. | VR Retail (B-10) | VR Firmenkunde (B-10b) | VR Vermoegen (B-10c) |
|---------|-----------------|----------------------|---------------------|
| 1 | Stammdaten | Stammdaten | Stammdaten |
| 2 | Konten & Karten | Kreditengagement | Depot & Vermoegensverwaltung |
| 3 | Kredit & Finanzierung | Zahlungsverkehr | Vorsorge-Check |
| 4 | Wertpapiere & Anlage | Rating & Risiko | Nachfolge |
| 5 | Versicherung & Vorsorge | Foerdermittel | MiFID & Dokumentation |
| 6 | **Open Finance / FIDA** | **Open Finance / FIDA** | **Open Finance / FIDA** |
| 7 | Beratungshistorie | Ansprechpartner | Beziehungs-Timeline |

FIDA ist in jedem Modus auf Position 6 — immer orange hervorgehoben.

### Besondere UI-Elemente je Modus

| Element | Retail | Firmenkunde | Vermoegen |
|---------|--------|------------|----------|
| Drei-Saeulen-Karten (B-02) | — | — | ✓ |
| Drei-Saeulen-Karten (B-10) | — | — | ✓ |
| Branchen-Badges | — | ✓ | — |
| Rating-Badges | — | ✓ | — |
| Segment-Badges | ✓ | — | — |
| Kredit-Tabelle | — | ✓ | — |
| Depot-Tabelle | — | — | ✓ |
| FinanzPlan-Indikator | ✓ | — | — |
| Nachfolge/Stiftung-Icons | — | — | ✓ |

---

## CSS-Design-System

### Farb-Variablen (`:root`)

```css
--bank-vr-blue:       #003399;   /* VR Corporate Blue (Header, aktive Tabs) */
--bank-vr-orange:     #FF6600;   /* VR Orange (FIDA-Hervorhebung, Signals) */
--bank-retail-color:  #2563eb;   /* Retail-Modus Akzent */
--bank-firma-color:   #16a34a;   /* Firmenkunde-Modus Akzent */
--bank-pb-color:      #d97706;   /* Private Banking Modus Akzent */
--bank-anlage-color:  #2563eb;   /* Saeule I Anlage (Blau) */
--bank-vorsorge-color:#16a34a;   /* Saeule II Vorsorge (Gruen) */
--bank-nachfolge-color:#d97706;  /* Saeule III Nachfolge (Gold) */
```

### Responsive Breakpoints

| Breakpoint | Aenderungen |
|-----------|-------------|
| ≤ 1400px | KPIs: 2 Spalten statt 4/5, Saeulen-Karten: 1 Spalte, FIDA-Sources: 2 Spalten |
| ≤ 1200px | Mode-Selector: relative statt absolute, Tabellen: kleinere Schrift (12px), Stammdaten-Grid: min 180px |
| ≤ 768px | KPIs: 1 Spalte, Sticky Bar: vertikal, Tabs: horizontal scrollbar, FIDA-Sources: 1 Spalte, KPI-Row: vertikal |

### CSS-Datei-Struktur (`banking-berater.css`, 793 Zeilen)

| Bereich | Zeilen | Beschreibung |
|---------|--------|-------------|
| Color Variables | 1-15 | `:root` CSS Custom Properties |
| Mode Selector | 17-54 | `.bank-view-mode-selector`, `.bank-mode-btn` |
| KPI Cards | 56-105 | `.banking-kpi-card` + Icon-Farben je Modus |
| Tab Styles | 107-123 | `.banking-tab-content` |
| Customer Tables | 125-168 | `.banking-kundenliste-table` |
| Branch Badges | 170-193 | `.branche-handwerk`, etc. |
| Segment Badges | 195-211 | `.segment-basis`, etc. |
| Product Mix Dots | 213-233 | `.produktmix-dot` |
| Sticky Bar | 235-300 | `.bank-sticky-bar`, `.bank-sticky-tab` |
| Three-Pillar Cards | 302-365 | `.banking-saeulen-grid`, `.banking-saeulen-card` |
| Open Finance Panel | 367-511 | `.open-finance-panel`, `.of-source-card`, `.of-ki-recommendation` |
| Detail Tabs | 513-551 | `.banking-detail-tab`, `.banking-detail-content` |
| Stammdaten Grid | 553-580 | `.banking-stammdaten-grid`, `.banking-info-item` |
| Detail Tables | 582-618 | `.banking-detail-table` |
| Rating Badges | 620-645 | `.rating-aaa` bis `.rating-unrated` |
| KPI Boxes (Detail) | 647-684 | `.bank-kpi-row`, `.bank-kpi-box` |
| Auslastung Bar | 686-718 | `.auslastung-bar` (Kreditlinien) |
| Responsive | 720-793 | Media Queries (1400px, 1200px, 768px) |

---

## Technische Architektur

### Datei-Uebersicht

| Datei | Groesse | Zweck |
|-------|---------|-------|
| `js/berater-overview.js` | ~15 KB, 271 Zeilen | B-02 Logik: Modi, KPIs, Kundenlisten, Navigation |
| `js/kunden-detail-bank.js` | ~32 KB, 557 Zeilen | B-10 Logik: Detail-Tabs, FIDA-Panel, Stammdaten |
| `js/banken-chat.js` | ~25 KB, 785 Zeilen | Collections-Chat: Queries, Export, Highlighting |
| `css/banking-berater.css` | ~20 KB, 793 Zeilen | Gesamtes Banking-Styling |
| `index.html` | Zeilen 6841-7035 | HTML-Grundstruktur B-02 + B-10 |
| `js/router.js` | 6 Routen | Hash-Routing fuer B-02/B-10 |
| `js/page-id-tracker.js` | 6 Views | Page-ID-Zuordnung fuer B-02/B-10 |

### Globale Funktionen (window-Scope)

**Aus `berater-overview.js`:**

| Funktion | Beschreibung |
|----------|-------------|
| `setBankViewMode(mode)` | Modus umschalten (retail/firmenkunde/vermoegen) |
| `showBeraterOverview()` | B-02 anzeigen, andere Seiten verstecken |
| `backFromBeraterOverview()` | Zurueck zur Landing Page |
| `switchBeraterTab(tabId, mode)` | Tab wechseln in B-02 |
| `bankViewMode` | Aktueller Modus (String) |
| `bankRetailKunden` | Mock-Daten Array (8 Kunden) |
| `bankFirmenKunden` | Mock-Daten Array (6 Kunden) |
| `bankVermoegenKunden` | Mock-Daten Array (4 Kunden) |

**Aus `kunden-detail-bank.js`:**

| Funktion | Beschreibung |
|----------|-------------|
| `openBankKundenDetail(kundenId, mode)` | B-10 oeffnen fuer einen Kunden |
| `closeBankKundenDetail()` | Zurueck zu B-02 |
| `switchBankDetailTab(tabId)` | Tab wechseln in B-10 |

**Aus `banken-chat.js`:**

| Funktion | Beschreibung |
|----------|-------------|
| `initBankenChat()` | Chat initialisieren |
| `sendBankenMessage()` | Nachricht senden und verarbeiten |
| `showFilteredCustomers(ids)` | Kunden in Tabelle hervorheben |
| `exportChatToExcel(data, filename)` | CSV-Export |
| `exportChatToPdf(data, filename)` | PDF-Export (Print-Fenster) |

### Datenfluss: B-02 → B-10

```
berater-overview.js:
    window.bankRetailKunden = retailKunden    ←── Mock-Daten exportiert
    window.bankFirmenKunden = firmenKunden
    window.bankVermoegenKunden = vermoegenKunden

kunden-detail-bank.js:
    var kunde = (window.bankRetailKunden || []).find(...)  ←── Mock-Daten konsumiert
```

B-02 exportiert die Mock-Daten-Arrays global. B-10 greift ueber `window.bankRetailKunden` etc. darauf zu, um den angeklickten Kunden zu finden. Die Stammdaten (Geburtsdatum, IBAN, etc.) liegen nur in B-10 (`retailStammdaten` Objekt).

### Event-System

| Event | Dispatcher | Listener | Zweck |
|-------|-----------|----------|-------|
| `viewChanged` | `setBankViewMode()` | `page-id-tracker.js` | Page-ID aktualisieren |
| `viewChanged` | `openBankKundenDetail()` | `page-id-tracker.js` | Page-ID aktualisieren |
| `hashchange` | Browser | `router.js` | URL-Aenderung erkennen |
| `popstate` | Browser | `router.js` | Browser-Navigation |

---

## Integration mit anderen Modulen

### Von Landing Page zu B-02

Die Landing Page bietet Kacheln fuer verschiedene Module. Der Klick auf eine Banking-Kachel fuehrt ueber den Router zu B-02:

```javascript
// Router-Handler in navigateToView():
'berater-retail':      → setBankViewMode('retail'), showBeraterOverview()
'berater-firmenkunde': → setBankViewMode('firmenkunde'), showBeraterOverview()
'berater-vermoegen':   → setBankViewMode('vermoegen'), showBeraterOverview()
```

### Seiten die B-02 beim Oeffnen versteckt

`showBeraterOverview()` blendet explizit folgende Container aus:
- `landingPage`, `mainApp`, `agenturOverview`, `potentialAnalysePage`
- `kundenDetailPage`, `bgavUmstellungPage`, `billingCheckPage`
- `bankenModule`, `assetModule`, `risikoscoringModule`
- `bestandsuebertragungModule`, `pmoToolboxModule`, `hrPipelineModule`
- `versicherungs1x1Module`, `kundenDetailBankPage`
- `welcomeChat`

### Deep-Linking

Alle 6 B-02/B-10 Routen unterstuetzen Deep-Linking. Beispiel:

```
https://kiarbeitsplatz.pages.dev/#/berater-firmenkunde
```

Der Router erkennt den Hash beim Laden, versucht bis zu 5x (100ms, 500ms, 1500ms, 3000ms, 5000ms) die Navigation, bis die JS-Dateien geladen sind.

---

## Mock-Daten-Katalog

### Uebersicht aller Mock-Daten-Quellen

| Daten-Typ | Datei | Variable | Anzahl |
|-----------|-------|----------|--------|
| Retail-Kunden | `berater-overview.js` | `retailKunden` | 8 |
| Firmenkunden | `berater-overview.js` | `firmenKunden` | 6 |
| Vermoegenskunden | `berater-overview.js` | `vermoegenKunden` | 4 |
| Berater-Profile | `berater-overview.js` | `beraterProfile` | 3 |
| Retail-Stammdaten | `kunden-detail-bank.js` | `retailStammdaten` | 8 (nach ID) |
| FIDA-Quellen Retail | `kunden-detail-bank.js` | `fidaSourcesRetail` | 4 |
| FIDA-Quellen FK | `kunden-detail-bank.js` | `fidaSourcesFirmenkunde` | 4 |
| FIDA-Quellen PB | `kunden-detail-bank.js` | `fidaSourcesVermoegen` | 4 |
| KI-Empfehlungen Retail | `kunden-detail-bank.js` | `kiEmpfehlungenRetail` | 3 |
| KI-Empfehlungen FK | `kunden-detail-bank.js` | `kiEmpfehlungenFirmenkunde` | 3 |
| KI-Empfehlungen PB | `kunden-detail-bank.js` | `kiEmpfehlungenVermoegen` | 3 |
| Collections-Kunden | `banken-chat.js` | `demoCustomerData` | 22 |
| Collections-Zahlungen | `banken-chat.js` | `demoPayments` | 7 |

### Gesamt: 18 Kunden + 3 Berater + 12 FIDA-Quellen + 9 KI-Empfehlungen + 22 Collections-Kunden

---

## Mapping: Versicherung → Banking

### Architektur-Mapping

| Versicherung (A-02/A-10) | Banking (B-02/B-10) | Aenderung |
|--------------------------|--------------------|-----------|
| `viewMode: 'ao'` | `bankViewMode: 'retail'` | Variable umbenannt |
| `viewMode: 'ecclesia'` | `bankViewMode: 'firmenkunde'` | Andere Zielgruppe |
| `viewMode: 'mrh'` | `bankViewMode: 'vermoegen'` | Andere Zielgruppe |
| `setViewMode()` | `setBankViewMode()` | Eigene Funktion |
| Route `#/agentur` | Route `#/berater` | Neuer Pfad |
| `agentur-overview.js` | `berater-overview.js` | Eigene Datei |
| `kunden-detail.js` | `kunden-detail-bank.js` | Eigene Datei |
| `chat.js` | `banken-chat.js` | Collections statt Vertrieb |
| Page-ID `A-02` | Page-ID `B-02` | B-Praefix |
| Page-ID `A-10` | Page-ID `B-10` | B-Praefix |
| CSS inline + shared | `banking-berater.css` (eigene Datei) | Separates Design-System |

### Inhaltliches Mapping

| Versicherung | Banking | Unterschied |
|-------------|---------|-------------|
| Vermittler-Uebersicht | Berater-Uebersicht | Berater statt Vermittler |
| Peter Schmidt (Showcase) | Thomas Mueller / Metallbau Schaefer / Dr. von Stein | Je Modus eigener Showcase |
| 9 Tabs (AO) | 7 Tabs (Retail) | Weniger, aber fokussierter |
| FIDA als Nischen-Tab | FIDA als Kern-Feature | Zentrale Stellung |
| Vertrags-Bestaende | Kreditengagement / Depot | Bankprodukte |
| Versicherungsschutz | Konten & Karten | Bankprodukte |
| Vertriebskanal-Fokus | Open-Finance-Fokus | Anderer roter Faden |

### Was bewusst anders ist

1. **FIDA ist zentral** — In A-10 ein optionaler Tab, in B-10 der Demo-Showstopper
2. **Drei-Saeulen-Modell** — Nur in Banking (Anlage/Vorsorge/Nachfolge), kein Pendant in Versicherung
3. **Collections-Chat** — Eigener Chat fuer Forderungsmanagement, nicht Vertriebs-KI
4. **Branchen-Badges** — Nur bei Firmenkunden, visuell hervorgehoben
5. **Rating-System** — Investment-Grade-Notation (AAA bis CCC), farbkodiert
6. **Depot-Tabelle mit ISIN** — Spezifisch fuer Wertpapier-Detailansicht
7. **MiFID-Dokumentation** — Regulatorik-Tab nur in Private Banking

---

*Dokumentation erstellt: Maerz 2026 — Deloitte Consulting / Eike Brenneisen*
*Basierend auf Quellcode-Analyse: berater-overview.js, kunden-detail-bank.js, banken-chat.js, banking-berater.css, router.js, page-id-tracker.js*

