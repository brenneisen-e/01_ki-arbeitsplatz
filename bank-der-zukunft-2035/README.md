# Bank der Zukunft 2035

Interaktive Web-Animation im Tilt-Shift-Modellbau-Look — drei Etagen
+ Außenbereich + Vorstands-Cockpit. Premium-B2B-Pitch-Tool für den
Banking-Workshop „Banking 2035 – Bank der Zukunft im KI-Zeitalter".

## Quick Start

```bash
cd bank-der-zukunft-2035
npm install        # oder pnpm install
npm run dev        # http://localhost:5180
npm run build      # produziert dist/
npm run preview    # bedient dist/ lokal
```

Stack: React 19, Vite 6, TypeScript strict, Tailwind 4, GSAP,
Framer Motion, Zustand, Lucide React. Kein SSR, kein localStorage —
State läuft über Zustand-Store und URL-Params.

## Workshop-Bedienung

- **Klick auf eine Etage** öffnet das rechte Side-Panel mit Inhalten
  (Heading, Beschreibung, 3 Bullets, Quick-Stats)
- **Hover auf Hotspots** (Server, KI-Avatar, Kunden …) zeigt Tooltips
- **„Workshop starten"** im Header startet eine geführte Tour mit
  Auto-Advance pro Schritt
- **Tag/Nacht-Toggle** unten rechts (Lucide Sun/Moon)
- **Tastatur**: Pfeiltaste hoch/runter wechselt Etagen, `Esc` schließt
  Panel
- **Deep-Link**: `?floor=top&hotspot=ai-avatar` öffnet direkt diese
  Etage + Tooltip

## Inhalte editieren

Workshop-Texte:
- `src/data/floors.ts` — Etagen-Inhalte (Heading, Beschreibung,
  Bullets, Stats)
- `src/data/hotspots.ts` — Hotspot-Definitionen mit Position +
  Tooltip-Text
- `src/data/workshop-steps.ts` — Sequenz für die geführte Tour

## KI-Bilder ergänzen (Asset-Slots)

Alle visuellen Layer rendern out-of-the-box als prozedurales SVG.
Wenn du fotorealistische Tilt-Shift-Bilder von Midjourney o. ä.
nachschieben willst, lege sie unter `public/assets/scene/` ab —
Dateiname entspricht dem Slot-Namen, z. B.

| Slot                        | Datei (optional)                          |
|-----------------------------|-------------------------------------------|
| `background-sky` (Nacht)    | `/assets/scene/sky-night-4k.webp`         |
| `background-sky` (Tag)      | `/assets/scene/sky-day-4k.webp`           |
| `building-facade`           | `/assets/scene/building-facade-4k.webp`   |
| `floor-basement-interior`   | `/assets/scene/floor-basement-4k.webp`    |
| `floor-ground-interior`     | `/assets/scene/floor-ground-4k.webp`      |
| `floor-top-interior`        | `/assets/scene/floor-top-4k.webp`         |
| `outdoor-foreground`        | `/assets/scene/outdoor-foreground-4k.webp`|

`SceneLayer` macht ein HEAD-Request beim Mount; ist die Datei vorhanden,
wird sie statt des prozeduralen Fallbacks gerendert. Kein Code-Change nötig.

Empfohlene Midjourney-Prompts siehe `public/assets/scene/README.md`.

## Cloudflare Pages Deployment

```bash
npm run build
# Pages-Projekt anlegen, Build-Command: npm run build
# Output-Dir: dist
# wrangler.toml ist bereits dabei
```

Oder im Monorepo-Kontext (das hier liegt unter `kiarbeitsplatz/bank-der-zukunft-2035`)
einfach via Sub-Path ausliefern: `https://kiarbeitsplatz.pages.dev/bank-der-zukunft-2035/dist/`.

## Projektstruktur

```
src/
├── App.tsx · main.tsx · index.css
├── components/
│   ├── Scene/
│   │   ├── BankBuilding.tsx       (Master-Komponente)
│   │   ├── SceneLayer.tsx         (Asset-Slot-Wrapper)
│   │   ├── Floor.tsx              (Etagen-Wrapper)
│   │   ├── floors/                (BasementIT, GroundOperations, TopBoardroom)
│   │   ├── Outdoor/               (Sky, Trees, Customers)
│   │   ├── characters/            (Worker, Customer, ExecutiveFigure)
│   │   └── effects/               (DataPulse, ServerLEDs, DashboardLoop, AIAvatarSphere)
│   ├── UI/                        (Header, SidePanel, Tooltip, ThemeToggle, ResetButton)
│   └── Workshop/                  (WorkshopFlow)
├── data/                          (floors, hotspots, workshop-steps)
├── hooks/                         (useScene, useParallax, useUrlSync)
├── lib/                           (tokens, easings)
└── types.ts
```

## Anti-Anforderungen

- Keine bunten Icons / Emojis
- Keine externen Bilddienste (Unsplash etc.) — alles prozedural oder
  lokale Asset-Slots
- Kein SSR, keine Class-Components, kein `any`
- Kein Browser-Storage — State über Zustand + URL-Params

## Performance-Notizen

- Lazy-rendering der Wolken via CSS-Variablen (kein React-Re-Render bei
  Mausbewegung — `requestAnimationFrame` schreibt nur DOM-Style)
- SVG `<animate>` läuft GPU-beschleunigt
- `prefers-reduced-motion` schaltet alle Animationen ab (siehe
  `index.css`)
