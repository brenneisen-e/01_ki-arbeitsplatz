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
