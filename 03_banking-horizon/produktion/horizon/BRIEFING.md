# Banking Horizon — zwei Filme

Zwei Fassungen desselben Gedankens, beide 64 Sekunden (60 s Film, 4 s
Endtafel), 1920x1080, mit Voice-over.

| Fassung | Laenge | Anbieter | Haltung |
|---|---|---|---|
| **A** | 84 s | Kling (fal.ai) | Vorstaende deutscher Banken. Deloitte-konform, ernsthaft, strategisch. 70 % Spannung, 30 % Hoffnung. Vier Hypothesen als Ueberschriften. Deutsches Voice-over. |
| **K** | 38 s | **Google Veo 3.1** | Dieselbe Erzaehlung auf ein Drittel gekuerzt: Einstieg, die vier Hypothesen, Schluss. Deutsches Voice-over. |
| **B** | 64 s | Kling (fal.ai) | International, Trailer-Charakter, Beschleunigung. Englisches Voice-over. |
| **N** | 42 s | Kling (fal.ai) | Neue Bildsprache, neues Drehbuch, neuer Bildsatz. Deutsches Voice-over. |
| **V** | 60 s | **Google Veo 3.1, natives 4K** | **Die aktuelle Fassung.** Zehn eigenstaendige Szenen statt eines Hauslaufs, je eine Aussage. Der endgueltige Sprechtext des Auftraggebers, Wort fuer Wort. Deutsche Stimme ueber ElevenLabs. |

## Fassung V: warum zehn Szenen und warum 60 Sekunden

Der Auftraggeber hat am 11.09. den endgueltigen Sprechtext geliefert. Er
hat dreizehn Zeilen und **30,6 Sekunden reine Sprechzeit** — gemessen, nicht
geschaetzt. Der frueher geaeusserte Wunsch nach rund 30 Sekunden Film ist
damit rechnerisch nicht mehr erfuellbar: selbst ohne jede Pause zwischen den
Saetzen bliebe kein Bild uebrig, auf dem etwas geschieht. Der Text hat
Vorrang, der Film ist 60,4 s lang.

Der Text zerfaellt in drei Bloecke, und daraus folgt die Szenenzahl:

| Block | Zeilen | Szenen |
|---|---|---|
| Befund | Stabilitaet / Doch etwas veraendert sich / Nicht nur die Technologie | s1 (8 s) |
| Wandel | Kunden / Arbeit / Wettbewerb / Fuehrung + die Scharnierfrage | k1–k4 (4, 4, 4, 8 s) |
| Antwort | die vier Hypothesen + der Titel | s2–s6 (6, 6, 6, 6, 8 s) |

Die vier k-Szenen sind neu und nicht verhandelbar: vier verschiedene
Behauptungen ueber denselben Wandel brauchen vier verschiedene Bilder.
Liefe der ganze Block ueber ein Bild, waere das genau der Fehler, an dem
die frueheren Fassungen gescheitert sind (siehe unten). Jede von ihnen
arbeitet gegen s1, das Bild der alten Welt:

* **k1 Kunden** — die Baeckerin erledigt es selbst in der Ladentuer,
  zwischen zwei Kunden. In s1 sitzt der Kunde am Tisch des Beraters.
* **k2 Arbeit** — zwei Kollegen streiten ueber eine einzige Ermessensfrage,
  der Bildschirm hinter ihnen ist aus. Gearbeitet wird geurteilt, nicht
  abgearbeitet.
* **k3 Wettbewerb** — drei Leute, Pappkartons, ein Fenster. Nichts an dem
  Raum sagt Bank. Das ist der Wettbewerb jetzt.
* **k4 Fuehrung** — die Entscheidung faellt im Treppenhaus, im Gehen, zu
  zweit. Nicht im Gremium.

k4 ist acht statt vier Sekunden lang, weil auf ihm zwei Zeilen liegen: die
vierte Behauptung und die Scharnierfrage „Was heisst das fuer die Bank im
Jahr 2030?". Die Frage traegt den ganzen Film und darf nicht ueber den
Schnitt in die erste Antwort rutschen. Nur eine einzige Zeile laeuft
absichtlich ueber einen Schnitt: „Nicht nur die Technologie." — sie IST die
Bruecke vom Befund in den Wandel.

