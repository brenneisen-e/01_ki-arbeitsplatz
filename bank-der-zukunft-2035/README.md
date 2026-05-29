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
Chatbot-Landing  →  Übersicht  →  Kameraflug  →  ChapterReader            →  Handoff
(externe App)       (7 Zonen)     (GSAP zoom)    (Hypothese 1·2·3 → Akt.)     (Demo / Tool)
```

- **Einstieg**: Die Chatbot-Landing lebt in der separaten App `BankDerZukunft/`
  (Q&A mit Charts/Tabellen/Quellen) und verlinkt direkt hierher
  (`/bank-der-zukunft-2035/dist/`). Diese App startet daher **unmittelbar mit
  der Übersicht** — kein eigener Intro-Chat. Ein dezenter „Zum Chat"-Link
  oben links führt zurück (`/BankDerZukunft/dist/`).
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

## Bild-Slots (29 Bilder) — hier die Firefly-Renders ablegen

Alle Bildpfade sind in `src/data/chapters.ts` verdrahtet. Die Dateien gehören
nach **`public/`**. Solange ein Slot leer ist, zeigt die App einen sauberen
Platzhalter mit Dateiname — **kein** Code-Eingriff nötig, einfach die Datei
ablegen. Die zugehörigen Firefly-Prompts stehen im Konzept-Dokument
(Abschnitt 5 Master, Abschnitt 6 je Kapitel).

**Master (1):**

- `bank-master.png` — Strukturbild „Bank'26" (Übersicht + Intro-Reveal).
  *Liegt aktuell als Platzhalter-Render vor; durch den finalen „Bank'26"-Render
  ersetzen. Die Zonen-Koordinaten sind auf diesen Prompt kalibriert.*

**Pro Kapitel: 3 Hypothesen + 1 Aktivität (7 × 4 = 28):**

```
ch01-kunde-hyp1.png        ch01-kunde-hyp2.png        ch01-kunde-hyp3.png        ch01-kunde-activity.png
ch02-vertrieb-hyp1.png     ch02-vertrieb-hyp2.png     ch02-vertrieb-hyp3.png     ch02-vertrieb-activity.png
ch03-marktfolge-hyp1.png   ch03-marktfolge-hyp2.png   ch03-marktfolge-hyp3.png   ch03-marktfolge-activity.png
ch04-corporate-hyp1.png    ch04-corporate-hyp2.png    ch04-corporate-hyp3.png    ch04-corporate-activity.png
ch05-it-hyp1.png           ch05-it-hyp2.png           ch05-it-hyp3.png           ch05-it-activity.png
ch06-compliance-hyp1.png   ch06-compliance-hyp2.png   ch06-compliance-hyp3.png   ch06-compliance-activity.png
ch07-transformation-hyp1.png  …-hyp2.png  …-hyp3.png  ch07-transformation-activity.png
```

> Die `*-activity.png` der Demo-Kapitel (01, 02, 05) sollten einen frontalen,
> achsenparallelen, **leeren grauen 16:9-Bildschirm** zeigen — dort wächst beim
> Absprung der Demo-iframe auf.

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
├── App.tsx                         (rendert direkt den Explorer)
├── main.tsx · index.css            (Tokens + Reset)
├── data/chapters.ts                (zentrale Datenquelle: 7 Kapitel, Zonen, Bild-Slots, Handoffs)
├── hooks/useReducedMotion.ts
└── components/
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

> Hinweis: `public/bank-floor-*.png` und `public/plaza-video.mp4` stammen aus
> dem vorherigen Konzept und werden vom neuen Flow nicht mehr referenziert
> (können nach Bedarf entfernt werden).
