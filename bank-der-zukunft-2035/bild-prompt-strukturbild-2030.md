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
| Format | PNG, keine Transparenz. **Raum-Labels erwünscht** (je Raum ein kurzes, korrekt geschriebenes Schild an der Rückwand) — im Workshop besser lesbar; die App-Overlay-Labels stören nicht |
| Stil | Fotorealistischer orthografischer Architektur-Querschnitt („Dollhouse-Cutaway"), Tageslicht, ruhig, premium — Vorstands-Workshop-tauglich, kein verspieltes Spielzeug |

## Raum-Layout (Legende — 4 Etagen × 2 Räume + Glas-Aufzug)

Von oben nach unten, Blick frontal in den aufgeschnittenen Gebäudequerschnitt.
Ein **gläserner Aufzug als vertikale Spine** verbindet mittig alle Etagen.

| Etage | Links | Rechts |
|---|---|---|
| **3. OG (oben)** | **Boardroom / Vorstand** — heller Tageslicht-Boardroom, großer Konferenztisch, an der Wand ein „Governance Cockpit" (Dashboard-Wand mit Kennzahlen, Donut-Charts, Balken) | **Produkte & Innovation** — Projektraum, Whiteboard-Wände mit Produkt-Mockups, Design-Sprint-Atmosphäre |
| **2. OG** | **Compliance & Risk** — Risikocontroller an mehreren Monitoren (Risk-Monitoring-Desk, Trading-Desk-Anmutung), **kein** Boardroom | **Technologie / IT** — Serverraum mit Server-Rack-Reihen und **seitlichem Fenster**; **Mann und Frau stehen vor den Servern und unterhalten sich**, dazu normale Screens (kein Hologramm) |
| **1. OG** | **Corporate Services / Organisationsentwicklung / HR** — offener Team-/Lernbereich, Menschen an Tischen, immersives Training angedeutet | **Marktfolge** — Backoffice-Großraum, Reihen mit Workflow-Screens, ruhige Sachbearbeitung |
| **Erdgeschoss** | **Filiale / Kundenperspektive** — Self-Service-Lounge und Schalter, einladend, hell | **Markt & Vertrieb** — Beratungsgespräch, Berater und Kunde am Tisch, Advisory-Cockpit-Screen |
| **Aufzug (Mitte, vertikal)** | \multicolumn — **Transformation**: gläserner Panorama-Aufzug als leuchtende Spine durch alle Etagen | |

Außenbereich links/rechts und unten: dezente Plaza-Andeutung mit einigen
Kunden-Silhouetten, damit das Gebäude im Kontext steht (nicht freigestellt).

---

## PROMPT (englisch — zum Kopieren ins Bildmodell)

> **v2 — Logikfehler aus dem ersten Rendering korrigiert:** (1) Aufzug hatte auf
> jeder Etage eine Person → jetzt genau **eine** Kabine mit max. einer Person;
> (2) Boardroom war leer → jetzt **besetzt** (Vorstände am Tisch); (3) im
> Serverraum schwebte eine **Hologramm-Welle** → entfernt, nur normale Screens +
> dezente Rack-LEDs.

```
Photorealistic orthographic architectural cross-section of a modern bank
building in 2030 — a clean dollhouse cutaway with the front facade removed so
you look straight into every room. Four stacked floors of equal height plus a
ground floor, perfectly symmetric, the building centered and filling the frame,
soft natural daylight, calm and premium, boardroom-grade, not toy-like.

A central full-height glass elevator shaft runs as a vertical spine, subtly
glowing deep green. It contains exactly ONE glass elevator car, stopped at a
single floor, with at most one person inside; the rest of the shaft is empty
glass. Do NOT place a person on every floor and do NOT stack multiple people up
the shaft.

Top floor, LEFT: an executive BOARDROOM, occupied — several board members /
executives seated around a large conference table, facing a wall-mounted
"governance cockpit" dashboard with donut charts, bars and KPI tiles. Top floor,
RIGHT: a product & INNOVATION project room, two or three people at whiteboard
walls covered in product mockups, design-sprint feel.

Second floor, LEFT: a COMPLIANCE & RISK control room — risk controllers seated
at rows of monitors, risk-monitoring desks, a trading-desk look (not a
boardroom). Second floor, RIGHT: an IT SERVER ROOM with rows of dark server
racks and a side window letting in daylight; a man and a woman stand in front of
the racks talking to each other; ordinary flat screens and only small green
indicator lights on the racks — NO floating hologram, no cyan light wave
hovering in mid-air.

First floor, LEFT: a CORPORATE SERVICES / HR open team-and-learning space, people
at tables, a hint of immersive training. First floor, RIGHT: a back-office
open-plan floor (loan operations) with rows of workflow screens, quiet and
orderly.

Ground floor, LEFT: a welcoming retail BRANCH with a self-service lounge and a
teller counter with staff and customers. Ground floor, RIGHT: a sales ADVISORY
meeting — an adviser and a client at a table with an advisory cockpit screen.

Outside, left and right and below: a subtle plaza with a few customer
silhouettes for context.

Each room carries one short, correctly spelled room label as a neat sign on its
back wall, consistent modern uppercase, deep green on light: top-left "BOARDROOM",
top-right "PRODUCT & INNOVATION", second-left "COMPLIANCE & RISK", second-right
"IT SERVER ROOM", first-left "CORPORATE SERVICES / HR", first-right "LOAN
OPERATIONS", ground-left "BRANCH", ground-right "ADVISORY". Spell each label
exactly as given; these eight are the only text in the image.

Material and color: light stone and warm wood surfaces, glass, professional and
restrained. Accent color deep Deloitte green (#046A38) with a secondary brighter
green (#86BC25); a cool cyan accent (#7EC8FF) only as subtle glow on flat
screens, never as free-floating holograms. Monochrome, single-color icons —
no multi-color or gradient icons. Even, clean daylight, high detail, crisp
edges, architectural rendering quality.

Aspect ratio 3:2, 1536x1024.
```

### Negativ-Prompt / Ausschlüsse

```
a person standing on every elevator floor (forbidden), multiple stacked people
inside the elevator shaft (forbidden), an empty boardroom with no people
(forbidden), a floating hologram or cyan light wave hovering in the server room
(forbidden), misspelled or gibberish room labels (forbidden — only the eight
given labels, spelled exactly), no extra signage beyond the room labels,
no watermark, no logos, no emojis, no people's faces in close-up, no dark night
mood, no neon cyberpunk, no fisheye or perspective distortion, no clutter,
no multi-color gradient icons, not isometric, not a floor plan seen from above.
```

---

## Ein-Prompt-Variante für ChatGPT / GPT-Image (kein Negativ-Feld)

ChatGPT (GPT-Image / DALL·E) hat **kein separates Negativ-Feld** — alles muss in
**einen** Prompt. Die Ausschlüsse stehen daher als normale Sätze im Fließtext.
Bildformat zusätzlich im ChatGPT-UI auf Querformat (3:2 / Landscape) stellen.

```
Create a photorealistic orthographic architectural cross-section of a modern bank building in 2030 — a clean dollhouse cutaway with the front facade removed so you look straight into every room. Four stacked floors of equal height plus a ground floor, perfectly symmetric, centered and filling the frame, soft natural daylight, calm, premium and boardroom-grade (not toy-like). Wide landscape format, aspect ratio 3:2 (1536×1024).

A central full-height glass elevator shaft runs as a vertical spine, subtly glowing deep green. It holds exactly one glass elevator car, stopped at a single floor, with at most one person inside — the rest of the shaft is empty glass. Do not put a person on every floor and do not stack several people up the shaft.

Each room shows one small, clean, correctly spelled room label as a neat sign on the back wall, in a consistent modern uppercase style, deep green on a light background. Use exactly these labels:
- Top floor left, label "BOARDROOM": an occupied executive boardroom, several board members seated around a large conference table, facing a wall-mounted governance-cockpit dashboard with abstract donut charts and bars.
- Top floor right, label "PRODUCT & INNOVATION": a project room with two or three people at whiteboard walls covered in product mockups.
- Second floor left, label "COMPLIANCE & RISK": a control room with risk controllers seated at rows of monitors, a calm trading-desk look.
- Second floor right, label "IT SERVER ROOM": rows of dark server racks with a window on the side letting in daylight; a man and a woman stand in front of the racks talking to each other; ordinary flat screens and small green rack lights, no floating hologram and no glowing wave hovering in the air.
- First floor left, label "CORPORATE SERVICES / HR": an open team-and-learning space with people at tables.
- First floor right, label "LOAN OPERATIONS": a back-office floor with rows of workflow screens, quiet and orderly.
- Ground floor left, label "BRANCH": a welcoming retail branch with a self-service lounge and a staffed teller counter.
- Ground floor right, label "ADVISORY": an adviser and a client at a table with a screen.
Outside, to the left, right and below: a subtle plaza with a few customer silhouettes for context.

Style: light stone and warm wood surfaces, glass, professional and restrained; deep green accent #046A38 with a brighter secondary green #86BC25, cool cyan #7EC8FF only as a subtle glow on the flat screens, never as a free-floating hologram; monochrome single-color icons. Even, clean daylight, high detail, crisp edges, architectural-rendering quality. The only text in the image is the eight short room labels above, each spelled exactly as given; no other signage, no logos, no watermark.
```

> Für die **Hypothesen-Bilder** in `bild-prompt-hypothesen-2030.md` gilt dasselbe:
> die Prompts dort sind bereits eigenständige Ein-Prompt-Texte; für ChatGPT den
> separaten Negativ-Block weglassen und stattdessen den Satz „Keep both halves
> clean with no text or labels; it is the same person on the right, just 4–5
> years older in different clothes" ans Ende hängen.

---

## Kompakt-Variante (für schnelle Iterationen)

```
Photorealistic orthographic cross-section (dollhouse cutaway, front wall removed)
of a premium 2030 bank, four equal floors plus ground floor, symmetric, daylight,
central green glass elevator spine with exactly ONE car (one person max, not one
per floor). Top-left OCCUPIED executive boardroom (executives seated at the
table) with a governance-cockpit dashboard wall; top-right innovation room with
mockup whiteboards; 2F-left compliance & risk control room (controllers at
monitor rows); 2F-right IT server room with racks, a side window and a man and a
woman standing in front of the servers talking (NO floating hologram); 1F-left
corporate/HR learning space; 1F-right back-office
workflow floor; ground-left retail branch with self-service lounge; ground-right
advisory meeting. One short correctly-spelled room label per room on the back
wall (BOARDROOM, PRODUCT & INNOVATION, COMPLIANCE & RISK, IT SERVER ROOM,
CORPORATE SERVICES / HR, LOAN OPERATIONS, BRANCH, ADVISORY). Light stone and
wood, glass, Deloitte-green accent #046A38, cyan glow only on flat screens,
monochrome icons, calm and high-end. Aspect 3:2, 1536x1024.
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