Aus „Compliance wird Teil des Systems" ist im endgueltigen Text „Security
ist integraler Bestandteil des Systems" geworden. Das Bild s4 bleibt: eine
Risikoverantwortliche geht an einem leeren Freigabeplatz vorbei, ohne
stehenzubleiben. Es belegt beide Saetze — die Kontrolle ist keine Schranke
mehr, an der man wartet, sondern im System.

## Die Bildsprache (Fassung N)

Die erste Bildsprache wurde verworfen. Vier Agenten haben unabhaengig
voneinander dieselbe Diagnose gestellt: Tuerkis-Orange als Render-Signatur,
Mittelperspektive in fast jedem Bild, leuchtende Bodenlinien und
Drahtgitter-Tuerme — also genau die Science-Fiction-Klischees, die die
Vorlage ausschliesst —, Stockfoto-Menschen in Werbeposen, und in jeder Szene
ein anderes Gebaeude.

Vier Richtungen sind gegeneinander angetreten, jede mit demselben Motiv
(Kundenhalle). Die Jury hat entschieden:

* **Grammatik: Architektur-Editorial.** Grossformat-Disziplin, korrigierte
  Vertikalen, Tageslicht, durchgezeichnete Tiefe. Das Haus ist der
  Hauptdarsteller — und nur so bleibt es ueber sechs Szenen dasselbe Haus.
* **Emulsion: analog.** Portra-400-Korn ueber alle Bilder. Es steht nicht im
  Prompt, sondern wird in `bilder_neu_horizon.emulgieren()` gerechnet: das
  Modell rendert sauber, und kein zusaetzliches Adjektiv aendert daran etwas.
* **Zwei Distanzen, nicht mehr.** Weit (90 mm, f/11) fuer Halle, Betrieb,
  Galerie und Aussenbild; halbtotal (150 mm, f/8, Hintergrund scharf) fuer
  Beratung und Vorstand.

Ausdruecklich NICHT uebernommen wurde die vierte Richtung, nahe Portraets
mit offener Blende. Gesichter bei f/2.2 sind das eine, was die Videofahrt
zuverlaessig zerstoert — und es waeren ausgerechnet die beiden wichtigsten
Bilder gewesen. Naehe entsteht hier ueber Ausschnitt und Koerperhaltung.

## Die Probe, an der die erste Fassung gescheitert ist

**Jedes Bild muss den Satz beweisen, der darauf gesprochen wird.** Ein
dunkler, leerer Raum mit drei gestrandeten Menschen sagt "die Bank ist tot",
nicht "die Marktfolge arbeitet autonom". Autonom heisst: es laeuft, hell und
in Ordnung, nur ohne uns — Lampen an, Papier frisch ausgegeben, Aktenwagen
im Gang, und kein einziger Mensch im Bild. Die Zuordnung steht als Tabelle
im Kopf von `bilder_neu_horizon.py` und ist bei jeder Aenderung
mitzupflegen.

## Warum kein leerer Raum — die teuerste Lehre dieser Produktion

Fuer den Satz "Die Marktfolge arbeitet autonom" sind drei Bilder
nacheinander durchgefallen, und alle drei benutzten dieselbe Grammatik:
ABWESENHEIT. Dunkel und leer las sich als Tod. Hell und leer, mit Papier,
Drucker und Aktenwagen als Beleg fuer laufende Arbeit, war zugleich
verlassen UND aus dem Jahr 1985 — Papier ist die Requisite der Handarbeit,
nicht der Autonomie. Moebellos und tadellos las sich als Bedeutungsleere.

Die Recherche erklaert, warum das systematisch scheitern musste:

* **Menschenleere ist kein neutrales Bild, sondern ein kodiertes Genre.**
  Die Liminal-Space-Aesthetik lebt genau davon, ueblicherweise bevoelkerte
  Raeume leer zu zeigen. Diel und Lewis haben 2022 im *Journal of
  Environmental Psychology* nachgewiesen, dass Abweichungen von vertrauten
  Strukturmustern eine Uncanny-Reaktion auf gebaute Umgebungen ausloesen.
  Mit Mark Fisher gesprochen: ein vertrauter Ort ohne die erwartete
  menschliche Praesenz wird unheimlich, nicht fortschrittlich.
