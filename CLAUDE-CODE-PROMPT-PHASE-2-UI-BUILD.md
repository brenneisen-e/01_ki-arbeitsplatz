# CLAUDE CODE PROMPT — Phase 2: UI-Build Versicherungs-1×1

## KONTEXT

Du arbeitest am **Versicherungs-1×1**, einer interaktiven Wissensplattform innerhalb der bestehenden Vue.js-Anwendung unter `https://kiarbeitsplatz.pages.dev/#/versicherungs-1x1`.

**Phase 1 (Deep Research) wurde bereits abgeschlossen.** Die recherchierten Inhalte liegen als JSON-Dateien unter `/src/data/versicherungs-1x1/` vor. Falls diese JSONs noch nicht existieren oder unvollständig sind, erstelle sie basierend auf deinem Wissen und Web-Recherche, bevor du mit dem Build beginnst.

Deine Aufgabe: **Den vollständigen UI-Build durchführen** — alle Komponenten, alle 9 Module als Unterseiten, Glossar, Quiz, Klickstrecken, Charts.

**Zielgruppe:** Neue Strategie-Berater bei Monitor Deloitte. Design-Anspruch: editorial, professionell, auf dem Niveau von Stripe Press oder Apple Developer Docs.

---

## SCHRITT 0: CODEBASE ANALYSIEREN

**Bevor du irgendetwas baust:**

1. Lies die bestehende Projektstruktur: `find src/ -type f | head -100`
2. Prüfe den Router: Wie ist `/versicherungs-1x1` aktuell geroutet?
3. Prüfe vorhandene Abhängigkeiten in `package.json`: Welche Chart-Libraries, Icon-Libraries, UI-Frameworks sind bereits installiert?
4. Prüfe den bestehenden Design-Token / Tailwind-Config: Welche Farben, Fonts sind definiert?
5. Schau dir bestehende Komponenten an: Gibt es wiederverwendbare Patterns?

**Erst danach** entscheidest du, welche Libraries du zusätzlich brauchst und wie du dich in die bestehende Architektur einfügst. Baue NICHTS, was gegen die bestehende Struktur arbeitet.

---

## SCHRITT 1: ABHÄNGIGKEITEN INSTALLIEREN

Prüfe ob folgende Pakete bereits vorhanden sind. Installiere nur was fehlt:

```bash
# Chart-Library (prüfe ob vue-chartjs oder recharts bereits vorhanden)
npm install chart.js vue-chartjs

# Icons (prüfe ob lucide-vue-next bereits vorhanden)
npm install lucide-vue-next

# Animationen (optional, nur wenn noch nicht vorhanden)
npm install @vueuse/core @vueuse/motion
```

**Keine unnötigen Pakete installieren.** Nutze was da ist. Tailwind ist bereits konfiguriert.

---

## SCHRITT 2: DESIGN-SYSTEM & BASIS-KOMPONENTEN

### 2.1 Design Tokens

Falls noch nicht vorhanden, erstelle eine zentrale Design-Token-Datei oder erweitere die Tailwind-Config:

```
Primär:       #111827 (gray-900), #1F2937 (gray-800), #374151 (gray-700)
Akzent:       #2563EB (blue-600)
Erfolg:       #059669 (emerald-600)
Warnung:      #D97706 (amber-600)
Fehler:       #DC2626 (red-600)
Hintergrund:  #FFFFFF (white), #F9FAFB (gray-50)
Borders:      #E5E7EB (gray-200)
Text Sekundär: #6B7280 (gray-500)
```

Typografie: System-Font-Stack oder Inter. Body 16px, Line-Height 1.6, max 70ch Zeilenbreite im Content.

### 2.2 Basis-Komponenten bauen

Erstelle diese Komponenten unter `/src/components/versicherungs-1x1/` (oder dem Pfad, der zur bestehenden Struktur passt):

**Pflicht-Komponenten (alle 15 bauen):**

#### 1. `KeyStatCard.vue`
- Props: `value` (string/number), `unit` (string), `label` (string), `trend` (string), `trendDirection` ('up'|'down'|'neutral'), `source` (string)
- Feature: CountUp-Animation beim Einblenden (Intersection Observer)
- Design: Große Zahl (32-48px, font-bold, monospace), kleinerer Label, Trend-Pfeil farbcodiert (grün ↑, rot ↓), Quellenangabe als Caption

