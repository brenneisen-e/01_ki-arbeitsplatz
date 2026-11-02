# CV Scanner Modul - KI-gestuetztes Bewerbermanagement

## Uebersicht

Das CV Scanner Modul ist ein KI-gestuetztes Bewerbermanagement-System innerhalb der kiarbeitsplatz-Plattform. Es bietet zwei Perspektiven: ein **Bewerber-Portal** (C-01) fuer Kandidaten und ein **Recruiting Dashboard** (C-02) fuer Arbeitgeber. Alle Daten sind clientseitig als Demo-Daten hinterlegt -- es gibt kein reales KI-Backend.

**Modul-Kennung:** C (Page-IDs: C-01, C-02)

---

## Dateien

| Datei | Beschreibung |
|-------|-------------|
| `js/cv-scanner.js` | Komplette Modul-Logik (State, Demo-Daten, Rendering, Chat) |
| `partials/cv-scanner-module.html` | HTML-Template (wird per fetch geladen) |
| `css/cv-scanner.css` | Modul-spezifische Styles |

---

## Funktionsweise

### Modul-Lebenszyklus

1. **Oeffnen:** `openCVScanner()` blendet die Landing-Page und andere Module aus, zeigt `cvScannerModule` an und laedt das HTML-Template per `fetch('partials/cv-scanner-module.html')` nach.
2. **Initialisierung:** `initCVScanner()` richtet Drag-and-Drop fuer den CV-Upload ein und initialisiert den Chatbot.
3. **Schliessen:** `closeCVScanner()` blendet das Modul aus und zeigt die Landing-Page wieder an.

### Modus-Umschaltung

Ueber den Mode-Toggle im Header wird zwischen **Bewerber** und **Arbeitgeber** gewechselt:

```
switchCVMode('bewerber')   → Bewerber-Portal (C-01)
switchCVMode('arbeitgeber') → Recruiting Dashboard (C-02)
```

---

## Layout

### Bewerber-Portal (C-01)

```
+------------------------------------------------------------------+
| [Zurueck]  CV Scanner - KI-gestuetztes Bewerbermanagement        |
|                                    [Bewerber-Portal | Recruiting] |
+------------------------------------------------------------------+
|                                                                    |
|   Finden Sie Ihre passende Vertriebsposition bei ERGO             |
|                                                                    |
|   +----------------------------------------------------+          |
|   |  Lebenslauf hochladen (Drag & Drop / Klick)       |          |
|   |  PDF | DOCX                                        |          |
|   +----------------------------------------------------+          |
|                                                                    |
|   oder Demo-Profil auswaehlen:                                     |
|   [Max Berger]  [Sarah Klein]  [Thomas Wendt]                     |
|   Top-Kandidat   Quereinsteigerin  Ablehnung                      |
|                                                                    |
+------------------------------------------------------------------+
```

**Nach CV-Analyse:**

```
+------------------------------------------------------------------+
| Profil-Card                                                       |
| +------+  Name, Stadt, Alter, Erfahrung         [Score-Ring 92%] |
| | MB   |  Ausbildung                                             |
| +------+  Kernkompetenzen: [Tag] [Tag] [Tag]                     |
|           Staerken-Profil: [Radar-Chart]                          |
|           KI-Zusammenfassung: "..."                               |
+------------------------------------------------------------------+
| Ablehnungshinweis (nur bei rejected Profilen)                     |
+------------------------------------------------------------------+
| Stellenvorschlaege                     Sortieren: [Score v]       |
| +-------------------------------------------------------------+  |
| | Agenturleiter          Duesseldorf (0 km)     [Score 94%]   |  |
| | [Wohnortnaehe] [Branchenerfahrung] [IHK-qualifiziert]       |  |
| | > Details anzeigen                                           |  |
| +-------------------------------------------------------------+  |
| | Vertriebsspezialist    Koeln (40 km)          [Score 87%]   |  |
| | ...                                                          |  |
| +-------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### Recruiting Dashboard (C-02)

```
+------------------------------------------------------------------+
| KPI-Leiste                                                        |
| +------------+ +------------+ +------------+ +------------+      |
| | Bewerbungen| | Durchschn. | | Empfohlene | | Ablehnungs-|      |
| |     47     | | Score: 68  | | Kand.: 12  | | quote: 34% |      |
| +------------+ +------------+ +------------+ +------------+      |
+------------------------------------------------------------------+
| Filter: [Alle Regionen v] [Alle Scores v] [Alle Status v]        |
+------------------------------------------------------------------+
| Bewerber-Grid                                                      |
| +-------------------------------------------------------------+  |
| | (92) Max Berger       | Duesseldorf | 34 J.  [Empfohlen]   |  |
| |      8J Vertrieb Allianz...                                  |  |
| |      [Kundenakquise] [Bestandsmanagement]                    |  |
| +-------------------------------------------------------------+  |
| | (68) Sarah Klein      | Koeln | 29 J.        [Pruefen]     |  |
| |      ...                                                     |  |
| +-------------------------------------------------------------+  |
| | (31) Thomas Wendt     | Flensburg | 52 J.    [Ablehnung]   |  |
| |      ...                                                     |  |
| +-------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

