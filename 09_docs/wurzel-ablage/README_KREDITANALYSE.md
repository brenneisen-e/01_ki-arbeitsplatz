# KI-Kreditanalyse -- Architektur & Dokumentation

## Ueberblick

Die **KI-Kreditanalyse** ist eine React-Single-Page-Application (SPA) fuer die
digitale Firmenkreditanalyse. Sie bildet den vollstaendigen Kreditprozess ab --
von der Antragserfassung ueber KYC, Bilanzanalyse, Rating und Sicherheiten-
bewertung bis zur Kreditentscheidung und laufendem Monitoring.

**Tech-Stack:**
- React 19 + Vite 7
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- Recharts (Diagramme: Balken, Linien, Pie, Sparklines)
- Lucide React (Icons)
- class-variance-authority + clsx + tailwind-merge (CSS-Utility-Komposition)

---

## Verzeichnisstruktur

```
14_kreditanalyse/
  src/
    main.jsx                       # React-Entry-Point
    App.jsx                        # AppProvider + MainLayout
    index.css                      # Design-Tokens (@theme), Fonts, Print-Styles
    context/
      AppContext.jsx                # Globaler State (useReducer)
    hooks/
      useAI.js                     # KI-Assistenten-Hook (API + Demo-Fallback)
    components/
      layout/
        MainLayout.jsx             # Shell: Sidebar + Header + Content + AI-Panel
        Sidebar.jsx                # Linke Navigation (8 Menuepunkte)
        Header.jsx                 # Breadcrumb, KI-Assistent-Button, User-Info
        AIChatPanel.jsx            # Seitliches Chat-Panel mit KI-Assistent
      dashboard/
        DashboardView.jsx          # Dashboard mit Pipeline/Tabelle Toggle
        KPICards.jsx               # 4 KPI-Karten (Antraege, Zeit, Quote, Volumen)
        PipelineBoard.jsx          # Kanban-Board (7 Spalten)
        ApplicationsTable.jsx      # Sortierbare Antrags-Tabelle
      application/
        NewApplicationView.jsx     # Kreditantrags-Formular (4 Sektionen)
      kyc/
        KYCView.jsx                # KYC & Compliance (4 Tabs)
      analysis/
        AnalysisView.jsx           # §18 KWG Pruefung (4 Tabs)
      rating/
        RatingView.jsx             # Rating (5 Tabs)
      collateral/
        CollateralView.jsx         # Sicherheitenbewertung (3 Tabs)
      decision/
        DecisionView.jsx           # Kreditentscheidung (4 Tabs)
      monitoring/
        MonitoringView.jsx         # Monitoring & Fruehwarnung (4 Tabs)
      shared/
        AmountInput.jsx            # Betragseingabe mit Formatierung
        DataTable.jsx              # Wiederverwendbare sortierbare Tabelle
        PercentageBar.jsx          # Prozentbalken-Visualisierung
        RatingBadge.jsx            # Farbige Rating-Klassen-Badge
        SparklineChart.jsx         # Mini-Sparkline (SVG)
        StatusBadge.jsx            # Status-Badge (Farbe nach Status)
        StepCompleteBar.jsx        # Fortschrittsbalken fuer Workflow-Schritte
        TrafficLight.jsx           # Ampel-Indikator (gruen/gelb/rot)
    data/
      demoCompanies.js             # 8 Demo-Unternehmen mit Bilanzen
      branchBenchmarks.js          # Branchen-Kennzahlen-Benchmarks (8 Branchen)
      ratingScales.js              # IFD-, Sparkassen-, VR-Rating-Skalen
      haircutRates.js              # Sicherheiten-Abschlaege (Haircuts)
      competencyMatrix.js          # Kompetenzmatrix + Genehmigungsstufen
    utils/
      financialCalculations.js     # Bilanz-Kennzahlen-Berechnungen
      ratingEngine.js              # Rating-Berechnung (Quantitativ/Qualitativ/Konto)
      formatters.js                # Formatierung (EUR, %, Datum, SLA-Farben)
```

