# Slide Template Spezifikation

Dieses Dokument beschreibt alle Layout-, Typografie- und Raster-Vorgaben fuer die Fullscreen-Slides.
Es dient als Referenz, damit neue Slides (auch als standalone HTML) exakt dem bestehenden Design entsprechen.

---

## 1. Ziel-Bildschirm & Viewport

| Eigenschaft | Wert |
|---|---|
| Zielmonitor | 27 Zoll, 2560 x 1440 px |
| Slide-Groesse | 100vw x 100vh (Fullscreen) |
| Max-Width (ab 2400px) | 2560px, zentriert |
| Scroll-Verhalten | Snap Scrolling (`scroll-snap-type: y mandatory`) |

---

## 2. Root Font-Size (rem-Basis)

Alle Groessenangaben mit Tailwind-Klassen nutzen `rem` und skalieren mit der Root-Font-Size.

| Viewport-Breite | Root `font-size` | Hinweis |
|---|---|---|
| < 2400px | **18px** | Standard, optimiert fuer Lesbarkeit (~14pt) |
| >= 2400px (27 Zoll) | **20px** | Media Query `@media (min-width: 2400px)` |

---

## 3. Schriftart (Font Family)

```
font-family: 'Aptos', 'Open Sans', 'Segoe UI', sans-serif;
```

- Line-Height: `1.6`
- Standardtextfarbe: `#333333`

---

## 4. Layout-Zonen (4 Bereiche)

Jede Slide ist vertikal in 4 Zonen unterteilt:

```
+----------------------------------------------------------+
|  ZONE 1: Title (H1)                     [ab 32px oben]   |
|  ZONE 2: Subtitle (H2)                  [ab 80px oben]   |
+----------------------------------------------------------+
|                                                          |
|  ZONE 3: Body Content                   [ab 130px oben]  |
|  (flexibel, fuellt den Raum)                             |
|                                                          |
+----------------------------------------------------------+
|  ZONE 4: Footer                    [48px Hoehe, unten]   |
+----------------------------------------------------------+
```

### Abstaende (LAYOUT_CONSTANTS)

| Konstante | Tailwind-Klasse | Pixel-Wert | Beschreibung |
|---|---|---|---|
| paddingTop | `pt-8` | 2rem | Oberer Abstand (Title-Bereich) |
| paddingX | `px-12` | 3rem | Seitenraender links/rechts |
| paddingBottom | `pb-6` | 1.5rem | Abstand zwischen Subtitle und Body |
| footerHeight | `h-12` | 3rem | Feste Footer-Hoehe |

### Pixel-Werte bei verschiedenen Root-Font-Sizes

| Konstante | Bei 18px root (Standard) | Bei 20px root (27 Zoll) |
|---|---|---|
| paddingTop (2rem) | 36px | 40px |
| paddingX (3rem) | 54px | 60px |
| paddingBottom (1.5rem) | 27px | 30px |
| footerHeight (3rem) | 54px | 60px |

---

## 5. Typografie

### Title (H1)
| Eigenschaft | Wert |
|---|---|
| Tailwind-Klasse | `text-4xl` (2.25rem) |
| Bei 18px root | 40.5px |
| Bei 20px root (27 Zoll) | 45px |
| Font-Weight | `font-normal` (400) |
| Farbe | Schwarz `#000000` (`text-black`) |
| Ausrichtung | links (`text-left`) |
| Margin unten | `mb-1` (0.25rem) |

### Subtitle (H2)
| Eigenschaft | Wert |
|---|---|
| Tailwind-Klasse | `text-2xl` (1.5rem) |
| Bei 18px root | 27px |
| Bei 20px root (27 Zoll) | 30px |
| Farbe | Grau-600 `#4B5563` (`text-gray-600`) |
| Ausrichtung | links (`text-left`) |

### Body-Text
| Variante | Tailwind-Klasse | Bei 18px root | Bei 20px root |
|---|---|---|---|
| Standard | `text-lg` (1.125rem) | 20.25px | 22.5px |
| Klein | `text-sm` (0.875rem) | 15.75px | 17.5px |
| Extra klein | `text-xs` (0.75rem) | 13.5px | 15px |