* **Es stimmt sachlich nicht.** Die menschenleere Fabrik gibt es praktisch
  nicht. Philips Drachten betreibt ueber 120 Roboter mit weniger als zehn
  Menschen fuer die Qualitaetssicherung — duenn besetzt, nicht leer. Das
  Paradox der Automatisierung sagt: je effizienter das System, desto
  entscheidender der Beitrag der wenigen Uebrigen.
* **Better Images of AI** nennt vier Prinzipien — honesty, humanity,
  necessity, specificity — und verwirft Roboter, gluehende Gehirne und Blau
  als KI-Farbe. Der leere Raum verletzt honesty und humanity zugleich.

Daraus folgt die Regel fuer alle weiteren Bilder dieser Reihe: **Autonomie
wird ueber das VERHAELTNIS erzaehlt, nicht ueber Abwesenheit.** Ein Saal
fuer vierzig, in dem drei Menschen stehen, und das einzige warme Licht
faellt auf genau diese drei — das ist die Aussage. Die drei sind
konzentriert und beschaeftigt, nicht gestrandet.

## Warum Fassung N ueberall blendet

Die sechs Szenen sind sechs verschiedene Raeume, und fuenf Sekunden reichen
Kling nicht, um von einem in den anderen zu fahren — drei Takes kamen nicht
an ihrem Zielbild an. Das ist aber gar nicht noetig: zwischen verschiedenen
Raeumen schneidet man. Eine halbe Sekunde Ueberblendung an jeder Fuge macht
daraus einen Uebergang, der zu einem ruhigen Film ohnehin besser passt als
ein harter Schnitt, und kostet zusammen knapp drei Sekunden.

## Was in der Kurzfassung nicht hineinpasst

Dreissig Sekunden tragen den Text der Vorlage nicht. Gestrichen sind in K
die vier "... veraendert sich."-Zeilen und "Nicht nur die Technologie"; der
Schluss steht in zwei kurzen Saetzen statt in dreien. Wer den vollen Text
will, braucht Fassung A.

## Wie die Filme entstehen

Dieselbe Kette wie die Mara-Strecke, nur ohne Bildschirminhalte:

1. `bilder_horizon.py` — sieben Schluesselbilder je Fassung, **als Kette**:
   Bild n entsteht mit Bild n-1 als Anker. Nur so bleibt das Haus ueber den
   ganzen Film dasselbe Haus, was die Vorlage ausdruecklich verlangt
   ("The building remains recognizable"). OpenAI `gpt-image-2`, 1536x1024,
   mittig auf 16:9 beschnitten.
2. Die Wege — jeder Take laeuft von Bild n nach Bild n+1, das Endbild des
   einen ist das Startbild des naechsten. Zwei Anbieter, dieselben Prompts:
   * `kling_horizon.py` — Kling ueber fal.ai (`tail_image_url`), Takes von
     fuenf oder zehn Sekunden. Traegt A und B.
   * `veo_horizon.py` — Google Veo 3.1 ueber Vertex AI (`image` und
     `lastFrame`), Takes von vier, sechs oder acht Sekunden. Traegt K.
     Schluessel: der Service-Account `veo-video-gen` in
     `$SCRATCH/.veo_sa.json`, Projekt `dgcp-sandbox-ebrenneisen`, Region
     `us-central1`, Modell `veo-3.1-generate-001`. Veos eigener Ton wird
     abgeschaltet (`generateAudio: false`) — Stimme und Klangbett kommen aus
     `stimme_horizon.py`.
   Wie lang ein Take ist, steht in seinem Namen: `a4c-a5_v6` sind sechs
   Sekunden Veo, `a2-a3_5` fuenf Sekunden Kling. Montage und Abnahme lesen
   die Laenge daraus.