**Detail-Overlay (bei Klick auf Bewerber):**

```
+-----------------------------------------------+
| Bewerber-Detail                          [X]  |
+-----------------------------------------------+
| [MB]  Max Berger                         (92) |
|       Duesseldorf | 34 Jahre | 8J Vertrieb    |
|                                                |
| KI-Zusammenfassung: "..."                      |
|                                                |
| Score-Aufschluesselung:                        |
| Vertriebserfahrung (30%)  ========== 95       |
| Branchenkenntnis (25%)    =========  90       |
| Qualifikation (20%)       ========   88       |
| Standort-Match (15%)      =========  92       |
| Soft Skills (10%)         ========   85       |
|                                                |
| Staerken          | Schwaechen                 |
| + Kundenakquise   | - Keine ERGO-Erfahrung    |
| + Bestandsmgmt    | - Wechselbereitschaft     |
| + Fuehrung (3 MA) |                           |
+-----------------------------------------------+
| [Einladen]  [Ablehnen]  [Merken]              |
+-----------------------------------------------+
```

### Chatbot (beide Modi)

- Fester Toggle-Button unten rechts (52x52px, Brand-Farbe)
- Chat-Fenster: 400px breit, max 560px hoch
- Modus-abhaengige Start-Buttons und Antworten
- Typing-Indicator mit 3-Punkt-Animation
- Follow-Up-Buttons nach jeder Antwort

---

## Inhalte

### Scoring-Algorithmus

Der KI-Score besteht aus 5 Teilbereichen:

| Dimension | Gewichtung | Beschreibung |
|-----------|-----------|-------------|
| Vertriebserfahrung | 30% | Jahre und Art der Vertriebstaetigkeit |
| Branchenkenntnis | 25% | Versicherung, Finanz, Bank |
| Qualifikation | 20% | IHK, Studium, Zertifikate |
| Standort-Match | 15% | Naehe zu offenen Stellen |
| Soft Skills | 10% | Kommunikation, Fuehrung, Kundenorientierung |

**Match-Score-Berechnung:**

```
Match Score = Basis-Score - Entfernungs-Malus + Typ-Bonus + Zufallsvarianz

  Basis-Score    = totalScore des Kandidaten (0-100)
  Entf.-Malus    = min(Entfernung_km / 20, 15)
  Typ-Bonus      = positions-spezifisch (5-8 Punkte)
  Zufallsvarianz = +/- 3 Punkte
  Ergebnis-Range = 15-98
```

### Score-Farbcodierung