#### 2. `InfoKachel.vue`
- Props: `icon` (Lucide-Icon-Name), `title`, `description`, `link` (optional)
- Design: Weißer Hintergrund, 1px Border, Lucide-Icon oben links (24px, gray-400), Titel bold, 2-3 Zeilen Text
- Hover: Subtle shadow-lift (`shadow-sm` → `shadow-md`), leichte Y-Translation (-2px)

#### 3. `AccordionBlock.vue`
- Props: `title`, `level` (2|3), `defaultOpen` (boolean)
- Feature: Smooth height-Animation (max-height transition oder Vue `<Transition>`)
- Design: Level-2 hat linken Rand `border-l-2 border-gray-300`, Level-3 hat `border-l-2 border-gray-900`
- Chevron-Icon rotiert bei open/close

#### 4. `ChartContainer.vue`
- Props: `title`, `subtitle` (optional), `source` (string), `height` (string, default '400px')
- Slot für den eigentlichen Chart
- Design: Titel oben links (font-semibold), Source unten rechts (text-xs, gray-400)
- Responsive: 100% Breite, feste Höhe

#### 5. `ComparisonTable.vue`
- Props: `columns` (array of { key, label }), `rows` (array of objects), `highlightColumn` (optional)
- Feature: Horizontales Scrollen auf Mobile, sticky erste Spalte
- Design: Zebra-Striping (gray-50), Header gray-100, Highlight-Column mit blauem Hintergrund (blue-50)

#### 6. `TimelineComponent.vue`
- Props: `events` (array of { year, title, description, type })
- Design: Horizontale Linie, Punkte auf der Achse, Popup bei Hover/Click
- Feature: Horizontal scrollbar auf Mobile, Scroll-Snap
- Farbcodierung nach `type`: 'regulation' (blue), 'market' (gray), 'crisis' (red), 'innovation' (green)

#### 7. `QuizCard.vue`
- Props: `question`, `options` (array), `correctAnswer` (index), `explanation`, `type` ('single'|'multiple')
- State: `selectedAnswer`, `isRevealed`
- Design: Frage bold, Optionen als klickbare Karten, nach Reveal: korrekt = grüner Rand, falsch = roter Rand
- Erklärung wird nach Antwort eingeblendet (slide-down)

#### 8. `GlossarPopover.vue`
- Props: `term`, `definition`, `relatedModules` (array of module IDs)
- Trigger: Hover (Desktop) / Tap (Mobile) auf unterstrichenen Begriff (dotted underline, blue-600)
- Design: Floating Popover mit Pfeil, max-width 320px, z-50

#### 9. `ProgressBar.vue`
- Props: `progress` (0-100), `label` (optional)
- Design: Schmaler Balken (4px Höhe), blue-600 fill, gray-200 background, rounded
- Animation: Smooth width-Transition

#### 10. `BreadcrumbNav.vue`
- Props: `items` (array of { label, to })
- Design: Text-sm, gray-500, Chevron-Right als Separator, letztes Item bold gray-900

#### 11. `SearchOverlay.vue`
- Trigger: Cmd+K / Ctrl+K
- Feature: Durchsucht alle Module (Titel, Content, Glossar)
- Design: Zentrierter Modal, Suchfeld oben, Ergebnisse darunter gruppiert nach Modul
- Keyboard-Navigation: Pfeiltasten + Enter

#### 12. `DecisionTree.vue`
- Props: `tree` (verschachtelte Struktur mit question, options, nextNode/result)
- State: `currentNode`, `history` (für Zurück-Button)
- Design: Zentrierte Karte mit Frage, Optionen als Buttons, Fortschrittsanzeige
- Ergebnis: Empfehlungskarte mit Icon, Titel, Begründung

#### 13. `SankeyDiagram.vue`
- Props: `nodes`, `links` (D3-Sankey-Format)
- Implementierung: D3.js (`d3-sankey`)
- Feature: Hover-Highlight einzelner Flows, Tooltip mit Werten
- Responsive: SVG viewBox-basiert

#### 14. `HeatmapGrid.vue`
- Props: `rows` (Labels), `columns` (Labels), `data` (2D-Array), `colorScale` (min/max color)
- Design: Grid mit farbcodierten Zellen, Legende unten
- Feature: Hover zeigt exakten Wert, Click-to-filter (optional)

#### 15. `TrendRadar.vue`
- Props: `segments` (array of { name, items: [{ label, ring }] }), `rings` (array: ['Adopt', 'Trial', 'Assess', 'Hold'])
- Design: Konzentrische Kreise, Punkte in Segmenten, Legende
- Feature: Hover zeigt Detail-Popup, Click öffnet Beschreibung
- Implementierung: SVG-basiert oder Canvas

