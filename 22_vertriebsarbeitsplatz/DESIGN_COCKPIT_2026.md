# Cockpit 2026: Designsystem des KI-Vertriebsarbeitsplatzes

Leitidee: ein helles, hochwertiges, ruhiges Cockpit. Weiße Karten auf warmem
Off-White, hauchdünne Linien, wenig Farbe. Farbe steht nur für Bedeutung:
die dunkle Modusfarbe (Bordeaux, Oliv, Petrol) trägt Identität und Aktion
(Kopfleiste, aktive Tabs, primäre Knöpfe, Chart-Linien, Akzent-Hairlines),
Gold ist der sparsame Akzent für Kennzahlen und Marken, die Signalfarben
stehen für Status. Zahlen groß und in Mono, Text in warmem Schwarz. Nichts
leuchtet, nichts springt; das Cockpit wirkt wie ein hochwertiges Instrument.

**Der Hintergrund ist weiß, nicht schwarz.** Dunkle Flächen gibt es nur in
der Kopfleiste (Modus-Verlauf) und in Hero-Kacheln.

## Tokens (`src/index.css`, alle auf `:root`)

| Token | Wert | Verwendung |
|---|---|---|
| `--bg-primary` | `#faf9f7` | Seitenhintergrund (warmes Off-White) |
| `--bg-inset` | `#f4f2ee` | vertiefte Flächen (Eingabefelder, Karten in Karten, Kanban-Spalten) |
| `--bg-card` | `#ffffff` | Karten, Panels |
| `--bg-card-hover` | `#fcfbf9` | Karten im Hover |
| `--bg-elevated` | `#ffffff` | Popover, Dropdowns, Modals, Tooltips (mit tieferem Schatten) |
| `--bg-table-stripe` / `--bg-table-hover` | `#faf9f7` / `#f4f2ee` | Tabellen |
| `--text-primary` | `#1c1a17` | Überschriften, Werte |
| `--text-secondary` | `#5c574f` | Fließtext, Labels |
| `--text-tertiary` | `#8d877e` | Nebenangaben, Icons in Ruhe |
| `--border-light` / `--border-medium` / `--border-strong` | `#e9e6e0` / `#d9d5cd` / `#bdb7ad` | Hairlines, Rahmen, Trenner |
| `--mode-primary` / `--mode-primary-light` | je Modus (dunkel) | Kopfleiste, primäre Knöpfe, aktive Tabs, Markierungen |
| `--mode-primary-soft` / `--mode-pastel` | je Modus, 8–12 % Alpha | zart getönte Flächen in Modusfarbe |
| `--mode-accent` | Gold `#b8963e` (Banking `#a8952f`) | Kennzahlen-Akzente, Trendmarken, Fokusring |
| `--mode-chart` | je Modus | Linien und Balken in Charts |
| `--mode-gradient` | je Modus, dunkel | Kopfleiste, Hero-Kacheln |
| `--color-success/warning/danger/info` | `#2f8f5b` `#b7791f` `#c23b3b` `#2f6bb0` | Status, immer mit Icon oder Text |
| `--tint-success/warning/danger/info` | 10–12 % Alpha | Status-Flächen (Badges, Hinweise) |
| `--chart-axis` / `--chart-grid` | `#8d877e` / 7 % Schwarz | Achsen, Gitter |
| `--card-radius` | `14px` | Karten |

Modi: `[data-mode="versicherung"]` Bordeaux, `[data-mode="banking"]` Oliv,
`[data-mode="vermoegensverwaltung"]` Petrol. Die Modusfarbe trägt Identität,
sie ist nie Hintergrund ganzer Seiten oder Karten.

## Tailwind-Klassen im Cockpit

Die Grautöne (`slate`, `gray`, `zinc`, `neutral`, `stone`) sind auf eine warme
Neutralskala gelegt, die Signalfarben (`emerald`, `amber`, `red`, `blue`,
`violet` …) auf gedämpfte, hochwertige Töne. `bg-white`, `bg-slate-50`,
`text-slate-700`, `bg-emerald-50 text-emerald-700` und so weiter dürfen
bleiben; sie fallen automatisch in das Cockpit.

Was in den Komponenten zu ändern ist:

1. **Hartcodierte Hexwerte** in Inline-Styles und Chart-Props auf Tokens
   umstellen. Zuordnung: `#0f172a` `#1e293b` `#334155` → `var(--text-primary)`;
   `#475569` `#64748b` → `var(--text-secondary)`; `#94a3b8` `#cbd5e1` `#a3a3a3`
   → `var(--text-tertiary)`; `#e2e8f0` `#f1f5f9` als Linie → `var(--border-light)`,
   als Fläche → `var(--bg-inset)`; `#f8fafc` → `var(--bg-primary)`; `#ffffff`
   als Fläche → `var(--bg-card)`; `#10b981` `#059669` → `var(--color-success)`;
   `#f59e0b` `#d97706` → `var(--color-warning)`; `#ef4444` `#dc2626` →
   `var(--color-danger)`; `#3b82f6` `#2563eb` `#1e40af` → `var(--color-info)`;
   `#8b5cf6` `#7c3aed` `#6366f1` → `var(--quelle-kommunikation)`;
   `#1a365d` `#004d26` `#86181d` → `var(--mode-primary-light)`.
   `var(--_fg, #hex)`-Fallbacks genauso umstellen, das `--_fg` kann bleiben;
   der Karten-Hover invertiert nicht mehr, die Fallbacks sind die Ruhefarbe.
