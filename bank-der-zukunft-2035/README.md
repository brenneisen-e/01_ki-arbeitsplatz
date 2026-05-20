# Bank der Zukunft 2035 — Interaktives Strukturbild

Premium 2.5D-Querschnitt einer Bank für den LBBW-Vorstands-Workshop.
Drei Etagen plus Außenbereich, navigierbar, ruhig, beeindruckend.

## Quick Start

```bash
cd bank-der-zukunft-2035
npm install
npm run dev        # http://localhost:5180
npm run build      # erzeugt dist/
npm run preview    # bedient dist/ lokal
```

## Stack

- React 19 + Vite 6 + TypeScript (strict)
- Styling: vanilla CSS + CSS Modules (kein Tailwind)
- Icons: `lucide-react` (monochrom)
- State: lokales `useState` -- kein Browser-Storage
- Animationen: CSS Transforms / Transitions, ein paar SVG-Pulse,
  `requestAnimationFrame` für den Parallax-Hook

## Workshop-Bedienung

| Interaktion              | Verhalten                                              |
|--------------------------|--------------------------------------------------------|
| Klick auf eine Etage     | Etage zoomt in den Fokus, andere dimmen                |
| Klick auf einen Hotspot  | Side-Panel rechts mit Modul-Inhalt + Hypothese 2035    |
| Header-Etagen-Tabs       | Direkt zwischen den drei Etagen wechseln               |
| `↑` / `↓`                | Etagen-Fokus auf/ab schalten                           |
| `Esc`                    | Panel schließen, dann Fokus verlassen                  |
| „Übersicht" oben rechts  | Zurück in die Gesamtansicht                            |

## Inhalte editieren

Alle Texte, Hotspot-Definitionen, Hypothesen, Kennzahlen liegen in
**einer** Datei:

```
src/data/modules.ts
```

`FLOORS` -- die drei Etagen.
`HOTSPOTS` -- klickbare Module mit Titel, Beschreibung, Hypothese 2035
und optional Quick-Facts.
`COCKPIT_INITIAL` -- Startwerte für den Live-Dashboard-Ticker.
`TERMINAL_TEMPLATE` -- Log-Zeilen für den Datacenter-Stream.

## Hero-Bild

Die Datei `public/hero-cross-section.png` ist das Referenz-Bild
(Tageslicht-Version). Sie wird aktuell nicht als Layer eingebunden --
das Querschnittsbild wird prozedural per CSS/SVG gebaut, damit es
crisp bleibt und animierbar ist. Wer das Foto-Bild stattdessen
einblenden will, legt es in `src/components/Scene.tsx` als unterstes
Layer ab.

## Cloudflare Pages Deployment

```bash
npm run build
# Pages-Projekt: Build-Command "npm run build", Output "dist"
```

`wrangler.toml` ist dabei.

## Projektstruktur

```
src/
├── App.tsx              -- Haupt-State (Fokus, Panel)
├── App.module.css       -- Header / Footer / Layout
├── index.css            -- Design-Tokens, Reset, Reduced-Motion
├── main.tsx             -- React 19 Entry
├── data/
│   └── modules.ts       -- Workshop-Inhalte zentral
├── hooks/
│   ├── useParallax.ts   -- --px/--py via rAF, kein Re-Render
│   ├── useReducedMotion.ts
│   └── useTicker.ts     -- simulierter Live-Stream
├── lib/
│   └── format.ts        -- deutsche Locale (DE-Zahlen, Prozent, EUR)
├── components/
│   ├── Scene.tsx        -- Building Shell + Sky + Plaza + Floors
│   ├── Floor.tsx        -- Klickbare Etagen-Hülle, Hotspots
│   ├── Hotspot.tsx      -- Hover-Tooltip + Klick-State
│   ├── SidePanel.tsx    -- Slide-in von rechts
│   ├── floors/
│   │   ├── Boardroom.tsx       -- Etage 1: Vorstand
│   │   ├── Operations.tsx      -- Etage 2: Operations + Bot
│   │   ├── DataCenter.tsx      -- Etage 3: Server + Terminal
│   │   └── Plaza.tsx           -- Außenbereich
│   └── widgets/
│       ├── CockpitDashboard.tsx
│       ├── Terminal.tsx
│       ├── Donut.tsx
│       ├── MiniBars.tsx
│       └── MiniLine.tsx
└── vite-env.d.ts
```

## Anti-Anforderungen

- Kein Tailwind, keine externen Schrift-CDNs, keine Analytics
- Keine bunten oder mehrfarbigen Icons -- alle Icons in einer Farbe
  (`currentColor` oder CSS-Variable)
- Kein Browser-Storage (`localStorage` / `sessionStorage`)
- Keine 3D-Engine -- der Tiefen-Effekt ist 2.5D via Parallax-Layern

## Performance-Notizen

- Parallax schreibt nur `--px` und `--py` per `requestAnimationFrame`
  auf den Scene-Knoten -- React-Tree wird dabei nicht neu gerendert
- Alle Animationen laufen über `transform` und `opacity` -- keine
  Layout-Trigger
- `prefers-reduced-motion` schaltet die Animationen ab (Regel in
  `src/index.css`)