**Nach jedem fertigen Komponenten-Block committen:**
```bash
git add -A && git commit -m "feat(v1x1): Basis-Komponenten KeyStatCard, InfoKachel, AccordionBlock erstellt"
```

---

## SCHRITT 3: LAYOUT-SHELL & ROUTING

### 3.1 Router-Konfiguration

Erweitere den bestehenden Router (NICHT überschreiben!) um Kindrouten:

```
/versicherungs-1x1                    → Übersichtsseite (Kachelraster)
/versicherungs-1x1/01-marktueberblick → Modul 01
/versicherungs-1x1/02-marktteilnehmer → Modul 02
/versicherungs-1x1/03-produktlandschaft → Modul 03
/versicherungs-1x1/04-vertriebswege   → Modul 04
/versicherungs-1x1/05-verguetung      → Modul 05
/versicherungs-1x1/06-regulatorik     → Modul 06
/versicherungs-1x1/07-wertschoepfungskette → Modul 07
/versicherungs-1x1/08-zukunftsthemen  → Modul 08
/versicherungs-1x1/09-verbaende       → Modul 09
/versicherungs-1x1/wissenscheck       → Quiz
/versicherungs-1x1/glossar            → Glossar
```

### 3.2 Layout-Shell: `Versicherungs1x1Layout.vue`

Wrapper-Komponente mit Sidebar + Content-Area:

```
┌──────────────────────────────────────────────────────────────────┐
│  Versicherungs-1×1               [🔍 Suche]   [Fortschritt 34%] │
├───────────────┬──────────────────────────────────────────────────┤
│               │                                                  │
│  SIDEBAR      │  <router-view />                                 │
│  (260px)      │  (max-width: 820px, mx-auto)                     │
│  fixed left   │                                                  │
│               │                                                  │
│  Übersicht    │                                                  │
│               │                                                  │
│  01 Markt ●   │                                                  │
│  02 Player    │                                                  │
│  03 Produkte  │                                                  │
│  ...          │                                                  │
│               │                                                  │
│  ──────────   │                                                  │
│  Wissensch.   │                                                  │
│  Glossar      │                                                  │
│               │                                                  │
│  ● = aktiv    │                                                  │
│  ○ = offen    │                                                  │
│  ✓ = fertig   │                                                  │
└───────────────┴──────────────────────────────────────────────────┘
```

**Sidebar-Verhalten:**
- Desktop (≥1024px): Fixed, sichtbar, 260px breit
- Mobile (<1024px): Hamburger-Button oben links, Sidebar als Drawer von links (overlay, z-40)
- Aktives Modul: Bold, blue-600 Punkt links
- Abgeschlossenes Modul: Grüner Haken
- Fortschritt wird im LocalStorage gespeichert

### 3.3 Fortschritts-Tracking Composable

```typescript
// /src/composables/useModuleProgress.ts
// - Speichert pro Modul: { visited: boolean, sectionsRead: string[], quizCompleted: boolean }
// - Berechnet Gesamtfortschritt (0-100%)
// - Persistiert in LocalStorage unter 'v1x1-progress'
// - Bietet: markSectionRead(moduleId, sectionId), isModuleComplete(moduleId), totalProgress
```

**Commit:** `feat(v1x1): Layout-Shell mit Sidebar, Router-Konfiguration und Progress-Tracking`

---

## SCHRITT 4: ÜBERSICHTSSEITE (LANDING PAGE)

### `Versicherungs1x1Overview.vue`

**Header-Bereich:**
- Titel: "Versicherungs-1×1" (text-3xl, font-bold)
- Untertitel: "Dein Kompendium zum deutschen Versicherungsmarkt" (text-lg, gray-500)
- Gesamtfortschritt als ProgressBar

**Kachelraster: 9 Module**
- Layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Jede Kachel ist eine `<router-link>` zum jeweiligen Modul
- Kachel-Inhalt:
  - Modulnummer (text-sm, gray-400, font-mono)
  - Lucide-Icon (32px, gray-400)
  - Titel (font-semibold)
  - 1-Satz-Beschreibung (text-sm, gray-500)
  - ProgressBar unten
- Hover: Shadow-lift + leichte Scale (1.02)
- Kachel-Hintergrund: white, border gray-200, rounded-xl, p-6