3. `stimme_horizon.py` — jede Zeile des Voice-overs **einzeln** gesprochen
   und auf eine feste Sekunde gelegt, damit "Kunden veraendern sich" auf die
   Kundenszene faellt und "Fuehrung veraendert sich" auf den Vorstandsraum.
   Darunter ein sehr leises, gerechnetes Klangbett; Fassung B bekommt einen
   Puls, der schneller wird und bei Sekunde 50 abbricht — dort haelt im Bild
   alles an. Von jeder Aufnahme wird die Stille am Anfang und Ende
   abgeschnitten: die Stimme laesst nach jedem Satz bis zu einer Sekunde
   stehen, und in der Kurzfassung kostet das den halben Schlusssatz.

   **Wichtig:** die Tonstuecke liegen unter fortlaufender Nummer
   (`ton/k00.wav`, bei ElevenLabs `ton/v00_el.mp3`) und werden
   wiederverwendet. Wer einen Text aendert, muss `ton/<fassung>*.wav` bzw.
   `ton/<fassung>*_el.mp3` loeschen, sonst spricht der Film weiter den alten
   Satz.

   **Stimme:** Fassung V spricht ElevenLabs (`ELEVEN`-Tabelle im Skript,
   Modell `eleven_multilingual_v2`, Schluessel in `$SCRATCH/.eleven_env`,
   Starter-Tarif oder hoeher — darunter ist die kommerzielle Nutzung nicht
   lizenziert). Grund: die OpenAI-Stimme sprach Deutsch mit hoerbar
   englischem Zungenschlag, und ausgerechnet "Stabilitaet" und "Vorstaende"
   verrieten sie — also genau die Woerter, die den Film tragen. Die Stimme
   heisst *Vitali*, ausgewaehlt aus sieben deutschen Erzaehlstimmen am
   selben Probesatz nach Tonhoehe (104 Hz), Sprechtempo (5,3 s — die
   schnellste der tiefen Stimmen, und die Zeilen liegen in Fenstern von 3,5
   bis 5,6 s) und Streuung der Tonhoehe (17 Hz, also ruhig statt Singsang).
   `STIMMEN_QUELLE=openai` schaltet zurueck. Der Tarif kennt hoechstens drei
   gleichzeitige Anfragen und gibt `pcm_44100` erst ab Pro frei — deshalb
   mp3 mit 128 kbit/s als Zwischenformat.

   Eine Hypothese gehoert in die ZWEITE Haelfte ihres Takes: der Take faehrt
   erst zu seinem Zielbild hin, die Szene steht am Ende. Wer die Zeile an den
   Anfang legt, spricht ueber die Fahrt statt ueber die Szene.
4. `montage_horizon.py` — harter Schnitt zwischen den Takes (jeder endet auf
   dem Bild, mit dem der naechste anfaengt), Endtafel, Ton.
5. `abnahme_horizon.py` — prueft Fugen, Anschluss an die Schluesselbilder,
   schwarze Bilder, Laenge und Tonspur.
6. `netzfassung.py` — rechnet aus dem 4K-Master die Netzfassung in 1080p und
   legt sie unter `public/videos/horizon/`. **Cloudflare Pages liefert keine
   Datei ueber 25 MiB aus, und es scheitert nicht die Datei, sondern der
   ganze Deploy — unsichtbar.** Genau daran hing der Film am 10.09.
   stundenlang fest, waehrend die Seite unveraendert aussah. Das Skript
   rechnet die Bitrate deshalb aus der Laufzeit zurueck, statt eine
   Qualitaetsstufe zu raten, und prueft die fertige Datei nach. Der
   4K-Master bleibt ausserhalb des Repositories.

## Reihenfolge

Es gilt die Regel aus `CLAUDE.md`: **erst sind alle Bilder final, dann werden
die Wege gebaut.** Ein Take haengt an zwei Bildern. Wer Bild `a4` aendert,
muss `a3-a4` und `a4-a5` neu drehen und danach `abnahme_horizon.py` laufen
lassen.

## Was bewusst nicht im Bild ist

