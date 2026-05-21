# Future Bank — Querschnitt-Prototyp

Foto-realistischer Bank-Querschnitt mit Klick-Navigation in einzelne
Etagen. Master-Bild als Übersicht, GSAP-Kameraflug per Klick in die
gewählte Etagen-Zone, Kapitel-Panel mit Platzhalter-Text und KPI-Karten.

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
- Animation: **GSAP 3.13** (kein Three.js, kein Framer Motion)
- Icons: `lucide-react`
- Akzent: Deloitte-Grün **#046A38**
- Privacy-first: keine externen Fonts / CDNs, keine Analytics, kein
  Browser-Storage

## Assets

| Datei                              | Zweck                              |
|------------------------------------|------------------------------------|
| `public/bank-master.png`           | 16:9-Master-Querschnitt (Übersicht)|
| `public/bank-floor-governance.png` | Detail-Bild Etage 1 (Slot)         |

## Bedienung

- **Klick auf eine Etage** in der Übersicht → GSAP-Zoom (~1,2 s,
  `power3.inOut`) in die jeweilige Zone, Kapitel-Panel fadet rechts ein
- **Hover** über eine Etage → Label „… →" in Deloitte-Grün
- **„Übersicht"-Button oben links** → Zoom zurück auf 1
- **Esc** → Übersicht
- **`prefers-reduced-motion: reduce`** → Kein Kameraflug, der Zustand
  schaltet hart um

## Etagen-Zonen kalibrieren

Die Zonen sind als Konstante `FLOORS` ganz oben in
`src/components/BankExplorer.tsx` definiert:

```ts
const FLOORS = [
  { id: 'governance', topPct:  4, heightPct: 34, … },
  { id: 'operations', topPct: 40, heightPct: 26, … },
  { id: 'datacenter', topPct: 68, heightPct: 28, … },
]
```

`topPct` / `heightPct` sind Prozent der **Bild**-Höhe. Zum schnellen
Kalibrieren: in `BankExplorer.module.css` kurz
`outline: 2px dashed lime;` auf `.zone` einkommentieren -- du siehst
sofort, wo die drei Bänder liegen.

## Zoom-Mathematik

Ausführlich im Header-Kommentar von `BankExplorer.tsx`. Kurz:

```
scale       = 100 / heightPct
translateY  = (50 − (topPct + heightPct/2)) × stageHeight / heightPct
```

`scale` macht aus der Zone den vollen Viewport, `translateY` zentriert
sie vertikal. Horizontal bleibt 0, weil die Etagen Bänder über die
ganze Breite sind.

## Detail-Bilder per Cross-Fade (Slot)

In `FLOORS` ist pro Etage optional ein `detailImage` vorgesehen. In
`BankExplorer.tsx` ist die Stelle, an der ein zweites `<img>`
über das Master-Bild gefadet wird, **als Kommentar** vorbereitet:

```tsx
{activeFloor?.detailImage && (
  <img className={`${styles.master} ${styles.masterDetail}`}
       src={activeFloor.detailImage} ... />
)}
```

Sobald du die Detail-Bilder ablegst und `detailImage` in `FLOORS`
einträgst: die zwei Zeilen oben aktivieren, `data-show` per State
toggeln (`useEffect` nach Zoom-Ende), CSS-Übergang ist in
`.masterDetail` bereits angelegt.

## Projektstruktur

```
src/
├── App.tsx · App.module.css
├── main.tsx
├── index.css                       (Tokens + Reset)
├── components/
│   ├── BankExplorer.tsx            (FLOORS-Konstante + Zoom + Stage)
│   ├── BankExplorer.module.css
│   ├── FloorPanel.tsx              (Kapitel-Panel rechts)
│   └── FloorPanel.module.css
├── hooks/
│   └── useReducedMotion.ts
└── vite-env.d.ts
```

## Cloudflare Pages

```bash
npm run build           # dist/
# Build-Command: npm run build, Output: dist
```

`wrangler.toml` ist dabei. `vite.config.ts` setzt `base: './'`, damit
ein Sub-Pfad-Deployment wie
`https://…/bank-der-zukunft-2035/` funktioniert.
