# Asset-Slots

Lege hier echte Bilder ab, um die prozeduralen SVG-Layer zu ersetzen.
`SceneLayer` prüft beim Mount per `HEAD`-Request, ob die Datei
existiert. Wenn ja, wird sie angezeigt; sonst greift der Fallback aus
dem Code.

## Slot-Übersicht

| Slot                        | Datei                                |
|-----------------------------|--------------------------------------|
| `background-sky` (Nacht)    | `sky-night-4k.webp`                  |
| `background-sky` (Tag)      | `sky-day-4k.webp`                    |
| `building-facade`           | `building-facade-4k.webp`            |
| `floor-basement-interior`   | `floor-basement-4k.webp`             |
| `floor-ground-interior`     | `floor-ground-4k.webp`               |
| `floor-top-interior`        | `floor-top-4k.webp`                  |
| `outdoor-foreground`        | `outdoor-foreground-4k.webp`         |

## Empfohlene Midjourney-Prompts (Tilt-Shift / BUCK Animation Look)

**Himmel Nacht:**
```
deep midnight blue sky, faint stars, soft moon glow, subtle horizon
gradient, tilt-shift miniature, cinematic, 4k, no text
```

**Bank-Querschnitt:**
```
architectural cross-section of a modern bank building, three floors
visible, warm beige facade, miniature model, tilt-shift photography,
soft cinematic lighting, premium B2B presentation aesthetic, no text
```

**Operations-Etage:**
```
open-space office interior, employees at desks with multiple monitors
showing dashboards, miniature model style, tilt-shift, BUCK animation
look, warm interior lighting, no text
```

**Vorstands-Etage:**
```
executive boardroom with oval table, six executives seated, large wall
display showing data dashboard, futuristic AI hologram floating above
table, tilt-shift miniature, premium cinematic
```

## Auflösungs-Empfehlung

- 4K WebP, Quality 80-85, Lossless: false
- Aspect-Ratio so wählen, dass das Bild im 1600×1000 viewBox ohne
  Verzerrung sitzt; bei abweichendem AR wird `object-cover` zugeschnitten.
