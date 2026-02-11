# Floating Teleprompter – Technische Dokumentation

## Überblick

Der Floating Teleprompter ist ein separates Browser-Fenster mit Speaker Notes, das automatisch der Mausposition des Presenters folgt. Damit hat der Presenter während einer Live-Demo immer seine Stichpunkte im Blick – egal wohin er die Maus bewegt.

## Architektur

```
┌─────────────────────────────────────────────┐
│  Hauptfenster (index.html)                  │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │ mousemove Event-Listener               │ │
│  │  → erfasst e.screenX / e.screenY      │ │
│  │  → ruft notesWindow.moveTo() auf      │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │ wheel Event-Listener                   │ │
│  │  → scrollt das Teleprompter-Fenster    │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │ keepOnTop Interval (1s)                │ │
│  │  → bringt Notes-Fenster nach vorne    │ │
│  │  → pausiert wenn User tippt           │ │
│  └────────────────────────────────────────┘ │
│                                             │
└──────────────────┬──────────────────────────┘
                   │ window.open() + moveTo()
                   ▼
┌─────────────────────────────────────────────┐
│  Teleprompter-Fenster (Popup)               │
│  400×600px, kein Menü/Toolbar               │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │ Auto-Scroll (60 FPS requestInterval)   │ │
│  │  → Standard: 30 px/s                  │ │
│  │  → Steuerbar: Langsamer/Schneller     │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │ Keyboard Shortcuts                     │ │
│  │  Leertaste  = Pause/Play              │ │
│  │  Pfeil ↑    = Schneller (+5 px/s)     │ │
│  │  Pfeil ↓    = Langsamer (-5 px/s)     │ │
│  │  R          = Zurücksetzen (scroll 0) │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │ Controls-Bar (fixed, unten)            │ │
│  │  [Langsamer] [Schneller] [Pause/Play] │ │
│  │  [Zurücksetzen]         Speed: 30 px/s│ │
│  └────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

## Dateien

| Datei | Zweck |
|---|---|
| `js/speaker-notes.js` | Gesamte Logik: `SpeakerNotes`-Objekt mit Fenster-Management, Mouse-Tracking, Auto-Scroll |
| `css/styles.css` (Zeile ~7096) | CSS für den Speaker-Notes-Button (fixed, unten rechts) |
| `index.html` (Zeile ~371) | Button "Speaker Notes / Teleprompter" im Settings-Bereich |
| `index.html` (Zeile ~5607) | `<script src="js/speaker-notes.js">` Einbindung |

## Kernmechanismus: Floating (Maus-Folgen)

### 1. Fenster öffnen (`openNotesWindow`)

```javascript
this.notesWindow = window.open(
    '',
    'SpeakerNotes',
    `width=400,height=600,left=100,top=100,menubar=no,toolbar=no,location=no,status=no`
);
```

- Erzeugt ein Popup ohne Browser-Chrome (kein Menü, keine URL-Leiste)
- 400×600px Startgröße, positioniert oben links
- Inhalt wird dynamisch per `document.write()` geschrieben

### 2. Maus-Tracking (`startMouseTracking`)

```javascript
document.addEventListener('mousemove', (e) => {
    if (this.notesWindow && !this.notesWindow.closed) {
        const newLeft = e.screenX - this.notesWindow.outerWidth - this.mouseOffset;
        const newTop = e.screenY - 100;

        const finalLeft = Math.max(0, newLeft);
        const finalTop = Math.max(0, Math.min(
            screen.height - this.notesWindow.outerHeight, newTop
        ));

        this.notesWindow.moveTo(finalLeft, finalTop);
    }
});
```

**Positionsberechnung:**
- Das Fenster wird **links** vom Cursor positioniert (`screenX - outerWidth - mouseOffset`)
- `mouseOffset = 50px` Abstand zwischen Cursor und Fensterrand
- `newTop = screenY - 100` → Fenster sitzt leicht oberhalb der Cursor-Höhe
- Boundary-Checks verhindern, dass das Fenster den Bildschirmrand verlässt

**Warum `screenX`/`screenY` statt `clientX`/`clientY`?**
- `moveTo()` arbeitet mit Screen-Koordinaten (absolute Bildschirmposition)
- `clientX`/`clientY` wären relativ zum Viewport des Hauptfensters

### 3. Scroll-Weiterleitung

```javascript
document.addEventListener('wheel', (e) => {
    if (this.notesWindow && !this.notesWindow.closed) {
        this.notesWindow.scrollBy({ top: e.deltaY, behavior: 'auto' });
    }
});
```

- Mausrad im Hauptfenster scrollt das Teleprompter-Fenster
- Der Presenter kann so manuell durch die Notes scrollen, ohne das Fenster zu fokussieren

### 4. Keep-on-Top Mechanismus

```javascript
this.keepOnTopInterval = setInterval(() => {
    const isTyping = activeElement.tagName === 'INPUT' || ...;

    if (this.notesWindow && !this.notesWindow.closed && !isTyping) {
        this.notesWindow.focus();
    }
}, 1000);
```

- Alle 1 Sekunde wird `focus()` auf das Notes-Fenster aufgerufen
- **Pause wenn User tippt** (Input/Textarea aktiv) → sonst würde der Fokus-Wechsel die Eingabe stören
- Zusätzlich: `window.addEventListener('focus', ...)` bringt das Fenster zurück wenn das Hauptfenster Fokus bekommt

## Auto-Scroll im Teleprompter-Fenster

Der Auto-Scroll läuft **innerhalb** des Popup-Fensters (eigener JS-Kontext):

```javascript
scrollInterval = setInterval(() => {
    if (isScrolling) {
        window.scrollBy({ top: scrollSpeed / 60, behavior: 'auto' });
    }
}, 1000 / 60); // 60 FPS
```

- Standard-Geschwindigkeit: 30 px/s
- Bereich: 0–100 px/s (einstellbar in 5er/10er-Schritten)
- 60 FPS für flüssiges Scrollen

## Speaker Notes Inhalt

Die Notes sind als Array von Sektionen definiert:

```javascript
notes: [
    { section: "EINLEITUNG", content: "Ich bin Eike Brenneisen..." },
    { section: "PROBLEMSTELLUNG & LÖSUNG", content: "Bei einem Programm..." },
    { section: "LANDING PAGE / DASHBOARD", content: "..." },
    // ... weitere Sektionen
]
```

Jede Sektion wird als Karte gerendert mit rotem ERGO-Branding (`#E30613`) und großer Schrift (24px) für gute Lesbarkeit.