**Icon-Zuordnung (Lucide):**
```
01 Marktüberblick      → BarChart3
02 Marktteilnehmer     → Building2
03 Produktlandschaft    → Package
04 Vertriebswege       → GitBranch
05 Vergütung           → Coins
06 Regulatorik         → Scale
07 Wertschöpfungskette → Settings
08 Zukunftsthemen      → Rocket
09 Verbände            → Landmark
```

**Zusatz-Kacheln darunter (2-spaltig):**
- Wissenscheck: `ClipboardCheck` Icon, "Teste dein Wissen über alle Module"
- Glossar: `BookOpen` Icon, "150+ Fachbegriffe erklärt"

**Commit:** `feat(v1x1): Übersichtsseite mit 9-Modul-Kachelraster und Progress-Tracking`

---

## SCHRITT 5: MODUL-TEMPLATE & ERSTE MODULE

### 5.1 Generisches Modul-Template: `ModulePage.vue`

Jedes Modul folgt demselben Aufbau. Erstelle ein generisches Template, das die JSON-Daten rendert:

**Aufbau einer Modul-Seite (von oben nach unten):**

```
1. BreadcrumbNav       → Übersicht > Modul 01 > Marktgröße
2. Hero-Section        → Titel + Untertitel + 3-4 KeyStatCards im Grid
3. Einführungstext     → 2-3 Absätze Level-1-Content
4. Info-Kacheln        → 3-6 Kacheln als Grid mit Schlüsselthemen
5. Interaktiver Chart  → ChartContainer mit dem Haupt-Chart des Moduls
6. Sektionen           → Für jede Section:
                          - Level 1: Sichtbarer Fließtext
                          - Level 2: AccordionBlock "Mehr erfahren"
                          - Level 3: AccordionBlock "Experten-Detail" (tiefere Einrückung)
                          - Eingebettete Charts wo passend
7. Glossar-Begriffe    → Alle Fachbegriffe im Text als GlossarPopover
8. Quiz-Section        → 2-3 QuizCards zum gerade Gelesenen
9. Kapitel-Navigation  → "← Vorheriges Modul" | "Nächstes Modul →"
```

### 5.2 Module bauen — Reihenfolge und spezifische Anforderungen

Baue die Module in dieser Reihenfolge. Jedes Modul hat neben dem generischen Template spezifische interaktive Elemente:

---

#### MODUL 01 — DER MARKT IM ÜBERBLICK

Spezifische Elemente (zusätzlich zum Template):
- **Treemap-Chart**: Beitragsvolumen aufgeteilt nach Leben / Kranken / Schaden-Unfall. Klick auf Segment zeigt Detail.
- **Line-Chart**: Zeitreihe Beitragsentwicklung 2015-2024, drei Linien (Leben, Kranken, S/U)
- **Bar-Chart**: Top-10-Versicherungsmärkte weltweit (horizontal bars)
- **Timeline**: Historische Meilensteine 1994-2025 (Deregulierung, Finanzkrise, Niedrigzins, Zinswende, etc.)
- **Trend-Kacheln**: 6 InfoKacheln für die Megatrends (Konsolidierung, Digitalisierung, Demografie, Klima, ESG, Zinswende)

KeyStats: Beitragsvolumen (~253 Mrd. €), Anzahl Versicherer (~500), Beschäftigte (~200.000), Kapitalanlagen (~1,8 Bio. €)

**Commit:** `feat(v1x1): Modul 01 - Der Markt im Überblick`

---

#### MODUL 02 — MARKTTEILNEHMER

Spezifische Elemente:
- **Filterbares Ranking**: Tabelle der Top-20-Versicherer, sortierbar nach Beitrag, filterbar nach Sparte und Rechtsform
- **Donut-Chart**: Marktanteile Top-5 vs. Rest, per Dropdown nach Sparte filterbar (Leben, Kfz, Kranken, Gesamt)
- **Konzern-Organigramm**: Vereinfachte Darstellung Allianz-Gruppe und Talanx-Konzern als verschachtelte Karten
- **InsurTech-Map**: Kachelraster der wichtigsten InsurTechs, kategorisiert (Vollversicherer, MGA, Plattform, Vergleicher)

**Commit:** `feat(v1x1): Modul 02 - Marktteilnehmer`

---

#### MODUL 03 — PRODUKTLANDSCHAFT

**Das umfangreichste Modul. Nimm dir hier besonders viel Zeit.**

