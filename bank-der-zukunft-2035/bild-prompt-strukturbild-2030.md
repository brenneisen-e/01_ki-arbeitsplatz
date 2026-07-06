# Bild-Prompt — neues Master-Strukturbild „Banking Horizon 2030"

Prompt zum **Erzeugen des Gebäude-Querschnitts** (`public/images/Strukturbild.png`),
also des begehbaren Master-Bildes in der Übersicht (`#/uebersicht`) und im
Intro-Reveal. Bildmodell: Firefly / GPT-Image / Midjourney o. ä.

> Kontext: Das alte Master-Bild zeigt den Boardroom oben links als *Compliance &
> Risk*. Laut Workshop-Feedback (`AENDERUNGEN_2030.md`, §6) soll es ein **neues
> Gebäude-Layout** geben: eine eigene **Vorstands-/Boardroom-Etage oben links**,
> *Compliance & Risk* wandert als *Risikocontroller vor Bildschirmen* nach unten,
> die Filiale teilt sich das Erdgeschoss mit der *Beratung (Markt & Vertrieb)*,
> und die *Organisationsentwicklung* rückt eine Etage tiefer. Dieser Prompt setzt
> genau dieses neue Layout um.

---

## Ziel-Spezifikation

| Feld | Wert |
|---|---|
| Datei | `public/images/Strukturbild.png` |
| Seitenverhältnis | **3:2 (1536 × 1024 px)** — die `ZONES`-Koordinaten in `src/data/chapters.ts` sind darauf kalibriert |
| Format | PNG, keine Transparenz, keine eingebrannten Beschriftungen (Labels rendert die App als Overlay) |
| Stil | Fotorealistischer orthografischer Architektur-Querschnitt („Dollhouse-Cutaway"), Tageslicht, ruhig, premium — Vorstands-Workshop-tauglich, kein verspieltes Spielzeug |

## Raum-Layout (Legende — 4 Etagen × 2 Räume + Glas-Aufzug)

Von oben nach unten, Blick frontal in den aufgeschnittenen Gebäudequerschnitt.
Ein **gläserner Aufzug als vertikale Spine** verbindet mittig alle Etagen.

| Etage | Links | Rechts |
|---|---|---|
| **3. OG (oben)** | **Boardroom / Vorstand** — heller Tageslicht-Boardroom, großer Konferenztisch, an der Wand ein „Governance Cockpit" (Dashboard-Wand mit Kennzahlen, Donut-Charts, Balken) | **Produkte & Innovation** — Projektraum, Whiteboard-Wände mit Produkt-Mockups, Design-Sprint-Atmosphäre |
| **2. OG** | **Compliance & Risk** — Risikocontroller an mehreren Monitoren (Risk-Monitoring-Desk, Trading-Desk-Anmutung), **kein** Boardroom | **Technologie / IT** — Serverraum mit Server-Rack-Reihen, Monitoring-Arbeitsplatz, Glasfaser-Licht |
| **1. OG** | **Corporate Services / Organisationsentwicklung / HR** — offener Team-/Lernbereich, Menschen an Tischen, immersives Training angedeutet | **Marktfolge** — Backoffice-Großraum, Reihen mit Workflow-Screens, ruhige Sachbearbeitung |
| **Erdgeschoss** | **Filiale / Kundenperspektive** — Self-Service-Lounge und Schalter, einladend, hell | **Markt & Vertrieb** — Beratungsgespräch, Berater und Kunde am Tisch, Advisory-Cockpit-Screen |
| **Aufzug (Mitte, vertikal)** | \multicolumn — **Transformation**: gläserner Panorama-Aufzug als leuchtende Spine durch alle Etagen | |

Außenbereich links/rechts und unten: dezente Plaza-Andeutung mit einigen
Kunden-Silhouetten, damit das Gebäude im Kontext steht (nicht freigestellt).

---

## PROMPT (englisch — zum Kopieren ins Bildmodell)

```
Photorealistic orthographic architectural cross-section of a modern bank
building in 2030 — a clean dollhouse cutaway with the front facade removed so
you look straight into every room. Four stacked floors of equal height plus a
ground floor, perfectly symmetric, the building centered and filling the frame,
soft natural daylight, calm and premium, boardroom-grade, not toy-like.

A central full-height GLASS PANORAMA ELEVATOR runs as a vertical spine through
all floors, subtly glowing deep green, connecting the levels.

Top floor, LEFT: an executive BOARDROOM — bright daylit room, large conference
table, a wall-mounted "governance cockpit" dashboard with donut charts, bars and
KPI tiles. Top floor, RIGHT: a product & INNOVATION project room with whiteboard
walls covered in product mockups, design-sprint feel.

Second floor, LEFT: a COMPLIANCE & RISK control room — risk controllers seated
at rows of monitors, risk-monitoring desks, a trading-desk look (not a
boardroom). Second floor, RIGHT: an IT SERVER ROOM with rows of server racks, a
monitoring workstation and fibre-optic light streaks.

First floor, LEFT: a CORPORATE SERVICES / HR open team-and-learning space, people
at tables, a hint of immersive training. First floor, RIGHT: a back-office
open-plan floor (loan operations) with rows of workflow screens, quiet and
orderly.

Ground floor, LEFT: a welcoming retail BRANCH with a self-service lounge and a
teller counter. Ground floor, RIGHT: a sales ADVISORY meeting — an adviser and a
client at a table with an advisory cockpit screen.

Outside, left and right and below: a subtle plaza with a few customer
silhouettes for context.

Material and color: light stone and warm wood surfaces, glass, professional and
restrained. Accent color deep Deloitte green (#046A38) with a secondary brighter
green (#86BC25); a cool cyan hologram accent (#7EC8FF) only on screens and
dashboards. Monochrome, single-color signage — no multi-color or gradient icons.
Even, clean daylight, high detail, crisp edges, architectural rendering quality.

Aspect ratio 3:2, 1536x1024.
```

### Negativ-Prompt / Ausschlüsse

```
no baked-in text labels, no lorem ipsum, no gibberish signage, no watermark,
no logos, no emojis, no people's faces in close-up, no dark night mood,
no neon cyberpunk, no fisheye or perspective distortion, no clutter,
no multi-color gradient icons, not isometric, not a floor plan seen from above.
```

---

## Kompakt-Variante (für schnelle Iterationen)

```
Photorealistic orthographic cross-section (dollhouse cutaway, front wall removed)
of a premium 2030 bank, four equal floors plus ground floor, symmetric, daylight,
central glowing green glass elevator spine. Top-left executive boardroom with a
governance-cockpit dashboard wall; top-right innovation room with mockup
whiteboards; 2F-left compliance & risk control room (controllers at monitor
rows); 2F-right IT server room; 1F-left corporate/HR learning space; 1F-right
back-office workflow floor; ground-left retail branch with self-service lounge;
ground-right advisory meeting. Light stone and wood, glass, Deloitte-green accent
#046A38, cyan screen glow, monochrome signage, no baked-in text, calm and
high-end. Aspect 3:2, 1536x1024.
```

---

## Nach der Bildlieferung (Code nachziehen)

1. Datei als `public/images/Strukturbild.png` (1536×1024) ablegen, `npm run build`.
2. In `src/data/chapters.ts` die `zone`-Koordinaten je Kapitel um 1–2 %
   nachjustieren (Zoom-Mathematik: Header-Kommentar in `BankExplorer.tsx`).
   Das aktuelle Raster (`RAUM-MAPPING`-Kommentar in `chapters.ts`) entspricht dem
   **alten** Bild — es muss auf das neue Layout oben angepasst werden.
3. **Offener Punkt (Freigabe nötig):** Der neue **Boardroom/Vorstand** oben links
   ist im obigen Layout ein eigener Raum. Damit sind es 8 Räume + Aufzug. Zu
   entscheiden: Wird „Vorstand/Boardroom" ein **eigenes Kapitel** (dann Kapitel-
   IDs, Hypothesen und Deep-Links erweitern) oder bleibt es rein bildlich Teil von
   „06 Compliance & Risk"? Bis zur Klärung nur das Bild tauschen, Zonen re-mappen.
