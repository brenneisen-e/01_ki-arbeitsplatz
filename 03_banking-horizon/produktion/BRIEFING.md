> **Stand 02.11.2026:** Die Medien der Produktion (Takes, Quellbilder, Szenen,
> Kunden- und Tagesbilder, Horizon-Material) sind aus dem Repo entfernt, um es
> klein zu halten; die Git-Historie ist neu aufgesetzt. Hier liegen nur noch
> Skripte und Doku. Die fertigen Videos und Standbilder der App stehen in
> `public/videos/` und `public/images/`. Wer Wege neu montieren will, muss die
> Quellen zuerst neu erzeugen oder aus einer eigenen Sicherung zurücklegen.

# Briefing: „Ein Tag in Banking Operations 2030" — was wir bauen und was es braucht

Stand: 19.08.2026 · Ablage: `03_banking-horizon/produktion/` · Live: `/v04`, `/v05`

Zweck: Dieses Dokument ist die Arbeitsgrundlage für eine externe Recherche
(z. B. in Claude Chat): **Software-Auswahl für Bild-/Video-Generierung und
Compositing** sowie **Prompt-Strategie**. Abschnitte 5–8 enthalten dafür die
Eckdaten, Auswahlkriterien, bewährten Prompts und die konkreten Fragen.

## Entscheidungsstand (19.08.2026, nach der Recherche)

* **Bildmodell: bleibt gpt-image-2.** Die echte Pixelmaske beim Inpainting
  ist für unangetastete Chroma-Flächen bei Folge-Edits entscheidend.