Spezifische Elemente:
- **Produktkatalog-Kacheln**: Grid mit allen Sparten als klickbare Kacheln. Klick öffnet Detail-Accordion mit Funktionsweise, Zielgruppe, typische Bausteine, Beispielkosten
- **Drei-Schichten-Modell**: SVG-Schaubild mit drei horizontalen Schichten, Klick pro Schicht öffnet Erklärung
- **bAV-Vergleichstabelle**: 5 Durchführungswege nebeneinander (ComparisonTable)
- **GKV-vs-PKV-Vergleich**: Zwei Spalten mit Gegenüberstellung, farbcodiert
- **Klickstrecke "Welche Versicherung brauche ich?"**: DecisionTree mit 5-7 Fragen (Berufstätig? Familie? Immobilie? Auto? Selbstständig?) → Produktempfehlung
- **Cyber-Wachstumschart**: Line-Chart 2019-2024 mit Annotation der Wachstumstreiber

**Commit:** `feat(v1x1): Modul 03 - Produktlandschaft mit Klickstrecke`

---

#### MODUL 04 — VERTRIEBSWEGE

Spezifische Elemente:
- **Vertriebskanal-Kacheln**: 6 große InfoKacheln (AO, Makler, Mehrfachagent, Bancassurance, Direkt, Online) mit Key-Facts und Marktanteil
- **Heatmap**: Vertriebsweg (Zeilen) × Sparte (Spalten) → Marktanteil als Farbintensität
- **Sankey-Diagramm**: Vertragsfluss von Kundengruppen (Privat, Gewerbe, Industrie) durch Vertriebskanäle zu Versicherern
- **Zeitreihe**: Stacked-Area-Chart Verschiebung der Vertriebsweganteile 2010-2024
- **Customer Journey Map**: Horizontale Klickstrecke: Bedarf → Information → Beratung → Angebot → Abschluss → Betreuung

**Commit:** `feat(v1x1): Modul 04 - Vertriebswege mit Sankey und Heatmap`

---

#### MODUL 05 — VERGÜTUNG UND PROVISION

Spezifische Elemente:
- **Provisionsrechner** (DecisionTree-artig oder eigene Komponente):
  - Dropdown: Sparte wählen
  - Input: Jahresbeitrag / Beitragssumme
  - Output: Geschätzte AP, geschätzte BP, Stornohaftungsdauer
  - Disclaimer: "Vereinfachte Darstellung, tatsächliche Sätze variieren"
- **Provisions-Vergleichstabelle**: ComparisonTable mit allen Sparten
- **Geldfluss-Sankey**: Kunde zahlt Beitrag → Versicherer → Aufteilung in Risiko, Verwaltung, Vertrieb (AP + BP + Bonus)
- **Regulatorik-Timeline**: LVRG I (2015) → IDD (2018) → LVRG II → RIS-Debatte
- **Vergleichs-Kacheln**: 3 InfoKacheln: Provision vs. Courtage vs. Honorar mit Pro/Contra

**Commit:** `feat(v1x1): Modul 05 - Vergütung mit Provisionsrechner`

---

#### MODUL 06 — REGULATORIK

Spezifische Elemente:
- **Regulatorik-Pyramide**: SVG mit drei Ebenen (EU → Bund → Unternehmen), jede Ebene klickbar → zeigt zugehörige Gesetze/Regelwerke
- **Solvency-II-Schaubild**: Drei Säulen als Karten nebeneinander, Klick öffnet Accordion mit Details (SCR/MCR, ORSA, SFCR etc.)
- **Gesetzes-Navigator**: 3 große Kacheln (VVG, VAG, IDD) mit den jeweils 5-6 wichtigsten Paragraphen als Unterliste
- **Timeline**: Regulatorische Meilensteine 1994-2025 (Deregulierung → Solvency I → VVG-Reform → Solvency II → IDD → DORA → FIDA)
- **Praxis-Quiz**: 3-4 Szenario-Fragen ("Ein Vermittler vergisst die Beratungsdokumentation — welche Rechtsfolge?")

**Commit:** `feat(v1x1): Modul 06 - Regulatorik mit Solvency-II-Schaubild`

---

#### MODUL 07 — WERTSCHÖPFUNGSKETTE

Spezifische Elemente:
- **Wertschöpfungsketten-Flussdiagramm**: Horizontale Kette (SVG oder CSS Grid):
  `Produktentwicklung → Underwriting → Vertragsverwaltung → Schadenmanagement → Kapitalanlage → Kundenservice`
  Jeder Schritt klickbar → öffnet Detail-Section