Keine Schrift, keine Logos, keine lesbaren Oberflaechen, keine Roboter, keine
Science-Fiction-Klischees — so steht es in der Vorlage, und so steht es im
Negativ-Prompt. Bildschirme tragen nur abstraktes Licht.

## Aufruf

```bash
SCRATCH=…/scratchpad python3 bilder_horizon.py
SCRATCH=…/scratchpad python3 kling_horizon.py
SCRATCH=…/scratchpad python3 stimme_horizon.py
SCRATCH=…/scratchpad python3 montage_horizon.py
SCRATCH=…/scratchpad python3 abnahme_horizon.py
```

Schluessel liegen in `$SCRATCH/.openai_env` und `$SCRATCH/.fal_env` und
gehoeren nicht ins Repository.

## Bewegtbild oder lesbarer Text — eine Entscheidung je Szene

Veo zeichnet jeden Bildschirmtext neu, und zwar von Anfang an: schon im
ersten Bild eines Takes steht "Pngrtnodies" statt "Projektupdate". Es gibt
kein sauberes Einzelbild im Take. Der Versuch, den Text aus dem Standbild
zurueckzuholen, ist zweimal gescheitert (siehe Kopf von
`bildschirm_fest.py`).

Also entscheidet jede Szene fuer sich:

| Einstellung | Quelle | Grund |
|---|---|---|
| s1, s7 | Take | kein Bildschirmtext im Bild |
| h1 | Take | nur die Smartwatch, ohnehin zu klein zum Lesen |
| h3, h7 | Take | grosse, frei schwebende Schilder; sie halten |
| h2, h4, h5, h6, h8 | Standbild mit Fahrt | grosser Schirm voll Kleintext |

Fuenf der zehn Einstellungen bewegen sich also wirklich, fuenf fahren ruhig
ins Standbild hinein. Die abgeloesten Takes liegen unter
`$SCRATCH/veo_bewegt/`; wer Bewegung wichtiger findet als lesbaren Text,
schiebt sie nach `veo_szenen/` zurueck und montiert neu.

Die Fahrt selbst zog frueher kraeftig nach rechts — damals waren die
Hypothesen-Bilder Vorher/Nachher-Splits, und die Kamera fuhr von 2026 nach
2030. Seit die Bilder ganz aus der 2030-Haelfte bestehen, gibt es nichts
mehr, wohin man fahren muesste: zehn Prozent, mittig, ruhig.

## Geisterbilder, die keine Nachbearbeitung erzeugt hat (15.09.)

Der doppelte Becher in h2, die doppelten Haende in h3, der Ruecken der
Frau in h5: alles stand schon im rohen Veo-Take — und davor im Standbild.
`hypothesen_breit.py` klebte die Originalhaelfte Pixel fuer Pixel in die
Erweiterung von gpt-image zurueck, mit fester Naht bei x = 480 und 1440.
gpt-image zeichnet die Mitte aber um 20 bis 120 Pixel verschoben neu, und
so lag an beiden Naehten alles doppelt, was sie kreuzt.

Seit `hypothesen_fest.py` ist die Neuzeichnung das Grundbild, und nur die
Bildschirme kommen aus dem Original — perspektivisch an ihre neue Lage
angepasst (`hypothesen/lagen.json`), Menschen im Kasten bleiben aus der
Neuzeichnung (`verdeckung`). Die Takes h2 bis h8 sind danach neu gedreht,
mit eigenem Negativ-Prompt fuer die Hypothesen-Szenen (der allgemeine
verbot "glowing screens, dashboards, holograms" — den Bildinhalt) und
mit zwei Proben je Take (`VEO_PROBEN=2`), von denen die sauberere in die
Montage ging (h7: die zweite).

Vorsicht Zwischenlager: `horizon_bau/n3840_<szene>_*.mp4` sind die
zurechtgeschnittenen Takes. Wer einen Take neu dreht oder festhaelt, muss
sie loeschen, sonst montiert `montage_horizon.py` den alten Take weiter —
genau so kam einmal ein Film mit identischer Groesse heraus.

## Die Bildschirme wackelten — und wie das jetzt gemessen wird (15.09.)

