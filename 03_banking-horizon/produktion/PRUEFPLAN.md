# Prüfplan „Ein Tag in Banking Operations 2030" (v04/v06)

Nichts wird gepusht, was hier nicht abgehakt ist. Grundlage:
- **Automatisch** (`abnahme.py`): Anschluss erstes/letztes Bild gegen die
  Standbilder (< 5 Graustufen), Restchroma je Frame (erodiert, < 200 px),
  Schwarzbildprüfung.
- **Erst-Sichtbarkeit** (`erstsicht.py`, auf den ROH-Takes): der
  Chroma-Flächenverlauf muss stetig wachsen/schrumpfen; ein Schritt von
  null auf groß mitten im Take ist ein aufpoppender Bildschirm. Misst die
  Fläche selbst und funktioniert deshalb auch während Kamerafahrten — dort
  ist der Blockdetektor blind, weil er auf den Bewegungs-Median normiert
  (so ist Defekt 19 durchgerutscht).
- **Sprungdetektor** (`dicht.py`): abrupte örtliche Änderungen zwischen
  Nachbarframes — findet aufpoppende und flackernde Objekte in ruhigen
  Einstellungen.
- **Dichte Sichtung** (`dicht.py`, jeder 3. Frame als Bogen): Duplikate,
  Türlogik, bauliche Logik, Identität. Zwölf Frames je Clip haben nicht
  gereicht — kurze Ereignisse (10–20 Frames) fielen durchs Raster.
  Pflichtfrage je Bogen seit Defekt 19: **„Ist jede Bildschirmfläche
  vorhanden, sobald ihr Träger (Wand, Pod, Tisch) erstmals sichtbar
  ist?"** — als explizite Frage, nicht als Nebenprodukt.

Architektur v06 gegen die ganze Fehlerklasse: Raumwechsel sind KETTEN aus
kurzen Takes (6 s Handlung + 4 s Kamerafahrt), geschnitten an einem
ANKER-Bild, das den Zielraum weit zeigt — mitsamt seiner Chroma-Fläche.
Jedes Teilstück ist damit an einem Bild verankert, auf dem der Schirm
schon existiert; die Dauer je Take ist so gewählt, dass sie am wenigsten
Fehler erzeugt (8 s nur für die Wohnungs-Beats und den Kachelträger).

## DoD — Szenenbild (Standbild)
- [ ] Genau einmal Mara; Gesicht/Haarschnitt = Referenz (dunkler Bob).
- [ ] Handlungs-Logik: Geräte werden benutzt, wie man sie benutzt; niemand
      präsentiert etwas in die Kamera.
- [ ] **Bauliche Logik: Sperrlinien schließen Wand zu Wand — eine Schranke,
      an der man vorbeilaufen kann, ist keine.** Türen: Anschlag und Griff
      plausibel, Schwenkbereich frei, Arbeitsplatz nie direkt an der Tür.
- [ ] Kein Restchroma außerhalb gewollter Flächen (Messung 0).
- [ ] **Chroma-Flächen unverdeckt**: Displays hängen so, dass nichts und
      niemand das Grün überlappt (Standard seit dem Teamraum-Umbau); das
      pixelweise Keying bleibt Sicherheitsnetz.
- [ ] Bildschirmflächen frontal, unbeschnitten; nichts Wichtiges an der Kante.
- [ ] Requisiten der 2030er: kein Papier, keine Zeitung.

## DoD — Bildschirm (HTML-Oberfläche)
- [ ] Eigene Handschrift (Akzent + Hero) und Familienzugehörigkeit.
- [ ] Zahlen konsistent mit App-Panel und Hypothese.
- [ ] Ablauf rein aus setT(t); agentische Anmutung; kein Cursor.
- [ ] Lesbar bei 33 % Bildanteil.
- [ ] **Füllt ihr Trägerformat**: auf Sonderformaten (Wandanzeige 3,1:1)
      layoutet die Seite wirklich breit (b/h-Parameter), statt nur gezoomt
      zu werden — keine tote Fläche auf dem Display.

## DoD — Übergang (montierter Clip)
- [ ] Anschlüsse < 5 Graustufen (gemessen), Restchroma < 200 px je Frame.
- [ ] Genau eine Mara, Identität durchgehend (Haarschnitt!); niemand kreuzt
      den Vordergrund; Statisten halten Position, Gesichter unverzerrt.