- **Combined-Ratio-Rechner**: Zwei Slider (Schadenquote 0-100%, Kostenquote 0-100%) → Ergebnis mit Interpretation (grün <100%, rot >100%)
- **IT-Systemlandkarte**: Kachelraster der wichtigsten Kernsysteme (msg, adesso, Guidewire, SAP) mit Beschreibung
- **Dunkelverarbeitungs-Balken**: Horizontaler Balkenvergleich: Wie viel % ist je Prozessschritt automatisiert?
- **Run-off-Timeline**: Wichtigste Bestandsübertragungen der letzten 10 Jahre

**Commit:** `feat(v1x1): Modul 07 - Wertschöpfungskette mit Flussdiagramm`

---

#### MODUL 08 — ZUKUNFTSTHEMEN

Spezifische Elemente:
- **TrendRadar**: Kreisförmig mit 4 Ringen (Adopt/Trial/Assess/Hold) und Segmenten (KI, Plattform, Regulierung, Risiko). Jeder Punkt = ein Trend, Hover zeigt Details
- **Impact-Assessment**: Interaktive Matrix (Tabelle oder Scatter) mit X-Achse = Zeithorizont (1-3J / 3-5J / 5-10J) und Y-Achse = Impact (Hoch/Mittel/Niedrig). Jeder Trend als Punkt positioniert
- **FIDA-Flowchart**: Schritt-für-Schritt-Visualisierung wie Open Insurance funktionieren wird (Kunde → Datenanfrage → Versicherer → Datenbereitstellung → Drittanbieter)
- **M&A-Timeline**: Wichtigste Insurance-M&A-Transaktionen 2019-2025
- **Klickstrecke**: "Wie betrifft dieser Trend meinen Versicherer-Klienten?" — 3-4 Fragen → Impact-Einschätzung

**Commit:** `feat(v1x1): Modul 08 - Zukunftsthemen mit TrendRadar`

---

#### MODUL 09 — VERBÄNDE UND INSTITUTIONEN

Spezifische Elemente:
- **Ökosystem-Netzwerkgraph**: SVG-basiert. Knoten = Institutionen, Kanten = Beziehungen (reguliert, vertritt, berät). Hover zeigt Beziehungstyp. Farbcodierung: Verbände (blau), Aufsicht (rot), Schlichtung (grün), Rating (orange), Verbraucher (lila)
- **Institutionen-Kacheln**: Grid mit allen Institutionen als Cards: Name, Kurzrolle (1 Satz), Relevanz-Badge (Hoch/Mittel/Niedrig), externer Link
- **"Wer macht was?"-Quiz**: 5 Szenario-Fragen ("Dein Klient will wissen, ob seine Solvenzquote ausreicht — wer prüft das?")

**Commit:** `feat(v1x1): Modul 09 - Verbände mit Ökosystem-Map`

---

## SCHRITT 6: GLOSSAR

### `GlossarPage.vue`

**Features:**
- Suchfeld oben (Echtzeit-Filter)
- Alphabetische Navigation (A-Z Buchstaben-Leiste, sticky)
- Thematische Cluster als Tabs: "Alle", "Markt", "Produkte", "Vertrieb", "Regulatorik", "Finanzen"
- Jeder Begriff: Term (bold), Definition (1-3 Sätze), Tags für zugehörige Module
- Klick auf Modul-Tag navigiert zum Modul

**Mindestens 150 Begriffe.** Hier die wichtigsten Cluster:

- Markt: Beitragsvolumen, Versicherungsdurchdringung, Versicherungsdichte, Konsolidierung, Run-off
- Rechtsformen: AG, VVaG, AöR, Niederlassung
- Produkte: Deckungssumme, Selbstbeteiligung, Versicherungssumme, Beitragssumme, Rückkaufswert, Überschussbeteiligung, Garantiezins, Höchstrechnungszins, Alterungsrückstellung, Gliedertaxe, Combined Ratio
- Vertrieb: AO, Einfirmenvertreter, Makler, Courtage, Maklerpool, MVP, BiPRO
- Regulatorik: VVG, VAG, BaFin, EIOPA, Solvency II, SCR, MCR, ORSA, IDD, POG, SFCR, DORA, FIDA
- Finanzen: Abschlussprovision, Bestandsprovision, Stornohaftung, Beitragsdynamik, Nettotarif

**Commit:** `feat(v1x1): Glossar mit 150+ Begriffen und Suchfunktion`

---

## SCHRITT 7: WISSENSCHECK / QUIZ-SYSTEM

### `WissenscheckPage.vue`

