# Banking Horizon 2035 — begehbares Strukturbild

Interaktives Workshop-Tool für einen Vorstands-Workshop. Ein KI-Chatbot
„erzeugt" zum Auftakt das Strukturbild der Bank (Zustand 2026); danach ist
das Bild eine **begehbare Navigations-Karte** mit 7 Zonen. Pro Zone führt der
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
  (`IntroChatbot`, blauer BdZ-Look): vorbereitete Frage → sichtbares Thinking →
  das Strukturbild baut sich auf → „als Haus erkunden". Die frühere Q&A-Landing
  (App `BankDerZukunft/`) ist nicht mehr der Einstieg und leitet automatisch
  hierher weiter (`/bank-der-zukunft-2035/dist/`).
- **Übersicht** (`BankExplorer`): Master-Bild füllt den Viewport, 7 Zonen mit
  Hover-Glow, Label und pulsierendem Schlüsselobjekt-Hotspot.
- **Kameraflug**: Klick auf eine Zone → GSAP-Zoom (`transform: scale` +
  Translation auf das Zonen-Zentrum).
- **ChapterReader**: Bild links/mittig, Textpanel rechts; per Pager durch die
  3 Hypothesen und die Aktivität blättern (Pfeile/Dots, Pfeiltasten, Esc).
- **Handoff** je Kapitel unterschiedlich (siehe Tabelle).

## Die 7 Kapitel & ihre Absprünge

| Kap. | Zone | Schlüsselobjekt | Absprung | Umsetzung |
|---|---|---|---|---|
| 01 Kundenperspektive | Plaza (außen) | Smartphone-App | Demo „Liquid" | `IframeStage` (URL offen) |
| 02 Markt & Vertrieb | Etage 3 | Vertriebs-Cockpit | Vertriebscockpit | `IframeStage` (Live-URL) |
| 03 Marktfolge | Etage 2 | Workflow-Screen | Strategy Lab | `StrategyLab` |
| 04 Corporate Services | Etage 4 | Organisations-Screen | Co-Creation | `CoCreationCanvas` (organisation) |
| 05 Technologie / IT | Keller / Etage 1 | Monitoring-Platz | Demo „SDLC" | `IframeStage` (URL offen) |
| 06 Compliance & Risk | Etage 5 | Governance-Cockpit | Kredit-Dilemma | `KreditDilemma` |
| 07 Transformation | Glas-Aufzug | Aufzug-Spine | Co-Creation | `CoCreationCanvas` (future-interaction) |

## Bild-Slots (29 Bilder · `public/images/`)

Die Workshop-Bilder liegen als **PNG** unter **`public/images/`** und sind in
`src/data/chapters.ts` verdrahtet. Fehlt eine Datei, zeigt die App einen
sauberen Platzhalter mit Dateiname — Datei dort ablegen, fertig.

**Schema:** `Strukturbild.png` (Master · Übersicht + Intro-Reveal), dann pro
Kapitel `Kapitel N_1.png` / `Kapitel N_2.png` / `Kapitel N_3.png` (3 Hypothesen)
und `Kapitel N_Demo.png` (Aktivität/Demo). `N` = Kapitelnummer 1–7:

```
Strukturbild.png
Kapitel 1_1.png  Kapitel 1_2.png  Kapitel 1_3.png  Kapitel 1_Demo.png   (01 Kundenperspektive)
Kapitel 2_1.png  Kapitel 2_2.png  Kapitel 2_3.png  Kapitel 2_Demo.png   (02 Markt & Vertrieb)
Kapitel 3_1.png  Kapitel 3_2.png  Kapitel 3_3.png  Kapitel 3_Demo.png   (03 Marktfolge)
Kapitel 4_1.png  Kapitel 4_2.png  Kapitel 4_3.png  Kapitel 4_Demo.png   (04 Corporate Services)
Kapitel 5_1.png  Kapitel 5_2.png  Kapitel 5_3.png  Kapitel 5_Demo.png   (05 Technologie / IT)
Kapitel 6_1.png  Kapitel 6_2.png  Kapitel 6_3.png  Kapitel 6_Demo.png   (06 Compliance & Risk)
Kapitel 7_1.png  Kapitel 7_2.png  Kapitel 7_3.png  Kapitel 7_Demo.png   (07 Transformation)
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
  Plattformpotenzial) + Zusammenfassung.
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
    ├── StrategyLab.tsx             (Kap. 03)
    ├── CoCreationCanvas.tsx        (Kap. 04 + 07)
    └── KreditDilemma.tsx           (Kap. 06)
```

## Cloudflare Pages

```bash
npm run build           # → dist/ (Build-Command: npm run build, Output: dist)
```

`vite.config.ts` setzt `base: './'`, damit ein Sub-Pfad-Deployment wie
`https://…/bank-der-zukunft-2035/` funktioniert. `wrangler.toml` liegt bei.

> Hinweis: `public/bank-master.png`, `public/bank-floor-*.png` und
> `public/plaza-video.mp4` stammen aus dem vorherigen Konzept und werden vom
> neuen Flow nicht mehr referenziert (Master liegt jetzt als
> `public/images/master.webp` vor)
> (können nach Bedarf entfernt werden).