---

## State-Management (AppContext)

Zentraler State via `useReducer` in `context/AppContext.jsx`:

| State-Key | Typ | Beschreibung |
|-----------|-----|--------------|
| `currentView` | `string` | Aktive View (`dashboard`, `application`, `kyc`, `analysis`, `rating`, `collateral`, `decision`, `monitoring`) |
| `currentSubView` | `string?` | Optionale Sub-View fuer Breadcrumbs |
| `selectedCompanyId` | `string?` | Aktuell ausgewaehltes Unternehmen |
| `companies` | `Array` | Liste aller Kreditantraege (initialisiert aus `demoCompanies`) |
| `sidebarCollapsed` | `boolean` | Sidebar ein-/ausgeklappt |
| `aiPanelOpen` | `boolean` | KI-Chat-Panel sichtbar |
| `aiMessages` | `Array` | Chat-Verlauf mit KI-Assistent |
| `applicationDraft` | `Object` | Formulardaten des aktuellen Kreditantrags |
| `kycState` | `Object` | KYC-Pruefungsstatus pro Unternehmen |
| `qualitativeAnswers` | `Object` | Qualitative Rating-Antworten pro Unternehmen |
| `votingState` | `Object` | Votierungs-Status pro Unternehmen |
| `notifications` | `Array` | System-Benachrichtigungen |

**Wichtige Actions:**
- `NAVIGATE` -- View wechseln
- `SELECT_AND_NAVIGATE` -- Unternehmen auswaehlen + View wechseln (z.B. Pipeline-Klick)
- `ADVANCE_STATUS` -- Unternehmen in naechste Pipeline-Stufe schieben
- `SET_COMPANY_STATUS` -- Status direkt setzen (z.B. `approved`/`rejected`)
- `UPDATE_KYC_STATE` / `UPDATE_QUALITATIVE_ANSWERS` / `UPDATE_VOTING_STATE` -- Per-Company State

**Status-Flow:**
```
eingegangen -> kyc -> analysis -> rating -> collateral -> decision -> voting
                                                                       |
                                                              approved / rejected
```

---

## Layout

```
+------------------+------------------------------------------------+--------+
| Sidebar (240px)  | Header (Breadcrumb + KI-Button + User)         | AI     |
| oder 64px (coll) |------------------------------------------------| Chat   |
|                  |                                                 | Panel  |
| - Dashboard      |   Main Content (max 1440px)                    | (380px)|
| - Kreditantrag   |                                                 |        |
| - KYC            |   <ViewComponent />                            |        |
| - §18 KWG        |                                                 |        |
| - Rating         |                                                 |        |
| - Sicherheiten   |                                                 |        |
| - Entscheidung   |                                                 |        |
| - Monitoring     |                                                 |        |
+------------------+-------------------------------------------------+--------+
```

- **Sidebar:** 8 Navigationspunkte, collapsible (60px), Dark-Theme (`#0F172A`)
- **Header:** Breadcrumb (View > Firma > Sub-View), KI-Assistent-Toggle, Benachrichtigungen, User-Info
- **AI-Panel:** Seitlich ein-/ausklappbar, kontextsensitiv pro View

---

## Design-Tokens

Definiert in `index.css` via Tailwind `@theme`:

| Token | Wert | Verwendung |
|-------|------|-----------|
| `--color-primary` | `#1B2B4B` | Sidebar aktiv, Header-Akzent, Buttons |
| `--color-primary-light` | `#2D4A7A` | Hover-States |
| `--color-accent` | `#00875A` | Positiv-Indikatoren (gruen) |
| `--color-accent-warm` | `#D97706` | Warn-Indikatoren (orange) |
| `--color-danger` | `#DC2626` | Fehler/Risiko (rot) |
| `--color-surface` | `#F8FAFC` | Hintergrund |
| `--color-surface-card` | `#FFFFFF` | Karten |
| `--color-surface-dark` | `#0F172A` | Sidebar |

