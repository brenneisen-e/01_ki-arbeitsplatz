# Upload-Ordner Banking Horizon

Hier können Bilder und Videos für Banking Horizon abgelegt werden. Der Ordner
liegt neben `dist/` und wird ohne Build mit ausgeliefert: Was hier landet, ist
nach dem nächsten Deployment unter

```
https://kiarbeitsplatz.pages.dev/03_banking-horizon/upload/<dateiname>
```

erreichbar (hinter dem Plattform-Login, wie die App selbst).

## Hochladen

- **Über GitHub:** Ordner `03_banking-horizon/upload` öffnen → „Add file“ →
  „Upload files“ → Dateien hineinziehen → Commit. Live wird die Datei, sobald
  der Stand im Produktionszweig deployt ist.
- **Über Git:** Datei in diesen Ordner kopieren, committen, pushen.

## Grenzen

- **Höchstens 25 MB je Datei.** Cloudflare Pages liefert größere Dateien nicht
  aus und bricht das Deployment ab; der GitHub-Upload im Browser endet ebenfalls
  bei 25 MB.
- Dateinamen ohne Leerzeichen und Umlaute, klein geschrieben, mit Bindestrichen
  (`kapitel-02-intro.mp4` statt `Kapitel 02 Intro.mp4`).

## Formate

- **Video:** MP4 (H.264, Ton AAC) für alle Browser, optional zusätzlich WebM.
  Zu große Videos lassen sich so verkleinern:

  ```bash
  ffmpeg -i eingang.mov -c:v libx264 -crf 24 -preset slow -vf "scale=-2:1080" \
    -c:a aac -b:a 128k -movflags +faststart ausgang.mp4
  ```

  `-movflags +faststart` sorgt dafür, dass das Video schon während des Ladens
  startet. Ohne Ton: `-an` statt der beiden Audio-Angaben.
- **Bild:** JPG für Fotos, PNG für Grafiken mit Transparenz, WebP als kleinere
  Alternative.

## Was hier liegt

| Datei | Verwendung |
|---|---|
| `liquid-demo.mp4`, `liquid-demo.webm`, `liquid-demo.jpg` | Kap. 01 Kundenperspektive, Absprung „Demo Liquid starten“ (Video im Vollbild, Standbild als Vorschau) |
| `ai-sdlc-demo.jpg` | Kap. 05 Technologie, Standbild aus dem Video „DForge – AI SDLC“; das Video selbst (rund 800 MB) liegt in Microsoft Stream auf SharePoint und öffnet sich per Klick in neuem Tab |

## In der App verwenden

Aus der App (`dist/index.html`) heraus ist der Pfad relativ `../upload/<dateiname>`,
von außen absolut `/03_banking-horizon/upload/<dateiname>`. Wo eine Datei
im Strukturbild erscheinen soll (Kapitelbild, Hypothesen-Clip, Einführungsvideo),
wird sie in den Daten verdrahtet, z. B. Clips in `src/data/hypothesenVideos.ts`
und Bilder in `src/data/chapters.ts`.