Der Auftraggeber sah es, ich hatte es nicht gemessen: der zurueckgeholte
Text zitterte gegen den Rahmen. Stichproben-Einzelbilder zeigen so etwas
nicht; Zittern ist ein Unterschied ZWISCHEN Bildern. `zittern_horizon.py`
misst deshalb je Bild die Bewegung des Textfelds im fertigen Take gegen die
Bewegung derselben Stelle im rohen Take (Veos eigener Text bewegt sich
exakt mit dem Bildschirm), sub-pixel, sechs Felder je Szene, jedes Bild.

Vorher (alte Verfolgung: ganzzahlige Korrelationspunkte, dann geglaettet):

    h2 0,70 px RMS, Spitze 2,4 px   h4 0,40 / 1,2   h5 0,46 / 1,7
    h6 0,63 / 2,7                   h8 0,84 / 4,5

Nachher (`ausrichten.py`: Lucas-Kanade, invers kompositionell, robust
gewichtet, affin fuer Wandschirme, Aehnlichkeit fuer die Schilder in h3,
KEINE Glaettung, zweiter Durchgang ohne die bewegten Flaechen):

    h2 0,07 / 0,30   h3 0,01 / 0,02   h4 0,03 / 0,06
    h5 0,07 / 0,38   h6 0,03 / 0,12   h8 0,02 / 0,04

Drei Lehren, alle aus der Messung und nicht aus dem Hinsehen:

  * Die Glaettung war der Fehler, nicht die Rettung. Veo haelt die Kamera
    nicht still (18 bis 62 px Wanderung je Take, in h5 zwei Bilder mit
    4 px Ruck). Ein geglaetteter Text folgt dem nicht; der Rahmen zittert,
    der Text nicht — und genau das sieht man. Planar-Tracker der Branche
    glaetten aus demselben Grund nicht.
  * Gauss-Newton braucht Residuum und Gradient in derselben Einheit. Mit
    normiertem Residuum waren die Schritte um den Faktor 50 zu klein; die
    Ausrichtung kroch dem Bild hinterher und holte an ffmpegs verdoppelten
    Bildern (24 -> 25 fps) den Rueckstand auf: 0,3 px Ruck bei stehendem
    Rahmen, einmal je Sekunde.
  * Wo grosse Flaechen ausgeblendet sind (Menschen), rauschen die zwei
    perspektivischen Parameter einer Homographie; frontale Wandschirme
    bekommen ein affines Modell.

Abnahme-Regel: `SCRATCH=… python3 zittern_horizon.py --alle` muss fuer jede
Szene RUHIG melden (Spitze unter 0,3 px), bevor montiert wird. h5 steht bei
0,38 px in EINEM Bild — dem Bild, in dem der ganze Take um 4 px ruckt und
eine Hand mit Bewegungsunschaerfe durch zwei Messfelder faehrt.

## Tempo 0,9 — Bild langsamer, Stimme bei 1,0 (15.09.)

Auf Wunsch laeuft Fassung V mit 90 % Bildtempo: 48,4 s statt 44,1 s. Die
Stimme wird dabei NICHT gedehnt (ein erster Versuch mit Rubber Band war
falsch: die Stimme muss bei 1,0 bleiben). Stattdessen verdrahtet
`stimme_horizon.neu_verdrahten` die Aufnahme neu: jede Zeile wird in der
Mitte der Pausen ausgeschnitten und dort eingesetzt, wo ihre Szene jetzt
liegt (Einsatz / 0,9); ihre Laenge bleibt, die Pausen werden laenger.
`montage_horizon.TEMPO` streckt die Takes mit setpts und senkt die Bildrate
auf 22,5 — jedes Einzelbild genau einmal, kein doppeltes Bild; der
Schnittplan rechnet in Filmzeit, Untertitel und Klangbett-Huellkurve
ziehen mit. `netzfassung.py` erzwingt keine Bildrate mehr (25 haette jedes
neunte Bild verdoppelt). Geprueft: Zeile 5 in der neuen Spur deckt sich
mit der Originalaufnahme zu 0,995 (ungedehnt), 1088 Bilder = 48,36 s x 22,5.
