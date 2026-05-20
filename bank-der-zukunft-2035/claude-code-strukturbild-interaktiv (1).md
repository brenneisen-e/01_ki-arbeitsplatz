# Claude Code Prompt — Interaktives Bank-2035-Strukturbild

> **Für den LBBW-Workshop.** Kopiere alles ab „=== PROMPT START ===" in
> Claude Code. Der Prompt ist self-contained und respektiert deinen Stack.

---

## Was du vorher bereitlegst

1. Das finale Hero-Bild (Tageslicht-Version) als `hero-cross-section.png`
   im Projekt-Root oder `public/` — der Prompt nutzt es als Fallback-Hintergrund.
   Optional, läuft auch ohne.
2. Claude Code im Projekt-Verzeichnis starten.

---

=== PROMPT START ===

Baue eine interaktive, navigierbare Web-App: ein **Banking-2035-Strukturbild**
als Bank-Querschnitt mit drei Etagen, durch die man navigieren kann. Das ist
Workshop-Material für einen Vorstands-Workshop bei einer Bank — es muss
premium, ruhig und beeindruckend wirken, kein verspieltes Spielzeug.

## Tech-Stack (mein etablierter Stack)

- pnpm + Turborepo Monorepo-Struktur (falls nicht vorhanden, lege ein
  einzelnes `apps/web`-Package an)
- React 19 + Vite + TypeScript (beyond-strict tsconfig)
- ESLint flat config v9, Prettier, Lefthook, Knip
- Styling: CSS Modules oder vanilla CSS mit CSS-Variablen — KEIN Tailwind
- Icons: ausschließlich `lucide-react` (monochrome, moderne SVGs)
- Privacy-first: keine Cookies, keine Google Fonts via CDN (Fonts lokal
  einbinden oder System-Stack), keine externen Analytics, keine Google Maps
- Animations: CSS-Transforms und Transitions, optional `motion` (framer-motion)
  wenn nötig — aber sparsam, ruhig, premium

## Kernkonzept: 2.5D-Querschnitt, kein echtes 3D

Baue KEINE Three.js-3D-Szene. Stattdessen ein geschichtetes 2.5D-Layout:
drei horizontale Etagen-Ebenen übereinander, die beim Mausbewegen / Scrollen
einen subtilen Parallax-Effekt zeigen (Vordergrund-Ebenen bewegen sich minimal
stärker als Hintergrund). Das erzeugt räumliche Tiefe ohne 3D-Engine-Risiko.

## Layout & Etagen

Vertikaler Gebäude-Querschnitt, von oben nach unten:

**Etage 1 — VORSTAND / AI GOVERNANCE (oben)**
- Boardroom-Atmosphäre, heller Tageslicht-Look
- Ein großes Wand-Dashboard „GOVERNANCE COCKPIT" mit live-tickenden
  (simulierten) Werten: Capital Adequacy, Liquidity Coverage, Risk Exposure
  (als Donut, ~42%), Net Interest Income (Balkenchart)
- Die Zahlen sollen sich alle paar Sekunden minimal ändern (simulierter
  Live-Stream via setInterval), damit es „lebt"

**Etage 2 — OPERATIONS (Mitte)**
- Open-Plan-Operations-Center
- Mehrere Monitor-Kacheln mit verschiedenen Visualisierungen: aufsteigende
  Liniencharts, Donut „STP-Quote 62%", Prozess-Flow „INPUT → VALIDATE →
  ENRICH → ROUTE → SETTLE", KPI-Kachel „EUR 12.4M Daily Volume"
- Ein kleiner autonomer Service-Roboter als Icon/Element

**Etage 3 — IT / DATA (Keller)**
- Data-Center-Look mit Server-Rack-Ebenen
- Ein Terminal-Log-Stream, der live durchläuft (simulierte System-Logs,
  monospace, [ok]/[warn]-Einträge in grün/amber)
- Fiber-Optic-Lichtpulse, die nach oben wandern (CSS-Animation)

**Außenbereich (links + rechts, optional dezent)**
- Andeutung einer Plaza mit Kunden-Figuren — kann minimalistisch als
  Silhouetten/Icons bleiben

## Interaktion (das Herzstück)

1. **Übersichts-Modus (Start):** Alle drei Etagen sichtbar, leichter
   Parallax bei Mausbewegung, ruhige Ambient-Animationen laufen.

2. **Etagen-Fokus:** Klick auf eine Etage → smooth Zoom/Transition, die
   gewählte Etage rückt in den Fokus (vergrößert, zentriert), die anderen
   beiden dimmen ab und rücken in den Hintergrund. Ein „Zurück"-Control
   (lucide ArrowLeft) bringt zurück in die Übersicht.

