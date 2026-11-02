# Kontextdokumente

Ablage für Kontext- und Hintergrunddokumente zur **Bestandsübertragung**, z. B.
Fachkonzepte, Vorlagen, Referenzunterlagen, Prozessbeschreibungen oder
Beispiel-Korrespondenz. Die Dateien dienen als fachlicher Kontext und werden
mit ins Repository eingecheckt.

## Dokumente hinzufügen

1. Datei(en) in diesen Ordner (`05_Bestandsuebertragung/kontextdokumente/`) legen.
2. Änderungen committen und pushen:

   ```bash
   git add 05_Bestandsuebertragung/kontextdokumente/
   git commit -m "Kontextdokument hinzugefügt"
   git push
   ```

Alternativ lassen sich Dateien direkt über die GitHub-Weboberfläche
(„Add file" → „Upload files") in diesen Ordner hochladen.

Ein Vite-Build ist **nicht** nötig: Dieser Ordner liegt neben `src/` und `dist/`
und ist nicht Teil des App-Builds.

## Zugriff über die Live-URL

Das Repository wird als Cloudflare-Pages-Site ausgeliefert (Repo-Root = Web-Root).
Einzelne Dateien aus diesem Ordner sind per Direkt-URL erreichbar:

```
https://kiarbeitsplatz.pages.dev/05_Bestandsuebertragung/kontextdokumente/<dateiname>
```

Hinweis: Es gibt kein automatisches Verzeichnis-Listing — der Ordnerpfad ohne
konkreten Dateinamen liefert kein Inhaltsverzeichnis. Dateien müssen direkt über
ihren vollständigen Namen aufgerufen werden.

## Wichtig: keine sensiblen Echtdaten

Alle Dateien in diesem Ordner sind nach dem Deployment **öffentlich im Internet
abrufbar**. Daher hier ausschließlich unkritische bzw. anonymisierte Inhalte
ablegen — **keine** echten personenbezogenen Daten, Vertragsnummern,
Zugangsdaten oder vertraulichen Unterlagen.