Fonts: **DM Sans** (Headlines), **IBM Plex Sans** (Body), **IBM Plex Mono** (Zahlen)

---

## Mock-Daten: 8 Demo-Unternehmen

Die Datei `data/demoCompanies.js` enthaelt 8 deutsche Unternehmen mit
vollstaendigen Daten fuer den gesamten Kreditprozess:

| ID | Firma | Branche | Kredit | Status |
|----|-------|---------|--------|--------|
| CRED-2024-001 | Mueller Maschinenbau GmbH | Maschinenbau | 1.500.000 EUR | rating |
| CRED-2024-002 | TechVision IT GmbH | IT-Dienstleistungen | 250.000 EUR | kyc |
| CRED-2024-003 | Gasthaus zum Goldenen Hirsch | Gastronomie | 180.000 EUR | analysis |
| CRED-2024-004 | Schmidt Logistik GmbH & Co. KG | Logistik/Transport | 3.200.000 EUR | collateral |
| CRED-2024-005 | MedTech Solutions AG | Medizintechnik | 5.000.000 EUR | voting |
| CRED-2024-006 | Bauer Handwerk GmbH | Handwerk (Elektro) | 400.000 EUR | voting |
| CRED-2024-007 | Rheinland Immobilien GmbH | Immobilienwirtschaft | 8.500.000 EUR | decision |
| CRED-2024-008 | NordStyle GmbH | E-Commerce | 350.000 EUR | approved |

**Datenstruktur pro Unternehmen:**

```javascript
{
  id, firma, rechtsform, hrb, amtsgericht, gruendung, branche, wz_code,
  adresse: { strasse, plz, ort },
  mitarbeiter, steuer_id, ust_id, hauptbank,
  gf: [{ name, geb, funktion, anteil, seit, erfahrung }],
  kredit: { art, betrag, laufzeit, tilgungsfrei, verwendung, verwendungKategorie, auszahlung },
  bilanzen: {
    2023: { eigenkapital, umsatz, jahresueberschuss, abschreibungen, zinsaufwand,
            steuern, personalaufwand, materialaufwand, sonstige_ertraege,
            immateriell, sachanlagen, finanzanlagen, vorraete, forderungen, liquide,
            verb_kurz, verb_lang, rueckstellungen },
    2022: { ... },
    2021: { ... }
  },
  bwa: [{ monat, umsatz, gewinn }],   // 12 Monate
  sicherheiten: [{ art, bezeichnung, nominalwert, bewertung, datum, rang }],
  konto: { kontokorrentlinie, auslastung_avg, ueberziehungen_12m,
           ruecklastschriften_12m, pfaendungen, saldo_avg },
  schufa: { score, negativeEintraege },
  creditreform: { index, bonitaet },
  status, bearbeiter, faellig,
  bestehende_verbindlichkeiten: [{ bank, art, betrag, rate, restlaufzeit }]
}
```

---

## Views und Funktionen

### 1. Dashboard (`DashboardView`)

**KPI-Karten (4 Stueck):**
- Offene Antraege (Anzahl, dynamisch berechnet)
- Ø Bearbeitungszeit (12 Tage, Demo-Wert)
- Genehmigungsquote (berechnet aus approved/rejected)
- Volumen in Bearbeitung (Summe aller offenen Kreditbetraege)

**Pipeline-Board (Kanban):**
7 Spalten entsprechend dem Workflow:
`Eingegangen -> KYC -> §18 Pruefung -> Rating -> Sicherheiten -> Votierung -> Entschieden`

Jede Spalte zeigt Cards mit: Firma, Kreditbetrag, Branche, Bearbeiter, SLA-Countdown.
Klick auf eine Card navigiert zur passenden Detail-View.

**Tabellen-Ansicht:**
Sortierbare Tabelle mit allen Antraegen (Toggle zwischen Pipeline/Tabelle).

### 2. Kreditantrag (`NewApplicationView`)