- [ ] Nichts erscheint/verschwindet aus dem Nichts; das Interieur bleibt das
      Interieur der Standbilder (keine von Veo erfundene Architektur).
- [ ] **Erst-Sichtbarkeit: jede Bildschirmfläche existiert ab dem ersten
      Frame, in dem ihr Träger sichtbar ist** — `erstsicht.py` ohne Befund
      UND am Bogen explizit beantwortet.
- [ ] Türen öffnen erst bei Berührung, Blatt schwingt von ihr weg, Hand
      sichtbar am Griff.
- [ ] Oberflächen: abgehende Seite steht fertig, ankommende endet exakt fertig;
      kein Schwimmen gegen den Monitorrahmen, kein Zittern.
- [ ] Kachelblenden stetig (eine Fortschrittszahl; kein Zyklus, kein Poppen).
- [ ] Requisiten-Kontinuität (Tasse, Tablet, Stuhl).

## DoD — App (Bühne v04)
- [ ] Am Videoende beschneidet die Fahrt das Bild smooth auf den Zielmonitor;
      das Standbild übernimmt nah, ohne Sprung.
- [ ] Bei Next erst smooth heraus, dann der Weg.
- [ ] Panel: Kicker, Action Title (Uniform-Light-Stack), drei Belege ohne
      Wiederholung des Titels.
- [ ] v01/v02/v03 unverändert (Stichprobe).

- [ ] **App je Station per Screenshot geprüft** (Overlay-Position, Zoomziel,
      Panel) — Messwerte allein haben die Fehllage des s4-Overlays nicht
      gefangen.

## Defektlog (speist die negativePrompt-Liste in `wege_neu.py`)
1. Duplikat von Mara läuft durch den Vordergrund.
2. Tür öffnet sich selbst, bevor die Hand am Griff ist.
3. Objekte poppen am Clipende ins Bild (Schranken, Screens).
4. Statisten in Bewegung zu Fratzen verzogen.
5. Stuhl rollt von selbst an den Platz.
6. Oberfläche schwimmt gegen den Monitorrahmen (Kasten festgenagelt).
7. Oberfläche zittert (Kasten ungeglättet).
8. Grüner Streifen neben der Oberfläche (Kasten zu klein durch Verdeckung;
   Fragmente hinter Köpfen nicht vereinigt; dunkles Chroma unerkannt —
   Chroma heißt leerer Rotkanal, nicht Helligkeit).
9. Wohnungstür schwang zur Kamera, durch ihren Standbereich.
10. Andere Frau am Glastür-Start — das alte Quellbild zeigte nicht Mara;
    Veo animiert treu die falsche Person.
11. Veo erfindet bei langen Reveals eigenes Interieur (Schranken-Wald).
12. Neunte Kundenkachel flackert (Deckkraft lief nach Vollzahl zyklisch);
    Kacheln poppten beim Ausblenden.
13. Sperrlinie endete mitten im Raum — Schranke umgehbar.
14. Abgehende Oberfläche startete im Clip wieder bei null; ankommende war am
    Clipende erst bei zwei Dritteln.
15. Veo machte aus den Glasflügeln der Schranke einen Drehkreuz-Arm, der beim
    Scan erschien (Negativliste: turnstile arm, boom barrier …).
16. glas2 lief ungeprüft durch die Schrankenreihe; der Schnitt übergibt jetzt
    nach 2 s an den Check-in-Take, bevor sie die Linie erreicht.
17. App-Overlay saß im Teamraum vor den Menschen: gerechnete Kastenwerte
    passten nach dem Rollback nicht mehr zu den committeten Stills — Kästen
    werden am Standbild nachgemessen; ein gerundeter y-Wert (0,03 statt
    0,0037) erzeugte danach noch Doppelbild plus Contain-Balken.
18. Kein Push ohne gesichtete dichte Bögen — der eine ausgelassene Durchgang
    hat genau die Fehler durchgelassen, die die Sichtung gefangen hätte.
19. Kabinen-Schirm entstand in s4-s5 aus dem Nichts: die Anfahrt zeigte den
    Pod ohne Fläche, das Grün kam erst spät. Zweifach durchgerutscht — der
    Blockdetektor normiert auf den Bewegungs-Median (blind bei Fahrt), und
    die Sichtung hatte keine explizite Erst-Sichtbarkeits-Frage. Antwort:
    `erstsicht.py` + Pflichtfrage + Anker-Architektur der v06.