### Footer-Text
| Eigenschaft | Wert |
|---|---|
| Tailwind-Klasse | `text-xs` (0.75rem) |
| Bei 18px root | 13.5px |
| Bei 20px root (27 Zoll) | 15px |
| Farbe | Grau-500 `#6B7280` (`text-gray-500`) |
| Inhalt | z.B. "Deloitte 2025" |

---

## 6. Rasterlinien (Grid Overlay)

### Vertikale Linien

| Linie | Position | Farbe | Deckkraft |
|---|---|---|---|
| Linker Rand | 48px von links | Rot, gestrichelt | 60% |
| Rechter Rand | 48px von rechts | Rot, gestrichelt | 60% |
| 25%-Linie | 25% der Breite | Rot (hell), gestrichelt | 40% |
| Mittellinie | 50% der Breite | Rot, gestrichelt | 60% |
| 75%-Linie | 75% der Breite | Rot (hell), gestrichelt | 40% |

### Horizontale Linien

| Linie | Position | Farbe | Deckkraft | Beschreibung |
|---|---|---|---|---|
| Title-Oberkante | 32px von oben | Blau, gestrichelt | 60% | Beginn Title-Zone |
| Subtitle-Bereich | 80px von oben | Blau, gestrichelt | 60% | Beginn Subtitle-Zone |
| Body-Start | 130px von oben | Gruen, gestrichelt | 60% | Beginn Body-Content |
| Footer-Grenze | 48px vom unteren Rand | Orange, gestrichelt | 80% | WICHTIG: Nichts unterhalb! |
| Fussnoten-Linie | 24px vom unteren Rand | Orange (hell), gestrichelt | 50% | Fussnoten-Bereich |

---

## 7. Farben

### Markenfarben (CSS Custom Properties)

| Variable | Hex | Verwendung |
|---|---|---|
| `--deloitte-green` | `#86BC25` | Primaerfarbe, Akzente, Badges |
| `--deloitte-black` | `#000000` | Titel, Headlines |
| `--deloitte-dark-gray` | `#333333` | Standard-Textfarbe |
| `--deloitte-gray` | `#666666` | Sekundaertext |
| `--deloitte-light-gray` | `#999999` | Dezenter Text |
| `--deloitte-bg-gray` | `#f5f5f5` | Hintergrund-Akzent |
| `--deloitte-white` | `#ffffff` | Slide-Hintergrund |

### Weitere verwendete Farben

| Farbe | Hex | Verwendung |
|---|---|---|
| Dunkelblau | `#003b6e` | Ueberschriften auf einzelnen Slides |
| Hellblau | `#0070c0` | Akzente, Pillar "Win Rate" |
| Dunkelgruen | `#046A38` | Pillar "Revenue Case", Status |

---

## 8. Slide-Badge (Entwicklungsmodus)

| Eigenschaft | Wert |
|---|---|
| Position | Oben rechts (`top: 16px`, `right: 80px`) |
| Hintergrund | `#86BC25` |
| Textfarbe | Weiss |
| Schrift | `text-base` (1rem), `font-mono`, `font-bold` |
| Format | "SLIDE-01", "SLIDE-02", etc. |
| Sichtbarkeit | Nur im Entwicklungsmodus (nicht im Praesentationsmodus) |

---

## 9. Zusammenfassung fuer neue Slides

Wenn du eine neue Slide als HTML-Seite erstellst, beachte:

1. **Viewport:** 100vw x 100vh, optimiert fuer 2560x1440
2. **Root font-size:** 18px (Standard), 20px ab 2400px Breite
3. **Font:** Aptos, Open Sans, Segoe UI, sans-serif
4. **Seitenraender:** 3rem (48-60px je nach Bildschirm) links und rechts
5. **Title:** 2.25rem, font-weight 400, schwarz, linkbuendig
6. **Subtitle:** 1.5rem, grau (#4B5563), linkbuendig
7. **Body:** ab 130px von oben, 1.125rem Standard
8. **Footer:** 3rem Hoehe fixiert am unteren Rand, 0.75rem, grau (#6B7280)
9. **Nichts darf unterhalb der Footer-Grenze (48px vom unteren Rand) ueberlaufen**