Multi-Sektion-Formular mit 4 Bereichen:
- **A: Antragsteller** -- Firma, Rechtsform, HRB, Branche, WZ-Code, Adresse, Mitarbeiter
- **B: Geschaeftsfuehrung** -- Dynamische Tabelle mit GF/Gesellschafter (Name, Geb., Funktion, Anteil, Erfahrung)
- **C: Kreditwunsch** -- Art (Investition/Betriebsmittel/KK/Aval/Immobilie), Betrag, Laufzeit, Tilgungsfrei, Verwendung
- **D: Bestehende Verbindlichkeiten** -- Dynamische Liste (Bank, Art, Betrag, Rate, Restlaufzeit)
- **KI-Voranalyse** -- Simulierte KI-Bewertung mit Ampel-Ergebnis

### 3. KYC & Compliance (`KYCView`)

4 Tabs:
- **Identifizierung & Legitimation** -- Dokumenten-Checkliste (HR-Auszug, Gesellschaftsvertrag, Ausweise etc.) mit Status-Tracking (Offen/Eingereicht/Geprueft/Mangel)
- **UBO-Ermittlung** -- Ultimate Beneficial Owner aus GF-Daten, Beteiligungsstruktur, >25%-Schwelle
- **PEP-Screening** -- Politisch exponierte Personen, simulierte Pruefergebnisse
- **Sanktionslistenpruefung** -- EU/UN/OFAC-Listen, simulierte KI-Pruefung

Fortschrittsbalken (`StepCompleteBar`) ueber allen Tabs.

### 4. §18 KWG Pruefung (`AnalysisView`)

4 Tabs:
- **Dokumenten-Upload** -- §18-Schwellenwertpruefung (750.000 EUR), Dokumentstatus-Cards, Upload-Simulation
- **Bilanzanalyse** -- 3-Jahres-Bilanz-Tabelle (Aktiva/Passiva), GuV-Tabelle, Kennzahlen-Dashboard mit 18 Kennzahlen + Ampelbewertung + Branchen-Benchmark, KI-Analyse-Button
- **BWA-Analyse** -- Monats-Chart (Umsatz + Gewinn als ComposedChart mit Recharts)
- **Kapitaldienstfaehigkeit** -- DSCR-Kalkulator mit Stress-Test-Slidern (Umsatz-/Kostenvariation), Tilgungsplan

### 5. Rating (`RatingView`)

5 Tabs:
- **Quantitatives Rating** -- 8 gewichtete Kennzahlen (EK-Quote 15%, EBITDA-Marge 15%, Dyn. Verschuldung 15%, Liquiditaet III 15%, Verschuldungsgrad 10%, GK-Rentabilitaet 10%, Zinsdeckung 10%, Cashflow-Rate 10%), Ampelbewertung, Branchen-Vergleich
- **Qualitatives Rating** -- 12 Fragen in 4 Gruppen (Management, Markt, Branche, Finanzen), Scoring 1-5
- **Eigentuemer-Rating** -- Schufa-Score + Creditreform-Index, automatische Umrechnung
- **Kontoführungsrating** -- KK-Auslastung, Ueberziehungen, Ruecklastschriften, Pfaendungen
- **Gesamtrating & PD** -- Gewichtete Zusammenfuehrung (Quant. 65%, Qual. 25%, Konto 10%), Rating-Klasse (Sparkassen- und VR-Skala), Ausfallwahrscheinlichkeit (PD), Visualisierung auf Rating-Leiter

### 6. Sicherheiten (`CollateralView`)

3 Tabs:
- **Sicherheiten erfassen** -- Dynamische Formular-Liste (Art, Bezeichnung, Nominalwert, Bewertungsverfahren, Rang)
- **Bewertung & Haircuts** -- Automatische Haircut-Berechnung anhand `haircutRates.js` (Grundschuld Wohn 30%, Gewerbe 45%, Maschinen 55%, Fahrzeuge 55%, etc.), anrechenbarer Wert
- **Blankoanteil & LTV** -- Deckungsanalyse (Gesamtsicherheiten vs. Kreditbetrag), Rating-abhaengige Blanko-Limits (Rating 1-3: bis 100%, 4-6: max 30-50%, 7-9: max 10-20%, >=10: Vollbesicherung)

