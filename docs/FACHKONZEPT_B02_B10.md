# B-02 & B-10: Berater- und Kundenansicht fuer die GFG

> Adaptionsvorschlag der Module A-02/A-10 fuer den Atruvia TechDay — "Open Finance meets KI"

---

## Leitgedanke

Die bestehenden Module A-02 (Vermittler-Uebersicht) und A-10 (Kunden-Detail) werden fuer den Bankenkontext der Genossenschaftlichen FinanzGruppe (GFG) adaptiert. Die Kernarchitektur — drei Modi, KPI-Boxen, Tab-System, KI-Chat — bleibt erhalten. Inhaltlich verschiebt sich alles von Versicherungsprodukten hin zu bankentypischen Kennzahlen, Produkten und Prozessen.

Der entscheidende Unterschied zur Versicherungsversion: **FIDA/Open Finance** rueckt vom Nischen-Tab zum zentralen Feature auf. In der Versicherungsversion ist FIDA ein optionaler Tab in A-10. In der Banking-Version wird Open Finance zum roten Faden — es liefert die Datenbasis, die den KI-Assistenten erst wirklich maechtig macht.

---

## Die drei Modi — Banking-Perspektive

Statt AO / Ecclesia / MRH Trowe bilden die drei Modi die typischen Vertriebswege der GFG ab:

| Modus | Pendant (Versicherung) | Zielgruppe | Kontext |
|-------|----------------------|------------|---------|
| **VR Retail** | AO (Privatkundenvertrieb) | Privatkundenberater einer Volksbank | Der Standardfall: Ein Berater betreut 300-500 Privatkunden mit Girokonto, Baufi, Wertpapier, Versicherung |
| **VR Firmenkunde** | Ecclesia B2B | Firmenkundenberater | Mittelstaendische Unternehmen mit Kreditlinien, Zahlungsverkehr, Leasing, Auslandsgeschaeft |
| **VR Vermoegen** | MRH Gewerbe 360 | Private Banking / Vermoegensberatung | Vermoegende Privatkunden mit Depot, Vermoegensverwaltung, Nachfolgeplanung, Stiftungen |

### Warum diese drei Modi fuer Atruvia relevant sind

Die GFG hat genau diese drei Vertriebssaeulen. Jede Volksbank hat Privatkundenberater in der Flaeche (das Massengeschaeft), Firmenkundenberater fuer den regionalen Mittelstand (das Ertragsgeschaeft) und — zunehmend — Private-Banking-Einheiten (das Wachstumsgeschaeft). Der Toggle demonstriert Atruvia, dass ein und dieselbe Plattform alle drei bedient.

---

## B-02 — Berater-Uebersicht

### B-02 (VR Retail): Privatkundenberater

Header: "Thomas Berger" | Berater-Nr. VB-40210 | Volksbank Mittelhessen eG
Region: Beratungscenter Giessen-Sued

**KPI-Boxen (4 Stueck):**

| KPI | Beschreibung | Beispielwert |
|-----|-------------|-------------|
| Kundenstamm | Anzahl aktive Kunden im Betreuungsstamm | 412 Kunden |
| Ertrag YTD | Provisionsertrag + Zinsertrag (Kundenbeitrag) | 284 Tsd. EUR |
| Cross-Selling-Quote | Produkte pro Kunde vs. Benchmark | 3,2 (Ziel: 4,0) |
| VR-FinanzPlan-Quote | Anteil Kunden mit ganzheitlicher Beratung | 38% (Ziel: 50%) |

**Tabs:** Uebersicht, Stammdaten, Neugeschaeft, Bestandskunden, Ertraege, Beratungsqualitaet, Aktivitaeten | Kunden, Potentiale

**Kundenliste:** Privatkunden mit Segment-Zuordnung (A-Kunde Top, B-Kunde Wachstum, C-Kunde Basis, Abwanderungsrisiko)

---

### B-02b (VR Firmenkunde): Firmenkundenberater

Header: "Carola Weiss" | FK-Berater-Nr. VB-40210-FK | Volksbank Mittelhessen eG

**KPI-Boxen (5 Stueck):**

| KPI | Beispielwert | Kontext |
|-----|-------------|---------|
| Kreditvolumen (Bestand) | 82 Mio. EUR | +6,1% YoY |
| Neugeschaeft Kredit YTD | 12,4 Mio. EUR | davon 3x Investitionskredit, 2x Betriebsmittel |
| Provisionsertrag | 320 Tsd. EUR | Zahlungsverkehr + Ausland + Leasing |
| Ausfallrisiko (Avg EWB-Quote) | 1,8% | Benchmark Verband: 2,1% |
| Kundenbindungsrate | 96,4% | Benchmark: 94% |