## Design-Entscheidungen

| Entscheidung | Begründung |
|---|---|
| **Separates Popup statt Overlay** | Overlay würde die Demo-Fläche verdecken und Klicks blockieren |
| **Links vom Cursor** | Rechts wäre im Weg für Rechtsklick-Menüs; links ist natürlicher für die Leserichtung |
| **50px Offset** | Genug Abstand, damit der Cursor nicht das Fenster verdeckt |
| **1s Keep-on-Top Intervall** | Kompromiss: oft genug um sichtbar zu bleiben, selten genug um Performance nicht zu belasten |
| **Typing-Detection** | Ohne diese Logik würde `focus()` den Cursor aus Inputfeldern reißen |
| **60 FPS Scroll-Loop** | `requestAnimationFrame` wäre eleganter, aber `setInterval` ist hier zuverlässiger weil das Fenster oft nicht fokussiert ist |
| **`document.write()`** | Einfachste Methode um ein komplettes HTML-Dokument in ein Popup zu schreiben; `srcdoc` wäre Alternative |

## Bekannte Einschränkungen

1. **Popup-Blocker**: Browser blockieren `window.open()` wenn es nicht durch User-Klick ausgelöst wird → Button-Click als Trigger nötig
2. **Cross-Origin**: `moveTo()` und `focus()` funktionieren nur bei Same-Origin Popups
3. **macOS**: Einige Browser erlauben `moveTo()` nicht für Popups (Sicherheitsrestriktion)
4. **Mehrere Monitore**: `screen.height` bezieht sich nur auf den primären Monitor → Fenster kann auf Zweitmonitor verloren gehen
5. **Performance**: `mousemove` feuert sehr häufig → `moveTo()` bei jedem Event kann bei schwachen Rechnern ruckeln (Throttling wäre Verbesserung)

## Aktivierung

1. Auf M-01 (Landing Page) → Settings öffnen (Passwort: "brenneisen")
2. Button **"Speaker Notes / Teleprompter"** klicken
3. Popup erlauben falls geblockt
4. Fenster folgt automatisch der Maus

## Cleanup

```javascript
SpeakerNotes.closeNotesWindow();
```

Räumt auf:
- Stoppt den `keepOnTopInterval`
- Entfernt den `focus` Event-Listener
- Schließt das Popup-Fenster