### 7. Kreditentscheidung (`DecisionView`)

4 Tabs:
- **Finanzierungsstruktur** -- Investitionsplan, Annuitaeten-Tilgungsplan, Chart
- **Konditionenberechnung** -- Zinsaufbau mit Slidern (Basiszins, Bonitaetsmarge, Laufzeitmarge, Risikomarge, Sondermarge), Marktvergleich
- **Votierung** -- Dual-Vote: Markt (Vertrieb) + Marktfolge (Risiko), MaRisk-konformes 4-Augen-Prinzip, KI-generiertes Kreditvotum
- **Genehmigungsworkflow** -- Kompetenzmatrix-Abgleich (Betrag x Rating -> Sachbearbeiter/Abteilungsleiter/Bereichsleiter/Vorstand/Gesamtvorstand+AR), Workflow-Stepper

### 8. Monitoring (`MonitoringView`)

4 Tabs:
- **Portfolio-Uebersicht** -- KPI-Karten (Gesamtobligo, Durchschnittsrating, NPL-Quote), Portfolio-Verteilung nach Rating/Branche (PieChart + BarChart), Tabelle
- **Fruehwarnindikatoren** -- Pro Unternehmen: KK-Auslastung, Umsatzveraenderung, Ruecklastschriften, Rating-Drift, mit Ampel-Bewertung
- **Rating-Migration** -- Migrations-Matrix (Heatmap) fuer Rating-Veraenderungen
- **Watchlist** -- Eskalationspfad nach MaRisk BTO 1.2 (Intensivbetreuung/Sanierung/Abwicklung)

---

## KI-Assistent

**Implementierung:** `hooks/useAI.js` + `AIChatPanel.jsx`

- Versucht API-Call an `api.anthropic.com` (Claude Sonnet)
- Bei Fehler (fehlender API-Key, Netzwerk): automatischer Fallback auf Demo-Responses
- **Kontextsensitiv:** Jede View hat einen eigenen System-Prompt (`viewContextPrompts`)
- **Funktionen:** Chat-Verlauf, Export als HTML/PDF, Markdown-Rendering
- **Demo-Responses:** EK-Quote-Analyse, Risikoanalyse, Zusammenfassung, Default-Antwort

---

## Berechnungs-Engines

### Finanzielle Kennzahlen (`utils/financialCalculations.js`)

18 Kennzahlen in 4 Kategorien:

**Vermoegen-/Kapitalstruktur:**
- Eigenkapitalquote, Verschuldungsgrad, Anlagendeckung I + II, Anlagenintensitaet

**Ertragskraft:**
- Umsatzrentabilitaet, Gesamtkapitalrentabilitaet, EBITDA-Marge, Cashflow-Rate,
  Personal-/Materialaufwandsquote

**Liquiditaet:**
- Liquiditaet I/II/III, Working Capital

**Entschuldungsfaehigkeit:**
- Dynamischer Verschuldungsgrad, Zinsdeckungsgrad, Schuldentilgungsdauer

### Rating-Engine (`utils/ratingEngine.js`)

**Scoring-Logik:**
- Kennzahlen-Score 1-6 gegen Branchen-Benchmarks (hoeher/niedriger ist besser)
- Ampel: 1-2 = gruen, 3-4 = gelb, 5-6 = rot

**Rating-Komponenten:**
| Komponente | Gewicht | Methode |
|------------|---------|---------|
| Quantitatives Rating | 65% | 8 gewichtete Bilanz-Kennzahlen |
| Qualitatives Rating | 25% | 12 Fragen, Durchschnitt |
| Kontoführungsrating | 10% | KK-Auslastung + Ueberziehungen + Ruecklastschriften + Pfaendungen |
| Eigentuemer-Adjustment | +/- | Schufa + Creditreform -> Score-Anpassung |