**Features:**
- Modul-Auswahl: Alle Module oder einzelnes Modul
- Fragenmodus: "Alle Fragen" (90+) oder "Quick-Check" (10 zufällige)
- Fragetypen: Single Choice, Multiple Choice, Zuordnung (Drag & Drop oder Dropdown)
- Pro Frage: Feedback sofort nach Antwort (richtig/falsch + Erklärung)
- Fortschrittsbalken oben
- Endergebnis: Prozent richtig, Stärken/Schwächen nach Modul, Empfehlung welche Module nochmal lesen
- Ergebnisse im LocalStorage speichern

**Mindestens 10 Fragen pro Modul = 90 Fragen gesamt.**

Fragebeispiele:
- M01: "Wie hoch ist das Gesamtbeitragsvolumen des deutschen Versicherungsmarkts?" → ~253 Mrd. €
- M02: "Welche Rechtsform hat die HUK-COBURG?" → VVaG
- M03: "Welcher bAV-Durchführungsweg ist der häufigste?" → Direktversicherung
- M04: "Welcher Vertriebsweg hat den größten Marktanteil bei Kfz?" → Online/Direkt
- M05: "Was bedeutet Stornohaftung?" → Rückforderung der Provision bei Vertragskündigung
- M06: "Was regelt §19 VVG?" → Vorvertragliche Anzeigepflicht
- M07: "Was bedeutet eine Combined Ratio von 95%?" → 5% versicherungstechnischer Gewinn
- M08: "Was ist FIDA?" → Financial Data Access Regulation
- M09: "Wer ist der Versicherungsombudsmann?" → Schlichtungsstelle für Verbraucherbeschwerden

**Commit:** `feat(v1x1): Wissenscheck mit 90+ Fragen und Ergebnis-Tracking`

---

## SCHRITT 8: KLICKSTRECKEN (DECISION TREES)

### 3 Klickstrecken bauen:

#### 8.1 "Welche Versicherung brauche ich?"
```
Start → "Bist du berufstätig?"
  Ja → "Angestellt oder selbstständig?"
    Angestellt → "Hast du Familie / Kinder?"
      Ja → Empfehlung: Privathaftpflicht, BU, Risikoleben, Hausrat, ggf. PKV/Zusatz
      Nein → Empfehlung: Privathaftpflicht, BU, Hausrat
    Selbstständig → "Hast du Mitarbeiter?"
      Ja → Empfehlung: Betriebshaftpflicht, D&O, BU, PKV, Cyber, ggf. bAV
      Nein → Empfehlung: Betriebshaftpflicht, BU, PKV, Cyber
  Nein → "Bist du Student oder in Ausbildung?"
    Ja → Empfehlung: Privathaftpflicht (wenn nicht über Eltern), Hausrat
    Nein → ...
→ "Besitzt du eine Immobilie?"
  Ja → + Wohngebäude, + Elementar
→ "Besitzt du ein Auto?"
  Ja → + Kfz-Haftpflicht (Pflicht!), ggf. Kasko
```

Jede Empfehlung verlinkt zum entsprechenden Abschnitt in Modul 03.

#### 8.2 "GKV oder PKV?"
```
"Wie hoch ist dein Brutto-Jahreseinkommen?"
  < 73.800 € → "Du bist versicherungspflichtig in der GKV"
  ≥ 73.800 € → "Wie alt bist du?"
    < 35 → "Hast du Vorerkrankungen?"
      Nein → "PKV kann attraktiv sein" + Rechenbeispiel
      Ja → "GKV ist oft sicherer" + Begründung
    35-45 → "Planst du eine Familie?"
      Ja → "GKV hat Familienversicherung" + Vergleich
      Nein → "PKV prüfen" + Hinweis auf Alterungsrückstellungen
    > 45 → "PKV-Wechsel in diesem Alter ist selten sinnvoll" + Begründung
```

#### 8.3 "Welcher Vertriebsweg passt?"
```
"Welches Produkt?"
  Einfach (Kfz, Haftpflicht) → "Online/Vergleichsportal"
  Komplex (Leben, bAV, Gewerbe) → "Wie wichtig ist unabhängige Beratung?"
    Sehr → "Makler"
    Marke vertraut → "AO"
    Bank-Kunde → "Bancassurance prüfen"
```

**Commit:** `feat(v1x1): 3 Klickstrecken (Versicherungsbedarf, GKV/PKV, Vertriebsweg)`

---

## SCHRITT 9: POLISH & FEINSCHLIFF