20. Anker als Collage (Zentrum pixelgenau zurückgeklebt) trug sichtbare
    Nähte — Bild-im-Bild-Wirkung; ein Ganzbild-Neuaufbau derselben Szene
    ist die richtige Technik. Und eine pauschale Grün-Klausel im
    Anker-Prompt erfand grüne Paneele im schirmlosen Dachgarten — die
    Chroma-Anweisung gehört nur in Prompts von Räumen MIT Bildschirm.
21. Wandanzeige nutzte nur die halbe Fläche (seit v04 unbemerkt): die
    Stationsseite ist auf 1600×1000 verdrahtet, der kompakt-Zoom skaliert
    nur, statt umzubrechen. Breit-Modus (b/h-Parameter) layoutet jetzt
    echt im Trägerformat; v06 führt deshalb einen eigenen Bildsatz mit neu
    gestanztem s4.
22. Programmatisch gemaltes Grün-Rechteck überschrieb in der Totale die
    Schulter, die VOR dem Glas liegt — Veo reproduzierte die kaputte
    Verdeckung, die gestanzte UI deckte den Arm (vom Nutzer gefunden).
    Regression der Teamraum-Lektion: Grünfüllung nie stumpf über
    Verdecker — wo etwas vor dem Glas steht, den gpt-Weg gehen
    (maskierter Edit, Verdecker bleiben vorn). DoD: an jeder gemalten
    Quelle die Kastenkanten in voller Auflösung sichten. Zweite Lehre:
    die Okklusions-Messung gegen das flache UI-Overlay taugt nicht bei
    perspektivischen Monitoren (Fehlalarm s7, Methodenartefakt).

## Abnahme-Matrix v07 (Kling, direkte Takes, Stand 20.08.)

| Clip | Auto (Kopf · Schwanz · Restchroma) | Sichtung | Status |
|---|---|---|---|
| home-s0 | 1,7 · 2,5 · 0 | Dreischnitt, Check-in an der geraden Sperrlinie | OK |
| s0-s1 | 2,3 · 2,3 · 0 | Halle belebt, Monitor ab Tuerblick da | OK |
| s1-s2 | 1,7 · 2,3 · 7 | Sprung = Oberflaechenwechsel s1→s2 (gesichtet) | OK |
| s2-s2b | 1,9 · 3,1 · 0 | Totale unverdeckt, Kacheln stetig | OK |
| s2b-s3 | 2,0 · 2,0 · 0 | Kacheln weich aus; F240 = Schlussblende | OK |
| s3-s4 | 1,7 · 2,8 · 0 | Buero-Monitor verlaesst Bild physisch | OK |
| s4-s5 | 1,8 · 2,5 · 0 | EIN Take statt Ellipse — Kling blendet nicht | OK |
| s5-s6 | 1,7 · 2,4 · 0 | Sprung = Oberflaechenwechsel (gesichtet) | OK |
| s6-s7 | 1,7 · 1,9 · 0 | durchgehender Weg, Werkraum ab Erstsicht | OK |
| s7-s8 | 1,6 · 2,3 · 2 | Rueckweg, echter Schreibtisch | OK |
| s8-s9 | 1,7 · 2,2 · 0 | Spruenge = Aufstehen/Armbewegung (gesichtet) | OK |
| s9-s10 | 1,7 · 3,3 · 0 | Ellipse aufs Dach (Stockwerkswechsel) | OK |

Erst-Sichtbarkeit auf allen 14 Roh-Takes OK; der einzige Befund (s3s4)
ist der Buero-Monitor, der beim Weggehen aus dem Bild WANDERT — am Bogen
bestaetigt. Anschluesse der Roh-Takes ans Zielbild: 1,7–3,9 Graustufen
(Veo lag bei 7–15; deshalb entfallen die Anker-Ketten der v06).

## Was der Modellwechsel gebracht hat

| | Veo 3.1 (v06) | Kling 2.5 pro (v07) |
|---|---|---|
| Zielbild-Treue | 7–15 Graustufen | 1,7–3,9 |
| Raumwechsel | Blende/Geister → Ellipsen noetig | ein durchgehender Take |
| Regie-Treue | haelt Rueckenansicht zuverlaessig | muss explizit gebunden werden |
| Takt | 4/6/8 s | 5/10 s |
| Preis je Take | ~1,20 USD (6 s) | ~0,42 USD (10 s) |