**Rating-Klassen:** Score (1.0-6.0) -> Sparkassen-Klasse (1 bis 13+) -> Ausfallwahrscheinlichkeit (PD: 0.01% bis 40%)

### Branchen-Benchmarks (`data/branchBenchmarks.js`)

8 Branchen mit je 16 Schwellenwerten (gut/mittel/schlecht):
Maschinenbau, IT-Dienstleister, Gastronomie, Logistik, Medizintechnik, Handwerk, Immobilien, E-Commerce

### Kompetenzmatrix (`data/competencyMatrix.js`)

```
                    Rating 1-5       Rating 6-9       Rating 10+
< 250.000 EUR       Sachbearbeiter   Abteilungsleiter Bereichsleiter
250k-750k EUR       Abteilungsleiter Bereichsleiter   Vorstand
750k-2.5M EUR       Bereichsleiter   Vorstand         Gesamtvorstand
> 2.5M EUR          Vorstand         Gesamtvorstand   Gesamtvorstand + AR
```

### Haircut-Tabelle (`data/haircutRates.js`)

| Sicherheitenart | Standard-Abschlag | Anrechnung |
|-----------------|-------------------|------------|
| Grundschuld Wohnimmobilie | 30% | 70% |
| Grundschuld Gewerbeimmobilie | 45% | 55% |
| Maschinen/Anlagen | 55% | 45% |
| Fahrzeuge | 55% | 45% |
| Globalzession | 35% | 65% |
| Buergschaft natuerl. Person | 40% | 60% |
| Bankbuergschaft | 5% | 95% |
| Festgeldverpfaendung | 2% | 98% |

### Rating-Skalen (`data/ratingScales.js`)

3 Systeme:
- **IFD-Masterskala:** 6 Klassen (I-VI, AAA bis C)
- **Sparkassen-Skala (DSGV):** 18 Klassen + 3 Ausfallklassen (1 bis 18+)
- **VR-Rating-Skala:** 16 Klassen + Ausfallklassen (0a bis III)

---

## Navigation & Routing

Kein Router-Framework -- Navigation erfolgt ueber `useReducer`-Actions:

```javascript
navigate('dashboard')                           // View wechseln
selectAndNavigate('CRED-2024-001', 'analysis')  // Firma auswaehlen + View
dispatch({ type: 'ADVANCE_STATUS', companyId }) // Pipeline weiterschieben
```

Die Sidebar spiegelt die 8 Haupt-Views wider, jede View verwaltet ihre eigenen Tabs intern via `useState`.

---

## Shared Components

| Komponente | Funktion |
|-----------|----------|
| `StepCompleteBar` | Fortschrittsbalken fuer Workflow-Schritte (z.B. KYC: 3/4 erledigt) |
| `TrafficLight` | Ampel-Indikator (gruen/gelb/rot) fuer Kennzahlen |
| `RatingBadge` | Farbige Badge mit Rating-Klasse |
| `StatusBadge` | Status-Anzeige (eingegangen/kyc/rating/approved etc.) |
| `SparklineChart` | Mini-SVG-Sparkline fuer KPI-Trend |
| `DataTable` | Wiederverwendbare sortierbare Tabelle |
| `PercentageBar` | Horizontaler Prozentbalken |
| `AmountInput` | Betragseingabe mit de-DE Formatierung |

---

## Build & Deployment

```bash
cd kreditanalyse
npm install
npm run dev      # Vite Dev-Server
npm run build    # Production Build -> dist/
npm run preview  # Preview des Builds
```

Die App kann standalone laufen oder als iframe im uebergeordneten KI-Vertriebsarbeitsplatz eingebettet werden. Der Header erkennt via `window.parent !== window` ob er in einem iframe laeuft und zeigt dann einen "Startseite"-Button.