2. **Bunte Verläufe** (`bg-gradient-to-r from-violet-50`, Kampagnen-Kacheln in
   Blau, Lila, Orange, Grün, Produktbausteine in Blau/Rot): keine Regenbogen-
   Kacheln. Kacheln sind weiße Flächen (`surface-card`) mit einem schmalen
   Streifen oder Punkt in einer gedämpften Kategoriefarbe und einem
   einfarbigen Lucide-Icon; nur die Hero-Kachel darf den `--mode-gradient`
   tragen (dunkel, Schrift weiß).
3. **Dunkle Tooltips/Knöpfe** (`bg-slate-800/900 text-white`): auf
   `surface-elevated` mit `text-(--text-primary)` umstellen; primäre Knöpfe
   auf `bg-(--mode-primary) text-white`.
4. **Institutsfarben** (`src/data/modeConfig.js`): tiefe, edle Varianten der
   Markenfarbe für die Kopfleiste (dunkler Verlauf, wenig Sättigung).

## Regeln

- **Karten**: `surface-card` oder `Card` (14 px Radius, Hairline, weiße
  Fläche, weicher Schatten). Hover hebt an (tieferer Schatten, Modus-Hairline),
  es wird nichts mehr vollflächig invertiert.
- **Typografie**: Uniform (Miller Type Foundry), selbst ausgeliefert aus
  `src/schrift/`, kein externer Schriftabruf. Regular 400 ist die
  Grundschrift (Light ist für Fließtext zu dünn), `font-medium`,
  `font-semibold`, `font-bold` und `strong` liegen auf Medium 500, dem
  schwersten Schnitt, Light 300 nur ausdrücklich über `font-light`; der
  Browser errechnet kein Fett (`font-synthesis-weight: none`). Überschriften `font-semibold`,
  `letter-spacing: -0.01em`. Kennzahlen in Uniform Tab (`font-mono`, Ziffern
  gleicher Dickte), große Werte 28 bis 36 px, Text 14 bis 15 px, Nebenangaben
  12 px in `--text-tertiary`. Uppercase-Labels mit `tracking-wider` nur 11 px
  und nur für Kicker.
- **Charts** (recharts): Linien 2 px in `--mode-chart`, Flächen 10 bis 12 %
  Alpha, Punkte ab 8 px mit weißem Ring, Achsen `--chart-axis`, Gitter
  `--chart-grid` als Hairline, Tooltip `surface-elevated`. Eine Achse je Chart.
  Kein Chart bekommt mehr als eine Modusfarbe plus Gold.
- **Status**: Erfolg, Warnung, Gefahr, Info aus den Tokens, immer mit Icon
  oder Text, nie Farbe allein. Badges: zart getönte Fläche (`--tint-*`),
  dunkler Text in der Statusfarbe, keine Rahmen in Signalfarbe.
- **Icons**: Lucide, einfarbig (`currentColor`), 14 bis 18 px, keine Emojis
  (`⚠` und ähnliche Zeichen durch Lucide-Icons ersetzen).
- **Knöpfe**: primär `bg-(--mode-primary) text-white` mit Hover
  `--mode-primary-light`; sekundär `surface-inset` mit `--text-primary`;
  Ghost nur Text in `--text-secondary`. Radius 10 px, Höhe 36 bis 40 px.
- **Eingaben**: `surface-inset`, Text `--text-primary`, Placeholder
  `--text-tertiary`, Fokus über den globalen Fokusring.
- **Modals und Popover**: `surface-elevated`, Backdrop `rgba(28,26,23,0.45)`
  mit `backdrop-blur-sm`.
- **Kopfleiste**: dunkler Modus-Verlauf (`--mode-gradient`), Chips als helles
  Glas (`bg-white/10`, `border-white/15`), Schrift weiß; Header-Foto mit
  dunklem Verlaufs-Scrim.
- **Landing**: das Panorama bleibt, Panels als helles Glas
  (`rgba(255,255,255,0.86)` mit `backdrop-blur`), Text dunkel, primärer Knopf
  in Modusfarbe.
- **Karten (Maps)**: helle Kacheln (CartoDB `light_all`, Mapbox `light-v11`),
  Marker und Flächen in `--mode-chart` bzw. `--mode-accent`.
- **Bewegung**: 150 bis 250 ms, `ease-out`, nichts springt oder hüpft.
- **Sprache und Formate** bleiben unverändert (Deutsch, `DD.MM.YYYY`,
  `1.234,56 EUR`), Datenkonsistenz gemäß `CLAUDE.md`.

## Prüfen

Dev-Server starten (`npx vite --port <port>`), dann mit Playwright Screenshots
der drei Modi ziehen (`#/versicherung/overview`, `#/banking/overview`,
`#/vermoegensverwaltung/overview`) und jede geänderte Ansicht auf dunkle
Restflächen, bunte Verläufe, unlesbaren Text und kaputte Hover prüfen. Der
Build (`npm run build`) läuft am Ende einmal zentral.
