# Banking Horizon 2035 — begehbares Strukturbild

Interaktives Workshop-Tool für einen Vorstands-Workshop. Ein KI-Chatbot
„erzeugt" zum Auftakt das Strukturbild der Bank (Zustand 2026); danach ist
das Bild eine **begehbare Navigations-Karte** mit 8 Zonen. Pro Zone führt der
Flow durch **drei Hypothesen-Vergleichsbilder** (Status Quo ↔ 2035) und ein
**Aktivitäts-/Demo-Bild** mit Absprung in eine Live-Demo oder ein interaktives
Tool.

## Quick Start

```bash
cd bank-der-zukunft-2035
npm install
npm run dev        # http://localhost:5180
npm run build      # erzeugt dist/ (wird ins Repo committet)
npm run preview    # bedient dist/ lokal (http://localhost:4173)
```

## Stack

- React 19 + Vite 6 + TypeScript (strict, `noUnusedLocals/Parameters`)
- Styling: vanilla CSS + CSS Modules (kein Tailwind), Tokens in `src/index.css`
- Animation: **GSAP 3** (kein Three.js, kein Framer Motion)
- Icons: `lucide-react` (monochrom), Akzent Deloitte-Grün **#046A38**
- Privacy-first: keine externen Fonts / CDNs / Analytics, kein Browser-Storage
- `prefers-reduced-motion: reduce` → Animationen entfallen / harter Schnitt

## Ablauf

```
Intro-Reveal     →  Übersicht  →  Kameraflug  →  ChapterReader            →  Handoff
(Frage→Thinking)    (7 Zonen)     (GSAP zoom)    (Hypothese 1·2·3 → Akt.)     (Demo / Tool)
```