| Bereich | Farbe | Bedeutung |
|---------|-------|-----------|
| >= 80 | Gruen (#16A34A) | Top-Kandidat |
| 60-79 | Orange (#D97706) | Pruefen / Potenzial |
| < 60 | Rot (#DC2626) | Ablehnung empfohlen |

### KPI-Werte (Recruiting Dashboard)

| KPI | Wert | Farbe |
|-----|------|-------|
| Bewerbungen gesamt | 47 | Standard |
| Durchschnittlicher Score | 68 | Blau |
| Empfohlene Kandidaten | 12 | Gruen |
| Ablehnungsquote | 34% | Rot |

### Chat-Aktionen

**Bewerber-Modus:**

| Aktion | Key | Beschreibung |
|--------|-----|-------------|
| Passende Stellen | `stellen_passend` | Top-3 Matches basierend auf Profil |
| Anforderungen | `anforderungen` | Allgemeine Stellenanforderungen |
| Stellen in der Naehe | `stellen_naehe` | Umkreissuche (50km) |
| Ablehnungsgrund | `ablehnung` | Detaillierte Erklaerung bei Ablehnung |
| Profil verbessern | `profil_verbessern` | Verbesserungsvorschlaege |
| Quereinsteiger-Programm | `quereinsteiger` | Info zum 6-Monats-Programm |

**Arbeitgeber-Modus:**

| Aktion | Key | Beschreibung |
|--------|-----|-------------|
| Pipeline-Ueberblick | `pipeline` | Recruiting-Funnel mit Zahlen |
| Top Kandidaten | `top_kandidaten` | Beste 3 Bewerber im Detail |
| Kritische Bewerbungen | `kritische` | Score <40, erfordern Bearbeitung |
| Absage-Mail | `absage_mail` | Generierte Absage-Vorlage |
| Matching-Kriterien | `matching_kriterien` | Erklaerung der Score-Gewichtung |

---

## Demo-Daten

### Bewerber-Profile (3 Hauptprofile + 7 weitere)

#### Hauptprofile (direkt auswaehlbar)

**1. Max Berger (ID: `max`) -- Top-Kandidat**
- Score: 92 | Status: Empfohlen
- 34 Jahre, Duesseldorf (NRW)
- 8 Jahre Versicherungsvertrieb (Allianz Aussendienst)
- BWL-Studium (B.A.), IHK Versicherungsfachmann
- Scores: Vertrieb 95, Branche 90, Qualifikation 88, Standort 92, Soft Skills 85
- Staerken: Kundenakquise, Bestandsmanagement, Fuehrungserfahrung (3 MA), IHK-qualifiziert

**2. Sarah Klein (ID: `sarah`) -- Quereinsteigerin**
- Score: 68 | Status: Pruefen
- 29 Jahre, Koeln (NRW)
- 4 Jahre Einzelhandel (Teamleitung MediaMarkt)
- Ausbildung Einzelhandelskauffrau, Weiterbildung Vertrieb
- Scores: Vertrieb 65, Branche 35, Qualifikation 55, Standort 88, Soft Skills 82
- Staerken: Teamfuehrung, Kommunikationsstaerke, Vertriebsaffinitaet

**3. Thomas Wendt (ID: `thomas`) -- Ablehnung**
- Score: 31 | Status: Abgelehnt
- 52 Jahre, Flensburg (Nord)
- 20 Jahre Sachbearbeitung Kommunalverwaltung
- Verwaltungsfachangestellter
- Scores: Vertrieb 10, Branche 5, Qualifikation 25, Standort 20, Soft Skills 35
- Erhaelt Ablehnungsbescheid mit detaillierter Begruendung

#### Weitere Profile (nur im Recruiting Dashboard)

| Name | ID | Score | Status | Stadt | Region | Hintergrund |
|------|-----|-------|--------|-------|--------|-------------|
| Julia Hoffmann | `julia` | 88 | Empfohlen | Essen | NRW | 5J Maklertaetigkeit, IHK |
| Markus Scholz | `markus` | 84 | Empfohlen | Bonn | NRW | 6J Bankvertrieb (Sparkasse) |
| Anna Weber | `anna` | 62 | Pruefen | Dortmund | NRW | 2J Kundenservice (Telekom) |
| Peter Mueller | `peter` | 72 | Pruefen | Koeln | NRW | 12J Aussendienst (diverse) |
| Lisa Krause | `lisa` | 65 | Pruefen | Duesseldorf | NRW | 1J Praktikum Versicherung |
| Frank Bergmann | `frank` | 38 | Abgelehnt | Hamburg | Nord | Lagerlogistik, keine Qualifikation |
| Sabine Richter | `sabine` | 42 | Abgelehnt | Bremen | Nord | 3J Gastgewerbe, Beschaeftigungsluecke |

### Stellenangebote (8 Positionen)

| # | Titel | Stadt | Region | Typ | Anforderungen |
|---|-------|-------|--------|-----|---------------|
| 1 | Agenturleiter | Duesseldorf | NRW | Fuehrung | Min. 5J Vertrieb, Fuehrungskompetenz, IHK |
| 2 | Vertriebsspezialist Leben | Koeln | NRW | Spezialist | Erfahrung Lebensversicherung, IHK |
| 3 | Maklerbetreuer | Essen | NRW | Betreuung | Netzwerk, Branchenkenntnis |
| 4 | Ausschliesslichkeitsvermittler | Dortmund | NRW | Vertrieb | Vertriebsaffinitaet, Eigeninitiative |
| 5 | Trainee Vertrieb | Koeln | NRW | Einstieg | Vertriebsaffinitaet, Lernbereitschaft |
| 6 | Vertriebspartner Sach/HUK | Bonn | NRW | Vertrieb | Sachversicherung, Kundenberatung |
| 7 | Bezirksdirektor | Muenster | NRW | Fuehrung | Min. 8J Vertrieb, Fuehrung >5 MA |
| 8 | Kundenberater Innendienst | Hamburg | Nord | Beratung | Kommunikation, Versicherungskenntnisse |

### Entfernungsmatrix (km)

|  | Duesseldorf | Koeln | Essen | Dortmund | Bonn | Muenster | Hamburg |
|---|---|---|---|---|---|---|---|
| **Duesseldorf** | 0 | 40 | 30 | 60 | 75 | 125 | 410 |
| **Koeln** | 40 | 0 | 65 | 90 | 30 | 150 | 430 |
| **Flensburg** | 530 | 570 | 500 | 470 | 600 | 400 | 155 |

---

## UI-Komponenten

### Score-Ring (SVG)

Kreisfoermiger Fortschrittsindikator mit animiertem `stroke-dashoffset`:

```html
<div class="cv-score-ring">
    <svg viewBox="0 0 56 56">
        <circle class="score-bg" cx="28" cy="28" r="24"/>
        <circle class="score-fill high|mid|low" cx="28" cy="28" r="24"
                stroke-dasharray="151"
                stroke-dashoffset="[berechnet]"/>
    </svg>
    <div class="cv-score-value">92%</div>
</div>
```

### Match-Badges

Farbcodierte Tags auf Stellenkarten:

- **Gruen:** Wohnortnaehe, Kommunikationsstaerke, Fuehrungskompetenz
- **Blau:** Branchenerfahrung, Vertriebserfahrung, IHK-qualifiziert
- **Orange:** Einstiegsposition

### Radar-Chart

Chart.js Radar-Diagramm mit 5 Achsen (Vertrieb, Branche, Qualifikation, Standort, Soft Skills). Verwendet die Brand-Farbe (#C8102E) mit 10% Fill und 70% Border.

### Filter (Recruiting Dashboard)

3 Select-Dropdowns fuer die Bewerber-Uebersicht:

- **Region:** Alle / NRW / Norddeutschland / Sueddeutschland
- **Score:** Alle / >80 / 60-80 / <60
- **Status:** Alle / Empfohlen / Pruefen / Ablehnung empfohlen

---

## Globale Funktionen

| Funktion | Beschreibung |
|----------|-------------|
| `openCVScanner()` | Modul oeffnen (async, laedt HTML-Template) |
| `closeCVScanner()` | Modul schliessen, zurueck zur Landing-Page |
| `switchCVMode(mode)` | Modus wechseln (`'bewerber'` / `'arbeitgeber'`) |
| `handleCVUpload(event)` | CV-Upload (laedt Demo-Profil Max) |
| `loadDemoProfile(id)` | Demo-Profil laden (`'max'`, `'sarah'`, `'thomas'`) |
| `resetCVBewerber()` | Upload-Ansicht zuruecksetzen |
| `toggleMatchDetails(idx)` | Stellen-Details ein-/ausklappen |
| `sortCVMatches(sortBy)` | Stellen sortieren (`'score'`, `'distance'`, `'region'`) |
| `filterCVApplicants()` | Bewerber-Grid filtern |
| `openCVDetail(id)` | Bewerber-Detail-Overlay oeffnen |
| `closeCVDetail()` | Detail-Overlay schliessen |
| `cvDetailAction(action)` | Detail-Aktion (`'einladen'`, `'ablehnen'`, `'merken'`) |
| `toggleCVChat()` | Chat-Fenster ein-/ausblenden |
| `cvChatAction(action)` | Chat-Aktion ausfuehren |
