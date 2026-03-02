# A-02 & A-10: Vermittler- und Kundenansicht

> Umfassende Dokumentation der Kernansichten des KI-Vertriebsarbeitsplatzes

---

## Inhaltsverzeichnis

1. [Ueberblick](#ueberblick)
2. [Page-ID-System und Namenskonvention](#page-id-system-und-namenskonvention)
3. [Die drei Modi](#die-drei-modi)
4. [A-02 -- Vermittler-Uebersicht](#a-02----vermittler-uebersicht)
   - [A-02 (AO): Privatkundenvertrieb](#a-02-ao-privatkundenvertrieb)
   - [A-02b (Ecclesia): Makler B2B](#a-02b-ecclesia-makler-b2b)
   - [A-02c (MRH): Gewerbe 360deg](#a-02c-mrh-gewerbe-360)
5. [A-10 -- Kunden-Detailansicht](#a-10----kunden-detailansicht)
   - [A-10 (AO): Privatkunden-Detail](#a-10-ao-privatkunden-detail)
   - [A-10b (Ecclesia): Institutioneller Kunde](#a-10b-ecclesia-institutioneller-kunde)
   - [A-10c (MRH): Gewerbekunden-Detail](#a-10c-mrh-gewerbekunden-detail)
6. [Modus-Umschaltung](#modus-umschaltung)
7. [Navigationsfluss A-02 zu A-10](#navigationsfluss-a-02-zu-a-10)
8. [KPI-Vergleich nach Modus](#kpi-vergleich-nach-modus)
9. [Tab-Vergleich nach Modus](#tab-vergleich-nach-modus)
10. [Technische Architektur](#technische-architektur)
11. [Dateistruktur](#dateistruktur)
12. [Integration mit anderen Modulen](#integration-mit-anderen-modulen)
13. [Ausblick: Banken-Modul](#ausblick-banken-modul)

---

## Ueberblick

**A-02** (Vermittler-Uebersicht) und **A-10** (Kunden-Detailansicht) bilden das Herzstuck des Versicherungsmoduls im KI-Vertriebsarbeitsplatz. Gemeinsam decken sie den kompletten Workflow ab: von der Gesamtbetrachtung eines Vermittlers/einer Geschaeftsstelle bis hinunter zum einzelnen Kunden mit Vertraegen, Schaeden und Potentialen.

Beide Ansichten existieren in **drei Varianten** (Modi), die ueber einen Toggle im Header umgeschaltet werden und die gesamte UI -- KPIs, Tabs, Kundenlisten, Chat-Kontext -- an den jeweiligen Vertriebskanal anpassen.

| Page-ID | Ansicht | Modus | Route |
|---------|---------|-------|-------|
| **A-02** | Vermittler-Uebersicht | AO (Privatkundenvertrieb) | `#/agentur` |
| **A-02b** | Vermittler-Uebersicht | Makler B2B (Ecclesia) | `#/agentur-b2b` |
| **A-02c** | Vermittler-Uebersicht | Gewerbe 360deg (MRH Trowe) | `#/agentur-gewerbe` |
| **A-10** | Kunden-Detail | AO (Privatkundenvertrieb) | `#/kundendetail` |
| **A-10b** | Kunden-Detail | Makler B2B (Ecclesia) | `#/kundendetail-b2b` |
| **A-10c** | Kunden-Detail | Gewerbe 360deg (MRH Trowe) | `#/kundendetail-gewerbe` |

---

## Page-ID-System und Namenskonvention

Der Arbeitsplatz verwendet ein Praefix-basiertes Page-ID-System (`page-id-tracker.js`), das jede Ansicht eindeutig identifiziert:

| Praefix | Modul | Beispiele |
|---------|-------|-----------|
| **M** | Main (Landing Page) | M-01 |
| **A** | Versicherung | A-01 bis A-12 |
| **B** | Banken | B-01 bis B-07 |
| **P** | PMO Toolbox | P-01 bis P-11 |
| **R** | Risikoscoring | R-01, R-02 |
| **T** | Bestandsuebertragung | T-01 bis T-13 |
| **H** | HR Pipeline | H-01, H-02 |

Innerhalb des Versicherungsmoduls (A-Praefix):

- **A-02** = Vermittler-Uebersicht (Basis)
- **A-02b** = Variante B2B (Suffix `b`)
- **A-02c** = Variante Gewerbe 360deg (Suffix `c`)
- **A-10** = Kunden-Detail (Basis)
- **A-10b** / **A-10c** = analog

Die Suffixe `b` und `c` bezeichnen also keine Untervarianten der Seite selbst, sondern denselben Seitentyp in einem anderen **Vertriebskanal-Modus**.

---

## Die drei Modi

### 1. AO -- Ausschliesslichkeitsorganisation (A-02 / A-10)

Der klassische Agenturvertrieb an **Privatpersonen**. Ein einzelner Vermittler (z.B. "Maria Musterfrau", VM00001) betreut Endkunden mit Standardprodukten in den Segmenten Leben, Kranken, Schaden und Kfz.

- **Zielgruppe:** Versicherungsagenten im Exklusivvertrieb
- **Kunden:** Privatpersonen (Peter Schmidt, Amira Koenig, ...)
- **Fokus:** Neugeschaeft, Bestand, Storno, Verguetung, Qualitaet

### 2. Ecclesia B2B -- Industriemakler (A-02b / A-10b)

Inspiriert vom Modell der Ecclesia Gruppe: ein **institutioneller Makler**, der Grossinstitutionen betreut. Die Geschaeftsstelle "GS NRW" verwaltet Kliniken, Kirchen, Sozialeinrichtungen und Industriebetriebe.

- **Zielgruppe:** Industriemakler / Spezialmakler
- **Kunden:** Institutionen in 5 Segmenten (Gesundheitswesen, Kirche, Sozialwirtschaft, Industrie & Gewerbe, Transport & Logistik)
- **Fokus:** Bestandspraemie, Courtage, Retention, Schadenquote, Renewals, Deckungsluecken

### 3. MRH Trowe Gewerbe 360deg (A-02c / A-10c)

Ein PE-gestuetzter Konsolidierer nach dem Vorbild von MRH Trowe, der **drei Saeulen** bedient: klassische Versicherung, Benefits (bAV/bKV) und Finance (Kreditversicherung, Avale, Leasing).

- **Zielgruppe:** Gewerbemakler mit Multi-Service-Ansatz
- **Kunden:** B2B-Gewerbekunden in 14 Branchen-Spezialisierungen
- **Fokus:** Drei-Saeulen-Courtage, Cross-Sell-Matrix, Beziehungs-Timeline, Berater-Teams

---

## A-02 -- Vermittler-Uebersicht

Die Vermittler-Uebersicht ist die zentrale Steuerungsansicht. Sie zeigt alle relevanten Kennzahlen, Tabs und die Kundenliste eines Vermittlers bzw. einer Geschaeftsstelle.

**Einstieg:** Klick auf eine Agentur-Kachel von der Landing Page (M-01) oder vom Dashboard (A-03).

**Hauptfunktion:** `showAgenturOverview(vermittlerId)` in `agentur-overview.js`

### A-02 (AO): Privatkundenvertrieb

```
Header:  "Agentur: Maria Musterfrau" | VM00001 | Status: Aktiv
Foto:    Persoenlicher Avatar
```

**KPI-Boxen (4 Stueck):**

| KPI | Beschreibung |
|-----|-------------|
| Gesamtbestand | Summe aller verwalteten Vertraege |
| Neugeschaeft YTD | Neu abgeschlossene Vertraege im lfd. Jahr |
| Storno-Quote | Prozentsatz gekuendigter Vertraege |
| Zielerreichung | Fortschritt gegenueber Jahresziel |

**Tabs:**

| Primaer-Tabs | Sekundaer-Tabs |
|-------------|---------------|
| Uebersicht, Stammdaten, Neugeschaeft, Bestand, Storno, Verguetung, Qualitaet | Kunden, Potentiale |

**Kundenliste:** Privatpersonen mit Segmentzuordnung (Leben, Kranken, Schaden, Kfz).

**Chat-Assistent:** KI-Antworten zu Ablauf, Cross-Selling Lebensversicherung, Privatkundenthemen.

---

### A-02b (Ecclesia): Makler B2B

```
Header:  "GS NRW" | Ecclesia Gruppe
Foto:    Gebaeude-Icon (institutionell)
```

**KPI-Boxen (5 Stueck):**

| KPI | Wert (Mock) | Kontext |
|-----|-------------|---------|
| Bestandspraemie | 68,5 Mio. EUR | +4,2% YoY |
| Neugeschaeft | 4,2 Mio. EUR | +11,8% vs. Vorjahr |
| Courtage | 5,8 Mio. EUR | -- |
| Retention | 97,2% | Benchmark: 95% |
| Schadenquote | 62% | Ziel: <65% |

**Tabs:**

| Primaer-Tabs | Sekundaer-Tabs |
|-------------|---------------|
| Uebersicht, Stammdaten, Neugeschaeft, Bestand, Versicherer-Mix, Renewals, Schaeden, Deckungsluecken | Kunden, Potentiale |

**Kundenliste:** Institutionen mit Segment-Icons:

| Segment | Icon | Beispiel-Kunden |
|---------|------|----------------|
| Gesundheitswesen | Kreuz/Gebaeude | Klinikum Lippetal, Reha-Klinik Teutoburg |
| Kirche | Kirchensymbol | Ev. Landeskirche Teutoburg, Kirchenkreis Auental |
| Sozialwirtschaft | Personengruppe | Diakonisches Werk Ostwestfalen, AWO Kreisverband |
| Industrie & Gewerbe | Fabrik | Nordlicht Automatisierung, Teutoburger Maschinenbau |
| Transport & Logistik | LKW | Weserland Spedition, Lippeland Fracht |

**Chat-Assistent:** KI-Antworten zu Renewals, Deckungsluecken, Schadenquoten, B2B-Potentiale.

---

### A-02c (MRH): Gewerbe 360deg

```
Header:     "MRH Trowe Rhein-Main" | Duesseldorf
Subheader:  "PE-gestuetzter Konsolidierer -- Insurance + Benefits + Finance"
Foto:       Gebaeude-Icon mit Spezialisierungs-Badge
```

**Drei-Saeulen-Badge-Anzeige im Header:**

| Saeule | Farbe | Bereich |
|--------|-------|---------|
| Saeule I -- Insurance | Blau | Klassische Versicherungsvermittlung |
| Saeule II -- Benefits | Gruen | bAV, bKV, P-LIVE (Mitarbeiter-Benefits) |
| Saeule III -- Finance | Orange | Kreditversicherung, Avale, Leasing |

**KPI-Boxen (4 Stueck, saeulenuebergreifend):**

| KPI | Wert (Mock) |
|-----|-------------|
| Insurance Courtage | 3,8 Mio. EUR |
| Benefits Courtage | 1,4 Mio. EUR |
| Finance Courtage | 0,6 Mio. EUR |
| Gesamt-Courtage | 5,8 Mio. EUR |

**Tabs:**

| Primaer-Tabs | Sekundaer-Tabs |
|-------------|---------------|
| Uebersicht, Stammdaten, Neugeschaeft, Bestand, Cross-Sell Matrix, Renewals, 3-Saeulen | Kunden, Potentiale |

**Kundenliste:** 15+ B2B-Gewerbekunden in 14 Branchen-Spezialisierungen:

Maschinenbau, Real Estate, Kfz/Motorrad, Logistik, IT/Hightech, Healthcare, Rechtsanwaelte, Bau/Handwerk, Events/Sport, Touristik, Fine Art, Wi/MA, OEPNV/SPNV, Privatkunde (Sonderfall).

---

## A-10 -- Kunden-Detailansicht

Die Kunden-Detailansicht zeigt das vollstaendige Profil eines einzelnen Kunden: Stammdaten, Vertraege, Schaeden, Potentiale und mehr. Sie wird immer aus A-02 heraus geoeffnet und erbt automatisch den aktiven Modus.

**Einstieg:** Klick auf einen Kundennamen in der Kundenliste von A-02.

**Hauptfunktion:** `openKundenDetail(kundenName, vermittlerId)` in `kunden-detail.js`

**Sticky Bar:** Am oberen Rand bleibt eine Leiste mit Kundenfoto, Name, NPS-Badge und Quick-Actions beim Scrollen sichtbar (`kunde-sticky-bar.css`).

### A-10 (AO): Privatkunden-Detail

```
Header:  Kundenfoto | "Peter Schmidt" | Kunden-ID
```

**Stammdaten:**

| Feld | Beispiel |
|------|----------|
| Name | Peter Schmidt |
| Geburtsdatum | 15.03.1978 |
| Adresse | Musterstrasse 12, 33100 Paderborn |
| Familienstand | Verheiratet |
| Beruf | Dipl.-Ingenieur |
| NPS Score | 72 (klickbarer Badge) |

**Tabs:**

| Tab | Inhalt |
|-----|--------|
| Stammdaten | Persoenliche Daten, Kontakt, Beruf |
| Vertraege | Einfache Vertragsliste (Produkt, Praemie, Status) |
| FIDA/Wettbewerber | Externe Vertraege bei Fremdversicherern via Open-Finance-Schnittstelle (z.B. Allianz, HUK24, ARAG) |
| Schaden | Schadenmeldungen und Regulierung |
| Vertriebsbericht | Automatisch generierter Bericht |

**FIDA-Integration:** Zeigt Vertraege bei Wettbewerbern an. Der Aktivierungszustand wird bei Navigation aus der Potentialanalyse (A-05) uebernommen.

---

### A-10b (Ecclesia): Institutioneller Kunde

```
Header:  Gebaeude-Icon | "Klinikum Lippetal" | Segment-Badge "Gesundheitswesen"
Untertitel: Branche | 2.400 Mitarbeitende | Key Contact: Dr. Meier
```

**Stammdaten (erweitert):**

| Feld | Beispiel |
|------|----------|
| Branche | Gesundheitswesen |
| Segment | Kliniken |
| Mitarbeitende | 2.400 |
| Jahresumsatz | 180 Mio. EUR |
| Betten | 620 |
| Standorte | 3 |
| Traeger | Kommunaler Traeger |
| Key Contact | Dr. med. Meier (Verwaltungsdirektor) |
| Risikoklasse | B+ |

**Tabs:**

| Tab | Inhalt |
|-----|--------|
| Stammdaten | Institutionelle Kerndaten (Branche, Mitarbeitende, Umsatz, ...) |
| Vertraege | Erweiterte Tabelle: Sparte, Versicherer, Praemie/a, Deckungssumme, Selbstbehalt, Ablauf, Schadenquote |
| Schadenhistorie | 5-Jahres-Schadenhistorie mit detaillierter Aufschluesselung nach Sparten |
| Deckungsluecken | Analyse fehlender oder unzureichender Deckungen mit Prioritaetsstufen |
| Renewal-Ampel | Ampelsystem (gruen/gelb/rot) fuer anstehende Vertragsverlaengerungen |
| Ansprechpartner | Kontaktpersonen der Institution mit Rolle und Zustaendigkeit |
| Potentiale | Cross-Selling- und Upselling-Moeglichkeiten |

---

### A-10c (MRH): Gewerbekunden-Detail

```
Header:     Branchen-Icon + Badge | "Rhein-Metall Maschinenbau GmbH" | Spezialisierung: Maschinenbau
Untertitel: Engagement in 3 Saeulen: Insurance aktiv | Benefits aktiv | Finance inaktiv
```

**Drei-Saeulen-Karten (Grid im oberen Bereich):**

| Karte | Farbe | Metriken |
|-------|-------|----------|
| **Insurance** | Blau | Courtage, Anzahl Vertraege, naechstes Renewal |
| **Benefits** | Gruen | bAV-Volumen, Durchdringungsquote, Hinweise |
| **Finance** | Orange | Kreditversicherung, Avale, Leasing, Courtage |

Jede Karte zeigt den Status "Aktiv" oder "Inaktiv" an. Inaktive Saeulen sind Cross-Sell-Potentiale.

**Stammdaten (erweitert):**

| Feld | Beispiel |
|------|----------|
| Spezialisierung | Maschinenbau |
| Branche | Verarbeitendes Gewerbe |
| Typ | B2B |
| Mitarbeitende | 850 |
| Jahresumsatz | 120 Mio. EUR |
| Standorte | 4 |
| Gesellschaftsform | GmbH |
| Eigentuemer | Familienbesitz |
| Beziehungsstatus | Gold-Partner |
| **Berater-Team** | Insurance: Herr Mueller, Benefits: Frau Weber, Finance: -- (vakant) |

**Tabs:**

| Tab | Inhalt |
|-----|--------|
| Stammdaten | Unternehmens-Kerndaten inkl. Berater-Team |
| Vertraege | Alle Vertraege ueber 3 Saeulen mit Saeulen-Spalte (I/B/F, farbcodiert) |
| Schadenhistorie | 5-Jahres-Verlauf spartenuebergreifend |
| Deckungsluecken | Analyse ueber alle drei Saeulen |
| Beziehung Timeline | Chronologisches Aktivitaetsprotokoll aller Saeulen mit Berater, Datum, Saeule und Beschreibung |
| Ansprechpartner | Kontaktpersonen mit Saeulen-Zuordnung |

---

## Modus-Umschaltung

### Toggle-Position

Oben rechts im Header der A-02-Ansicht befindet sich ein 3-Wege-Schalter:

```
[ AO ] | [ Ecclesia ] | [ MRH ]
```

### Technischer Ablauf

```
Benutzer klickt Toggle
        |
        v
setViewMode('ao' | 'ecclesia' | 'mrh')     -- mrh-trowe.js
        |
        v
applyViewMode()
   |-- KPI-Boxen austauschen
   |-- Header (Titel, Foto, Untertitel) aktualisieren
   |-- Tabs austauschen
   |-- Kundenliste filtern/ersetzen
   |-- Chat-Kontext anpassen
   |-- URL-Route aktualisieren (Router.navigate)
   +-- Page-ID aktualisieren (PageIDTracker.setPageId)
        |
        v
localStorage.setItem('viewMode', mode)     -- persistiert ueber Sessions
        |
        v
Falls A-10 geoeffnet: closeKundenDetail() + zurueck zu A-02
```

### Rueckwaertskompatibilitaet

Die globale Variable `viewMode` ('ao' | 'ecclesia' | 'mrh') ersetzt die aeltere boolesche `maklerModus`-Variable. Beide werden synchron gehalten.

---

## Navigationsfluss A-02 zu A-10

```
Landing Page (M-01)
    |
    |  [Klick: Agentur-Kachel]
    v
A-02: Vermittler-Uebersicht
    |-- Header mit KPIs
    |-- Primaer- und Sekundaer-Tabs
    |-- Kundenliste (Tab "Kunden")
    +-- KI-Chat-Assistent
    |
    |  [Klick: Kundenname in Liste]
    v
A-10: Kunden-Detail
    |-- Sticky Bar (Name, NPS, Quick Actions)
    |-- Stammdaten
    |-- Vertraege
    |-- Weitere Tabs (je nach Modus)
    +-- Vertriebsbericht
    |
    |  [Klick: "Zurueck"-Button]
    v
Zurueck zu A-02 (gleicher Modus, gleicher Scroll-Zustand)
```

Der Modus wird automatisch von A-02 an A-10 vererbt. Ein Moduswechsel waehrend A-10 schliesst die Detailansicht und navigiert zurueck zu A-02.

---

## KPI-Vergleich nach Modus

| | AO (A-02) | Ecclesia B2B (A-02b) | MRH 360deg (A-02c) |
|---|---|---|---|
| **KPI 1** | Gesamtbestand | Bestandspraemie (68,5 Mio.) | Insurance Courtage (3,8 Mio.) |
| **KPI 2** | Neugeschaeft YTD | Neugeschaeft (4,2 Mio.) | Benefits Courtage (1,4 Mio.) |
| **KPI 3** | Storno-Quote | Courtage (5,8 Mio.) | Finance Courtage (0,6 Mio.) |
| **KPI 4** | Zielerreichung | Retention (97,2%) | Gesamt-Courtage (5,8 Mio.) |
| **KPI 5** | -- | Schadenquote (62%) | -- |
| **Ausrichtung** | Volumen + Qualitaet | Praemie + Retention | Saeulen-Courtage |

---

## Tab-Vergleich nach Modus

### A-02 Tabs

| AO | Ecclesia B2B | MRH 360deg |
|----|-------------|------------|
| Uebersicht | Uebersicht | Uebersicht |
| Stammdaten | Stammdaten | Stammdaten |
| Neugeschaeft | Neugeschaeft | Neugeschaeft |
| Bestand | Bestand | Bestand |
| **Storno** | **Versicherer-Mix** | **Cross-Sell Matrix** |
| **Verguetung** | **Renewals** | **Renewals** |
| **Qualitaet** | **Schaeden** | **3-Saeulen** |
| -- | **Deckungsluecken** | -- |
| *Kunden* | *Kunden* | *Kunden* |
| *Potentiale* | *Potentiale* | *Potentiale* |

*Kursiv = Sekundaer-Tabs. **Fett** = Modus-spezifisch.*

### A-10 Tabs

| AO | Ecclesia B2B | MRH 360deg |
|----|-------------|------------|
| Stammdaten | Stammdaten | Stammdaten |
| Vertraege | Vertraege (erweitert) | Vertraege (3-Saeulen) |
| **FIDA/Wettbewerber** | **Schadenhistorie** | **Schadenhistorie** |
| **Schaden** | **Deckungsluecken** | **Deckungsluecken** |
| **Vertriebsbericht** | **Renewal-Ampel** | **Beziehung Timeline** |
| -- | **Ansprechpartner** | **Ansprechpartner** |
| -- | **Potentiale** | -- |

---

## Technische Architektur

### State Management

| Variable | Typ | Speicherung | Zweck |
|----------|-----|-------------|-------|
| `viewMode` | String ('ao'/'ecclesia'/'mrh') | localStorage | Aktiver Vertriebskanal |
| `maklerModus` | Boolean | localStorage | Legacy-Kompatibilitaet |
| `currentAgenturIdInOverview` | String | RAM | Aktuell geladener Vermittler in A-02 |
| `currentKundenVermittlerId` | String | RAM | Vermittler-ID des geoeffneten Kunden in A-10 |

### Routing

Hash-basiertes Routing ueber `router.js`:

```
#/agentur           --> A-02  (AO)
#/agentur-b2b       --> A-02b (Ecclesia)
#/agentur-gewerbe   --> A-02c (MRH)
#/kundendetail      --> A-10  (AO)
#/kundendetail-b2b  --> A-10b (Ecclesia)
#/kundendetail-gewerbe --> A-10c (MRH)
```

Deep-Linking wird unterstuetzt: Direktaufruf via URL oeffnet die korrekte Ansicht im richtigen Modus.

### Kern-Funktionen

**A-02 (agentur-overview.js):**

| Funktion | Aufgabe |
|----------|---------|
| `showAgenturOverview(id)` | Oeffnet A-02 fuer einen Vermittler |
| `loadAgenturData(id)` | Laedt Vermittlerdaten |
| `fillCockpitKPIs()` | Befuellt KPI-Boxen |
| `showAgenturTab(tabName)` | Tab-Wechsel |

**A-10 (kunden-detail.js):**

| Funktion | Aufgabe |
|----------|---------|
| `openKundenDetail(name, id)` | Oeffnet Kunden-Detail |
| `fillKundenDetail(name, id)` | Befuellt alle Felder |
| `closeKundenDetail()` | Zurueck zu A-02 |

**B2B-Modus (makler.js):**

| Funktion | Aufgabe |
|----------|---------|
| `toggleMaklerModus()` | Toggle-Klick-Handler |
| `applyMaklerModus()` | A-02b UI anwenden |
| `showMaklerTab(tabName)` | B2B-Tab anzeigen |
| `openMaklerKundenDetail(id)` | A-10b oeffnen |
| `fillMaklerDetail(kunde)` | A-10b befuellen |
| `restoreMaklerKundenDetail()` | Zurueck zu AO-Ansicht |

**MRH-Modus (mrh-trowe.js):**

| Funktion | Aufgabe |
|----------|---------|
| `setViewMode(mode)` | Globaler Modus-Wechsel (alle 3 Modi) |
| `applyMRHModus()` | A-02c UI anwenden |
| `showMRHTab(tabName)` | MRH-Tab anzeigen |
| `openMRHKundenDetail(id)` | A-10c oeffnen |
| `fillMRHDetail(kunde)` | A-10c befuellen (inkl. 3-Saeulen-Karten) |
| `restoreMRHKundenDetail()` | Zurueck zu AO-Ansicht |

---

## Dateistruktur

### JavaScript (ca. 7.250 Zeilen fuer A-02/A-10)

```
js/
|-- agentur-overview.js     2.188 Zeilen   A-02 Kernlogik (AO-Modus)
|-- kunden-detail.js        1.370 Zeilen   A-10 Kernlogik (AO-Modus)
|-- makler.js               2.293 Zeilen   A-02b + A-10b (Ecclesia B2B)
|-- mrh-trowe.js            1.405 Zeilen   A-02c + A-10c (MRH Gewerbe 360)
|-- router.js                 218 Zeilen   Hash-basiertes URL-Routing
|-- page-id-tracker.js        450 Zeilen   Page-ID-Verwaltung
|-- config.js                 148 Zeilen   KPI-Definitionen, Silo-/Segmentfaktoren
+-- user-mode.js              421 Zeilen   Benutzer-/Rollenverwaltung
```

### CSS

```
css/
|-- styles.css              Shared Header Tabs (A-02 / A-10), ~150 Zeilen relevant
|-- makler.css              B2B-Tabs, Stammdaten-Overrides, KPI-Boxen, Segment-Icons
|-- mrh-trowe.css           3-Saeulen-Karten, Beziehungs-Timeline, Branchen-Badges
|-- kunden-detail.css       A-10 spezifische Styles, Tabs, Vertraege-Tabellen
+-- kunde-sticky-bar.css    Sticky Bar oben in A-10 (NPS-Badge, Quick Actions)
```

### HTML

```
index.html
|-- <div id="agenturOverview">        A-02 Container
|-- <div id="kundenDetailPage">       A-10 Container
|-- 3x KPI-Box-Sets (je Modus)
|-- 3x Kundenlisten (je Modus)
+-- 3x Tab-Leisten (je Modus)
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
| **A-03** (Dashboard) | Drill-Down von Gesamt-KPIs zu einzelnem Vermittler (A-02). Teilt KPI-Definitionen aus `config.js`. |
| **A-05** (Potentialanalyse) | Kann zu A-10 springen mit voraktiviertem FIDA-Status. Analysiert Cross-Sell-Potentiale. |
| **A-11/A-12** (BGAV-Tools) | Provisionsrechner mit Link zu vermittlerspezifischen Berechnungen in A-02. |
| **KI-Chat** | Kontextabhaengiger Assistent, der in A-02 automatisch oeffnet und modusspezifische Antworten liefert. |
| **Router** | Alle A-02/A-10-Varianten per URL-Hash erreichbar. Deep-Linking unterstuetzt. |

---

## Ausblick: Banken-Modul

> **Status:** Die Plattform hat aktuell einen klaren **Versicherungsfokus** (A-Praefix). Ein **Banken-Modul** (B-Praefix) ist bereits in der Grundstruktur angelegt und wird zeitnah ausgebaut.

### Bereits vorhanden (B-01 bis B-07)

Das Banken-Modul existiert bereits mit eigenen Page-IDs und Ansichten:

| Page-ID | Ansicht | Beschreibung |
|---------|---------|-------------|
| B-01 | Segmentierung | Kundensegmentierung nach Bankkriterien |
| B-02 | Aufgaben | Aufgaben-Management |
| B-03 | NPL Dashboard | Non-Performing-Loans Uebersicht |
| B-04 | Stage 2 Ampel | Stage-2-Fruehwarnsystem (IFRS 9) |
| B-05 | CRM Profil | Kunden-Profil-Ansicht |
| B-06 | KI-Chat | KI-Assistent fuer Bankenkontext |
| B-07 | Kunden-Detail | Kunden-Detailansicht Banken |

### Geplante Erweiterung

Das Banken-Modul wird kuenftig eine analoge Struktur zu A-02/A-10 erhalten:

- **B-02x (Berater-Uebersicht):** Pendant zu A-02, aber fuer Bankberater statt Versicherungsvermittler. KPIs wie Kreditvolumen, Einlagen, Provisionsertrag, Cross-Selling-Quote.
- **B-10x (Kunden-Detail Banking):** Pendant zu A-10, aber mit Bank-spezifischen Tabs (Konten, Kredite, Wertpapiere, Anlageberatung, MiFID-Dokumentation).
- **Modus-Varianten:** Aehnlich wie bei Versicherung koennten verschiedene Banktypen (Privatkundenbank, Firmenkundenbank, Private Banking) als Modi abgebildet werden.

In `config.js` ist der Silo-Faktor `'Banken'` bereits definiert und liefert die Basis fuer bankspezifische KPI-Berechnungen:

```javascript
siloFactors: {
    'Ausschliesslichkeit': { ... },
    'Makler': { ... },
    'Direktvertrieb': { ... },
    'Banken': { neugeschaeft: 0.30, bestand: 0.35, storno: 0.95, ... }
}
```

Die modulare Architektur der Plattform -- insbesondere das Page-ID-System, der Router und das View-Mode-Konzept -- ist so ausgelegt, dass neue Vertriebskanaele und Module mit minimalem Aufwand hinzugefuegt werden koennen.

---

*Letzte Aktualisierung: Maerz 2026*
