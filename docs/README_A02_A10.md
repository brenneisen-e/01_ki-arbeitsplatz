# A-02 & A-10: Vermittler- und Kundenansicht -- Vollstaendige Dokumentation

> Umfassende Dokumentation aller Ansichten, Tabs, Layouts, Daten, Logiken und des KI-Chatbots
> im KI-Vertriebsarbeitsplatz (Stand: Maerz 2026)

---

## Inhaltsverzeichnis

1. [Ueberblick](#ueberblick)
2. [Page-ID-System und Namenskonvention](#page-id-system-und-namenskonvention)
3. [Die drei Modi im Detail](#die-drei-modi-im-detail)
4. [A-02 -- Vermittler-Uebersicht](#a-02----vermittler-uebersicht)
   - [Layout-Aufbau (Gesamtstruktur)](#a-02-layout-aufbau)
   - [Header-Bereich](#a-02-header-bereich)
   - [KPI-Boxen je Modus](#a-02-kpi-boxen)
   - [A-02 AO: Alle 9 Tabs im Detail](#a-02-ao-alle-9-tabs)
     - [Tab: Uebersicht](#ao-tab-uebersicht)
     - [Tab: Stammdaten](#ao-tab-stammdaten)
     - [Tab: Neugeschaeft](#ao-tab-neugeschaeft)
     - [Tab: Bestand](#ao-tab-bestand)
     - [Tab: Storno](#ao-tab-storno)
     - [Tab: Verguetung](#ao-tab-verguetung)
     - [Tab: Qualitaet](#ao-tab-qualitaet)
     - [Tab: Kunden](#ao-tab-kunden)
     - [Tab: Potentiale](#ao-tab-potentiale)
   - [A-02b Ecclesia: Alle 10 Tabs im Detail](#a-02b-ecclesia-tabs)
   - [A-02c MRH: Alle 10 Tabs im Detail](#a-02c-mrh-tabs)
5. [A-10 -- Kunden-Detailansicht](#a-10----kunden-detailansicht)
   - [Layout-Aufbau (Gesamtstruktur)](#a-10-layout-aufbau)
   - [Sticky Bar](#a-10-sticky-bar)
   - [A-10 AO: Alle 6 Tabs mit Peter-Schmidt-Showcase](#a-10-ao-alle-6-tabs)
     - [Tab: Stammdaten](#a10-ao-tab-stammdaten)
     - [Tab: Betreute Vertraege](#a10-ao-tab-vertraege)
     - [Tab: Open Finance (FIDA)](#a10-ao-tab-open-finance)
     - [Tab: Potentiale](#a10-ao-tab-potentiale)
     - [Tab: Finanzplanung](#a10-ao-tab-finanzplanung)
     - [Tab: Kommunikation](#a10-ao-tab-kommunikation)
   - [A-10b Ecclesia: Institutioneller Kunde](#a-10b-ecclesia)
   - [A-10c MRH: Gewerbekunden-Detail](#a-10c-mrh)
6. [KI-Chatbot (Vertriebs-Assistent)](#ki-chatbot)
   - [Architektur und Funktionsweise](#chatbot-architektur)
   - [AO-Modus: Alle Mock-Antworten](#chatbot-ao-antworten)
   - [Ecclesia B2B: Alle Mock-Antworten](#chatbot-b2b-antworten)
   - [MRH 360: Alle Mock-Antworten](#chatbot-mrh-antworten)
   - [Follow-up-Vorschlaege](#chatbot-followups)
   - [Spezialfunktionen](#chatbot-spezialfunktionen)
7. [Modus-Umschaltung (Technischer Ablauf)](#modus-umschaltung)
8. [Navigationsfluss A-02 zu A-10](#navigationsfluss)
9. [KPI-Vergleich nach Modus](#kpi-vergleich)
10. [Tab-Vergleich nach Modus](#tab-vergleich)
11. [Technische Architektur](#technische-architektur)
12. [Dateistruktur](#dateistruktur)
13. [Integration mit anderen Modulen](#integration)
14. [Mock-Daten-Katalog](#mock-daten-katalog)

---

## Ueberblick

**A-02** (Vermittler-Uebersicht) und **A-10** (Kunden-Detailansicht) bilden das Herzstuck des Versicherungsmoduls im KI-Vertriebsarbeitsplatz. Gemeinsam decken sie den kompletten Workflow ab: von der Gesamtbetrachtung eines Vermittlers/einer Geschaeftsstelle bis hinunter zum einzelnen Kunden mit Vertraegen, Schaeden und Potentialen.

Beide Ansichten existieren in **drei Varianten** (Modi), die ueber einen 3-Wege-Toggle im Header umgeschaltet werden und die **gesamte UI** -- KPIs, Tabs, Kundenlisten, Header-Titel, Fotos, Chat-Kontext und URL-Route -- an den jeweiligen Vertriebskanal anpassen.

### Uebersichtstabelle

| Page-ID | Ansicht | Modus | Route | JS-Datei |
|---------|---------|-------|-------|----------|
| **A-02** | Vermittler-Uebersicht | AO (Privatkundenvertrieb) | `#/agentur` | `agentur-overview.js` |
| **A-02b** | Vermittler-Uebersicht | Makler B2B (Ecclesia) | `#/agentur-b2b` | `makler.js` |
| **A-02c** | Vermittler-Uebersicht | Gewerbe 360 (MRH Trowe) | `#/agentur-gewerbe` | `mrh-trowe.js` |
| **A-10** | Kunden-Detail | AO (Privatkundenvertrieb) | `#/kundendetail` | `kunden-detail.js` |
| **A-10b** | Kunden-Detail | Makler B2B (Ecclesia) | `#/kundendetail-b2b` | `makler.js` |
| **A-10c** | Kunden-Detail | Gewerbe 360 (MRH Trowe) | `#/kundendetail-gewerbe` | `mrh-trowe.js` |

### Technologie-Stack

| Schicht | Technologie |
|---------|------------|
| Frontend | Vanilla JavaScript (HTML5, CSS3) -- kein Framework |
| Charts | Chart.js 4.4, D3.js 7.8 |
| Karten | Leaflet.js 1.9.4 |
| Export | html2canvas, jsPDF |
| KI-Chat | Cloudflare Worker API (claude-haiku-4-5) + Mock-Modus |
| Routing | Hash-basiert (`router.js`) |
| State | localStorage + globale Variablen |
| Hosting | Cloudflare Pages |

---

## Page-ID-System und Namenskonvention

Der Arbeitsplatz verwendet ein Praefix-basiertes Page-ID-System (`page-id-tracker.js`), das jede Ansicht eindeutig identifiziert. Die Page-ID wird unten links im UI als Badge angezeigt und animiert sich bei Seitenwechseln.

### Alle Praefixe

| Praefix | Modul | IDs |
|---------|-------|-----|
| **M** | Main (Landing Page) | M-01 |
| **A** | Versicherung | A-01 bis A-12 |
| **B** | Banken | B-01 bis B-10c |
| **P** | PMO Toolbox | P-01 bis P-11 |
| **R** | Risikoscoring | R-01, R-02 |
| **T** | Bestandsuebertragung | T-01 bis T-13 |
| **H** | HR Pipeline | H-01, H-02 |

### Versicherungsmodul im Detail (A-Praefix)

| Page-ID | Ansicht | Beschreibung |
|---------|---------|-------------|
| A-01 | Agentur-Auswahl | Grid mit Agentur-Kacheln |
| **A-02** | Vermittler-Uebersicht (AO) | Privatkundenvertrieb |
| **A-02b** | Vermittler-Uebersicht (Ecclesia) | Industriemakler B2B |
| **A-02c** | Vermittler-Uebersicht (MRH) | Gewerbemakler 360 |
| A-03 | Gesamtuebesicht / Dashboard | 9 KPI-Boxen, Charts |
| A-04 | Kunden-Uebersicht | Tabellen-Ansicht |
| A-05 | Potentialanalyse | Cross-Sell-Analyse |
| A-06 | FIDA Cases | Open-Finance-Faelle |
| A-07 | Eigene Daten | Vermittler-eigene Daten |
| A-08 | KI-Chat | Chat-Assistent (Mock-Modus) |
| A-09 | Finanzplanung | Kundenfinanzplanung |
| **A-10** | Kunden-Detail (AO) | Privatkunden-Detailansicht |
| **A-10b** | Kunden-Detail (Ecclesia) | Institutionelles Kunden-Detail |
| **A-10c** | Kunden-Detail (MRH) | Gewerbekunden-Detail 360 |
| A-11 | BGAV Uebersicht | Vermittler-Tabelle + Charts |
| A-12 | BGAV Simulation | Provisions-Rechner |

Die Suffixe `b` und `c` bezeichnen **nicht** Untervarianten der Seite, sondern denselben Seitentyp in einem anderen Vertriebskanal-Modus.

---

## Die drei Modi im Detail

### 1. AO -- Ausschliesslichkeitsorganisation (A-02 / A-10)

Der klassische Agenturvertrieb an **Privatpersonen**. Ein einzelner Vermittler (z.B. "Maria Musterfrau", VM00001) betreut Endkunden mit Standardprodukten.

| Eigenschaft | Wert |
|-------------|------|
| **Zielgruppe** | Versicherungsagenten im Exklusivvertrieb |
| **Kunden** | 11 Privatpersonen (Peter Schmidt, Amira Koenig, Thomas Weber, ...) |
| **Header-Titel** | "Agentur: Maria Musterfrau" |
| **Header-Untertitel** | "VM00001 | Aktiv" |
| **Header-Foto** | Persoenlicher Avatar (maria-musterfrau.png) |
| **KPI-Anzahl** | 4 (Gesamtbestand, Neugeschaeft, Storno-Quote, Zielerreichung) |
| **Tab-Anzahl** | 9 (7 primaer + 2 sekundaer) |
| **URL-Route** | `#/agentur` |
| **Fokus** | Neugeschaeft, Bestand, Storno, Verguetung, Qualitaet |

### 2. Ecclesia B2B -- Industriemakler (A-02b / A-10b)

Inspiriert vom Modell der **Ecclesia Gruppe**: ein institutioneller Makler, der Grossinstitutionen betreut. Die Geschaeftsstelle "GS NRW" verwaltet Kliniken, Kirchen, Sozialeinrichtungen und Industriebetriebe.

| Eigenschaft | Wert |
|-------------|------|
| **Zielgruppe** | Industriemakler / Spezialmakler |
| **Kunden** | 15 Institutionen in 5 Segmenten |
| **Header-Titel** | "GS NRW" |
| **Header-Untertitel** | "Ecclesia Gruppe" |
| **Header-Foto** | Gebaeude-SVG-Icon (kein persoenliches Foto) |
| **KPI-Anzahl** | 5 (Bestandspraemie, Neugeschaeft, Courtage, Retention, Schadenquote) |
| **Tab-Anzahl** | 10 (8 primaer + 2 sekundaer) |
| **URL-Route** | `#/agentur-b2b` |
| **Fokus** | Praemie, Courtage, Retention, Schadenquote, Renewals, Deckungsluecken |

**5 Segmente mit Icons:**

| Segment | SVG-Icon | Beispiel-Kunden |
|---------|----------|----------------|
| Gesundheitswesen | Kreuz/Gebaeude | Klinikum Lippetal, Reha-Klinik Teutoburg, MVZ MediVita, Seniorenresidenz Sonnenhof |
| Kirche | Kirchensymbol | Ev. Landeskirche Teutoburg (12,5 Mio.), Erzbistum Waldburg (8,3 Mio.), Kirchenkreis Auental |
| Sozialwirtschaft | Personengruppe | Diakonisches Hilfswerk Westmark, Sozialwerkstaetten Bergland, Wohlfahrtswerk Auental |
| Industrie & Gewerbe | Fabrik | Westfalia Elektronik (3,8 Mio.), Nordlicht Automatisierung (9,5 Mio.) |
| Transport & Logistik | LKW | (weitere Kunden im Datenkatalog) |

### 3. MRH Trowe Gewerbe 360 (A-02c / A-10c)

Ein PE-gestuetzter Konsolidierer nach dem Vorbild von **MRH Trowe**, der drei Saeulen bedient:

| Eigenschaft | Wert |
|-------------|------|
| **Zielgruppe** | Gewerbemakler mit Multi-Service-Ansatz |
| **Kunden** | 7+ B2B-Gewerbekunden in 7+ Branchen |
| **Header-Titel** | "Niederlassung Rhein-Main" |
| **Header-Untertitel** | "Gewerbemakler 360" |
| **Header-Foto** | Gebaeude-SVG-Icon mit 360-Badge (gruen) |
| **KPI-Anzahl** | 5 |
| **Tab-Anzahl** | 10 (8 primaer + 2 sekundaer) |
| **URL-Route** | `#/agentur-gewerbe` |
| **Fokus** | Drei-Saeulen-Courtage, Cross-Sell, Beziehungs-Timeline |

**Drei-Saeulen-Modell:**

| Saeule | Kuerzel | Farbe | Bereich |
|--------|---------|-------|---------|
| Insurance | I | Blau (#3b82f6) | Klassische Versicherungsvermittlung |
| Benefits | B | Gruen (#22c55e) | bAV, bKV, P-LIVE (Mitarbeiter-Benefits) |
| Finance | F | Orange (#f59e0b) | Kreditversicherung, Avale, Leasing |

**Branchen-Spezialisierungen (Specialties):**

| Specialty | Beispiel-Kunde | Insurance | Benefits | Finance |
|-----------|---------------|-----------|----------|---------|
| Maschinenbau | Rhein-Main Maschinenbau GmbH | 420.000 EUR | inaktiv | 45.000 EUR |
| Real Estate | Nordpark Projektentwicklung AG | 680.000 EUR | 1,2 Mio. | 120.000 EUR |
| Logistik | Hessenlog Spedition GmbH | 280.000 EUR | inaktiv | 28.000 EUR |
| IT/Hightech | DigiCore Solutions GmbH | 82.000 EUR | 380.000 EUR | inaktiv |
| Healthcare | Medicum Rhein-Main MVZ GmbH | 165.000 EUR | 890.000 EUR | 48.000 EUR |
| Bau/Handwerk | Hessenbau Generalunternehmer GmbH | 290.000 EUR | 320.000 EUR | 65.000 EUR |
| OEPNV/SPNV | Rhein-Main Verkehr GmbH | 1,45 Mio. EUR | 4,8 Mio. | 142.000 EUR |

---

## A-02 -- Vermittler-Uebersicht

Die Vermittler-Uebersicht ist die **zentrale Steuerungsansicht**. Sie zeigt alle relevanten Kennzahlen, Tabs und die Kundenliste eines Vermittlers bzw. einer Geschaeftsstelle.

**Einstieg:** Klick auf eine Agentur-Kachel von der Landing Page (M-01) oder vom Dashboard (A-03).
**Hauptfunktion:** `showAgenturOverview(vermittlerId)` in `agentur-overview.js`
**HTML-Container:** `<div id="agenturOverview">` (index.html, Zeilen 530-3512)

### A-02 Layout-Aufbau

```
+============================================================================+
|  HEADER                                                                     |
|  +--------+  +---------------------------+  +---------------------------+   |
|  | Zurueck|  | Foto | Agentur: Maria     |  | [AO] [Ecclesia] [MRH]    |   |
|  | Button |  |      | Musterfrau         |  | (View-Mode-Toggle)        |   |
|  +--------+  |      | VM00001 | Aktiv    |  +---------------------------+   |
|              +---------------------------+  | Reset-Demo-Daten-Button   |   |
|                                             +---------------------------+   |
|  TAB-NAVIGATION (horizontal scrollbar)                                      |
|  [Uebersicht] [Stammdaten] [Neugeschaeft] [Bestand] [Storno]              |
|  [Verguetung] [Qualitaet] | [Kunden] [Potentiale]                         |
|                            ^Divider                                         |
+============================================================================+
|  KPI-BOXEN (4 im AO-Modus, 5 im B2B/MRH-Modus)                           |
|  +------------------+ +------------------+ +------------------+ +--------+ |
|  | Icon  Gesamt-    | | Icon  Neugeschaeft| | Icon  Storno-   | | Icon   | |
|  |       bestand    | |       YTD        | |       Quote     | | Ziel-  | |
|  | EUR 1.247.000    | | EUR 89.400       | | 4,2%            | | 87%    | |
|  | +5,3% YoY       | | +12,1% vs. VJ    | | +0,8%           | | [====] | |
|  +------------------+ +------------------+ +------------------+ +--------+ |
+============================================================================+
|  MAIN CONTENT (je nach aktivem Tab)                                        |
|                                                                             |
|  +---------------------------------------------+ +------------------------+|
|  | LINKE SPALTE (2/3 Breite)                    | | RECHTE SPALTE (1/3)    ||
|  |                                               | |                        ||
|  | Vertriebskennzahlen-Card                      | | Sidebar                ||
|  | +-------------------------------------------+ | | (Timeline, Kalender,   ||
|  | | Abschluesse | Neugeschaeft | Termine | AQ | | | Aufgaben)              ||
|  | | 12          | EUR 8.400    | 5       | 68%| | |                        ||
|  | | +3 vs. VW   | +2.100      | 2 offen | +6%| | |                        ||
|  | +-------------------------------------------+ | |                        ||
|  |                                               | |                        ||
|  | Vertriebspotentiale-Card                      | |                        ||
|  | +-------------------------------------------+ | |                        ||
|  | | Peter Schmidt - BU-Nachversicherung       | | |                        ||
|  | | Amira Koenig - Kfz-Wechsel                | | |                        ||
|  | | Thomas Weber - Risikoleben                | | |                        ||
|  | +-------------------------------------------+ | |                        ||
|  +---------------------------------------------+ +------------------------+|
+============================================================================+
|  FLOATING CHAT-WIDGET (fixed, unten rechts, ausserhalb des Containers)     |
|  +--------------------+                                                     |
|  | [KI] Chat-Toggle   |  <-- Runder Button mit "KI"-Badge                  |
|  +--------------------+                                                     |
|                                                                             |
|  +----------------------------------+                                       |
|  | Vertriebs-Assistent         [X]  |  <-- Chat-Widget (420x560px)          |
|  |----------------------------------|                                       |
|  | Fragen Sie mich zu Kunden,       |                                       |
|  | Potentialen oder Vertriebsdaten. |                                       |
|  |                                  |                                       |
|  | [Auslaufende Vertraege]          |                                       |
|  | [LV-Potenziale anzeigen]         |                                       |
|  | [Neue Potentiale]                |                                       |
|  | [Meine Abschlussquote]           |                                       |
|  | [Vertriebsbericht]               |                                       |
|  |----------------------------------|                                       |
|  | [Frage stellen...        ] [-->] |                                       |
|  +----------------------------------+                                       |
+============================================================================+
```

**Wichtig:** Der Chat-Widget (`agenturChatWidget`) ist im HTML **ausserhalb** des `agenturOverview`-Containers platziert, damit die `position: fixed`-Positionierung korrekt funktioniert.

### A-02 Header-Bereich

Der Header passt sich dynamisch an den aktiven Modus an:

| Element | AO | Ecclesia B2B | MRH 360 |
|---------|-----|-------------|---------|
| **Titel** | "Agentur: Maria Musterfrau" | "GS NRW" | "Niederlassung Rhein-Main" |
| **Untertitel** | "VM00001 \| Aktiv" | "Ecclesia Gruppe" | "Gewerbemakler 360" |
| **Foto** | Persoenliches Bild (`maria-musterfrau.png`) | Gebaeude-SVG-Icon | Gebaeude-SVG mit 360-Badge |
| **CSS-Klasse** | `.agentur-header-new` | gleich | gleich |

**View-Mode-Toggle** (3 Buttons, rechts im Header):
```html
<div class="view-mode-selector" id="viewModeSelector">
    <button class="view-mode-btn active" data-mode="ao">Privatkunde (AO)</button>
    <button class="view-mode-btn" data-mode="ecclesia">Makler B2B</button>
    <button class="view-mode-btn" data-mode="mrh">Gewerbemakler 360</button>
</div>
```

### A-02 KPI-Boxen

#### AO-Modus: 4 KPI-Boxen

```
+-------------------+  +-------------------+  +-------------------+  +-------------------+
| [Bestand-Icon]    |  | [Neugesch.-Icon]  |  | [Storno-Icon]     |  | [Ziel-Icon]       |
|                   |  |                   |  |                   |  |                   |
| EUR 1.247.000     |  | EUR 89.400        |  | 4,2%              |  | 87%               |
| Gesamtbestand     |  | Neugeschaeft YTD  |  | Storno-Quote      |  | Zielerreichung    |
| +5,3% YoY        |  | +12,1% vs. VJ     |  | +0,8% (neg.)      |  | [=========>  ]    |
+-------------------+  +-------------------+  +-------------------+  +-------------------+
```

Jede KPI-Box besteht aus:
- **Icon** (farblich codiert, SVG in `.cockpit-kpi-icon`)
- **Wert** (gross, dynamisch via `fillCockpitKPIs()`)
- **Label** (Beschreibung)
- **Trend** (positiv/negativ mit Farbcodierung, oder Gauge-Balken bei Zielerreichung)

Die Werte werden durch `fillCockpitKPIs(agenturData)` dynamisch befuellt. IDs: `cockpitBestand`, `cockpitNeugeschaeft`, `cockpitStorno`, `cockpitZiel`.

#### Ecclesia B2B: 5 KPI-Boxen

| KPI | Wert | Trend | CSS-ID |
|-----|------|-------|--------|
| Bestandspraemie | 68,5 Mio. EUR | +4,2% YoY | `maklerKpis` |
| Neugeschaeft | 4,2 Mio. EUR | +11,8% vs. VJ | |
| Courtage | 5,8 Mio. EUR | Ziel: 6,4 Mio. | |
| Retention | 97,2% | Benchmark: 95% | |
| Schadenquote | 62% | Ziel: <65% | |

Container: `<div id="maklerKpis">` (standardmaessig `display:none`)

#### MRH 360: 5 KPI-Boxen

| KPI | Wert | Trend |
|-----|------|-------|
| Insurance Courtage | 3,8 Mio. EUR | +8,2% YoY |
| Benefits Courtage | 1,4 Mio. EUR | +15,3% YoY |
| Finance Courtage | 0,6 Mio. EUR | +22,1% YoY |
| Gesamt-Courtage | 5,8 Mio. EUR | Ziel: 6,2 Mio. |
| Retention Rate | 94,2% | Benchmark: 92% |

Container: `<div id="mrhKpis">` (standardmaessig `display:none`)

---

### A-02 AO: Alle 9 Tabs

Die Tabs werden durch die Funktion `showAgenturTab(tabName)` umgeschaltet. Jeder Tab hat einen HTML-Container mit der Klasse `.agentur-tab-content`.

#### AO Tab: Uebersicht

**Tab-ID:** `tab-uebersicht` (Standard-Tab, beim Oeffnen aktiv)
**Layout:** Zwei-Spalten-Grid (`agentur-uebersicht-grid`)

```
+-----------------------------------------------+  +---------------------------+
| LINKE SPALTE (agentur-uebersicht-main)        |  | RECHTE SPALTE (sidebar)   |
|                                                |  |                           |
| [Vertriebskennzahlen-Card]                     |  | Timeline / Aktivitaeten   |
| Period-Toggle: [Woche] [Monat]                 |  | Kalender                  |
| +----------+----------+----------+----------+  |  | Aufgaben                  |
| | Abschl.  | Neugesch.| Termine  | AbschlQ  |  |  |                           |
| | 12       | EUR8.400 | 5        | 68%      |  |  |                           |
| | +3 vs VW | +2.100   | 2 offen  | +6%      |  |  |                           |
| +----------+----------+----------+----------+  |  |                           |
|                                                |  |                           |
| [Vertriebspotentiale-Card]                     |  |                           |
| Peter Schmidt - BU-Nachversicherung            |  |                           |
|   BU deckt nur 41% des Nettogehalts           |  |                           |
|   Praemie: EUR 1.680/J. | Provision: EUR 1.260|  |                           |
|                                                |  |                           |
| Amira Koenig - Kfz-Wechsel                    |  |                           |
|   Vertrag laeuft aus, EUR 200/J. Ersparnis    |  |                           |
|   Praemie: EUR 540/J.  | Provision: EUR 405   |  |                           |
|                                                |  |                           |
| Thomas Weber - Risikolebensversicherung        |  |                           |
|   Familie unzureichend abgesichert             |  |                           |
|                                                |  |                           |
| [Weitere Potentiale anzeigen v] (+3)           |  |                           |
+-----------------------------------------------+  +---------------------------+
```

**Vertriebskennzahlen** (4 klickbare Kacheln im Grid):
- Klick auf eine Kachel navigiert zum entsprechenden Tab (z.B. "Abschluesse" -> Tab "Neugeschaeft")
- Period-Toggle wechselt zwischen Wochen- und Monatswerten
- Funktion: `toggleVertriebsPeriod('week'|'month')`

**Vertriebspotentiale** (Potential-Cards):
- Jede Card ist klickbar und oeffnet die Kunden-Detailansicht (A-10)
- Onclick: `openKundenDetail('Peter Schmidt', 'KD00001')`
- Zeigt: Kundenname, Kunden-ID, Prioritaet (Hoch/Mittel), Produkt, Beschreibung, Praemie, Provision
- "Weitere Potentiale": Toggle-Button zeigt 3 zusaetzliche Potentiale

#### AO Tab: Stammdaten

**Tab-ID:** `tab-stammdaten`

Zeigt die Stammdaten des Vermittlers (nicht des Kunden!):

| Feld | Wert (Mock) |
|------|-------------|
| Name | Maria Musterfrau |
| Vermittler-ID | VM00001 |
| Status | Aktiv |
| Typ | Ausschliesslichkeit |
| Region | NRW |
| Eintrittsdatum | 01.01.2015 |
| Qualifikation | IHK Fachmann/-frau |

#### AO Tab: Neugeschaeft

**Tab-ID:** `tab-neugeschaeft`

Zeigt Neugeschaeft-Statistiken mit Charts:
- Neugeschaeft nach Sparten (Balkendiagramm)
- Abschluesse nach Monat (Liniendiagramm)
- Top-Produkte Tabelle
- Vergleich mit Vorjahr

#### AO Tab: Bestand

**Tab-ID:** `tab-bestand`

Zeigt die Bestandsuebersicht:
- Bestandsverteilung nach Sparten (Tortendiagramm)
- Bestandsentwicklung (Zeitreihe)
- Detailtabelle aller Bestandsvertraege mit Kunden-Zuordnung

Die Bestandsvertraege werden aus dem Array `kundenBestandVertraege` geladen, das alle Vertraege aller 11 AO-Kunden enthaelt.

#### AO Tab: Storno

**Tab-ID:** `tab-storno`

Zeigt Storno-Analyse:
- Storno-Quote im Zeitverlauf
- Storno-Gruende (Balkendiagramm)
- Gefaehrdete Vertraege (Fruehwarnsystem)
- Vergleich mit Benchmark

#### AO Tab: Verguetung

**Tab-ID:** `tab-provision`

Zeigt Vergeetungsdaten des Vermittlers:
- Provisions-Uebersicht (Abschluss- und Bestandsprovision)
- Provisions-Entwicklung im Zeitverlauf
- Aufschluesselung nach Sparten
- Ziel vs. Ist

#### AO Tab: Qualitaet

**Tab-ID:** `tab-qualitaet`

Zeigt Qualitaetskennzahlen:
- NPS-Score (Kundenzufriedenheit)
- Beschwerdequote
- Beratungsqualitaet
- IDD-Compliance-Status
- Weiterbildungsstatus

#### AO Tab: Kunden

**Tab-ID:** `tab-kundenliste`

```
+============================================================================+
| Kunden (11)                                    [Kunde suchen...        ]   |
+============================================================================+
| Name            | Kunden-ID | Geb.datum  | Beruf        | Vertr. | Bestand   | NPS | Letzter Kontakt |
|-----------------|-----------|------------|--------------|--------|-----------|-----|-----------------|
| Christian Bauer | KD00008   | 07.12.1980 | Architekt    | 5      | EUR4.800  | [8] | 29.11.2024      |
| Claudia Richter | KD00009   | 22.04.1975 | Aerztin      | 6      | EUR5.200  | [9] | 15.12.2024      |
| Frank Hoffmann  | KD00010   | 30.08.1968 | Unternehmer  | 4      | EUR3.900  | [7] | 20.11.2024      |
| Julia Fischer   | KD00006   | 18.09.1992 | Lehrerin     | 3      | EUR2.100  | [8] | 10.12.2024      |
| Maria Schneider | KD00004   | 03.07.1982 | Kauffrau     | 4      | EUR3.500  | [7] | 05.12.2024      |
| Markus Klein    | KD00007   | 14.01.1988 | IT-Berater   | 3      | EUR2.800  | [6] | 22.11.2024      |
| Peter Schmidt   | KD00001   | 15.03.1985 | Angestellter | 2      | EUR1.518  | [7] | 28.11.2024      |
| ...             |           |            |              |        |           |     |                 |
+============================================================================+
```

**Funktionalitaet:**
- Suchfeld: `filterKundenliste(this.value)` -- filtert in Echtzeit
- Jede Zeile klickbar: `onclick="openKundenDetail('Name', 'ID')"` -- oeffnet A-10
- NPS-Badge farbcodiert: Promoter (9-10, gruen), Passive (7-8, gelb), Detractor (0-6, rot)
- Sortierbar nach Spalten

**Alle 11 AO-Kunden:**

| Name | ID | Beruf | Vertraege |
|------|----|-------|-----------|
| Peter Schmidt | KD00001 | Angestellter | 2 (BU, Wohngebaeude) |
| Amira Koenig | KD00002 | Selbststaendig | 3 (Risikoleben, BU, Unfall) |
| Thomas Weber | KD00003 | Handwerksmeister | 3 (Privathaftpflicht, Kfz, Hausrat) |
| Maria Schneider | KD00004 | Kauffrau | 4 |
| Andreas Mueller | KD00005 | Beamter | 3 |
| Julia Fischer | KD00006 | Lehrerin | 3 |
| Markus Klein | KD00007 | IT-Berater | 3 |
| Christian Bauer | KD00008 | Architekt | 5 |
| Claudia Richter | KD00009 | Aerztin | 6 |
| Frank Hoffmann | KD00010 | Unternehmer | 4 |
| Sarah Braun | KD00011 | Studentin | 2 |

#### AO Tab: Potentiale

**Tab-ID:** `tab-potential` (Sekundaer-Tab, nach Divider)

Zeigt alle identifizierten Vertriebspotentiale als Liste:
- Gleiche Daten wie die Potential-Cards in der Uebersicht, aber vollstaendig
- Filterbar nach Prioritaet (Hoch, Mittel, Niedrig)
- Klick oeffnet Kunden-Detail mit Sprung zum Potentiale-Tab

---

### A-02b Ecclesia: Alle 10 Tabs

Die B2B-Tabs werden durch `showMaklerTab(tabName)` gesteuert. Container-Klasse: `.makler-tab-content`. Die Inhalte werden **lazy-gerendert** -- erst beim ersten Oeffnen wird der HTML-Inhalt generiert.

**Tab-Leiste im Ecclesia-Modus:**
```
[Uebersicht] [Stammdaten] [Neugeschaeft] [Bestand] [Versicherer-Mix]
[Renewals] [Schaeden] [Deckungsluecken] | [Kunden] [Potentiale]
```

#### Ecclesia Tab: Uebersicht

**Tab-ID:** `tab-makler-uebersicht`
**Render-Funktion:** `renderMaklerUebersicht()` (in `makler.js`)

Layout analog zur AO-Uebersicht, aber mit B2B-spezifischen Inhalten:

```
+-----------------------------------------------+  +---------------------------+
| Vertriebskennzahlen (B2B)                      |  | Aufgaben                  |
| +----------+----------+----------+----------+  |  | - Renewal Klinikum (rot)  |
| | Kunden   | Vertraege| Retention| Schaden  |  |  | - Cyber-Erweiterung       |
| | 15       | 196      | 97,2%    | 62%      |  |  | - Jahresgespraech         |
| | 5 Segm.  | O/ 13/K  | BM: 95% | <65%     |  |  | - Flottenkonzept          |
| +----------+----------+----------+----------+  |  |                           |
|                                                |  | Segment-Verteilung        |
| Top-5-Kunden nach Praemie                      |  | [===========] Kirche 52%  |
| 1. Ev. Landeskirche    12,5 Mio. | 38 Vertr.  |  | [=======]   Industrie 34% |
| 2. Nordlicht Autom.     9,5 Mio. | 31 Vertr.  |  | [====]    Gesundheit 8%   |
| 3. Erzbistum Waldburg   8,3 Mio. | 29 Vertr.  |  | [===]  Sozialwirt. 4%     |
| 4. Westfalia Elektr.    3,8 Mio. | 22 Vertr.  |  | [==]   Transport 2%       |
| 5. Diak. Hilfswerk      1,8 Mio. | 16 Vertr.  |  |                           |
|                                                |  | Anstehende Renewals       |
| Vertriebspotentiale                             |  | (naechste 90 Tage)        |
| - Umwelthaftpflicht Klinikum Lippetal          |  | Cyber Klinikum 31.03.     |
| - Cyber-Rahmenvertrag Ev. Landeskirche         |  | Gebaeude Kirchenkr. 01.04.|
| - Produkthaftpflicht Nordlicht                 |  |                           |
+-----------------------------------------------+  +---------------------------+
```

#### Ecclesia Tab: Stammdaten

**Tab-ID:** `tab-makler-stammdaten`
Zeigt die Geschaeftsstellen-Stammdaten (GS NRW / Ecclesia Gruppe).

#### Ecclesia Tab: Neugeschaeft

**Tab-ID:** `tab-makler-neugeschaeft`
Neugeschaeft-Analyse fuer institutionelle Kunden mit Praemienvolumen-Fokus.

#### Ecclesia Tab: Bestand

**Tab-ID:** `tab-makler-bestand`
Bestandsuebersicht aller 15 institutionellen Kunden, aggregiert nach Segmenten.

#### Ecclesia Tab: Versicherer-Mix

**Tab-ID:** `tab-makler-versicherermix`
Analyse der Versicherer-Verteilung im Portfolio:
- Welche Versicherer decken welche Sparten ab
- Konzentrationsrisiken
- Verhandlungsposition (Praemienvolumen pro Versicherer)

Haeufige Versicherer im B2B-Portfolio: Allianz, Zurich, HDI, Provinzial, VGH, Kravag, Hiscox, ARAG, R+V, ERGO, DKV.

#### Ecclesia Tab: Renewals

**Tab-ID:** `tab-makler-renewal`
**Ampelsystem** fuer anstehende Vertragsverlaengerungen:

| Status | Farbe | Bedeutung |
|--------|-------|-----------|
| Gruen | `renewal-gruen` | Renewal > 90 Tage entfernt |
| Gelb | `renewal-gelb` | Renewal 31-90 Tage entfernt |
| Rot | `renewal-rot` | Renewal <= 30 Tage entfernt (kritisch!) |

Tabelle mit allen anstehenden Renewals, sortiert nach Dringlichkeit.

#### Ecclesia Tab: Schaeden

**Tab-ID:** `tab-makler-schaden`
5-Jahres-Schadenhistorie aggregiert ueber alle Kunden:
- Schadenvolumen nach Jahr
- Schadenquote-Entwicklung
- Top-Schaeden nach Betrag
- Schaeden nach Sparte

#### Ecclesia Tab: Deckungsluecken

**Tab-ID:** `tab-makler-deckungsluecken`
Analyse fehlender oder unzureichender Deckungen:

| Prioritaet | Farbcode | Beispiel |
|------------|----------|----------|
| Hoch | Rot | Umwelthaftpflicht Klinikum Lippetal |
| Mittel | Orange | Organhaftpflicht |
| Niedrig | Grau | Drohnen-Haftpflicht |

Jede Deckungsluecke zeigt: Kunde, Risiko, Status, Empfehlung, Prioritaet.

#### Ecclesia Tab: Kunden

**Tab-ID:** `tab-kundenliste-makler`

```
+============================================================================+
| Kunden -- GS NRW                               [Kunde suchen...        ]  |
+============================================================================+
| Kunde                         | Segment          | Praemie    | Vertr. | SQ   | DQ   | Renewal     |
|-------------------------------|------------------|------------|--------|------|------|-------------|
| Ev. Landeskirche Teutoburg    | Kirche           | 12,5 Mio.  | 38     | 48%  | 92%  | [01.01.27]g |
| Nordlicht Automatisierung     | Industrie        | 9,5 Mio.   | 31     | 38%  | 94%  | [01.01.27]g |
| Erzbistum Waldburg            | Kirche           | 8,3 Mio.   | 29     | 44%  | 88%  | [01.01.27]g |
| Westfalia Elektronik          | Industrie        | 3,8 Mio.   | 22     | 45%  | 85%  | [31.12.26]g |
| Diak. Hilfswerk Westmark      | Sozialwirtschaft | 1,8 Mio.   | 16     | 52%  | 82%  | [31.12.26]g |
| Klinikum Lippetal             | Gesundheitswesen | 1,2 Mio.   | 14     | 58%  | 78%  | [31.03.26]r |
| Kirchenkreis Auental          | Kirche           | 620.000    | 11     | 38%  | 75%  | [01.04.26]y |
| ...                           |                  |            |        |      |      |             |
+============================================================================+
```

SQ = Schadenquote, DQ = Deckungsquote. g/y/r = Ampelfarbe des Renewals.
Klick auf Zeile: `openMaklerKundenDetail(id)` -> oeffnet A-10b.

#### Ecclesia Tab: Potentiale

**Tab-ID:** `tab-makler-potentiale`
Cross-Selling-Potentiale fuer institutionelle Kunden.

---

### A-02c MRH: Alle 10 Tabs

Die MRH-Tabs werden durch `showMRHTab(tabName)` gesteuert. Container-Klasse: `.mrh-tab-content`. Auch hier **Lazy-Rendering**.

**Tab-Leiste im MRH-Modus:**
```
[Uebersicht] [Stammdaten] [Neugeschaeft] [Bestand] [Versicherer-Mix]
[Renewals] [Schaeden] [Deckungsluecken] | [Kunden] [Potentiale]
```

#### MRH Tab: Uebersicht

**Tab-ID:** `tab-mrh-uebersicht`
**Render-Funktion:** `renderMRHUebersicht()` (in `mrh-trowe.js`)

```
+-----------------------------------------------+  +---------------------------+
| Vertriebskennzahlen (360)                      |  | Aufgaben                  |
| +----------+----------+----------+----------+  |  | ! Renewal BH Rhein-Main   |
| | Kunden   | Vertraege| Retention| Schaden  |  |  |   Maschinenbau (42 Tage)  |
| | 7        | 54       | 94,2%    | 58%      |  |  | ! Cyber DigiCore (Offen)  |
| | 7 Branch.| O/ 8/K   | BM: 92% | <65%     |  |  | Jahresgespr. Nordpark     |
| +----------+----------+----------+----------+  |  | Flottenkonzept Hessenlog  |
|                                                |  | Produktrueckruf pruefen   |
| Top-5-Kunden nach Praemie                      |  |                           |
| 1. Rhein-Main Verkehr   1,45 Mio. | 8 Vertr.  |  | Segment-Verteilung        |
| 2. Nordpark Projektentw.  680k   | 9 Vertr.  |  | [=======] Maschinenbau    |
| 3. Rhein-Main Maschinen.  420k   | 11 Vertr. |  | [======]  Real Estate     |
| 4. Hessenbau GU            290k   | 9 Vertr.  |  | [=====]   OEPNV           |
| 5. Hessenlog Spedition     280k   | 6 Vertr.  |  | [====]    Bau/Handwerk    |
|                                                |  | [===]     Logistik        |
| Anstehende Renewals (90 Tage)                  |  | [==]      Healthcare      |
| [01.04.26] Rhein-Main Maschinen. - BH  95k    |  | [=]       IT/Hightech     |
|                                                |  |                           |
| Top-3 Vertriebspotentiale                      |  |                           |
| Produktrueckruf-Vers. RMM     ~35.000 EUR/a    |  |                           |
| Flottenvers. Hessenlog         ~28.000 EUR/a    |  |                           |
| Cyber-Erweiterung DigiCore     ~45.000 EUR/a    |  |                           |
+-----------------------------------------------+  +---------------------------+
```

#### MRH Tab: Kunden

**Tab-ID:** `tab-kundenliste-mrh`

```
+==============================================================================================+
| Kunden -- Niederlassung Rhein-Main                          [Kunde suchen...        ]        |
+==============================================================================================+
| Kunde                     | Specialty      | Saeulen | Praemie Ins.| bAV       | Finance  | Renewal     |
|---------------------------|----------------|---------|-------------|-----------|----------|-------------|
| Rhein-Main Maschinenbau   | Maschinenbau   | [I][F]  | 420.000 EUR | --        | 45.000   | [01.04.26]y |
| Nordpark Projektentw.     | Real Estate    | [I][B][F]| 680.000 EUR| 1,2 Mio.  | 120.000  | [30.06.26]g |
| Hessenlog Spedition       | Logistik       | [I][F]  | 280.000 EUR | --        | 28.000   | [01.01.27]g |
| DigiCore Solutions        | IT/Hightech    | [I][B]  | 82.000 EUR  | 380.000   | --       | [31.12.26]g |
| Medicum Rhein-Main        | Healthcare     | [I][B][F]| 165.000 EUR| 890.000   | 48.000   | [31.12.26]g |
| Hessenbau GU              | Bau/Handwerk   | [I][B][F]| 290.000 EUR| 320.000   | 65.000   | [31.12.26]g |
| Rhein-Main Verkehr        | OEPNV/SPNV    | [I][B][F]| 1,45 Mio.  | 4,8 Mio.  | 142.000  | [01.07.26]y |
+==============================================================================================+
```

Saeulen-Tags: `[I]` = Insurance (blau), `[B]` = Benefits (gruen), `[F]` = Finance (orange).
Klick auf Zeile: `openMRHKundenDetail(id)` -> oeffnet A-10c.

#### MRH Tab: Stammdaten / Neugeschaeft / Bestand / Versicherer-Mix / Renewals / Schaeden / Deckungsluecken / Potentiale

Analog zu den Ecclesia-Tabs, aber mit **Drei-Saeulen-Perspektive**:
- Alle Analysen koennen nach Saeule (I/B/F) gefiltert werden
- Cross-Sell-Potentiale beruecksichtigen fehlende Saeulen-Aktivierung
- Renewals zeigen auch bAV-Erneuerungen und Finance-Verlaengerungen

---

## A-10 -- Kunden-Detailansicht

Die Kunden-Detailansicht zeigt das **vollstaendige Profil** eines einzelnen Kunden. Sie wird immer aus A-02 heraus geoeffnet und erbt automatisch den aktiven Modus.

**Einstieg:** Klick auf einen Kundennamen in der Kundenliste von A-02
**Hauptfunktion:** `openKundenDetail(kundenName, vermittlerId)` in `kunden-detail.js`
**HTML-Container:** `<div id="kundenDetailPage">` (index.html, Zeilen 3565-5907)

### A-10 Layout-Aufbau

```
+============================================================================+
|  SHARED HEADER (gleicher Header wie A-02, zeigt Agentur-Kontext)           |
|  [Zurueck] | Foto | Agentur: Maria Musterfrau | VM00001 | Aktiv          |
|  Tab-Navigation: [Uebersicht] [Stammdaten] ... [Kunden] [Potentiale]      |
+============================================================================+
|  STICKY BAR (bleibt beim Scrollen oben fixiert)                            |
|  +----------------------------------------------------------------------+  |
|  | [Avatar]  Peter Schmidt  KD00001  | NPS [7] | CLV EUR12.400 | Seg.  |  |
|  +----------------------------------------------------------------------+  |
+============================================================================+
|  TAB-NAVIGATION (6 Kunden-Detail-Tabs)                                     |
|  [Stammdaten] [Betreute Vertraege] [Open Finance] [Potentiale]            |
|  [Finanzplanung] [Kommunikation]                                           |
+============================================================================+
|  TAB-INHALT (je nach aktivem Tab)                                          |
|                                                                             |
|  +----------------------------------------------------------------------+  |
|  |                                                                      |  |
|  |  (vollstaendiger Tab-Inhalt -- siehe Details unten)                   |  |
|  |                                                                      |  |
|  +----------------------------------------------------------------------+  |
+============================================================================+
```

### A-10 Sticky Bar

Die Sticky Bar (`kunde-sticky-bar.css`) bleibt beim Scrollen oben fixiert und zeigt die wichtigsten Kunden-KPIs auf einen Blick:

```
+============================================================================+
|  [Avatar-  Peter Schmidt          KD00001    |  NPS   CLV        Segment   |
|   Kreis]   Kundenname             Kunden-ID  |  [7]   EUR12.400  [A]      |
+============================================================================+
```

**Elemente der Sticky Bar:**
- **Avatar:** Rundes Platzhalter-SVG oder Kundenbild
- **Name:** Kundenname (gross, fett)
- **ID:** Kunden-ID (kleiner, grau)
- **NPS-Badge:** Farbcodiert (gruen/gelb/rot), klickbar fuer Details
- **CLV:** Customer Lifetime Value
- **Segment-Badge:** Kundensegment-Klassifizierung

---

### A-10 AO: Alle 6 Tabs (Showcase: Peter Schmidt, KD00001)

Peter Schmidt ist der **primaere Showcase-Kunde** in der Demo. Alle Tabs werden hier mit seinen vollstaendigen Daten dokumentiert.

#### A-10 AO Tab: Stammdaten

**Tab-Index:** 0 (Standard-Tab, beim Oeffnen aktiv)
**Container-ID:** innerhalb des ersten Tab-Content-Blocks

```
+============================================================================+
|  STAMMDATEN                                                Peter Schmidt   |
+============================================================================+
|                                                                             |
|  +----------------------------------+  +----------------------------------+ |
|  | [Foto-Platzhalter]               |  | CLV-Badge                        | |
|  |  Peter Schmidt                   |  | Segment: [A] Premium             | |
|  |  KD00001                         |  | Trend: +8,2% YoY                 | |
|  +----------------------------------+  +----------------------------------+ |
|                                                                             |
|  Persoenliche Daten                                                         |
|  +----------------------------------------------------------------------+  |
|  | Geburtsdatum     | 15.03.1985                                       |  |
|  | Adresse          | Musterstrasse 123, 12345 Musterstadt              |  |
|  | Telefon          | +49 123 456789                                    |  |
|  | E-Mail           | max.mustermann@email.de                           |  |
|  | Beruf            | Angestellter                                      |  |
|  | Familienstand    | Verheiratet                                       |  |
|  | Kinder           | Lena (8 Jahre), Paul (5 Jahre)                    |  |
|  | Arbeitgeber      | TechCorp GmbH                                     |  |
|  | Beschaeftigt seit| 01.03.2016                                        |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  Scores                                                                     |
|  +----------------------------------------------------------------------+  |
|  | Risikoscore      | [===========>    ] 72/100                         |  |
|  | Bonitaetsscore   | [============>   ] 78/100                         |  |
|  | NPS Score        | [7] (klickbar, mit Detail-Popup)                  |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  CLV-Detail                                                                 |
|  +----------------------------------------------------------------------+  |
|  | Gesamt-CLV            | EUR 12.400                                   |  |
|  | Kundensegment         | A (Premium)                                  |  |
|  | Prognostizierte       |                                               |  |
|  |   Haltedauer          | 12 Jahre                                      |  |
|  | Storno-Risiko         | Niedrig (15%)                                 |  |
|  |----------------------------------------------------------------------|  |
|  | Herleitung:                                                           |  |
|  | Bestandspraemie/Jahr: EUR 1.518                                      |  |
|  | x Haltedauer: 12 Jahre                                               |  |
|  | - Kundengewinnungskosten: EUR 800                                    |  |
|  | = CLV: EUR 12.400                                                    |  |
|  +----------------------------------------------------------------------+  |
+============================================================================+
```

#### A-10 AO Tab: Betreute Vertraege

**Tab-Index:** 1

Zeigt nur die durch den Vermittler betreuten Vertraege (ERGO-Vertraege):

```
+============================================================================+
|  BETREUTE VERTRAEGE                                                         |
+============================================================================+
|                                                                             |
|  +----------------------------------------------------------------------+  |
|  | Versicherungstyp            | Versicherer | Details                   |  |
|  |-----------------------------|-------------|---------------------------|  |
|  | Berufsunfaehigkeitsvers.    | ERGO        | BU-Rente: EUR1.500/Mon.  |  |
|  |                             |             | Endalter 67, ohne        |  |
|  |                             |             | Ausschluesse             |  |
|  |                             |             | Praemie: EUR 89/Mon.     |  |
|  |                             |             | Beginn: 01.03.2018       |  |
|  |                             |             | Status: [Aktiv]          |  |
|  |-----------------------------|-------------|---------------------------|  |
|  | Wohngebaeudeversicherung    | VHV         | Vers.-Summe: EUR450.000  |  |
|  |                             |             | inkl. Elementar,         |  |
|  |                             |             | gleitender Neuwert       |  |
|  |                             |             | Praemie: EUR 450/Jahr    |  |
|  |                             |             | Beginn: 15.06.2019       |  |
|  |                             |             | Status: [Aktiv]          |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  Info: Dies sind die durch Sie betreuten Vertraege. Fuer Vertraege bei     |
|  anderen Anbietern siehe Tab "Open Finance".                                |
|                                                                             |
|  Schadenhistorie/Leistungen (letzte 24 Monate)                             |
|  +----------------------------------------------------------------------+  |
|  | Datum      | Sparte           | Beschreibung  | Status   | Betrag    |  |
|  |------------|------------------|---------------|----------|-----------|  |
|  | (Demo-Daten werden dynamisch geladen)                                 |  |
|  +----------------------------------------------------------------------+  |
+============================================================================+
```

#### A-10 AO Tab: Open Finance (FIDA)

**Tab-Index:** 2
Dies ist der umfangreichste Tab -- er zeigt **alle finanziellen Daten** des Kunden aus externen Quellen via Open-Finance-Schnittstelle (FIDA = Financial Data Access).

```
+============================================================================+
|  OPEN FINANCE                                                               |
+============================================================================+
|                                                                             |
|  CONSENT-STATUS                                                             |
|  +----------------------------------------------------------------------+  |
|  | Status: [Aktiv] (gruener Haken)                                      |  |
|  | Erteilt am: 15.03.2024   |  Gueltig bis: 15.03.2026                 |  |
|  | Datenquellen: 5 aktiv                                                |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  EXTERNE VERKNUEPFUNGEN                                                     |
|  +----------------------------------------------------------------------+  |
|  | Finanzinstitut | Produktart    | Hinweis              | Consent      |  |
|  |----------------|---------------|----------------------|--------------|  |
|  | Sparkasse      | Girokonto     | PSD2-Zahlungshistorie| 15.03.2024   |  |
|  | Targobank      | Konsumentenkredit| Kreditdaten        | 15.03.2024   |  |
|  | DWS            | Depot         | Fondssparen          | 15.03.2024   |  |
|  | Allianz        | Versicherung  | Kfz-Versicherung     | 15.03.2024   |  |
|  | HUK24          | Versicherung  | Hausratversicherung  | 15.03.2024   |  |
|  | ARAG           | Versicherung  | Rechtsschutz         | 15.03.2024   |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  BEDARFSFELD: BEZAHLEN                                                      |
|  +---------------------+ +---------------------+ +---------------------+   |
|  | Gesamtgehalt (netto) | | Monatl. Ausgaben    | | Frei verfuegbar     |   |
|  | EUR 3.834/Monat      | | EUR 2.890/Monat     | | EUR 944/Monat       |   |
|  | Fix: EUR 3.680       | | Fix: EUR 2.240      | | Sparquote: ~25%     |   |
|  | Variabel: EUR 154    | | Var: EUR 650        | |                     |   |
|  +---------------------+ +---------------------+ +---------------------+   |
|                                                                             |
|  BEDARFSFELD: SPAREN & VORSORGEN                                            |
|                                                                             |
|  Geldmarkt:                                                                 |
|  +----------------------------------------------------------------------+  |
|  | Produkt         | Anbieter | Volumen    | Zinssatz    | Laufzeit     |  |
|  |-----------------|----------|------------|-------------|--------------|  |
|  | Tagesgeldkonto  | ING DiBa | EUR15.400  | 2,75% p.a.  | Flexibel     |  |
|  | Festgeld        | ING DiBa | EUR25.000  | 3,25% p.a.  | bis 31.03.26 |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  Kapitalmarkt:                                                              |
|  +----------------------------------------------------------------------+  |
|  | Produkt              | Anbieter | Volumen    | Sparrate  | Perf.YTD |  |
|  |----------------------|----------|------------|-----------|----------|  |
|  | DWS Top Dividende    | DWS      | EUR42.500  | EUR400/M  | +8,2%    |  |
|  | iShares Core MSCI W. | DWS      | EUR28.300  | EUR300/M  | +12,4%   |  |
|  | UniRak               | Union Inv| EUR14.200  | EUR100/M  | +5,1%    |  |
|  |----------------------------------------------------------------------|  |
|  | Gesamt Depot          |          | EUR85.000  | EUR800/M  | +8,9%    |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  BEDARFSFELD: ABSICHERN -- Wettbewerber-Versicherungen                     |
|  +----------------------------------------------------------------------+  |
|  | Versicherung    | Anbieter | Deckung    | Tarif   | Praemie | Frist  |  |
|  |-----------------|----------|------------|---------|---------|--------|  |
|  | Kfz-Versicherung| Allianz  | Premium    | SF12    | EUR720/J| 30.11. |  |
|  | Hausratvers.    | HUK24    | EUR65.000  | Standard| EUR142/J| 14.02. |  |
|  | Rechtsschutz    | ARAG     | Premium    | Premium | EUR248/J| 31.08. |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  BEDARFSFELD: ABSICHERN -- Eigene Versicherungen (ERGO)                    |
|  +----------------------------------------------------------------------+  |
|  | Versicherung    | Deckung        | Tarif           | Praemie         |  |
|  |-----------------|----------------|-----------------|-----------------|  |
|  | BU              | EUR1.500/Mon.  | Premium Protect | EUR 89/Mon.     |  |
|  | Wohngebaeude    | EUR450.000     | Premium         | EUR 450/Jahr    |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  BEDARFSFELD: FINANZIEREN                                                   |
|  +----------------------------------------------------------------------+  |
|  | Kredit          | Geber     | Ursprung   | Rest      | Zins  | Rate  |  |
|  |-----------------|-----------|------------|-----------|-------|-------|  |
|  | Baufinanzierung | Sparkasse | EUR320.000 | EUR285.000| 2,85% | 1.450 |  |
|  | Konsumentenkredit| Targobank| EUR18.000  | EUR12.500 | 9,0%  | 405   |  |
|  |----------------------------------------------------------------------|  |
|  | SUMME                        | EUR297.500            |       | 1.855 |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  [!] WARNUNG: Baufinanzierung EUR285.000 ohne Risikolebensversicherung!    |
+============================================================================+
```

#### A-10 AO Tab: Potentiale

**Tab-Index:** 3

Zeigt KI-generierte Vertriebsimpulse basierend auf Open-Finance-Daten:

```
+============================================================================+
|  POTENTIALE                                                                 |
+============================================================================+
|                                                                             |
|  KATEGORIE: WHITESPOTS (Neugeschaeft)                                      |
|  ----------------------------------------------------------------          |
|                                                                             |
|  [!] Impuls 1: Risikolebensversicherung                    [HOCH]          |
|  Quelle: Open Finance                                                      |
|  +----------------------------------------------------------------------+  |
|  | Situation: Hypothek EUR285.000 ohne Restschuldversicherung            |  |
|  |            Familie mit 2 Kindern (8 und 5 Jahre)                      |  |
|  |                                                                      |  |
|  | Herleitung:                                                           |  |
|  | +------------------+------------------+------------------+            |  |
|  | | Datenquelle      | Erkannte Sit.    | Familiensituation|            |  |
|  | | Open Finance     | Hypothek ohne    | 2 Kinder,        |            |  |
|  | | Sparkasse        | Absicherung      | verheiratet      |            |  |
|  | +------------------+------------------+------------------+            |  |
|  |                                                                      |  |
|  | Empfehlung: Risikoleben EUR 285.000, Laufzeit bis 2045               |  |
|  | Geschaetzte Praemie: EUR 35-45/Monat                                 |  |
|  +----------------------------------------------------------------------+  |
|  [Angebot erstellen v] -> PDF generieren | Entwurf speichern | Tarif     |
|                                                                             |
|  [!] Impuls 2: Fondspolice                                  [HOCH]         |
|  Quelle: Open Finance                                                      |
|  +----------------------------------------------------------------------+  |
|  | Situation: Depot EUR85.000, Sparrate EUR800/Mon.                      |  |
|  |            Keine Steueroptimierung                                    |  |
|  | Empfehlung: Fondsgebundene Rentenversicherung                        |  |
|  +----------------------------------------------------------------------+  |
|  [Angebot erstellen v]                                                      |
|                                                                             |
|  ----------------------------------------------------------------          |
|  KATEGORIE: ANPASSUNGSBEDARFE (Aenderungsgeschaeft)                        |
|  ----------------------------------------------------------------          |
|                                                                             |
|  [!] Impuls 1: Kfz-Wechsel                                  [HOCH]         |
|  Quelle: Open Finance (Allianz, SF12)                                      |
|  +----------------------------------------------------------------------+  |
|  | Situation: Kfz laeuft 30.11.2025 aus                                 |  |
|  | Aktuell: Allianz, EUR720/Jahr, SF12                                  |  |
|  | Ersparnis: ca. EUR180/Jahr                                           |  |
|  |                                                                      |  |
|  | Tarifvergleich:                                                       |  |
|  | +---------------------------+---------------------------+             |  |
|  | | Allianz (aktuell)        | Unser Angebot             |             |  |
|  | | EUR 720/Jahr             | EUR 540/Jahr              |             |  |
|  | | Premium-Tarif            | Premium Protect           |             |  |
|  | | SB: EUR 300              | SB: EUR 150               |             |  |
|  | +---------------------------+---------------------------+             |  |
|  +----------------------------------------------------------------------+  |
|  [Angebot erstellen v]                                                      |
|                                                                             |
|  [!] Impuls 2: BU-Nachversicherung                          [HOCH]         |
|  +----------------------------------------------------------------------+  |
|  | Bestehende BU: EUR1.500/Mon.                                         |  |
|  | Netto-Gehalt: EUR3.680/Mon.                                          |  |
|  | Absicherungsgrad: 41% (Deckungsluecke: EUR2.180/Mon.)               |  |
|  |                                                                      |  |
|  | Visualisierung:                                                       |  |
|  | [===========>                              ] 41% abgesichert         |  |
|  | |-- BU -----|------------ Luecke ----------|                          |  |
|  |                                                                      |  |
|  | Empfehlung: BU-Erhoehung auf EUR3.700/Mon.                          |  |
|  | Mehrpraemie: ca. EUR120-150/Mon.                                    |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  [i] Impuls 3: Hausrat-Anpassung                            [MITTEL]       |
|  Mietzahlung geaendert -> Umzugs-Indiz -> Hausrat-Check empfohlen          |
|                                                                             |
|  [!] Impuls 4: Konsumentenkredit-Umschuldung                [HOCH]         |
|  +----------------------------------------------------------------------+  |
|  | Targobank Kredit: EUR12.500 Restschuld, 9,0% p.a., 36 Monate       |  |
|  | Empfehlung: Santander Consumer Bank, 4,9% p.a.                      |  |
|  | Ersparnis: EUR 756 ueber Restlaufzeit                                |  |
|  +----------------------------------------------------------------------+  |
+============================================================================+
```

#### A-10 AO Tab: Finanzplanung

**Tab-Index:** 4

Interaktiver Finanzplanungs-Tab mit Liquiditaetsanalyse und Rentensimulator:

```
+============================================================================+
|  FINANZPLANUNG                                                              |
+============================================================================+
|                                                                             |
|  MONATLICHE LIQUIDITAET                                                     |
|  +----------------------------------------------------------------------+  |
|  | Einnahmen:                                                            |  |
|  | [==========================================] Netto-Einkommen EUR4.200 |  |
|  | [===] + Variables Einkommen EUR 450                                   |  |
|  |                                                                      |  |
|  | Ausgaben:                                                             |  |
|  | [============================] - Fixkosten EUR 2.100                  |  |
|  | [============] - Variable Ausgaben EUR 850                            |  |
|  |                                                                      |  |
|  | = Freies Einkommen: EUR 1.700/Monat                                  |  |
|  | Sparquote: 37% (Benchmark: 20%)                                      |  |
|  | Bonus Sept: Durchschnittl. EUR 3.200                                  |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  SPARZIELE                                                                  |
|  +----------------------------------------------------------------------+  |
|  | 1. Neues Auto                             Ziel: Maerz 2027           |  |
|  |    Status: [Im Plan] (gruen)                                          |  |
|  |    Erreicht: EUR 8.400 / Ziel: EUR 25.000  [====>          ] 34%     |  |
|  |    Benoetigtgt/Monat: EUR 460 | Aktuell: EUR 500 [OK]                 |  |
|  |                                                                      |  |
|  | 2. Eigenkapital Immobilie                  Ziel: Dezember 2029       |  |
|  |    Status: [Anpassung noetig] (orange)                                |  |
|  |    Erreicht: EUR 15.000 / Ziel: EUR 60.000  [==>            ] 25%    |  |
|  |    Benoetigt/Monat: EUR 940 | Aktuell: EUR 500 [WARNUNG]            |  |
|  |    Empfehlung: Sparrate um EUR440 erhoehen oder Ziel auf 2031        |  |
|  |                                                                      |  |
|  | 3. Rentenluecke schliessen                 Ziel: Renteneintritt 2042 |  |
|  |    Status: [Handlungsbedarf] (orange)                                 |  |
|  |    Erreicht: EUR 42.000 / Ziel: EUR 180.000  [=>             ] 23%   |  |
|  |    Benoetigt/Monat: EUR 680 | Aktuell: EUR 400 [WARNUNG]            |  |
|  |    [Rentenluecken-Simulator oeffnen]                                  |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  RENTENLUECKEN-SIMULATOR (interaktiv)                                       |
|  +----------------------------------------------------------------------+  |
|  | Renteneintrittsalter:  [60 ----o------- 67]  Aktuell: 63             |  |
|  | Wunsch-Einkommen:      [1.500 ---o----- 4.000] EUR 2.500/Mon.       |  |
|  | Erwartete Rendite:     [2% -----o------ 8%]   4% p.a.                |  |
|  |                                                                      |  |
|  | Visualisierung:                                                       |  |
|  | [=======] Gesetzliche Rente: EUR 1.650                               |  |
|  | [       ] Rentenluecke: EUR 850/Mon.                                  |  |
|  | [=============] Wunsch-Einkommen: EUR 2.500                          |  |
|  |                                                                      |  |
|  | Ergebnis:                                                             |  |
|  | Benoetigtes Kapital: EUR 180.000                                      |  |
|  | Bereits angespart: EUR 42.000                                         |  |
|  | Noch benoetigte Sparrate: EUR 680/Mon.                                |  |
|  |                                                                      |  |
|  | Produktempfehlung: Fondsgebundene Rentenversicherung                  |  |
|  | [Angebot erstellen] [Termin vereinbaren]                               |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  SZENARIO-VERGLEICH (Chart.js Canvas)                                       |
|  +----------------------------------------------------------------------+  |
|  |    ^                                                                  |  |
|  |    |              _____--- Optimistisch (7%): EUR 231.000            |  |
|  |    |          ___/   _--- Moderat (5%): EUR 180.000                  |  |
|  |    |       __/    __/  --- Konservativ (3%): EUR 142.000             |  |
|  |    |    __/    __/                                                    |  |
|  |    | __/   __/                                                        |  |
|  |    |/   __/                                                           |  |
|  |    +---/-------------------------------------------------->           |  |
|  |    Heute                                           2042               |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  VERTRIEBSIMPULS AUS LIQUIDITAETSANALYSE                                   |
|  +----------------------------------------------------------------------+  |
|  | Situation:                                                            |  |
|  | - Freies Einkommen: EUR 1.700/Mon.                                   |  |
|  | - Sparquote: 37% | Rentenluecke: EUR 850/Mon.                        |  |
|  | - Bonus: Durchschnittl. EUR 3.200                                    |  |
|  |                                                                      |  |
|  | Empfohlene Gespraechsthemen:                                         |  |
|  | 1. Rentenluecke mit Fondspolice schliessen (EUR 680/Mon.)            |  |
|  | 2. Bonus-Verwendung optimieren (jaehrl. Sonderzahlung)               |  |
|  | 3. Immobilien-Sparziel beschleunigen (ETF-Sparplan)                  |  |
|  |                                                                      |  |
|  | [Beratungsgespraech vorbereiten] [Kunde kontaktieren]                 |  |
|  +----------------------------------------------------------------------+  |
+============================================================================+
```

#### A-10 AO Tab: Kommunikation

**Tab-Index:** 5

Zeigt die Kommunikationshistorie als Timeline:

```
+============================================================================+
|  KOMMUNIKATION                                                              |
+============================================================================+
|                                                                             |
|  KOMMUNIKATIONSHISTORIE                                                     |
|                                                                             |
|  [Email-Icon] 28.11.2025, 09:15                                            |
|  +----------------------------------------------------------------------+  |
|  | Automatische E-Mail                                                   |  |
|  | Betreff: "Kfz-Versicherung: Ihr Vertrag laeuft aus"                  |  |
|  | Status: Geoeffnet am 28.11.2025, 14:32                                |  |
|  | Preview: Kfz-Vertrag endet 30.11.2025, attraktives Angebot           |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  [Brief-Icon] 15.11.2025                                                    |
|  +----------------------------------------------------------------------+  |
|  | Automatischer Brief                                                    |  |
|  | Betreff: "Open Finance Datenfreigabe: Neue Potentiale erkannt"        |  |
|  | Status: Versendet                                                      |  |
|  | Preview: Optimierungsmoeglichkeiten basierend auf freigegebenen Daten |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  [Telefon-Icon] 10.11.2025, 11:20                                           |
|  +----------------------------------------------------------------------+  |
|  | Telefonat                                                              |  |
|  | Betreff: "Rueckruf wegen Altersvorsorge-Angebot"                      |  |
|  | Status: Termin: 12.12.2025                                             |  |
|  | Preview: Kunde interessiert an fondsgebundener Rentenversicherung      |  |
|  +----------------------------------------------------------------------+  |
|                                                                             |
|  [Email-Icon] 01.10.2025, 08:00                                             |
|  +----------------------------------------------------------------------+  |
|  | Automatische E-Mail                                                    |  |
|  | Betreff: "Willkommen bei Open Finance -- Ihre Daten sind verknuepft"  |  |
|  | Status: Geoeffnet am 01.10.2025, 19:45                                 |  |
|  | Preview: Vielen Dank fuer Open Finance Datenfreigabe                   |  |
|  +----------------------------------------------------------------------+  |
+============================================================================+
```

### Peter Schmidt -- Zusammenfassung aller Daten

| Kategorie | Feld | Wert |
|-----------|------|------|
| **Person** | Name | Peter Schmidt |
| | ID | KD00001 |
| | Geburtsdatum | 15.03.1985 (39 Jahre) |
| | Familienstand | Verheiratet |
| | Kinder | Lena (8), Paul (5) |
| | Adresse | Musterstrasse 123, 12345 Musterstadt |
| | Beruf | Angestellter |
| | Arbeitgeber | TechCorp GmbH (seit 01.03.2016) |
| **Einkommen** | Netto (fix) | EUR 3.680/Monat |
| | Netto (variabel) | EUR 154/Monat (Durchschnitt) |
| | Netto gesamt | EUR 3.834/Monat |
| | Bonus | EUR 3.200 (jaehrlich, September) |
| **Ausgaben** | Fixkosten | EUR 2.240/Monat |
| | Variable Kosten | EUR 650/Monat |
| | Gesamt | EUR 2.890/Monat |
| | Freies Einkommen | EUR 944/Monat (Sparquote ~25%) |
| **Geldmarkt** | Tagesgeld (ING DiBa) | EUR 15.400 (2,75% p.a.) |
| | Festgeld (ING DiBa) | EUR 25.000 (3,25% p.a.) |
| **Kapitalmarkt** | DWS Top Dividende | EUR 42.500, EUR 400/Mon., +8,2% |
| | iShares MSCI World | EUR 28.300, EUR 300/Mon., +12,4% |
| | UniRak | EUR 14.200, EUR 100/Mon., +5,1% |
| | **Depot gesamt** | **EUR 85.000, EUR 800/Mon., +8,9%** |
| **Eigene Vertraege** | BU (ERGO) | EUR 1.500/Mon., EUR 89/Mon. Praemie |
| | Wohngebaeude (VHV) | EUR 450.000, EUR 450/Jahr |
| **Wettbewerber** | Kfz (Allianz) | SF12, EUR 720/Jahr, laeuft 30.11.2025 |
| | Hausrat (HUK24) | EUR 65.000, EUR 142/Jahr, Standard |
| | Rechtsschutz (ARAG) | EUR 248/Jahr, Premium |
| **Verbindlichkeiten** | Baufinanzierung (Sparkasse) | EUR 285.000 Rest, 2,85%, EUR 1.450/Mon. |
| | Konsumentenkredit (Targobank) | EUR 12.500 Rest, 9,0%, EUR 405/Mon. |
| | **Summe Schulden** | **EUR 297.500, EUR 1.855/Mon.** |
| **Scores** | NPS | 7 (Passiv) |
| | CLV | EUR 12.400 |
| | Risikoscore | 72/100 |
| | Bonitaetsscore | 78/100 |

---

### A-10b Ecclesia: Institutioneller Kunde

**Einstieg:** Klick auf eine Zeile in der Ecclesia-Kundenliste (A-02b)
**Funktion:** `openMaklerKundenDetail(id)` in `makler.js`

Der gesamte A-10-Container wird wiederverwendet -- die B2B-spezifischen Inhalte werden eingeblendet und die AO-Inhalte ausgeblendet.

#### Layout A-10b

```
+============================================================================+
|  HEADER                                                                     |
|  [Gebaeude-Icon]  Klinikum Lippetal GmbH                                   |
|  Segment: [Gesundheitswesen]  |  MK-GW-001  |  Risikoklasse: B            |
|  Branche: Akutkrankenhaus | 1.800 MA | 450 Betten | 3 Standorte           |
|  Traeger: Klinikverbund Lippetal gGmbH                                     |
|  Key Contact: Dr. Thomas Weinert (CFO)                                      |
|  Kunde seit: 2008                                                           |
+============================================================================+
|  TABS: [Stammdaten] [Vertraege] [Schadenhistorie] [Deckungsluecken]        |
|        [Renewal-Ampel] [Ansprechpartner] [Potentiale]                      |
+============================================================================+
```

#### A-10b Tab: Stammdaten

Erweiterte institutionelle Stammdaten (anders als bei AO-Privatkundendaten):

| Feld | Beispiel (Klinikum Lippetal) |
|------|------------------------------|
| Name | Klinikum Lippetal GmbH |
| ID | MK-GW-001 |
| Segment | Gesundheitswesen |
| Branche | Akutkrankenhaus |
| Betten | 450 |
| Mitarbeitende | 1.800 |
| Jahresumsatz | 185 Mio. EUR |
| Standorte | 3 |
| Traeger | Klinikverbund Lippetal gGmbH |
| Key Contact | Dr. Thomas Weinert (CFO) |
| Risikoklasse | B |
| Kunde seit | 2008 |
| Praemienvolumen | 1,2 Mio. EUR |
| Vertraege | 14 |
| Schadenquote | 58% |
| Deckungsquote | 78% |

#### A-10b Tab: Vertraege (erweitert)

Detaillierte Vertragstabelle mit Versicherer-Mix:

| Nr | Sparte | Versicherer | Praemie | Deckungssumme | SB | Ablauf | SQ |
|----|--------|-------------|---------|---------------|-----|--------|-----|
| 1 | Betriebshaftpflicht | Allianz (60%) / Zurich (40%) | 285.000 | 10 Mio. | 10.000 | 31.12.26 | 58% |
| 2 | Arzthaftpflicht | EGAS (Rahmenvertrag) | 340.000 | 5 Mio. p.P. | 5.000 | 31.12.26 | 72% |
| 3 | Gebaeudeversicherung | Provinzial | 125.000 | 95 Mio. | 25.000 | 30.06.27 | 41% |
| 4 | Inhaltsversicherung | Provinzial | 48.000 | 12 Mio. | 5.000 | 30.06.27 | 28% |
| 5 | D&O | Zurich | 32.000 | 5 Mio. | 50.000 | 31.12.26 | 0% |
| 6 | Cyberversicherung | Hiscox | 45.000 | 3 Mio. | 15.000 | 31.03.26 | 0% |
| 7 | Betriebsunterbrechung | Allianz | 68.000 | 50 Mio. | 3 Tage | 31.12.26 | 15% |
| 8 | Kfz-Flotte (85 Fzg.) | Kravag | 52.000 | -- | 500 | 01.01.27 | 68% |
| 9 | Rechtsschutz | ARAG | 18.000 | 1 Mio. | 1.000 | 31.12.26 | 45% |
| 10 | Elektronikversicherung | HDI | 28.000 | 8 Mio. | 2.500 | 30.09.26 | 22% |
| 11 | Vertrauensschaden | Zurich | 12.000 | 2 Mio. | 10.000 | 31.12.26 | 0% |
| 12 | bKV (1.800 MA) | DKV | 86.000 | Budget 600/MA | -- | 31.12.26 | 82% |
| 13 | bAV (Direktversicherung) | Allianz | 42.000 | -- | -- | unbefristet | -- |
| 14 | Transportversicherung | Helvetia | 8.000 | 500.000 | 500 | 31.12.26 | 12% |

#### A-10b Tab: Schadenhistorie

5-Jahres-Schadenhistorie (Beispiel Klinikum Lippetal):

| Jahr | Anzahl | Volumen | Quote | Groesster Schaden |
|------|--------|---------|-------|-------------------|
| 2025 | 28 | 580.000 | 48% | 185.000 (Arzthaftpflicht) |
| 2024 | 34 | 720.000 | 62% | 210.000 (Arzthaftpflicht) |
| 2023 | 41 | 890.000 | 78% | 340.000 (Gebaeude - Wasserschaden) |
| 2022 | 22 | 410.000 | 36% | 95.000 (Betriebshaftpflicht) |
| 2021 | 31 | 650.000 | 58% | 280.000 (Arzthaftpflicht) |

#### A-10b Tab: Deckungsluecken

| Risiko | Status | Empfehlung | Prioritaet |
|--------|--------|-----------|-----------|
| Umwelthaftpflicht | Nicht versichert | Separate Police (Labor, Gefahrstoffe) | **Hoch** |
| Maschinenbruch (med. Grossgeraete) | Nicht separat versichert | MRT, CT, OP-Robotik absichern | **Hoch** |
| Epidemie-/Pandemie-BU | Sublimit erschoepft | Deckungserweiterung pruefen | Mittel |
| Organhaftpflicht (Aufsichtsrat) | Nicht versichert | Separate OR-D&O empfohlen | Mittel |
| Drohnen-Haftpflicht (Helipad) | Nicht geprueft | Neue Risikokategorie evaluieren | Niedrig |

#### A-10b Tab: Renewal-Ampel

Ampelsystem fuer anstehende Vertragsverlaengerungen des Kunden:

| Vertrag | Ablaufdatum | Status | Handlungsbedarf |
|---------|------------|--------|-----------------|
| Cyberversicherung (Hiscox) | 31.03.2026 | ROT | Erneuerung einleiten! |
| Betriebshaftpflicht | 31.12.2026 | GRUEN | In Planung |
| Arzthaftpflicht | 31.12.2026 | GRUEN | Rahmenvertrag aktiv |

#### A-10b Tab: Ansprechpartner

Kontaktpersonen der Institution mit Rollen und Zustaendigkeiten.

#### A-10b Tab: Potentiale

Cross-Selling und Upselling fuer den institutionellen Kunden.

---

### A-10c MRH: Gewerbekunden-Detail

**Einstieg:** Klick auf eine Zeile in der MRH-Kundenliste (A-02c)
**Funktion:** `openMRHKundenDetail(id)` in `mrh-trowe.js`

#### Layout A-10c

```
+============================================================================+
|  HEADER                                                                     |
|  [Branchen-Icon]  Rhein-Main Maschinenbau GmbH                             |
|  Specialty: [Maschinenbau]  |  MRH-001  |  B2B                             |
|  Branche: Sondermaschinenbau | 340 MA | 78 Mio. EUR Umsatz                 |
|  Standorte: Frankfurt, Hanau, Bratislava                                    |
|  Eigentuemer: Familienbesitz (3. Generation)                                |
|  Key Contacts: CFO Markus Schaefer, Prokuristin Lisa Wendel, BR Juergen K. |
+============================================================================+
|                                                                             |
|  DREI-SAEULEN-KARTEN                                                       |
|  +--------------------+ +--------------------+ +--------------------+       |
|  | INSURANCE     [I]  | | BENEFITS      [B]  | | FINANCE       [F]  |       |
|  | Blau              | | Gruen              | | Orange             |       |
|  |                    | |                    | |                    |       |
|  | Praemie: 420.000  | | Status: INAKTIV    | | Kreditvers:        |       |
|  | Vertraege: 11     | | bAV-Vol: --        | |  Euler Hermes      |       |
|  | Renewal: 01.04.26 | | Durchdringung: 0%  | |  (Obligo 12 Mio.)  |       |
|  | Status: GELB      | | Hinweis: Cross-    | | Avale: 2x 500k     |       |
|  |                    | | Sell-Potential hoch | | Leasing: CNC 1,4M  |       |
|  | Berater:           | | (340 MA)           | | Courtage: 45.000   |       |
|  | Frank Moser        | | Berater: --        | | Berater: N. Hecht  |       |
|  +--------------------+ +--------------------+ +--------------------+       |
|                                                                             |
+============================================================================+
|  TABS: [Stammdaten] [Vertraege] [Schadenhistorie] [Deckungsluecken]        |
|        [Beziehung-Timeline] [Ansprechpartner]                              |
+============================================================================+
```

**Besonderheit:** Die drei Saeulen-Karten im oberen Bereich zeigen auf einen Blick, welche Saeulen aktiv sind. Inaktive Saeulen (hier: Benefits) werden als Cross-Sell-Potential hervorgehoben.

#### A-10c Tab: Vertraege (3-Saeulen)

Vertraege werden mit einer **Saeulen-Spalte** (I/B/F) dargestellt:

| Sparte | Versicherer | Praemie | DS | Ablauf | Saeule |
|--------|-------------|---------|-----|--------|--------|
| Betriebshaftpflicht | Allianz | 95.000 | 1,8 Mio. | 01.04.2026 | **I** |
| Sach/Feuer | Zurich | 78.000 | 45 Mio. | 31.12.2026 | **I** |
| Maschinenbruch | HDI | 42.000 | 8 Mio. | 31.12.2026 | **I** |
| D&O | AIG | 28.000 | 5 Mio. | 31.12.2026 | **I** |
| Cyber | Hiscox | 35.000 | 3 Mio. | 30.06.2026 | **I** |
| Kfz-Flotte (38 Fzg.) | Helvetia | 48.000 | -- | 01.01.2027 | **I** |
| Kreditversicherung | Euler Hermes | 38.000 | 12 Mio. Obligo | 31.12.2026 | **F** |

#### A-10c Tab: Beziehung-Timeline

Chronologisches Aktivitaetsprotokoll aller Saeulen:

| Datum | Saeule | Text | Person |
|-------|--------|------|--------|
| 10.01.2026 | Insurance | Renewal-Gespraech BH vorbereitet | Frank Moser |
| 15.12.2025 | Finance | CNC-Leasing-Anfrage eingegangen | Nina Hecht |
| 20.11.2025 | Insurance | Cyber-Vorfall gemeldet & reguliert | Frank Moser |

Jeder Eintrag zeigt die Saeule farbcodiert (I=blau, B=gruen, F=orange).

---

## KI-Chatbot (Vertriebs-Assistent)

Der Vertriebs-Assistent ist ein **kontextabhaengiger KI-Chat**, der als Floating Widget in der A-02-Ansicht erscheint. Er passt seine Antworten automatisch an den aktiven Modus (AO/Ecclesia/MRH) an.

### Chatbot-Architektur

#### Technische Implementierung

| Komponente | Beschreibung |
|------------|-------------|
| **HTML-Toggle** | `<button id="agenturChatToggle">` -- Runder Button (60px), fixed bottom-right |
| **HTML-Widget** | `<div id="agenturChatWidget">` -- 420x560px, fixed bottom-right |
| **JS-Logik** | `agentur-overview.js`: Funktionen `sendAgenturChat()`, `askAgenturQuestion()`, `getAgenturChatResponse()` |
| **API-Config** | `chat.js`: Cloudflare Worker URL, Claude Haiku 4.5 Modell |
| **Mock-Modus** | Im A-02 Chat: **immer Mock-Modus** (kein API-Call). Echte API nur auf T-05 (Dokumentenassistent) |

#### Ablauf einer Chat-Interaktion

```
1. User tippt Frage oder klickt Vorschlags-Button
         |
         v
2. sendAgenturChat() oder askAgenturQuestion(text)
         |
         v
3. User-Nachricht wird als Blase angezeigt
         |
         v
4. Typing-Indikator (3 animierte Punkte) wird gezeigt
         |
         v
5. Nach 1-2 Sekunden: getAgenturChatResponse(question)
         |
         +---> Prueft viewMode: 'ao' | 'ecclesia' | 'mrh'
         |
         +---> Keyword-basiertes Matching der Frage
         |
         v
6. Mock-Antwort wird als Bot-Blase angezeigt
         |
         v
7. Follow-up-Vorschlaege werden als klickbare Buttons eingeblendet
```

#### Widget-Design

```
+----------------------------------+
| [Zahnrad]  Vertriebs-Assistent [X]|  <-- Header (Gradient #86BC25)
|----------------------------------|
|                                  |
| Vertriebs-Assistent              |  <-- Welcome-Screen
| Fragen Sie mich zu Kunden,       |     (nur bei erstem Oeffnen)
| Potentialen oder Vertriebsdaten. |
|                                  |
| [Auslaufende Vertraege]          |  <-- 5 Vorschlags-Buttons
| [LV-Potenziale anzeigen]         |     (2-Spalten-Grid)
| [Neue Potentiale]                |
| [Meine Abschlussquote]           |
| [Vertriebsbericht]               |
|                                  |
|----------------------------------|
| [Frage stellen...        ] [-->] |  <-- Input-Area
+----------------------------------+
```

Im **MRH-Modus** wird die Welcome-Message ersetzt durch:
```
Gewerbemakler 360 Assistent
Fragen Sie mich zu Kunden, Renewals, Bestand oder Potentialen.
[Q2 Renewals] [Neue Potentiale] [Bestand]
```

#### CSS-Styling des Widgets

| Element | Eigenschaft | Wert |
|---------|------------|------|
| Toggle-Button | Position | Fixed, bottom: 24px, right: 24px |
| | Groesse | 60px rund |
| | Hintergrund | Gradient #86BC25 -> #6B9A1F |
| | Badge | Dunkel (#1e293b) mit "KI" Text |
| | Hover | Scale 1.1x |
| Widget | Groesse | 420px breit x 560px hoch |
| | Hintergrund | Weiss, border-radius: 16px |
| | Schatten | 0 10px 50px rgba(0,0,0,0.2) |
| Header | Hintergrund | Gradient #86BC25 -> #6B9A1F |
| Vorschlags-Buttons | Layout | 2-Spalten-Grid, max-width: 280px |
| | Hover | Gruen (#86BC25), weisser Text |
| Send-Button | Groesse | 40px rund, gruen (#86BC25) |

### Chatbot AO-Antworten

Im AO-Modus reagiert der Chat auf folgende Keywords und liefert vordefinierte Mock-Antworten:

#### 1. Ablaufende Vertraege

**Trigger:** "ablaufend", "30 tag", "vertrag" + "lauf"

**Antwort:**
```
Ablaufende Vertraege (naechste 60 Tage):

1 Eigener Vertrag zur Verlaengerung:
  [Amira Koenig -> KD00002] Risikoleben bei ERGO (Datum +21 Tage)
  -> Vertragsverlaengerung vorbereiten, Beitragsanpassung +3.2% kommunizieren

2 Wettbewerber-Vertraege mit Wechselpotential:
  [Peter Schmidt -> KD00001] Kfz bei Allianz (Datum +45 Tage)
  -> SF12, EUR720/Jahr, Wechselangebot mit EUR180 Ersparnis moeglich

  [Peter Schmidt -> KD00001] Hausrat bei HUK24 (Datum +60 Tage)
  -> Standard EUR142/Jahr, Premium-Upgrade empfohlen
```

Jeder Kundenname ist ein **klickbarer Button**, der direkt die Kunden-Detailansicht (A-10) oeffnet und optional zum passenden Tab springt.

#### 2. Cross-Selling Lebensversicherung

**Trigger:** "cross-selling", "lebensversicherung", "potential"

**Antwort:**
```
Cross-Selling-Potential Lebensversicherung:

2 Kunden ohne LV-Absicherung trotz Bedarf:
  [Peter Schmidt -> KD00001] (45 J.) - BU vorhanden, keine Risikoleben
  -> Baufinanzierung EUR285.000, Absicherung dringend empfohlen

  [Amira Koenig -> KD00002] (38 J.) - 2 Kinder, selbststaendig
  -> Geschaetzte Praemie: EUR1.200/Jahr

Gesamtpotential: EUR3.000/Jahr
```

#### 3. FIDA-Faelle

**Trigger:** "fida"

**Antwort:**
```
FIDA-Faelle diese Woche:

2 offene Anfragen mit Frist:
  Allianz Anfrage - [Peter Schmidt -> KD00001]
  -> Frist: +3 Tage | Status: In Bearbeitung

  AXA Anfrage - [Thomas Weber -> KD00003]
  -> Frist: +5 Tage | Status: Neu

Empfehlung: AXA-Anfrage priorisieren
```

#### 4. Abschlussquote

**Trigger:** "abschlussquote", "vergleich", "quote"

**Antwort:**
```
Abschlussquote im Vergleich:

Aktueller Monat: 68% (12 von 18 Angeboten)
Vormonat: 62% (10 von 16 Angeboten)
Veraenderung: +6 Prozentpunkte

Staerkste Sparten:
- Kfz: 78% Abschlussquote
- Hausrat: 71% Abschlussquote
- BU: 45% Abschlussquote (unter Durchschnitt)
```

#### 5. Fallback (alle anderen Fragen)

Zeigt die Follow-up-Vorschlaege mit Themenvorschlaegen.

### Chatbot B2B-Antworten (Ecclesia)

Im Ecclesia-Modus (`maklerModus === true`) werden andere Mock-Antworten geliefert:

#### 1. Renewals

**Trigger:** "renewal", "ablaufend", "vertrag" + "lauf", "30 tag"

**Antwort:**
```
Anstehende Renewals (naechste 90 Tage):

Kritisch (<=30 Tage):
  [Klinikum Lippetal -> MK-GW-001] Cyberversicherung (Hiscox) - 31.03.2026
  -> 45.000 EUR Praemie, Erneuerung dringend einleiten

Bald faellig (31-90 Tage):
  [Kirchenkreis Auental -> MK-KI-003] Gebaeude-Rahmenvertrag - 01.04.2026
  -> 620.000 EUR Gesamtpraemie, Verhandlungen vorbereiten

  [Lippeland Fracht -> MK-TL-003] 3 Vertraege - 01.04.2026
  -> 190.000 EUR Praemie, Buendelung pruefen
```

#### 2. Deckungsluecken

**Trigger:** "deckungsluecke", "luecke"

**Antwort:**
```
Deckungsluecken-Analyse:

5 Kunden mit hoher Prioritaet:
  [Klinikum Lippetal] 5 Deckungsluecken
  -> Umwelthaftpflicht & Maschinenbruch fehlen

  [Reha-Klinik Teutoburg] 2 Deckungsluecken
  -> Cyberversicherung & D&O fehlen komplett

  [Ev. Landeskirche Teutoburg] 2 Deckungsluecken
  -> Cyber nur teilweise, Missbrauchspraevention in Pruefung

Geschaetztes Neugeschaeft: ~850.000 EUR p.a.
```

#### 3. Cross-Selling-Potentiale B2B

**Trigger:** "cross-selling", "potential"

**Antwort:**
```
Top 3 nach Praemienvolumen:
  [Ev. Landeskirche] Cyber-Rahmenvertrag
  -> 1.900 Kirchengemeinden, geschaetzt 1,0 Mio. EUR Praemie

  [Nordlicht Automatisierung] Erweiterte Produkthaftpflicht
  -> Internationale Produktrueckruf-Absicherung, ~570.000 EUR p.a.

  [Klinikum Lippetal] Umwelthaftpflicht + Maschinenbruch
  -> Med. Grossgeraete & Labor, ~190.000 EUR p.a.

Gesamtpotential: ~1,8 Mio. EUR p.a.
```

#### 4. Schadenquoten

**Trigger:** "schadenquote", "schaden", "quote"

**Antwort:**
```
Portfolio gesamt: 62% (Ziel: <65%)
Vorjahr: 58%

Auffaellige Kunden:
  [Weserland Spedition] SQ 62% -> Kfz-Flotte auffaellig
  [Klinikum Lippetal] SQ 58% -> Arzthaftpflicht steigend
  [Teutoburger Maschinenbau] SQ 55% -> BU-Praevention besprechen
```

### Chatbot MRH-Antworten

Im MRH-Modus (`viewMode === 'mrh'`) gibt es separate Mock-Antworten:

#### 1. Renewals MRH

**Trigger:** "renewal", "ablaufend"

```
Anstehende Renewals (naechste 90 Tage):
  [Rhein-Main Maschinenbau] BH-Renewal 01.04.2026
  -> Allianz hat +15% angekuendigt, Alternativangebote einholen

  [Rhein-Main Verkehr] Flotte + BH OEPNV 01.07.2026
  -> 1,45 Mio. Praemie, groesstes Renewal des Halbjahres
```

#### 2. Bestandsuebersicht MRH

**Trigger:** "bestand"

```
Gesamtbestand Niederlassung Rhein-Main: 42,3 Mio. EUR (+6,1% YoY)

Top-Kunden:
  [Nordpark Projektentwicklung] 680.000 EUR
  [Rhein-Main Maschinenbau] 420.000 EUR
  [Rhein-Main Verkehr] 380.000 EUR
```

### Chatbot Follow-up-Vorschlaege

Nach jeder Antwort werden klickbare **Follow-up-Buttons** angezeigt:

**AO-Modus:**
```
[Welche Vertraege laufen bald aus?]
[Wer hat Cross-Selling-Potential?]
[Neue Potentiale?]
[Vertriebsbericht]  <-- mit Dokument-Icon
```

**B2B-Modus:**
```
[Welche Renewals stehen an?]
[Deckungsluecken anzeigen]
[Cross-Selling Potentiale?]
[Schadenquoten-Uebersicht]
```

**MRH-Modus:**
```
[Q2 Renewals]
[Deckungsluecken anzeigen]
[Bestandsuebersicht]
[Neue Potentiale?]
```

### Chatbot-Spezialfunktionen

#### 1. "Neue Potentiale" -- Sequenzielle Animation

Die Funktion `showNeuePotentiale()` zeigt Potentiale **nacheinander** mit Animation ein:

1. Chat oeffnet sich (falls geschlossen)
2. User-Nachricht "Neue Potentiale?" wird angezeigt
3. Typing-Indikator (1,5 Sekunden)
4. Potentiale werden einzeln eingeblendet (400ms Delay pro Eintrag)
5. Jedes Potential faded-in mit translateY-Animation
6. Nach dem letzten Potential: Hinweis + Follow-up-Buttons
7. Automatischer Tab-Wechsel zum Potentiale-Tab (nach 1,5 Sekunden)

**AO-Potentiale:**
- Peter Schmidt: Risikoleben fehlt (Baufinanzierung EUR285.000)
- Peter Schmidt: BU-Nachversicherung (nur 41% abgesichert)
- Amira Koenig: Kfz-Wechsel (EUR200/Jahr Ersparnis)
- Thomas Weber: Risikoleben fehlt (Familie unzureichend abgesichert)

**B2B-Potentiale:**
- Klinikum Lippetal: Umwelthaftpflicht fehlt
- Klinikum Lippetal: Cyber-Renewal in 30 Tagen
- Reha-Klinik Teutoburg: Cyberversicherung fehlt
- Ev. Landeskirche: Cyber-Rahmenvertrag (12,5 Mio. Bestand)
- Teutoburger Maschinenbau: 3 Renewals in 90 Tagen

**MRH-Potentiale:**
- Rhein-Main Maschinenbau: bAV fehlt (340 MA Cross-Sell)
- Rhein-Main Maschinenbau: Renewal BH 01.04.2026 (+15% Allianz)
- Hessenlog Spedition: bAV fehlt (210 MA, Bindungsmodell)
- DigiCore Solutions: Kreditversicherung pruefen (SaaS international)
- Rhein-Main Verkehr: Renewal Flotte + BH 01.07.2026 (1,45 Mio.)

#### 2. "Vertriebsbericht" -- Navigation

Die Funktion `goToSalesReport()`:
1. Zeigt User-Nachricht "Vertriebsbericht"
2. Typing-Indikator (1,5 Sekunden)
3. Bot-Antwort: "Vertriebsbericht wird geladen..."
4. Navigiert zum Dashboard (A-03) mit Vertriebsbericht-Filter

#### 3. Chat-zu-Kundendetail Navigation

Kundennamen in Chat-Antworten sind als Buttons implementiert:
- Klick ruft `openKundenDetailFromChat(kundenId, targetTab, contractType)` auf
- Oeffnet A-10 mit dem richtigen Kunden
- Springt optional zum angegebenen Tab (z.B. 'fida', 'vertraege')
- Highlightet optional eine Vertragszeile fuer 2 Sekunden (`highlightContractRow()`)

---

## Modus-Umschaltung

### Toggle-Position

Oben rechts im Header der A-02-Ansicht befindet sich ein 3-Wege-Schalter:

```
+-------------------------------------------------------+
| [ Privatkunde (AO) ] | [ Makler B2B ] | [ Gewerbe 360 ] |
+-------------------------------------------------------+
```

### Technischer Ablauf

```
Benutzer klickt Toggle-Button
        |
        v
setViewMode('ao' | 'ecclesia' | 'mrh')      <-- mrh-trowe.js
        |
        +-- viewMode = mode (globale Variable)
        +-- Update Toggle-Buttons (CSS active-Klasse)
        +-- maklerModus synchronisieren (Legacy-Compat)
        |
        v
applyViewMode()
        |
        +-- if 'ao':       applyAOModus()
        +-- if 'ecclesia':  applyMaklerModus()
        +-- if 'mrh':       applyMRHModus()
        |
        v
Jede apply-Funktion macht:
   |-- KPI-Boxen austauschen (3 Container: default, maklerKpis, mrhKpis)
   |-- Header aktualisieren (Titel, Untertitel, Foto/Icon)
   |-- Tabs ein-/ausblenden (agentur-tab, agentur-tab-makler, agentur-tab-mrh)
   |-- Kundenliste wechseln (tab-kundenliste, tab-kundenliste-makler, tab-kundenliste-mrh)
   |-- Tab-Inhalte ein-/ausblenden (agentur-tab-content, makler-tab-content, mrh-tab-content)
   +-- Chat-Welcome-Message anpassen (AO vs. MRH)
        |
        v
Falls A-10 geoeffnet: closeKundenDetail() + zurueck zu A-02
        |
        v
URL-Route aktualisieren: AppRouter.navigate('/agentur' | '/agentur-b2b' | '/agentur-gewerbe')
        |
        v
localStorage.setItem('viewMode', mode)      <-- persistiert ueber Sessions
```

### State-Variablen

| Variable | Typ | Speicherung | Zweck |
|----------|-----|-------------|-------|
| `viewMode` | `'ao' \| 'ecclesia' \| 'mrh'` | localStorage + RAM | Aktiver Vertriebskanal |
| `maklerModus` | Boolean | localStorage + RAM | Legacy-Kompatibilitaet (= `viewMode === 'ecclesia'`) |
| `currentAgenturIdInOverview` | String | RAM | Aktuell geladener Vermittler in A-02 |
| `currentKundenVermittlerId` | String | RAM | Vermittler-ID des geoeffneten Kunden in A-10 |
| `fidaActiveInPotentialAnalyse` | Boolean | RAM | FIDA-Aktivierung bei Navigation aus A-05 |
| `previousViewBeforeKundenDetail` | String | RAM | Navigationshistorie fuer Zurueck-Button |

---

## Navigationsfluss

### Gesamtnavigation A-02 zu A-10

```
Landing Page (M-01)
    |
    |  [Klick: Agentur-Kachel]
    v
A-02: Vermittler-Uebersicht
    |-- Header mit KPIs (je nach Modus)
    |-- 9-10 Tabs (je nach Modus)
    |-- Kundenliste (Tab "Kunden")
    +-- KI-Chat-Assistent (Floating Widget)
    |
    |  [Klick: Kundenname in Liste]
    |  oder [Klick: Potential-Card]
    |  oder [Klick: Kundenname im Chat]
    v
A-10: Kunden-Detail
    |-- Sticky Bar (Name, NPS, CLV, Segment)
    |-- 6-7 Tabs (je nach Modus)
    |-- Potentiale mit Angebotserstellung
    |-- Finanzplanung mit Simulator
    +-- Kommunikationshistorie
    |
    |  [Klick: "Zurueck"-Button]
    v
Zurueck zu A-02 (gleicher Modus, gleicher Scroll-Zustand)
```

### Modus-Vererbung

Der Modus wird bei Navigation von A-02 zu A-10 automatisch vererbt:
- A-02 (AO) -> A-10 (AO): Privatkunden-Detail
- A-02b (Ecclesia) -> A-10b (Ecclesia): Institutionelles Detail
- A-02c (MRH) -> A-10c (MRH): Gewerbekunden-Detail

Ein **Moduswechsel waehrend A-10** schliesst die Detailansicht automatisch und navigiert zurueck zu A-02 im neuen Modus.

### Deep-Linking

Alle Ansichten sind per URL-Hash direkt erreichbar:

| URL | Ansicht |
|-----|---------|
| `kiarbeitsplatz.pages.dev/#/agentur` | A-02 AO |
| `kiarbeitsplatz.pages.dev/#/agentur-b2b` | A-02b Ecclesia |
| `kiarbeitsplatz.pages.dev/#/agentur-gewerbe` | A-02c MRH |
| `kiarbeitsplatz.pages.dev/#/kundendetail` | A-10 (redirect zu A-02) |
| `kiarbeitsplatz.pages.dev/#/kundendetail-b2b` | A-10b (redirect zu A-02b) |
| `kiarbeitsplatz.pages.dev/#/kundendetail-gewerbe` | A-10c (redirect zu A-02c) |

Der Router (`router.js`) versucht Deep-Links in mehreren Intervallen aufzuloesen (100ms, 500ms, 1.5s, 3s, 5s), um sicherzustellen dass alle Module geladen sind.

---

## KPI-Vergleich nach Modus

| | AO (A-02) | Ecclesia B2B (A-02b) | MRH 360 (A-02c) |
|---|---|---|---|
| **KPI 1** | Gesamtbestand | Bestandspraemie (68,5 Mio.) | Insurance Courtage (3,8 Mio.) |
| **KPI 2** | Neugeschaeft YTD | Neugeschaeft (4,2 Mio.) | Benefits Courtage (1,4 Mio.) |
| **KPI 3** | Storno-Quote | Courtage (5,8 Mio.) | Finance Courtage (0,6 Mio.) |
| **KPI 4** | Zielerreichung (Gauge) | Retention (97,2%) | Gesamt-Courtage (5,8 Mio.) |
| **KPI 5** | -- | Schadenquote (62%) | Retention (94,2%) |
| **Anzahl** | 4 | 5 | 5 |
| **Ausrichtung** | Volumen + Qualitaet | Praemie + Retention | Saeulen-Courtage |

---

## Tab-Vergleich nach Modus

### A-02 Tabs

| AO (9 Tabs) | Ecclesia B2B (10 Tabs) | MRH 360 (10 Tabs) |
|----|-------------|------------|
| Uebersicht | Uebersicht | Uebersicht |
| Stammdaten | Stammdaten | Stammdaten |
| Neugeschaeft | Neugeschaeft | Neugeschaeft |
| Bestand | Bestand | Bestand |
| **Storno** | **Versicherer-Mix** | **Versicherer-Mix** |
| **Verguetung** | **Renewals** | **Renewals** |
| **Qualitaet** | **Schaeden** | **Schaeden** |
| -- | **Deckungsluecken** | **Deckungsluecken** |
| *Kunden* | *Kunden* | *Kunden* |
| *Potentiale* | *Potentiale* | *Potentiale* |

*Kursiv = Sekundaer-Tabs nach Divider. **Fett** = Modus-spezifisch.*

### A-10 Tabs

| AO (6 Tabs) | Ecclesia B2B (7 Tabs) | MRH 360 (6 Tabs) |
|----|-------------|------------|
| Stammdaten | Stammdaten | Stammdaten |
| Betreute Vertraege | Vertraege (erweitert) | Vertraege (3-Saeulen) |
| **Open Finance (FIDA)** | **Schadenhistorie** | **Schadenhistorie** |
| **Potentiale** | **Deckungsluecken** | **Deckungsluecken** |
| **Finanzplanung** | **Renewal-Ampel** | **Beziehung-Timeline** |
| **Kommunikation** | **Ansprechpartner** | **Ansprechpartner** |
| -- | **Potentiale** | -- |

---

## Technische Architektur

### Kern-Funktionen

**A-02 (agentur-overview.js -- 2.228 Zeilen):**

| Funktion | Aufgabe |
|----------|---------|
| `showAgenturOverview(id)` | Oeffnet A-02 fuer einen Vermittler |
| `loadAgenturData(id)` | Laedt Vermittlerdaten (Mock) |
| `fillCockpitKPIs()` | Befuellt die 4 KPI-Boxen |
| `fillHeader(agentur, data)` | Setzt Header-Infos (Name, ID, Foto) |
| `showAgenturTab(tabName)` | AO-Tab-Wechsel |
| `sendAgenturChat()` | Chat-Nachricht senden |
| `askAgenturQuestion(text)` | Vordefinierte Frage stellen |
| `getAgenturChatResponse(q)` | Mock-Antwort generieren (alle 3 Modi) |
| `openKundenDetailFromChat(id, tab, type)` | Kunden-Detail aus Chat oeffnen |
| `highlightContractRow(type)` | Vertragszeile highlighten |
| `toggleAgenturChat()` | Chat-Widget ein-/ausblenden |
| `showNeuePotentiale()` | Potentiale mit Animation anzeigen |
| `goToSalesReport()` | Zum Vertriebsbericht navigieren |
| `toggleVertriebsPeriod(period)` | Kennzahlen Woche/Monat umschalten |
| `filterKundenliste(text)` | Kundenliste durchsuchen |
| `resetDemoData()` | localStorage loeschen + Reload |

**A-10 (kunden-detail.js -- 1.370 Zeilen):**

| Funktion | Aufgabe |
|----------|---------|
| `openKundenDetail(name, id)` | Oeffnet Kunden-Detail, speichert Kontext |
| `fillKundenDetail(name, id)` | Befuellt alle Tab-Inhalte |
| `closeKundenDetail()` | Zurueck zu A-02, stellt vorherigen View wieder her |
| `initKundenFidaState()` | FIDA-Status aus A-05 uebernehmen |

**B2B-Modus (makler.js -- 2.293 Zeilen):**

| Funktion | Aufgabe |
|----------|---------|
| `toggleMaklerModus()` | Legacy-Toggle (delegiert an `setViewMode`) |
| `applyMaklerModus()` | A-02b UI anwenden (KPIs, Tabs, Header, Listen) |
| `showMaklerTab(tabName)` | B2B-Tab anzeigen + Lazy-Render |
| `openMaklerKundenDetail(id)` | A-10b oeffnen |
| `fillMaklerDetail(kunde)` | A-10b mit institutionellen Daten befuellen |
| `restoreMaklerKundenDetail()` | Zurueck zu AO-Ansicht bei Moduswechsel |
| `renderMaklerUebersicht()` | Uebersichts-Tab generieren |
| `renderMaklerStammdaten()` | Stammdaten-Tab generieren |
| `renderMaklerNeugeschaeft()` | Neugeschaeft-Tab generieren |
| `renderMaklerBestand()` | Bestand-Tab generieren |
| `renderMaklerVersichererMix()` | Versicherer-Mix-Tab generieren |
| `renderMaklerRenewals()` | Renewals-Tab generieren |
| `renderMaklerSchaden()` | Schaden-Tab generieren |
| `renderMaklerDeckungsluecken()` | Deckungsluecken-Tab generieren |
| `renderMaklerPotentiale()` | Potentiale-Tab generieren |

**MRH-Modus (mrh-trowe.js -- 1.405 Zeilen):**

| Funktion | Aufgabe |
|----------|---------|
| `setViewMode(mode)` | Globaler 3-Wege-Modus-Wechsel |
| `applyViewMode()` | Delegiert an applyAOModus/applyMaklerModus/applyMRHModus |
| `applyAOModus()` | AO-UI wiederherstellen |
| `applyMRHModus()` | A-02c UI anwenden |
| `showMRHTab(tabName)` | MRH-Tab anzeigen + Lazy-Render |
| `openMRHKundenDetail(id)` | A-10c oeffnen |
| `fillMRHDetail(kunde)` | A-10c mit 3-Saeulen-Daten befuellen |
| `renderMRHUebersicht()` | 3-Saeulen-Dashboard generieren |
| `renderMRHKundenliste()` | MRH-Kundentabelle generieren |
| `filterMRHKundenliste(text)` | MRH-Kundenliste durchsuchen |
| `renderMRHStammdaten()` | Stammdaten-Tab generieren |
| `renderMRHNeugeschaeft()` | Neugeschaeft-Tab generieren |
| `renderMRHBestand()` | Bestand-Tab generieren |
| `renderMRHVersichererMix()` | Versicherer-Mix-Tab generieren |
| `renderMRHRenewals()` | Renewals-Tab generieren |
| `renderMRHSchaden()` | Schaden-Tab generieren |
| `renderMRHDeckungsluecken()` | Deckungsluecken-Tab generieren |
| `renderMRHPotentiale()` | Potentiale-Tab generieren |

### Routing (router.js -- 229 Zeilen)

Hash-basiertes Routing mit Deep-Link-Unterstuetzung:

| Methode | Aufgabe |
|---------|---------|
| `Router.init()` | Initialisiert Routing, erkennt Deep-Links |
| `Router.navigate(hash)` | Navigiert zu Route, aktualisiert URL + History |
| `Router.handleHashChange()` | Reagiert auf Browser-Back/Forward |
| `Router.navigateToView(viewName)` | Ruft die View-Funktion auf |
| `Router.isDeepLink()` | Prueft ob ein Deep-Link erkannt wurde |
| `Router.getCurrentRoute()` | Gibt aktuelle Route zurueck |
| `Router.getHashForView(name)` | Gibt Hash fuer einen View-Namen zurueck |

### Page-ID-Tracker (page-id-tracker.js -- 487 Zeilen)

| Methode | Aufgabe |
|---------|---------|
| `PageIDTracker.init()` | Initialisiert Observer und Events |
| `PageIDTracker.updatePageId()` | Ermittelt und setzt aktuelle Page-ID |
| `PageIDTracker.getCurrentModule()` | Erkennt aktives Modul anhand sichtbarer Container |
| `PageIDTracker.getCurrentView()` | Erkennt aktive View innerhalb des Moduls |
| `PageIDTracker.setPageId(id)` | Setzt Page-ID mit Scale-Animation |
| `PageIDTracker.getPageId()` | Gibt aktuelle Page-ID zurueck |

---

## Dateistruktur

### JavaScript (ca. 7.300 Zeilen fuer A-02/A-10)

```
js/
+-- agentur-overview.js     2.228 Zeilen   A-02 Kernlogik + KI-Chat (alle 3 Modi)
+-- kunden-detail.js        1.370 Zeilen   A-10 Kernlogik (AO-Modus)
+-- makler.js               2.293 Zeilen   A-02b + A-10b (Ecclesia B2B)
+-- mrh-trowe.js            1.405 Zeilen   A-02c + A-10c (MRH Gewerbe 360)
+-- router.js                 229 Zeilen   Hash-basiertes URL-Routing
+-- page-id-tracker.js        487 Zeilen   Page-ID-Verwaltung
+-- config.js                 148 Zeilen   KPI-Definitionen, Silo-/Segmentfaktoren
+-- user-mode.js              421 Zeilen   Benutzer-/Rollenverwaltung
+-- chat.js                   ~800 Zeilen  KI-Chat-Logik (API + Mock-Modus Config)
+-- data.js                   Zeilen       State Management, Datenaggregation
+-- main.js                   Zeilen       Dashboard-Initialisierung
+-- landing.js                Zeilen       Landing-Page-Logik
```

### CSS

```
css/
+-- styles.css               Shared Styles, Header, Tabs (~150 Zeilen relevant)
+-- agentur-fachkonzept.css   A-02 Detail-Styling, Chat-Widget (1.386 Zeilen)
+-- makler.css                B2B-Tabs, Stammdaten, KPI-Boxen, Segment-Icons
+-- mrh-trowe.css             3-Saeulen-Karten, Beziehungs-Timeline, Branchen-Badges
+-- kunden-detail.css         A-10 spezifische Styles, Tabs, Vertraege-Tabellen
+-- kunde-sticky-bar.css      Sticky Bar oben in A-10 (NPS-Badge, Quick Actions)
+-- variables.css             Design-Tokens (Farben, Abstande, Schatten)
```

### HTML (index.html -- 498 KB)

```
index.html
+-- <div id="agenturOverview">             Zeilen 530-3512    A-02 Container
+-- <button id="agenturChatToggle">        Zeile 3515         Chat-Toggle (ausserhalb!)
+-- <div id="agenturChatWidget">           Zeilen 3522-3560   Chat-Widget (ausserhalb!)
+-- <div id="kundenDetailPage">            Zeilen 3565-5907   A-10 Container
    +-- Shared Header                      Zeilen 3567-3643
    +-- Sticky Bar                         Zeilen 3647-3672
    +-- Tab Navigation                     Zeilen 3710-3752
    +-- Tab 1: Stammdaten                  Zeilen 3756-4063
    +-- Tab 2: Betreute Vertraege          Zeilen 4067-4146
    +-- Tab 3: Open Finance (FIDA)         Zeilen 4149-4582
    +-- Tab 4: Potentiale                  Zeilen 4585-5201
    +-- Tab 5: Finanzplanung               Zeilen 5205-5680
    +-- Tab 6: Kommunikation               Zeilen 5683-5837
    +-- B2B-Tabs (hidden)                  Zeilen 5841-5903
```

---

## Integration mit anderen Modulen

```
                    M-01 (Landing Page)
                         |
          +--------------+--------------+
          |              |              |
       A-03           A-02          A-05
    Dashboard    Vermittler-     Potential-
   (9 KPI-Boxen) Uebersicht     analyse
          |              |              |
          |         +---------+         |
          |         |         |         |
          +-------> A-10 <----+---------+
                Kunden-Detail
                     |
              +------+------+
              |             |
           A-11           A-12
         BGAV            BGAV
       Uebersicht      Simulation
```

| Modul | Beziehung zu A-02/A-10 |
|-------|----------------------|
| **M-01** (Landing) | Agentur-Kacheln fuehren zu A-02. Modus wird aus localStorage geladen. |
| **A-03** (Dashboard) | Drill-Down von Gesamt-KPIs zu einzelnem Vermittler (A-02). Teilt KPI-Definitionen aus `config.js`. |
| **A-05** (Potentialanalyse) | Kann zu A-10 springen mit voraktiviertem FIDA-Status (`fidaActiveInPotentialAnalyse`). |
| **A-11/A-12** (BGAV) | Provisionsrechner mit Link zu vermittlerspezifischen Berechnungen. |
| **KI-Chat** | Kontextabhaengiger Assistent. Oeffnet automatisch in A-02. Antworten passen sich an Modus an. |
| **Router** | Alle A-02/A-10-Varianten per URL-Hash erreichbar. Deep-Linking mit Retry-Logik. |
| **B-02/B-10** (Banken) | Parallele Implementierung fuer Bankberater, analoge Architektur. |

---

## Mock-Daten-Katalog

### AO-Kunden (11 Privatpersonen)

| ID | Name | Beruf | Vertraege | Bestand/Jahr |
|----|------|-------|-----------|-------------|
| KD00001 | Peter Schmidt | Angestellter | 2 | EUR 1.518 |
| KD00002 | Amira Koenig | Selbststaendig | 3 | EUR 2.436 |
| KD00003 | Thomas Weber | Handwerksmeister | 3 | EUR 1.850 |
| KD00004 | Maria Schneider | Kauffrau | 4 | EUR 3.500 |
| KD00005 | Andreas Mueller | Beamter | 3 | EUR 2.200 |
| KD00006 | Julia Fischer | Lehrerin | 3 | EUR 2.100 |
| KD00007 | Markus Klein | IT-Berater | 3 | EUR 2.800 |
| KD00008 | Christian Bauer | Architekt | 5 | EUR 4.800 |
| KD00009 | Claudia Richter | Aerztin | 6 | EUR 5.200 |
| KD00010 | Frank Hoffmann | Unternehmer | 4 | EUR 3.900 |
| KD00011 | Sarah Braun | Studentin | 2 | EUR 980 |

### Ecclesia-Kunden (15 Institutionen in 5 Segmenten)

| ID | Name | Segment | Praemie | Vertraege |
|----|------|---------|---------|-----------|
| MK-GW-001 | Klinikum Lippetal GmbH | Gesundheitswesen | 1,2 Mio. | 14 |
| MK-GW-002 | Reha-Klinik Teutoburg | Gesundheitswesen | 340.000 | 9 |
| MK-GW-003 | MVZ MediVita GmbH | Gesundheitswesen | 85.000 | 6 |
| MK-GW-004 | Seniorenresidenz Sonnenhof | Gesundheitswesen | 190.000 | 8 |
| MK-KI-001 | Ev. Landeskirche Teutoburg | Kirche | 12,5 Mio. | 38 |
| MK-KI-002 | Erzbistum Waldburg | Kirche | 8,3 Mio. | 29 |
| MK-KI-003 | Kirchenkreis Auental | Kirche | 620.000 | 11 |
| MK-SW-001 | Diak. Hilfswerk Westmark | Sozialwirtschaft | 1,8 Mio. | 16 |
| MK-SW-002 | Sozialwerkstaetten Bergland | Sozialwirtschaft | 280.000 | 7 |
| MK-SW-003 | Wohlfahrtswerk Auental | Sozialwirtschaft | 420.000 | 10 |
| MK-IG-001 | Westfalia Elektronik GmbH | Industrie & Gewerbe | 3,8 Mio. | 22 |
| MK-IG-002 | Nordlicht Automatisierung | Industrie & Gewerbe | 9,5 Mio. | 31 |
| (weitere) | ... | Transport & Logistik | ... | ... |

### MRH-Kunden (7 Gewerbekunden in 7 Specialties)

| ID | Name | Specialty | Insurance | Benefits | Finance |
|----|------|-----------|-----------|----------|---------|
| MRH-001 | Rhein-Main Maschinenbau GmbH | Maschinenbau | 420.000 | inaktiv | 45.000 |
| MRH-003 | Nordpark Projektentwicklung AG | Real Estate | 680.000 | 1,2 Mio. | 120.000 |
| MRH-005 | Hessenlog Spedition GmbH | Logistik | 280.000 | inaktiv | 28.000 |
| MRH-007 | DigiCore Solutions GmbH | IT/Hightech | 82.000 | 380.000 | inaktiv |
| MRH-008 | Medicum Rhein-Main MVZ GmbH | Healthcare | 165.000 | 890.000 | 48.000 |
| MRH-013 | Hessenbau Generalunternehmer GmbH | Bau/Handwerk | 290.000 | 320.000 | 65.000 |
| MRH-015 | Rhein-Main Verkehr GmbH | OEPNV/SPNV | 1,45 Mio. | 4,8 Mio. | 142.000 |

---

*Letzte Aktualisierung: Maerz 2026*
*Gesamtumfang: ~7.300 Zeilen Code (A-02/A-10), 3 Modi, 25+ Tabs, 33+ Kunden, 1 KI-Chatbot*