### 9.1 Animationen
- Scroll-triggered Fade-In für Sektionen (Intersection Observer, `opacity 0→1, translateY 20px→0`)
- CountUp-Animation für KeyStatCards (wenn sie in den Viewport kommen)
- Smooth Accordion open/close (max-height + opacity transition)
- Page-Transitions zwischen Modulen (subtle fade, 200ms)
- Chart-Animationen: Balken wachsen von unten, Linien werden gezeichnet

### 9.2 Responsive-Feinschliff
- Teste alle Module auf 375px (iPhone SE), 768px (iPad), 1024px, 1440px
- Charts: Auf Mobile `height: 250px` statt 400px
- Tabellen: Horizontal scrollbar mit Scroll-Indikator
- Sidebar: Hamburger-Menü auf Mobile, Overlay mit Backdrop
- Kacheln: 1-spaltig auf Mobile, 2-spaltig auf Tablet, 3-spaltig auf Desktop

### 9.3 Accessibility
- Alle interaktiven Elemente: `tabindex`, `aria-label`, `role`
- Charts: `aria-label` mit Zusammenfassung der Daten
- Farbkontrast: Mindestens WCAG AA (4.5:1 für Text)
- Keyboard-Navigation: Tab durch alle Elemente, Enter zum Aktivieren

### 9.4 Performance
- Lazy-Load Module-Seiten: `() => import('./views/Modul01.vue')`
- Lazy-Load Charts: Erst rendern wenn im Viewport
- JSON-Daten: Nur das aktuelle Modul laden, nicht alle 9 auf einmal
- Bilder (falls vorhanden): WebP, lazy loading
- Ziel: Lighthouse Performance Score >90

### 9.5 Letzte Checks
- [ ] Alle 9 Module vollständig mit Content und Charts
- [ ] Glossar: 150+ Begriffe, Suchfunktion funktioniert
- [ ] Quiz: 90+ Fragen, Feedback korrekt
- [ ] 3 Klickstrecken funktional
- [ ] Fortschritts-Tracking über LocalStorage
- [ ] Cmd+K Suche über alle Module
- [ ] Mobile-Ansicht sauber
- [ ] Keine Console-Errors
- [ ] Alle internen Links funktionieren

**Commit:** `feat(v1x1): Polish — Animationen, Responsive, Accessibility, Performance`

**Finaler Commit:** `feat(v1x1): Versicherungs-1×1 komplett — 9 Module, Glossar, Quiz, 3 Klickstrecken`

---

## ZUSAMMENFASSUNG DER COMMITS

```
1. feat(v1x1): Basis-Komponenten (15 Komponenten)
2. feat(v1x1): Layout-Shell, Router, Progress-Tracking
3. feat(v1x1): Übersichtsseite mit Kachelraster
4. feat(v1x1): Modul 01 - Der Markt im Überblick
5. feat(v1x1): Modul 02 - Marktteilnehmer
6. feat(v1x1): Modul 03 - Produktlandschaft mit Klickstrecke
7. feat(v1x1): Modul 04 - Vertriebswege mit Sankey und Heatmap
8. feat(v1x1): Modul 05 - Vergütung mit Provisionsrechner
9. feat(v1x1): Modul 06 - Regulatorik mit Solvency-II-Schaubild
10. feat(v1x1): Modul 07 - Wertschöpfungskette mit Flussdiagramm
11. feat(v1x1): Modul 08 - Zukunftsthemen mit TrendRadar
12. feat(v1x1): Modul 09 - Verbände mit Ökosystem-Map
13. feat(v1x1): Glossar mit 150+ Begriffen
14. feat(v1x1): Wissenscheck mit 90+ Fragen
15. feat(v1x1): 3 Klickstrecken
16. feat(v1x1): Polish und Feinschliff
```

---

## WICHTIGE REGELN

1. **Analysiere IMMER zuerst die bestehende Codebase** bevor du baust
2. **Brich niemals bestehende Funktionalität** — das Versicherungs-1×1 ist EIN Bereich der App
3. **Committe nach jedem Modul** — nicht alles am Ende
4. **Nutze bestehende Patterns** aus der Codebase wo möglich
5. **Keine Emojis, keine bunten Icons** — nur monochrome Lucide Icons
6. **Content-Qualität**: Wenn JSON-Daten fehlen oder dünn sind, recherchiere selbst und fülle sie auf. Jedes Modul braucht mindestens 3.000 Wörter
7. **Responsive ist nicht optional** — teste gedanklich jeden Screen auf Mobile

**Nimm dir die Zeit. Qualität vor Geschwindigkeit.**