**Tabs:** Uebersicht, Stammdaten, Neugeschaeft, Kreditportfolio, Zahlungsverkehr, Foerdermittel, Branchenmix | Kunden, Potentiale

**Kundenliste:** Firmenkunden mit Branchen-Icons (Handwerk/Bau, Produktion/Industrie, Handel/Gastro, Dienstleistung/IT, Landwirtschaft, Heilberufe/Freiberufler)

---

### B-02c (VR Vermoegen): Private Banking

Header: "Dr. Julia Rademacher" | PB-Center Giessen | Volksbank Mittelhessen eG
Subheader: "Ganzheitliche Vermoegensbetreuung — Anlage, Vorsorge, Nachfolge"

**Drei-Saeulen-Badge:**

| Saeule | Farbe | Bereich |
|--------|-------|---------|
| Saeule I — Anlage | Blau | Depot, Vermoegensverwaltung, Fonds |
| Saeule II — Vorsorge | Gruen | Altersvorsorge, Versicherung, Stiftung |
| Saeule III — Nachfolge | Gold | Testamentsvollstreckung, Generationenberatung, Immobilie |

**KPI-Boxen (4 Stueck):** AuM (48,2 Mio.) | Provisionsertrag Wertpapier (186 Tsd.) | Vorsorge-Ertrag (62 Tsd.) | Gesamt-Ertrag PB-Kunden (248 Tsd.)

---

## B-10 — Kunden-Detailansicht

### B-10 (VR Retail): Privatkunden-Detail

**Tabs:** Stammdaten | Konten & Karten | Kredit & Finanzierung | Wertpapiere & Anlage | Versicherung & Vorsorge | **Open Finance / FIDA** | Beratungshistorie

**FIDA-Tab — der Demo-Showstopper:**

Externe Datenquellen (mit Kunden-Consent):
- ING DiBa (Gehaltseingang, Sparrate) → Sparplan-Potenzial
- Trade Republic (ETF-Portfolio) → VR-FinanzPlan-Anlass
- HUK24 (Kfz-Versicherung) → R+V Buendelrabatt
- Scalable Capital (Robo-Advisor) → Vermoegensverwaltung ohne ganzheitlichen Blick

KI-generierte Handlungsempfehlungen direkt im Tab.

### B-10b (VR Firmenkunde): Firmenkunden-Detail

**Tabs:** Stammdaten | Kreditengagement | Zahlungsverkehr | Rating & Risiko | Foerdermittel | **Open Finance / FIDA** | Ansprechpartner

### B-10c (VR Vermoegen): Private-Banking-Detail

**Tabs:** Stammdaten | Depot & Vermoegensverwaltung | Vorsorge-Check | Nachfolge | MiFID & Dokumentation | **Open Finance / FIDA** | Beziehungs-Timeline

Drei-Saeulen-Karten: Anlage (Blau) | Vorsorge (Gruen) | Nachfolge (Gold)

---

## Open Finance als roter Faden — die Story fuer den TechDay

### Die drei Demo-Touchpoints

1. **"So sieht die Datenwelt aus"** → B-10 oeffnen, FIDA-Tab zeigen
2. **"So arbeitet die KI damit"** → KI-Analyse im FIDA-Tab
3. **"So sieht das im Berateralltag aus"** → B-02 oeffnen, KI-priorisierte Beratungsanlaesse

### Warum die GFG den Consent bekommt

Die Genossenschaftsbanken fuehren bei Vertrauen. Aber Vertrauen allein reicht nicht — der Berater braucht das Werkzeug. Atruvia muss die Schnittstellen in agree21 bauen. Der Prototyp zeigt: Genau dieses Werkzeug existiert.

---

## Technisches Mapping

| Versicherung | Banking |
|-------------|---------|
| `viewMode: 'ao'` | `bankViewMode: 'retail'` |
| `viewMode: 'ecclesia'` | `bankViewMode: 'firmenkunde'` |
| `viewMode: 'mrh'` | `bankViewMode: 'vermoegen'` |
| Route `#/agentur` | Route `#/berater` |
| `agentur-overview.js` | `berater-overview.js` |
| `kunden-detail.js` | `kunden-detail-bank.js` |
| Page-ID `A-02` | Page-ID `B-02` |
| Page-ID `A-10` | Page-ID `B-10` |

## Mock-Daten: Regionale Verankerung

Mock-Daten regional in Mittelhessen (Giessen, Wetzlar, Marburg).
Bankname: "Volksbank Mittelhessen eG"

---

*Vorschlag erstellt: Maerz 2026 — Deloitte Consulting / Eike Brenneisen*
