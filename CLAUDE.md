# KI Arbeitsplatz - Entwicklungshinweise

## Build-Prozess

Nach jeder Code-Änderung in einer der Sub-Apps muss der Vite-Build neu ausgeführt werden, damit die Änderungen in der ausgelieferten `dist/`-Version sichtbar werden:

```bash
cd Bestandsuebertragung && npm install && npm run build
```

Die gebauten Dateien in `dist/` werden mit ins Repository eingecheckt und müssen nach jedem Build committet werden.

## Projekt-Struktur

- **Bestandsuebertragung/** - Bestandsübertragung (ERGO, Portfolio Transfer Management)
- **vertriebsarbeitsplatz/** - Vertriebsarbeitsplatz (Sales Workstation)
- **kreditanalyse/** - Kreditanalyse (Credit Analysis)

Alle Projekte nutzen: **Vite + React 19 + Tailwind CSS v4**

## Styling-Konventionen

- CSS-Framework: Tailwind CSS v4 mit Custom Properties in `src/index.css`
- Schriftarten: DM Sans (Fließtext), JetBrains Mono (Monospace)
- Basis-Schriftgröße (Bestandsuebertragung): 20px
- Card-System: `.card-base` Klasse für Karten mit Shadow, Border-Radius, Containment
- Modus-Farben über CSS Custom Properties (`--mode-primary`, `--mode-primary-light`, etc.)
- Seiten-Layouts sollen die volle verfügbare Breite nutzen (kein `max-w-*` + `mx-auto` auf Page-Containern)

## Icon- und Emoji-Regeln

- **Keine Emojis** im gesamten Produkt. Dazu zählen insbesondere `💡`, `🔥`, `✨`, `⭐`, `🎉`, `⚠️`, `✅`, `❌`, `🚀` und sonstige Unicode-Emojis — weder in UI-Texten, Chatbot-Antworten, Tooltips, Badges, Notifications, noch in Demo-Daten.
- **Ausschließlich einfarbige Icons** verwenden. Lucide-Icons (React) oder inline SVGs sind die einzige erlaubte Icon-Quelle. Icons dürfen nur eine Farbe haben (`currentColor` oder eine CSS Custom Property), keine Multi-Color- oder Gradient-Icons.
- **Keine Farbverläufe in Icons**. Wenn Hervorhebung nötig ist, über Container (Background-Gradient auf dem Button/der Card), nicht über das Icon selbst.
- Statt `💡` als „Tipp"-Marker verwenden: Lucide `Lightbulb` oder `Sparkles` in einer Farbe.
- Statt `🔥` für Streaks: Lucide `Flame` in einfarbigem Orange.
- Statt `⚠️`: Lucide `AlertTriangle` oder `AlertCircle`.
- Statt `✅`/`❌`: Lucide `Check`/`X`.

## Datenkonsistenz

- Die Antworten des KI-Vertriebsassistenten (VertriebsAssistent.jsx) **müssen zu den tatsächlich im UI angezeigten Daten passen**. Keine hardcodierten Zeiten, Namen oder Zahlen, die sich von den Tab-Inhalten unterscheiden. Stattdessen die realen Datenquellen (`TERMINE_BY_MODE`, `AUFGABEN_BY_MODE`, `getAllPotentiale`, …) lesen.

## Datums- und Zahlenformate (deutsche Lokalisierung)

Die Apps sind deutschsprachig — entsprechend **müssen alle im UI sichtbaren Datums- und Zahlenangaben in deutschem Format** dargestellt werden. Das gilt für Texte, Tabellen, Badges, Karten, Tooltips, Listen und Demo-Daten.

- **Datum:** `DD.MM.YYYY` (z. B. `01.09.2025`). Verwenden: `new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })`.
- **Datum lang:** `1. September 2025`. Verwenden: `toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })`.
- **Monat + Jahr:** `September 2025` — deutsche Monatsnamen (Januar, Februar, März, …, Dezember), **nie** englische (January, March, May, …).
- **Uhrzeit:** `HH:MM` im 24-Stunden-Format (z. B. `14:30`).
- **Geldbeträge:** `1.234,56 EUR` via `toLocaleString('de-DE')` bzw. `Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })`.
- **Dezimal-/Tausender-Trennzeichen:** Komma dezimal, Punkt tausender.

### Keine native `<input type="month">` / `<input type="date">` ohne Locale-Fallback

HTML5-Picker rendern Monats- und Datumsnamen in der Browser-UI-Sprache. Auf englischsprachigen Systemen stehen dann z. B. `March 2026` statt `März 2026` im Feld. Daraus folgt:

- Für Monats-/Jahr-Auswahl **keine** `<input type="month">` einsetzen. Stattdessen einen eigenen Monat/Jahr-Picker mit zwei Dropdowns (deutsche Monatsnamen als `<option>`, Jahr als `<option>`) bauen und den Wert als `YYYY-MM` verdrahten (siehe `MonatJahrPicker` in `provisionsreklamation/src/modules/provisionsreklamation/components/ReklamationForm.jsx`).
- Bei `<input type="date">` das Attribut `lang="de-DE"` setzen und zusätzlich unterhalb eine formatierte DE-Anzeige (`toLocaleDateString('de-DE', ...)`) rendern, damit der Nutzer den gesetzten Wert garantiert in `DD.MM.YYYY` sieht — unabhängig vom Browser-Rendering.
- Demo-Daten (`eingangsdatum`, `vertragsbeginn`, `datum`, Zeiträume …) bleiben intern im ISO-Format (`YYYY-MM-DD` bzw. `YYYY-MM`), werden aber **vor der Anzeige** mit `toLocaleDateString('de-DE', …)` bzw. einem Monatsnamen-Mapping formatiert.

## Markdown / Rich Text in Demo-Daten

- Reine E-Mail-/Korrespondenz-Texte (z. B. `antwort_entwurf`) werden als Plaintext versendet. Dort **kein** Markdown (`**fett**`, `*kursiv*`, `#` etc.) verwenden — die Sterne erscheinen dem Empfänger sonst wörtlich.
- Nur in Analyse-/Bewertungstexten, die über einen Renderer mit Inline-Markdown-Unterstützung angezeigt werden (z. B. `KiAnalysePanel` mit `renderMarkdownInline`), dürfen `**fett**`-Stellen vorkommen.
