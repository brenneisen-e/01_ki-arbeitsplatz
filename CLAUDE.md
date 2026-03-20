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