* **Videomodell: bleibt Veo 3.1 — wird besser gefahren.** Umgesetzt in
  `wege_neu.py`: ohne Audio (war bereits aktiv); Negativliste um
  Flächen-Substantive erweitert (texture/reflections/glare/content on the
  green screen, flickering, inconsistent lighting); Chroma-Baustein auf
  „matte, no glare, no texture" verschärft; Betriebsregeln (eine Aktion
  pro Take, Zeitfenster-Beats, Zielbild aus derselben Szene) im
  Skript-Docstring. **Korrektur zur Recherche:** `referenceImages` ist auf
  Vertex NICHT mit Startbild kombinierbar („Image and reference images
  cannot be both set", gemessen 19.08.) — die Identität tragen stattdessen
  die Start-/Anker-/Zielbilder selbst.
* **v06-Architektur (19.08.):** Raumwechsel als Ketten kurzer Takes
  (6 s Handlung + 4 s Kamerafahrt), geschnitten an gpt-generierten
  ANKER-Bildern, die den Zielraum weit zeigen — mitsamt Chroma-Fläche.
  Bildschirme können so strukturell nicht mehr „aus dem Nichts" entstehen.
  Neu: `erstsicht.py` (Chroma-Flächenverlauf auf Roh-Takes, fängt
  Aufpopper auch während Kamerafahrten), `anker.py`, `montage_v06.py`.
* **Magnific: gestrichen** (kreativer Upscaler, erfindet Struktur; Veo
  rendert ohnehin neu). Der API-Key wurde aus dem Scratchpad gelöscht und
  muss im Magnific-Konto entwertet werden — er stand im Chat.
* **Offen**: Chroma-Flächen-Erhalt ist bei keinem Modell belastbar
  dokumentiert — bei den nächsten Generationen messen (Abnahme zählt
  Restchroma ohnehin); A/B gegen Kling/Wan nur, falls Veo wiederholt
  Struktur ins Grün malt. Compositing-Ausbau (OpenCV-Homographie,
  CoTracker3 für Ecken, Matting nur an Handkontaktzonen) bleibt als
  nächster Schritt aus Abschnitt 4 bestehen.

## 1. Was das Produkt ist

Eine klickbare Erzählstrecke für Kundentermine (Deloitte → Bank-Vorstände):
**ein Arbeitstag der Operations-Spezialistin Mara Vogel im Jahr 2030**, von
07:00 (Wohnung) bis 17:00 (Dachgarten), in 13 Stationen. Jede Station trägt
eine Hypothese („The best complaint is the one that never takes place") und
belegt sie mit einer fotorealen Szene, einem laufenden System-Bildschirm und
einem Videoübergang, in dem Mara physisch von Raum zu Raum geht.

Es gibt fünf parallele Fassungen derselben Strecke (v01 ausführlich, v02
knapp, v03 Bühne, v04 Bühne mit Zoom + Panel, v05 Vollbild mit
Sprechblasen). v04/v05 teilen sich die Assets. Der Gebäudeplan mit dem
Tagesweg liegt als `LAGEPLAN.svg` daneben.

## 2. Die technische Kette (heutiger Ansatz)

1. **Szenenbilder**: gpt-image-2 baut die Räume; jede Bildschirmfläche ist
   eine flache Chroma-Fläche (#00B140). Mara kommt aus einem Referenzbild
   (Konsistenz von Gesicht/Frisur/Kleidung).
2. **Bildschirme**: KEINE Bildgenerierung — echte HTML-Seiten (ein
   Designsystem, 9 Stationen mit je eigener Handschrift), deterministisch
   animiert über `setT(t)`, per Chromium Frame für Frame gerendert.
3. **Keying**: die HTML-Frames werden pixelweise in das Chroma gestanzt
   (Standbilder und Videos). Erkennung über leeren Rotkanal, Fragment-
   Vereinigung, Quantil-Hülle + Savitzky-Golay gegen Zittern, Despill.
4. **Übergänge**: Veo 3.1 (Vertex) mit Start- UND Zielbild (`lastFrame`),
   negativePrompt (Substantivliste aus dem Defektlog), fester Seed je Take.
   Der Bildschirm bleibt im Take grün und wird in der Montage gekeyt —
   dadurch ist Schrift im Video exakt so scharf wie im Standbild.
5. **Montage**: Anschlüsse durch Überblenden der Standbilder an Kopf/Schwanz
   (gemessen < 5 Graustufen), Bildschirmwechsel in der Keying-Ebene
   (abgehende Seite steht fertig, ankommende endet exakt fertig),
   Kundenkacheln als gerechnete Glasebene.
6. **Abnahme**: automatisch (Anschlüsse, Restchroma je Frame, Schwarzbild) +
   Sprungdetektor (aufpoppende Objekte) + dichte Sichtung (jeder 3. Frame
   als Kontaktbogen, manuell gesichtet). Definition of Done in
   `PRUEFPLAN.md`, Defektlog speist die Negativliste.

## 3. Harte Anforderungen (das „braucht es")

* **Bildschirminhalte 100 % lesbar und stabil** — in Standbild UND Video.
  Kein von Veo gemaltes UI (unleserlich, morphend). Inhalte müssen zu den
  App-Texten passen (Zahlen identisch mit Panel/Hypothese).
* **Anschlüsse unsichtbar**: letzter Videoframe = Standbild (< 5 Graustufen).
* **Erzähllogik**: eine Mara (Referenz-Identität), Türen öffnen erst bei
  Berührung und vom Körper weg, Sperrlinien schließen Wand zu Wand, Geräte
  werden benutzt wie man sie benutzt, nichts erscheint/verschwindet aus dem
  Nichts, Statisten ruhig und unverzerrt, Requisiten-Kontinuität.
* **Chroma unverdeckt** (neuer Standard): Displays so platziert, dass nichts
  das Grün überlappt; pixelweises Keying bleibt Sicherheitsnetz.
* **Reproduzierbarkeit**: deterministische UI (setT), feste Seeds,
  Pipeline + Quellen + Roh-Takes versioniert (Container-Rollbacks!).

## 4. Bekannte Schwächen des aktuellen Ansatzes (Forschungsfragen)

1. **Achsenparalleles Stanzen**: die Oberfläche wird in das umschließende
   Rechteck der Grünfläche gelegt. Bei schrägen Schirmen (Fahrten, Ein-/
   Ausstiege) fehlt die perspektivische Verzerrung — es wirkt kurz „aufgelegt".
   → Kandidat: **4-Punkt-Tracking + Homographie/Corner-Pin** (OpenCV:
   Quad-Erkennung der Grünfläche, `getPerspectiveTransform`, per-Frame-Warp;
   professioneller Standard, vgl. Mocha/After-Effects-Planar-Tracking).
   Optional Tracking-Marker in den Ecken der Grünfläche.
2. **Veo erfindet Interieur bei langen Reveals** (Schranken-Wald) und
   ignoriert vereinzelt Anweisungen (Halt an der Schranke, Türrichtung).
   Heutige Mittel: kurze Beats, Trim + Mehrfachschnitt, negativePrompt,
   Seed-Variation, Start+Zielbild. → Frage: bessere Video-Modelle/Parameter
   für Anweisungstreue (Veo „extend“-Ketten, Referenzbilder, andere Anbieter).
3. **Keine Subframe-Deckung bei Handkontakt**: berührt die Hand die
   Grünkante, entscheidet die Maske pixelweise — gut, aber Kanten flimmern
   minimal. → Kandidat: Matting-Modelle (z. B. Robust Video Matting) statt
   Farbschwelle.
4. **Upscaling/Realismus**: Magnific/Freepik-Upscaler für Hauttextur — nur
   VOR dem Keying einsetzbar (erfindet Struktur im Grün), Nutzen begrenzt,
   da Veo ohnehin neu rendert.

## 5. Technische Eckdaten (für die Software-Auswahl)

* **Bilder**: gpt-image-2 über die Images-/Edits-API, Arbeitsformat
  1536×1024 (3:2). Für 16:9-Ziele wird das Bild mit gespiegelten Rändern
  gepolstert und nach dem Edit zurückgeschnitten; nur die Maskenregion wird
  zurückkomponiert. Finale Stills 1920×1080 JPG. Chroma-Farbe **#00B140**.
* **Videos**: Veo 3.1 auf Vertex AI (funktioniert nur in `us-central1`).
  Pro Take: **8 s, 1080p, 16:9**; genutzte Parameter: Startbild + `lastFrame`
  (Zielbild), `negativePrompt`, fester `seed` je Take. Audio wird verworfen.
  Nach der Montage: 24 fps, H.264.
* **Bildschirm-UI**: reine HTML/CSS-Seiten, deterministisch über `setT(t)`;
  headless Chromium rendert jeden Frame als PNG (z. B. 1875×600 für das
  Breitdisplay); die Frames werden pixelweise ins Chroma gekeyt. Dieser Teil
  steht nicht zur Disposition — er garantiert lesbare, korrekte Inhalte.
* **Abnahme-Schwellen**: Anschluss Kopf/Schwanz < 5 Graustufen mittlerer
  Differenz, Restchroma nach Erosion < 200 px pro Frame, Sprungdetektor über
  Blockdifferenzen, Kontaktbogen jeder 3. Frame manuell gesichtet.
* **Umgebung**: alles muss **skriptbar und headless auf Linux** laufen
  (Container ohne GUI, Python/ffmpeg/OpenCV/Chromium). GUI-Werkzeuge
  (After Effects, Mocha, Nuke) kämen nur infrage, wenn sie lokal am eigenen
  Rechner bedient werden — dann bricht aber die automatische, wiederholbare
  Pipeline.
* **Umfang und Iterationen**: 13 Stills, 12 Übergänge. Erfahrungswert:
  1–5 Generationen pro Übergang bis zur Abnahme (die Abnahme verwirft hart).
  Ein Kandidat muss Iterationen in dieser Größenordnung bezahlbar und per
  API automatisierbar machen; Wasserzeichen sind ein Ausschlusskriterium.

## 6. Auswahlkriterien je Werkzeugklasse (Muss / Soll)

**Bildmodell** (heute gpt-image-2)
* Muss: Personen-Konsistenz über Referenzbild; maskiertes Inpainting;
  erzeugt exakt flache, unverdeckte Farbflächen und lässt sie bei
  Folge-Edits unangetastet; API.
* Soll: natives 16:9 (erspart den Polster-Trick); zuverlässig text-/logofrei.

**Videomodell** (heute Veo 3.1) — der wichtigste Auswahlpunkt
* Muss: **Konditionierung auf Start- UND Endbild** — die gesamte
  Anschlusstechnik hängt daran; erhält große einfarbige Flächen als Flächen
  (malt nichts ins Grün); Negativ-Prompt oder gleichwertige Steuerung;
  Seed/Reproduzierbarkeit; ≥ 1080p; ≥ 8 s; API ohne Wasserzeichen.
* Soll: längere Takes oder Extend-Ketten mit Identitätserhalt; bessere
  Anweisungstreue bei Interaktionen (Türgriff, Schrankenflügel,
  Türaufschlagrichtung); zusätzliche Personen-Referenzbilder neben dem
  Startframe.

**Compositing** (heute eigene Python-Pipeline)
* Muss: skriptbar/headless (OpenCV, ffmpeg); Frame-genaue Kontrolle.
* Soll: 4-Punkt-/Planar-Tracking mit Homographie statt achsenparallelem
  Kasten (Abschnitt 4.1); Matting-Modell für Handkontakt-Kanten (4.3).

**Upscaler/Enhancer** (Magnific-Zugang vorhanden)
* Nur vor dem Keying sinnvoll; API-Zugang; Einordnung siehe 4.4.

## 7. Prompts: was sich bewährt hat (mit Originalbeispielen)

**Video — Muster**: nummerierte Beats in fester Reihenfolge; kritische
Physik in Großbuchstaben; Kamera explizit festlegen; Ende auf das Zielbild
zulaufen lassen. Beispiel Check-in (Original, gekürzt):

> "Continuous single shot that begins exactly on this frame: she stands at
> the speed gate, wrist raised to the small dark reader. IN THE FIRST TWO
> SECONDS THE CHECK-IN HAPPENS: the reader lights up briefly and THE TWO
> VERTICAL GLASS LEAVES OF HER GATE SLIDE APART SIDEWAYS, RETRACTING INTO
> THE PEDESTALS — these gates have NO arms and NO rotating parts […] behind
> her the leaves slide closed again."

**Wiederverwendbare Bausteine**, an jeden Prompt angehängt:
* Identität/Regie: "There is exactly one of her in the frame at all times —
  the woman with the dark chin-length bob, black blazer, white top and dark
  navy trousers, unchanged throughout. Observational documentary style,
  continuous single shot."
* Chroma-Erhalt: "THE SCREEN STAYS A COMPLETELY FLAT, UNIFORM, SATURATED
  CHROMA-KEY GREEN RECTANGLE FROM THE FIRST FRAME TO THE LAST."
* Negativliste (Substantive, aus dem Defektlog gewachsen): "second person,
  duplicate of the woman, different woman, changed hairstyle, door opening
  by itself, door swinging towards the camera, chair rolling on its own,
  objects appearing out of nowhere, gates appearing suddenly, morphing,
  jump cut, watermark, turnstile arm, barrier arm, …"
* Bei Fehlversuchen: erst Seed variieren, dann Beats verschärfen, dann den
  Take kürzen/schneiden — nicht den ganzen Prompt umwerfen.

**Bild — Muster**: Referenzbild + „zero alteration"-Klausel + präzise
Objektlage. Beispiel (Original, gekürzt):

> "The woman from the reference image, seen STRICTLY FROM BEHIND, standing
> directly in front of a floor-to-ceiling glass entrance door with a slim
> vertical brushed steel handle. Her right hand rests on the handle. Keep
> her exact hair — dark chin-length bob — her black blazer, white top and
> dark navy trousers, zero alteration."

**Anti-Muster** (führten nachweislich zu Defekten):
* UI-Inhalte vom Videomodell malen lassen → unleserlich, morphend.
* Lange Reveals in einem Take → Modell erfindet Interieur (Schranken-Wald).
* Implizites Verhalten („she walks through") statt expliziter Beats mit
  Halt, Berührung, Richtung → Türen/Schranken verhalten sich falsch.
* Prompts, die dem Startbild widersprechen → das Modell „repariert" die
  Szene sichtbar im ersten Halbsekunden-Fenster.

## 8. Konkrete Fragen an die Software-Recherche

1. Welche aktuellen Videomodelle beherrschen **First+Last-Frame nativ** und
   folgen Interaktions-Beats messbar besser als Veo 3.1? (Kandidatenliste
   prüfen — Stand kann veraltet sein: Veo 3.x mit Extend, Kling, Runway
   Gen-4/Aleph, Luma Ray, Pika, MiniMax/Hailuo, Open-Source wie Wan.)
   Bewertung strikt gegen die Muss-Kriterien in Abschnitt 6.
2. Gibt es ein Bildmodell/Feature mit **stärkerer Identitätstreue** als
   unser Referenzbild-Workflow (Charakter-Referenzen, Multi-Image-Editing)?
3. **Corner-Pin/Planar-Tracking headless**: selbst bauen mit OpenCV
   (Quad-Erkennung + `getPerspectiveTransform`) oder gibt es ein fertiges,
   skriptbares Werkzeug in Produktionsqualität?
4. Lohnt ein **Matting-Modell** (z. B. Robust Video Matting) für die
   Handkontakt-Kanten gegenüber der Farbschwelle?
5. **Upscaling**: bringt Magnific/Freepik vor dem Keying sichtbaren Gewinn,
   wenn Veo die Frames ohnehin neu rendert? (Vermutung aus 4.4: begrenzt.)

## 9. Inventar

* `produktion/` — Pipeline (bilder_neu, wege_neu, montage_neu, abnahme,
  dicht, kontaktbogen, handyglas), UI-Quellen (`ui/`), Quellbilder
  (`quellen/`), Roh-Takes (`takes/`), `PRUEFPLAN.md`, `LAGEPLAN.svg`
  (Gebäudeplan mit Maras Tagesweg).
* `public/images/operations-v04/` — 13 Stills + `ui/*.jpg` (Overlays).
* `public/videos/operations-v04/` — 12 montierte Übergänge.
* `src/operationstag/` — App (fünf Fassungen), `schirmKaesten.ts`
  (Monitorlagen), `ankerV05.ts` (Sprechblasen-Anker).
* Geheimnisse (OpenAI/GCP/Magnific) NUR im Scratchpad — nach Abschluss
  rotieren, sie standen im Chat.