- **Einstieg**: Der Workshop startet **direkt mit dem Intro-Reveal**
  (`IntroChatbot`, Logo-Kachel „Banking Horizon"): unter der Begrüßung eine
  Kachel mit dem **Einführungsvideo** (`public/videos/banking-horizon-intro.mp4`,
  48 s; Klick öffnet den Player direkt im Browser-Vollbild mit Ton, Escape/X
  schließt), dann
  genau ein Vorschlag im Chat („Wie kann ich mir die Bank der Zukunft
  vorstellen?") → sichtbares
  Thinking → **Bau-Animation**: die Kapitelzonen zeichnen sich als Bauplan,
  dann setzt sich das Strukturbild Etage für Etage aus Kacheln zusammen, ein
  Scan läuft mit → das Bild **zoomt von selbst auf Vollbild** und übergibt
  nahtlos an den Explorer (kein Knopf). Weitere Knöpfe gibt es auf der
  Landing nicht; die Operations-Strecke (`#/operations`) ist per Deep-Link
  und über Kapitel 03 erreichbar. Das EDEKABANK-Holodeck ist vorerst
  abgeschaltet (`HOLODECK_AKTIV` in `App.tsx`). Die frühere Q&A-Landing
  (App `BankDerZukunft/`) ist entfernt; `_redirects` leitet alte Links
  hierher weiter (`/03_banking-horizon/dist/`).
- **Übersicht** (`BankExplorer`): Master-Bild füllt den Viewport, 8 Zonen mit
  Hover-Glow, Label und pulsierendem Schlüsselobjekt-Hotspot.
- **Kameraflug**: Klick auf eine Zone → GSAP-Zoom (`transform: scale` +
  Translation auf das Zonen-Zentrum).
- **Studien-Schritt** (`FaktSlide`, Daten in `src/data/fakten.ts`): Kapitel mit
  Eintrag zeigen nach der Einstiegsbühne und vor den Hypothesen eine belastbare
  Zahl aus einer aktuellen Deloitte-Studie als Balkendiagramm mit drei
  Kennzahlen, Folgerung und Quelle (Kapitel 02: „How much do bank customers
  trust gen AI?", Deloitte Insights, August 2026). Die Hypothesen behalten ihre
  Nummern (Hypothese n = Schritt n), der Studien-Schritt ist `#/<kapitel>` bzw.
  `#/<kapitel>/0`. Sprechertexte: `docs/speakernotes-kapitel-02-markt-vertrieb.md`.
  Vortragsfassung (Vorstellung, Einstiegsbühne mit Trends, Studie, Hypothesen,
  Demo): `docs/speakernotes-vortrag-markt-vertrieb.md`, gesetzt als PDF und
  DOCX daneben (Sätze als Stichpunkte); neu erzeugen mit
  `node scripts/speakernotes-pdf.mjs` (Playwright mit Chromium, hier global über
  `NODE_PATH`) und `python3 scripts/speakernotes-docx.py` (python-docx).
  Dieselben Notizen als **Notizfenster**: ein Klick auf das Deloitte-Logo in
  der Kopfleiste der Übersicht (unauffällig, kein eigener Knopf) öffnet
  `speakernotes.html` (zweite Vite-Seite, `src/notizen/`) als
  eigenes Browserfenster, das man per OS-Werkzeug über andere Bildschirme legt:
  dunkel, Schriftgröße (+/−), Timer (T), Sprungchips je Abschnitt; es folgt dem
  Strukturbild (Kapitel, Schritt, Einstiegsbühne) über `localStorage`
  (`bh-vortrag-stand`, F schaltet das Folgen aus). Solange das Notizfenster
  offen ist (Herzschlag über den BroadcastChannel `bh-notizen`), scrollt das
  Mausrad im Strukturbild die Notizen statt der Seite, wie in EikeCase;
  waagerechtes Radeln bleibt der Seite. Eingebettete Demos bekommen
  `NOTES_RELAY` und melden ihr Radeln als `IFRAME_WHEEL` (senkrecht → Notizen,
  waagerecht → `PARENT_SCROLL` zurück in die Demo); im Vertriebsarbeitsplatz
  macht das `src/utils/notizenRelay.js`.
- **ChapterReader**: Gegenüberstellung Heute | 2030 als geteilte Folie (links
  graphit, Heute-Bild entsättigt; rechts grün, 2030 farbig); per Pager durch
  die Hypothesen und die Aktivität blättern (Pfeile/Dots, Pfeiltasten, Esc).
  Die Werkzeuge „Screenshot speichern" und „Bearbeiten" sind in der Vorführung
  ausgeblendet — **Umschalt+B** blendet sie ein (im Bearbeitungsmodus sind sie
  immer sichtbar). Dasselbe gilt in der Übersicht für „Bearbeiten", „Excel"
  und „Bild".
- **Handoff** je Kapitel unterschiedlich (siehe Tabelle).

## Die 8 Kapitel & ihre Absprünge

Mapping auf das neue Strukturbild (4 Etagen, je zwei Räume + Glas-Aufzug):

| Kap. | Zone (Raum) | Schlüsselobjekt | Absprung | Umsetzung |
|---|---|---|---|---|
| 01 Kundenperspektive | Erdgeschoss (Filiale) | Self-Service-Lounge & Schalter | Demo „Liquid" | `IframeStage` (URL offen) |
| 02 Markt & Vertrieb | 1. OG links (Advisory) | Vertriebs-Cockpit | Vertriebscockpit | `IframeStage` (Live-URL) |
| 03 Marktfolge | 1. OG rechts (Backoffice-Großraum) | Workflow-Screen | Demo „Ein Tag in Banking Operations 2030“ im Vollbild | `OperationsTag` (`#/operations/-1`, „Overview" zurück ins Kapitel) |
| 04 Corporate Services | 2. OG links (Corporate / HR) | Organisations-Screen | Co-Creation | `CoCreationCanvas` (organisation) |
| 05 Technologie / IT | 2. OG rechts (Serverraum) | Monitoring-Platz | Demo „SDLC" | `IframeStage` (URL offen) |
| 06 Compliance & Risk | 3. OG links (Boardroom) | Governance-Cockpit | Kredit-Dilemma | `KreditDilemma` |
| 07 Transformation | Glas-Aufzug (vertikal) | Glas-Spine | Co-Creation | `CoCreationCanvas` (future-interaction) |
| 08 Produkte & Innovation | 3. OG rechts (Projektraum) | Whiteboard-Wand mit Mockups | _folgt_ | `IframeStage` (URL offen, provisorisch) |

> Verschiebungen gegenüber dem alten 5-Etagen-Bild: **05 IT** zieht aus dem
> Keller in den **Serverraum (2. OG rechts)**, **03 Marktfolge** bekommt mit dem
> **Backoffice-Großraum (1. OG rechts)** einen eigenen Raum, und oben rechts
> kommt mit **08 Produkte & Innovation (Projektraum)** ein komplett neues
> Kapitel hinzu. Dessen drei Hypothesen (Segment of One · lebende adaptive
> Services · kontinuierliche KI-Produktentwicklung) sind neu formuliert und
> noch nicht aus dem Deck-PDF — vor Workshop-Einsatz freigeben und ins Deck
> übernehmen. Demo-Absprung und Demo-Bild folgen.

## Deep-Links (direkt ins Kapitel)

Jede Etage / jedes Kapitel lässt sich direkt per URL aufrufen — Hash-Routing,
funktioniert ohne Server-Konfiguration unter dem Auslieferungs-Pfad
(`…/bank-der-zukunft-2035/dist/`). Ein Deep-Link überspringt das Intro und
fliegt direkt in das Kapitel; der aktuelle Stand wird laufend in die Adresszeile
geschrieben (teilbar).

| URL-Hash | Ziel |
|---|---|
| `#/uebersicht` | Strukturbild-Übersicht |
| `#/<kapitel>` | Kapitel öffnen (Hypothese 1) |
| `#/<kapitel>/<n>` | Schritt `n`: `1`–`3` = Hypothesen, `4` = Aktivität/Demo, `0` = Studien-Schritt (wo vorhanden) |

`<kapitel>` ist die **Kapitel-ID** oder die **Nummer** (`02` bzw. `2`):

| ID | Nr. | Kapitel |
|---|---|---|
| `kunde` | 01 | Kundenperspektive |
| `vertrieb` | 02 | Markt & Vertrieb |
| `marktfolge` | 03 | Marktfolge |
| `corporate` | 04 | Corporate Services |
| `it` | 05 | Technologie / IT |
| `compliance` | 06 | Compliance & Risk |
| `transformation` | 07 | Transformation |
| `projekt` | 08 | Produkte & Innovation |

Beispiele:

```
…/dist/#/vertrieb        → Markt & Vertrieb, erste Hypothese
…/dist/#/vertrieb/3      → Markt & Vertrieb, dritte Hypothese
…/dist/#/02/4            → Markt & Vertrieb, Aktivität/Demo
…/dist/#/uebersicht      → Übersicht (Strukturbild)
```

Implementierung: `src/deeplink.ts` (Parser/Formatter), verdrahtet in `App.tsx`
(Intro überspringen) und `BankExplorer.tsx` (Hash ⇄ Navigationsstand).

Die Live-Demo eines Kapitels (`screenOverlay`, z. B. das Vertriebscockpit in
Kapitel 02) wird nicht erst auf dem Aktivitäts-Schritt geladen: der Reader
legt das iframe beim Öffnen des Kapitels als dauerhafte, unsichtbare Ebene an
und lädt es, während Studie und Hypothesen gelesen werden; auf dem
Aktivitäts-Schritt liegt es über dem Monitor im Foto. Bis das Dokument steht,
zeigt die Fläche den dunklen Bildschirm mit Ladehinweis statt Weiß (ebenso die
Vollbild-Stage).

## Bild-Slots (33 Bilder · `public/images/`)

Die Workshop-Bilder liegen als **PNG** unter **`public/images/`** und sind in
`src/data/chapters.ts` verdrahtet. Fehlt eine Datei, zeigt die App einen
sauberen Platzhalter mit Dateiname — Datei dort ablegen, fertig.

**Schema:** `Strukturbild.png` (Master · Übersicht + Intro-Reveal), dann pro
Kapitel `Kapitel N_1.png` / `Kapitel N_2.png` / `Kapitel N_3.png` (3 Hypothesen)
und `Kapitel N_Demo.png` (Aktivität/Demo). `N` = Kapitelnummer 1–8:

```
Strukturbild.png
Kapitel 1_1.png  Kapitel 1_2.png  Kapitel 1_3.png  Kapitel 1_Demo.png   (01 Kundenperspektive)
Kapitel 2_1.png  Kapitel 2_2.png  Kapitel 2_3.png  Kapitel 2_Demo.png   (02 Markt & Vertrieb)
Kapitel 3_1.png  Kapitel 3_2.png  Kapitel 3_3.png  Kapitel 3_Demo.png   (03 Marktfolge)
Kapitel 4_1.png  Kapitel 4_2.png  Kapitel 4_3.png  Kapitel 4_Demo.png   (04 Corporate Services)
Kapitel 5_1.png  Kapitel 5_2.png  Kapitel 5_3.png  Kapitel 5_Demo.png   (05 Technologie / IT)
Kapitel 6_1.png  Kapitel 6_2.png  Kapitel 6_3.png  Kapitel 6_Demo.png   (06 Compliance & Risk)
Kapitel 7_1.png  Kapitel 7_2.png  Kapitel 7_3.png  Kapitel 7_Demo.png   (07 Transformation)
Kapitel 8_1.png  Kapitel 8_2.png  Kapitel 8_3.png  Kapitel 8_Demo.png   (08 Produkte & Innovation · NEU, Demo-Bild folgt)
```

> `Strukturbild.png` ist 1536×1024 (3:2); die `ZONES`-Koordinaten in
> `chapters.ts` sind darauf kalibriert. Die `Kapitel N_Demo.png` der Demo-
> Kapitel (01, 02, 05) zeigen idealerweise einen frontalen, leeren grauen
> 16:9-Bildschirm — dort wächst beim Absprung der Demo-iframe auf.

## Demo-URLs hinterlegen

In `src/data/chapters.ts` am jeweiligen `activity.handoff`:

- **02 Vertriebscockpit**: bereits verdrahtet (Live-Deployment).
- **01 Liquid** und **05 SDLC**: `url: ''` → trägt man die URL ein, zeigt
  `IframeStage` die Demo in Vollbild; solange leer, erscheint ein
  beschrifteter Platzhalter.

## Zonen / Kameraflug kalibrieren

Die Zonen liegen als `zone: { centerX, centerY, width, height, fit }` (% der
Bild-Maße) je Kapitel in `src/data/chapters.ts`. Startwerte stammen aus dem
Konzept und sind auf den „Bank'26"-Master kalibriert; nach dem Austausch des
Master-Bildes ggf. um 1–2 % nachziehen. Die Zoom-Mathematik ist im
Header-Kommentar von `src/components/BankExplorer.tsx` dokumentiert.

## Interaktive Tools

Eigene, voll interaktive Scaffolds (deutschsprachig, ohne Storage):

- `StrategyLab.tsx` — 3-Schritt-Workshop (Zukunftsrolle, Verortung,
  Plattformpotenzial) + Zusammenfassung. Derzeit von keinem Kapitel
  verdrahtet: Kapitel 03 springt in die Operations-Demo (siehe unten).
- `CoCreationCanvas.tsx` — zwei Varianten: 4 Gestaltungsdimensionen
  (`organisation`) bzw. Control-Shift + 2×2-Priorisierungsmatrix
  (`future-interaction`).
- `KreditDilemma.tsx` — Telefon-Sequenz mit drei reagierenden Balken
  (Regulatorik / Geschwindigkeit / Zufriedenheit) und Auflösung.

## Projektstruktur

```
src/
├── App.tsx                         (Phasen: Intro-Reveal → Explorer)
├── main.tsx · index.css            (Tokens + Reset)
├── data/chapters.ts                (zentrale Datenquelle: 7 Kapitel, Zonen, Bild-Slots, Handoffs)
├── hooks/useReducedMotion.ts
└── components/
    ├── IntroChatbot.tsx            (AI-Banking-Assistant: Name → Begrüßung → Vorschläge → Reveal)
    ├── BankExplorer.tsx            (Übersicht, Zonen, Kameraflug, Orchestrierung)
    ├── ChapterReader.tsx           (Hypothesen → Aktivität, Bild + Panel + Pager)
    ├── ImageSlot.tsx               (Bild mit Platzhalter-Fallback)
    ├── IframeStage.tsx             (Demo-Absprung: Bildschirm → Vollbild-iframe)
    ├── StrategyLab.tsx             (frei, war Kap. 03)
    ├── CoCreationCanvas.tsx        (Kap. 04 + 07)
    └── KreditDilemma.tsx           (Kap. 06)
```

## Ein Tag in Banking Operations 2030 (Maras Arbeitstag)

Eigenständige Bild- und Videostrecke (`src/operationstag/`), erreichbar über
den Knopf auf der Startseite, den Absprung aus Kapitel 03 und per Deep-Link —
**ohne Versionsnummer**:

| URL-Hash | Ziel |
|---|---|
| `#/operations` | Strecke am Anfang |
| `#/operations/<klick>` | direkt eine Station (`-1` = 07:00 zu Hause, `0` = 07:45, `1` = 08:00 … `10` = 17:00) |

Es gibt nur noch eine Fassung (die frühere v08). Alte Kurzlinks (`#/v01` …
`#/v08`) werden weiter erkannt und beim Öffnen auf `#/operations/<klick>`
umgeschrieben; Bilder und Wege der Vorfassungen sind aus dem Repo entfernt.

Die Bildschirme tragen die Bildmarke der Deutschen Bank (in der Produktion
in die Standbilder gerendert). Der Schalter **„Bank logo“** unten rechts in
der Uhrzeitleiste blendet sie ein oder aus — Standard ist **aus**; die App
legt dann eine Maske in der Grundfarbe des Bildschirms über die Marke
(`src/operationstag/logoMaske.ts`, Lage je Station automatisch vermessen).
Während eines Wegs (Video) bleibt die Marke sichtbar.

## Cloudflare Pages

```bash
npm run build           # → dist/ (Build-Command: npm run build, Output: dist)
```

`vite.config.ts` setzt `base: './'`, damit ein Sub-Pfad-Deployment wie
`https://…/bank-der-zukunft-2035/` funktioniert. `wrangler.toml` liegt bei.

> Hinweis: Vom alten Konzept ist nur `public/bank-floor-sales-2.png` geblieben
> (Kapitel 02, Monitorfläche); die übrigen `bank-floor-*`-Bilder, `bank-master.png`,
> `plaza-video.mp4` und die Horizon-Videos sind entfernt.