3. **Hotspots:** Pro Etage 2-3 klickbare Hotspots (lucide-Icon in einem
   dezenten Kreis). Klick öffnet ein Side-Panel (slide-in von rechts) mit
   einem Modul-Inhalt: Titel, 2-3 Sätze Beschreibung, eine „Hypothese
   2035"-Aussage. Inhalte sind Platzhalter, die ich später editiere —
   lege sie in einer zentralen `modules.ts`-Datendatei an, damit ich sie
   leicht ändern kann.

4. **Tastatur:** Pfeiltasten hoch/runter wechseln zwischen Etagen,
   Escape schließt Panels/Fokus. Wichtig für die Beamer-Präsentation.

## Design-Tokens (Deloitte-Stil, an meine Slides angelehnt)

```
--green-dark: #046A38   /* Deloitte Dark Green — Akzente, aktive States */
--green-brand: #86BC25  /* Deloitte Brand Green — sekundär */
--green-soft: #E8F3D1   /* heller grüner Hintergrund für Panels */
--ink: #212121          /* Haupttext */
--ink-2: #4A4A4A        /* Sekundärtext */
--ink-3: #8A8A8A        /* Tertiär / Labels */
--bg: #FFFFFF           /* Grundhintergrund hell */
--surface: #F7F8F5      /* Karten / Etagen-Flächen */
--cyan-accent: #7EC8FF  /* Hologramm / Dashboard-Akzent */
--amber: #C68A12        /* Highlights, Warn-States */
```

- Heller, Tageslicht-Look (passend zum neuen Hero-Bild) — NICHT dunkel
- Typografie: distinktive, aber professionelle Schrift. Vorschlag:
  eine Grotesk mit Charakter für Headlines (z.B. eine lokal eingebundene
  Schrift wie „Space Grotesk" oder „Geist" — KEINE Inter/Arial/Roboto),
  monospace nur für Daten-/Log-Werte (z.B. „IBM Plex Mono" oder „Geist Mono")
- Etagen durch feine Trennlinien und Material-Anmutung (Holz-Frame-Andeutung
  als CSS-Border, beige Stein-Flächen als Hintergrund) — subtil, nicht kitschig
- Ruhige, hochwertige Transitions (300-500ms ease), kein hektisches Gewackel

## Wichtige Constraints

- KEIN localStorage/sessionStorage (läuft sonst nicht in allen Umgebungen)
- Voll responsive, aber primär für Querformat / Beamer / Desktop optimiert
- Muss auch offline laufen (kein CDN-Zwang) — Fonts und Assets lokal
- Performance: 60fps bei den Parallax-/Ambient-Animationen, GPU-beschleunigt
  (transform/opacity statt layout-triggernde Properties)
- Code sauber strukturiert: eine `modules.ts` für alle editierbaren Inhalte,
  Komponenten pro Etage, ein zentraler State für Fokus/Panel

## Lieferung

- Vollständig lauffähiges Projekt mit `pnpm install && pnpm dev`
- README mit kurzer Anleitung (starten, Inhalte in modules.ts editieren,
  builden für statisches Hosting auf Cloudflare Pages)
- Sauberer, kommentierter Code

Fang mit der Projektstruktur und der Etagen-Übersicht an, dann Interaktion,
dann Feinschliff der Animationen. Zeig mir den Fortschritt iterativ.

=== PROMPT END ===

---

## Optionaler Schritt 2: Live-AI-Demo andocken

Wenn das Strukturbild läuft und du Zeit hast, kannst du einen Hotspot
„Frag die Bank der Zukunft" einbauen. Dann diesen Zusatz-Prompt geben:

```
Füge einen besonderen Hotspot hinzu: ein Chat-Panel "Frag die Bank 2035".
Der Nutzer tippt eine Frage, die an die Anthropic Messages API geht
(claude-sonnet-4 Modell, max_tokens 1000) über einen Hono-Worker auf
Cloudflare Workers als Proxy (API-Key serverseitig, niemals im Frontend).
System-Prompt: der Assistent antwortet als Banking-2035-Strategieberater,
prägnant, faktenbasiert, auf Deutsch. Antwort wird im Panel gestreamt
angezeigt. Wenn kein Worker erreichbar ist, zeige eine Demo-Antwort aus
einer lokalen Fallback-Liste.
```

---

## Notfall-Fallback für Donnerstag

Falls das Monorepo-Setup zu lange dauert: sag Claude Code einfach
*„mach mir das als einzelne self-contained index.html mit allem inline,
ohne Build-Schritt — muss nur im Browser per Doppelklick laufen"*.
Dann hast du eine Datei, die garantiert auf dem Beamer-Laptop läuft,
auch ohne Node/pnpm. Die Monorepo-Variante ist das Schöne, die
Single-File-Variante ist die Versicherung.
