# BÜ-Reporting HSB4 K – Master-Excel

Tagesbasiertes Reporting der Makler-Bestandsübertragung aus den Rückstandsabzügen **OPAG** (Arbeitsgüter) und
**Verbund** (Vorgänge) sowie der Anwesenheitsliste (MAK je Kalenderwoche). Eine Master-Datei mit Makros liest die
Rohdaten aus einem Ordner, führt Rückstand, Eingänge, Abgänge und Produktivität fort und zeigt alles in einem Cockpit.

## Ordnerstruktur

```
bue_reporting/
├── BUE_Reporting_Master.xlsm      leere Master-Datei (Cockpit, Makros) – Daten kommen per „Neue Daten laden“
├── BUE_Reporting_Demo_befuellt.xlsm dieselbe Datei, mit den vier Abzügen und der MAK-Liste vorbefüllt (zum Anschauen)
├── Rohdaten/                      neue Abzüge hier ablegen, je Datei ein Blatt (oder mehrere) – Dateiname beliebig; beim Laden
│   │                              umbenannt und nach Rohdaten/JJJJ/MM_Monat/JJJJMMTT_BUe_<OPAG|Verbund>.xlsx verschoben
│   ├── 20260922_Rueckstand_OPAG_HSB4K.xlsx
│   ├── 20260922_Rueckstand_Verbund_HSB4K.xlsx
│   ├── 20260923_Rueckstand_OPAG_HSB4K.xlsx
│   └── 20260923_Rueckstand_Verbund_HSB4K.xlsx
├── Anwesenheit/                   Anwesenheit: MAK-Liste je KW (einmaliger Import) oder Telefonie- und Abwesenheitsplan (bei jedem Laden neu); die neueste Datei wird gelesen
│   └── HSB4K_Anwesenheit_bis_Oktober_2026.xlsx
├── Vorlage/ERGO_Vorlage.pptx      ERGO-Folienmaster für „PowerPoint-Folie erzeugen“
├── Praesentationen/               entsteht beim ersten Export, eine Datei je Folie
└── quellen/                       Build-Skripte (siehe unten)
```

Die Master-Datei erkennt jedes Blatt selbst: Stichtag aus der Zeile „Rückstandsstichtag = Mittwoch, 23. September 2026“,
Quelle aus den Spaltenköpfen (`OPS_AUFTR_ID` vorhanden = OPAG, sonst Verbund). Liegt die Master-Datei in OneDrive oder SharePoint, bildet das Makro die https-Adresse auf den
synchronisierten lokalen Ordner ab oder fragt ihn einmal ab (Konfiguration!B7). Ein Stand (Quelle + Stichtag) wird nur
einmal geladen; das Ladeprotokoll zeigt, was drin ist. Kommt ein neuer Abzug für einen schon geladenen Tag in den Ordner
Rohdaten (etwa weil der erste unvollständig war), fragt eine Karte „Neuen Abzug übernehmen“ / „Alten Stand behalten“:
Übernehmen entfernt den alten Stand aus Fakten, markiert ihn im Ladeprotokoll als ersetzt, rechnet ihn aus der neuen Datei
neu (Eingänge/Abgänge gegen den Stand davor, dessen Schlüssel aus seiner abgelegten Datei gelesen werden) und danach alle
späteren Stände dieser Quelle. Die alte Datei heißt danach `…_ersetzt`, eine nicht übernommene neue `…_verworfen`; beide
liest das Laden nicht mehr. Stände müssen in zeitlicher Reihenfolge kommen, weil Eingänge
und Abgänge aus dem Vergleich mit dem jeweils letzten Stand entstehen.

## Anleitung in der Datei

Das Blatt **Anleitung** (zweites Blatt) beschreibt Ordner, täglichen Ablauf, Tages- und Sammeldateien, Anwesenheit,
Filter, Kennzahlen, Blätter, Fehlerbilder und Grenzen. Tagesdateien (ein Blatt je Datei) und Sammeldateien (mehrere
Blätter je Datei) werden gleich behandelt: die Erkennung arbeitet je Blatt.

## Bedienung im Cockpit

- **Neue Daten laden** (Cockpit) startet den geführten Ablauf – geführter Ablauf in drei Karten (Formen auf dem Blatt, keine UserForm; `vba/modTagesablauf.bas`): 1. Rohdaten im Ordner? Ja → Neue Daten laden (die Abschlussmeldung wird abgefangen und als Ergebnis in Schritt 2 gezeigt; bei Fehler Karte mit „Nochmal laden“/„Ohne Laden weiter“). 2. Heute jemand nicht da? Ja → Kalender beim heutigen Tag, die Spalte von heute blinkt kurz auf, eine Karte am rechten Rand bleibt beim Eintragen offen (nennt auch, wer laut Modell heute frei hat), „Fertig“ schließt ab; kommt die Anwesenheit aus dem Telefonie- und Abwesenheitsplan, zeigt Schritt 2 stattdessen, wer heute laut Plan fehlt. 3. Erfolgskarte mit Zusammenfassung und Knopf „PowerPoint-Folie erzeugen“. Der Zeitpunkt des Abschlusses steht in Filter!O42. Einen eigenen Knopf „Tagesablauf starten“ gibt es nicht mehr.
- **PowerPoint-Folie erzeugen** – zuerst eine Karte „Welche Kacheln sollen auf die Folie?“ (`vba/modFolienauswahl.bas`): sechs Kästchen in der Anordnung des Blatts PPT, Klick schaltet an/ab, Auswahl in Filter!O46 gemerkt. `modPPT.NachPowerPoint` baut je gewählter Kachel (Zuordnung über die Lage im 3×2-Raster) die Kachel auf der Folie neu auf: Textfelder werden in PowerPoint nachgebaut (Text, Schrift, Farbe, Füllung; Titel und Kennzahl als zwei Zeilen in einer Kopfleiste), jedes Teil an seinem festen Platz im Kachelraster des Builds (283 × 195 pt: Kopfleiste 30 pt, darunter das Diagramm, Fußnote unten) – nicht nach der Lage im Blatt, weil Excel die Formen je nach Standardschrift verzerrt (die Zuordnung der Textfelder zur Kachel richtet sich deshalb nach dem echten Diagramm der Kachel, Chart 10–15), jedes Diagramm wird einzeln kopiert und als PowerPoint-Diagramm eingefügt; nimmt PowerPoint es nicht als Diagramm an, wird es als Bild (PNG-Export) gesetzt. Früher wurden alle Formen einer Kachel als Gruppe über die Zwischenablage eingefügt – je nach PowerPoint-Version kam dabei ein eingebettetes Excel-Objekt an, das auf der Folie leer blieb. Anordnung: 1–3 in einer Reihe, 4 als 2×2, 5–6 in zwei Reihen, auf die Fläche skaliert (höchstens 1,6-fach). PPT-Diagramme haben eine feste einzeilige Legende; SLA-Werte stehen in der Legende, zu schmale Segmente bekommen kein Etikett; das Delta der Bewegungen steht als grüne/gelbe Box in eigener Zeile unter den Abgängen, über den Datumsangaben (verdeckt keine Säule und kein Etikett).
- **Celonis (Process Mining)** – jede Rohdatei, aus der ein Stand geladen oder ersetzt wird (auch beim ersten Laden einer
  leeren Datei aus der fertigen Ablage), geht einmal per Kopie in den Ordner aus Konfiguration!B6 übergeben (Standard `H:\Process-Mining-Sync\Upload`), Dateiname wie in der
  Ablage ohne Doppel-Endung `_2`, damit ein ersetzter Stand die alte Kopie überschreibt. Nicht übernommene Dateien gehen
  nicht hinüber. Ordner nicht erreichbar: Laden läuft weiter, Hinweis in der Abschlussmeldung und in Ladelog.txt. B6 leer = aus.
  Doppelt hochgeladen wird nichts: Weil der Server die Dateien alle zwei Stunden abholt und den Ordner leert, führt das Tool
  `Celonis_Upload_Log.txt` neben der Master-Datei (Zeitpunkt, Datei, Bytes, Herkunft). Steht eine Datei darin oder liegt sie
  noch im Ordner, wird sie nicht erneut kopiert – außer ein aktuellerer Abzug (Ersatz oder Doppel `_2`) mit anderer Größe.
- **Doppel beim ersten Laden** – liegen zu einem Stand Grunddatei und Doppel (`…_2`) in der Ablage, lädt eine leere
  Master-Datei das Doppel als aktuelleren Abzug; die Grunddatei wird übersprungen.
- **Produktivität (Tagessicht)** – Samstage und Sonntage ohne Anwesenheit laut Kalender (MAK am Tag = 0) werden
  ausgelassen; das Diagramm zeigt die letzten 7 übrigen Stichtage („Aktuelle KW“: Montag bis Sonntag wie die übrigen Diagramme).
  Die Kachel „Produktivität Verbund“ zeigt dann die durchschnittliche Tagesproduktivität je MAK der gezeigten Tage (Mittel der
  Tageswerte, nur Montag bis Freitag ohne Feiertage), in der Wochensicht den Wert der KW mit Zahl der Arbeitstage (siehe Stand 12.79).
- **Bezugstag** (Cockpit!L12) – zeigt immer ein Datum: als Formel der neueste Stichtag, ein früherer Stichtag als Wert (Auswahlliste oder ‹ zurück); „Neuester Stand“ setzt die Formel zurück, Filter!O45 = 1 heißt früherer Stichtag aktiv (gelb).
- **Anwesenheit je Tag** – Blatt „Mitarbeiter“: BÜ-Kapazität (MAK/Woche), Arbeitszeit (I, leer = 1,0) und Arbeitszeit je Wochentag Mo–Fr (J:N, leer = gleichmäßig); berechnet BÜ-Anteil der Arbeitszeit (O = D/I) und BÜ-MAK je Wochentag (P:T); rot, wenn die Tage im Schnitt nicht die Arbeitszeit ergeben oder die BÜ-Kapazität größer ist. Blatt „Kalender“ (ersetzt Wochenplan und Blatt Abwesenheit): eine Spalte je Arbeitstag Mo–Fr ab KW 30/2026 bis Ende 2028, eine Spalte je Tag Mo–Sa; Eingabe U Urlaub, K Krankheit, A abwesend, Zahl 0–1 = anwesender Anteil (Samstag zählt nur mit Zahl); feste freie Tage laut Modell (kursives A) und Feiertage (FT, Konfiguration N:O, bundesweit + NRW) trägt `modCockpit.KalenderVorbelegen` beim Öffnen ein; grau = frei laut Modell oder außerhalb Eintritt/Austritt, rot = heute, vergangene Wochen als Gliederung eingeklappt (`modCockpit.KalenderEinklappen`, beim ersten Aufruf je Sitzung über das Blattmodul `vba/Kalender.cls`). „Wirksam“ (ausgeblendet) rechnet je Mitarbeiter und Tag BÜ-MAK des Wochentags × anwesender Anteil; darunter im Kalender die Summen je Tag (Zeilen 68–70). MAK am Tag (Verlauf!AX:AZ) = Tagessumme, MAK je KW (KW!L:N) = Durchschnitt Mo–Fr. Import der MAK-Liste: Stammdaten nach „Mitarbeiter“, Wochenwerte auf die Tage der KW (Urlaub = U, sonst A, abweichende Zahl = Anteil); vorhandene Tageseinträge bleiben. Mitarbeiter und Kalender alphabetisch (`modCockpit.AlphabetischSortieren`).
- **Standard-Auswahl** – welche Themenpostkörbe und GeVo-Typen zum Standard gehören: Konfiguration H:L (Namen gespiegelt aus Filter!B/G, daneben ja/nein; Namen PK_Std, GV_Std, GV_Std_Rest) oder im Cockpit die Karte „Standard festlegen …“ (`vba/modStandard.bas`, Chips anklicken, „Nur speichern“ oder „Speichern und anwenden“). Fakten!Q (F_Std) markiert je Faktenzeile, ob sie zum Standard gehört; der Report-Block STD_* in „Wochenwerte“ und damit das Rohdatenblatt rechnen nur damit – die Chips im Cockpit wirken dort nicht. „Auf Standard zurücksetzen“ (früher „Filter zurücksetzen“) und „Standard-Postkörbe“ (früher „Aktive Bearbeitung“) übernehmen den Standard in die Ansicht. Neue Postkörbe beim Laden: HS-Postkörbe (… 23724) KO/MV „ja“, sonst „nein“ (Chip im Cockpit ebenfalls aus); Postkörbe anderer Bereiche (z. B. ODPB) erst einmal alle „ja“ – direkt nach dem Laden fragt die Karte „Neue Themenpostkörbe in den Rohdaten“, welche nicht betrachtet werden sollen (im Tagesablauf zwischen Rohdaten und Anwesenheit; „Alle behalten“ lässt sie im Standard).
- **Rohdatenblatt** – Nachbau des Wochenreports „Rohdaten“ ohne Makros: Zeilen 1–157 genau wie im Original (BÜ-Zeilen 67–90 = 7VA–7OL), Wochenspalten ab I (Datum, Δ) erst ab Beginn des Anwesenheitsplans (ältere Wochen entfernt, Stichtage wie im Original, weiter bis Ende 2028). Der andere Report holt Werte über Zeile und Datum: `=INDEX([BUE_Reporting_Master.xlsm]Rohdatenblatt!$67:$67;VERGLEICH(Datum;[BUE_Reporting_Master.xlsm]Rohdatenblatt!$1:$1;0))`. Werte per INDEX auf den Standard-Block (STD_*) in „Wochenwerte“ (Zeile 2: Spalte der ISO-KW des Spaltendatums); Offene = Rückstand zum letzten Stichtag der KW, Zugänge/Abgänge = Summe der KW (leer ohne Stand der Quelle), Gesamt inkl. Sonstige, Δ = nächste minus diese Woche. Öffnet bei der aktuellen Woche (Blattmodul `vba/Rohdatenblatt.cls`), Excel-Warnungen im Block ausgeblendet. Struktur in `quellen/rohdatenblatt_struktur.json`.
- **Laden der Rohdaten** (`modLaden.NeueDatenLaden`, Schritt 1 des Ablaufs) – alle Abzüge im Ordner Rohdaten einlesen, fehlende Stände ergänzen; jede erkannte Datei wird einheitlich benannt und im Monatsordner abgelegt (`Rohdaten/2026/09_September/20260916_BUe_OPAG.xlsx` bzw. `…_BUe_Verbund.xlsx`, Sammeldatei `JJJJMMTT-JJJJMMTT_BUe_OPAG_Verbund.xlsx`, doppelter Name `_2`; scheitert das Verschieben, etwa bei gesperrten Dateien, bleibt die Datei liegen und Ladelog.txt vermerkt es). Abgelegte Dateien, deren Stand laut Ladeprotokoll geladen ist, werden nicht mehr geöffnet; nach einem Zurücksetzen werden sie wieder gelesen; ein Overlay mit Fortschrittsbalken zeigt Datei, Stand und Prozent (modFortschritt, Formen auf dem Blatt, keine UserForm).
- **Anwesenheit laden** – MAK-Liste importieren: füllt „Mitarbeiter“ (Stammdaten, BÜ-Kapazität = größter Wochenwert) und überträgt die Wochenwerte auf die Tage im „Kalender“ (Urlaub = U, sonst A, abweichende Zahl = anwesender Anteil); vorhandene Tageseinträge bleiben.
- **Anwesenheitsplan öffnen** – Blatt „Planung“: Matrix Mitarbeiter × KW bis Ende 2028, Einträge leer/U/K/F/H/Zahl, aktuelle KW markiert, Summen je KW; neue Mitarbeitende im Blatt „Mitarbeiter“ anlegen, Austritt per Datum oder Aktiv = FALSCH.
- **PowerPoint-Folie erzeugen** – kopiert die sechs Kacheln des Blatts „PPT“ (OPAG rot, Verbund petrol, Kennzahlen im Kachelkopf) auf eine Folie der ERGO-Vorlage, Titel „HS | BÜ-Reporting Makler-Bestandsübertragung“, sichert eine Kopie in „Praesentationen“.
- **Sparten** – Chips Komposit, Leben, KV und Sonstige in der Farbe der Sparte; sie grenzen alle Kennzahlen und Diagramme auf die gewählten Sparten ein (Einzelreporting je Sparte). MAK und Produktivität folgen der Auswahl (KV gegen MAK Gesundheit, Komposit/Leben gegen MAK Komposit). Über den Rückstandssäulen zeigt ein Badge die Veränderung zur vorherigen Periode (grün = weniger, gelb = mehr, grau = gleich); die Kacheln Rückstand OPAG/Verbund nennen das Delta mit dem Datum des vorherigen geladenen Stands.
- **Chips folgen den Daten** – nach jedem Laden werden die Themenpostkörbe nach Rückstand am letzten Stand sortiert
  (`modCockpit.PostkoerbeSortieren`, Filterkennzeichen und Standard wandern zeilengleich mit). Die zehn Postkorb-Chips zeigen
  so immer die größten Postkörbe der geladenen Daten; Postkörbe ohne Daten (z. B. HS-Postkörbe bei ODPB-Rohdaten) erscheinen
  nicht. Sparten-Chips erscheinen nur, wenn die Sparte in den Daten vorkommt (Filter!U/V = Sätze in Fakten).
- **Themenpostkörbe** – Chips je Postkorb (gefüllt = im Filter, leuchten beim Überfahren mit der Maus auf; Zellen mit HYPERLINK auf die Hover-Funktion `ChipHover`, Klick über `Worksheet_SelectionChange` im Blattmodul Cockpit); „Aktive Bearbeitung“ setzt die Vorauswahl aus Konfiguration!F11:F30 (Standard KO, MV), „Alle Postkörbe“ wählt alles.
- **GeVo-Typen** – Modus „Alle GeVo“, „Nur BÜ-Schlüssel“ (108, 469, 2015, 6065 aus Konfiguration!D11:D20) oder „Manuelle Auswahl“ über die Chips der 13 häufigsten GeVo-Typen (aufsteigend nach Nummer) plus „Alle übrigen“.
- **Ansicht** (Chips in der Bezugstag-Leiste, Filter!L9) – „Tagessicht · 7 Stichtage“ (Tag: letzte 7 Stichtage bis zum Bezugstag), darunter
  „Aktuelle KW · Mo–So“ (KW: Montag bis Sonntag der Kalenderwoche des Bezugstags, standardmäßig die laufende Woche; Tage ohne Stand oder
  nach dem Bezugstag bleiben leer, Datum und Wochentag stehen trotzdem an der Achse; ‹ zurück / vor › verschieben die KW) oder
  „Wochensicht · 7 KW“ (Woche: letzte 7 Kalenderwochen; Rückstand je KW = Stand vom Sonntag der KW, unter jeder KW das Datum des
  verwendeten Stands der Quelle des Diagramms, z. B. „KW 41“ / „11.10. (So.)“, siehe „Rückstand je KW (Sonntag)“). Gilt für Rückstand, Bewegungen, Produktivität und Verhältnis; MAK immer je KW (7 KW bis zur
  KW des letzten Stichtags). Beim Öffnen steht die Wochensicht.
- Alle Kennzahlen und Diagramme rechnen über Formeln; die Filter wirken sofort. „Aktualisieren“ erzwingt eine Neuberechnung, „Zurücksetzen“ nimmt alle Filter zurück.

## Diagramme

- Immer 7 Plätze je Diagramm. Tages- und Wochensicht: neueste Periode rechts, fehlende Stände lassen die Plätze links frei, die Breite steht von Anfang an. Aktuelle KW: Montag links bis Sonntag rechts, Tage nach dem Bezugstag bleiben rechts leer.
- Gestapelte Säulen im think-cell-Stil: Werte in den Segmenten, Summe über der Säule, keine Wertachse. Eingänge und Abgänge: eine Kachel mit je einer Zeile für Gesamt, Komposit, Leben und KV – Eingänge über der Achse (Wert darüber), Abgänge darunter (Wert darunter), Delta als abgerundete Box auf der Achse (grün = Abbau, gelb = Aufbau); Sparten mit gemeinsamer Skala, Gesamt mit eigener; rechts die Summen (Tagessicht: letzte 7 Stichtage, Aktuelle KW: Tage der KW, Wochensicht: letzte KW). Bookmark-Chips „Verbund“/„OPAG“ in der Kopfleiste schalten die Quelle um (Filter!L13).
- Werte, die nicht in ihr Segment passen, stehen mit Führungslinie links oder rechts neben der Säule (Altersstruktur: über dem Balken). Beim Bau setzt `bue_reporting_build.py` diese Positionen ins Diagramm-XML; in Excel setzt `modCockpit.EtikettenAuslagern` sie nach jedem Laden und jedem Filterklick neu.

## Kennzahlen und Logik

| Größe | Definition |
|---|---|
| Rückstand | Zeilen des Abzugs am Stichtag (OPAG: Arbeitsgüter, Verbund: Vorgänge), nach Sparte aus dem Verwaltungssystemschlüssel (Konfiguration!A11:B40: KV; LV/LF/LG = Leben; übrige = Komposit) |
| Eingänge | Schlüssel, die im neuen Stand erstmals vorkommen (Verbund: VSS + Ordnungsbegriff + VORG_VERBU_LNR; OPAG zusätzlich OPS_AUFTR_ID + OPS_ARBGUT_LNR) |
| Abgänge | Schlüssel des Vortagsstands, die im neuen Stand fehlen – abgearbeitet oder weitergeleitet (auch Übergabe an den 72-Stunden-BOT); zugeordnet nach Postkorb, GeVo und Sparte des Vortags |
| Altersklassen | Rückstandsalter 0–7, 8–30, 31–90, über 90 Tage |
| MAK je KW | wirksame MAK aus Mitarbeiter (Kapazität, Eintritt/Austritt, Aktiv) und Planung (leer = Kapazität, U/K/F = 0, H = halbe Kapazität, Zahl = Wert), getrennt nach Gesundheit (KV) und Komposit/Leben |
| Produktivität | Abgänge je MAK, die neueste KW bis zu ihrem Freitagsstand hochgerechnet (siehe 12.89): Tagessicht = Abgänge des Stichtags ÷ MAK an diesem Tag (MAK am Tag laut Kalender); Wochensicht = Abgänge der KW ÷ Ø MAK der Arbeitstage (Stichtage Mo–Fr ohne Feiertage mit Abgängen) – eine angefangene KW zählt nur die MAK ihrer bisherigen Tage. Kachel: Wochensicht = Wert der KW mit Basis („je MAK in KW 41 · bisher 2 Arbeitstage (Mo–Di)“), Tagessicht/Aktuelle KW = Mittel der gezeigten Tageswerte Mo–Fr ohne Feiertage („Ø je MAK und Arbeitstag · 5 Tage (30.09.–07.10.)“) |

Der erste Stand je Quelle liefert nur den Rückstand (keine Bewegungen), ab dem zweiten Stand kommen Eingänge und Abgänge dazu.

## Blätter

Cockpit (KPI-Kacheln, Filter, Kacheln mit farbiger Kopfleiste: OPAG rot, Verbund petrol; Diagramme: Rückstand OPAG/Verbund (mit SLA-Linie, OPAG als Vorschlag aus Ø 14 Tage), Kachel Eingänge/Abgänge in voller Breite mit vier Zeilen und Umschaltung Verbund/OPAG, MAK, Altersstruktur, Produktivität Verbund/OPAG, Rückstand je Postkorb, Verhältnis Verbund zu OPAG) · Wochenwerte (Nachschlagetabelle: KW in Spalten, Kennzahlen in Zeilen, nach gewählten Themenpostkörben) · Abwesenheit (tagesgenaue Ausnahmen für die MAK am Tag) · Verlauf (eine Zeile je Stichtag, gefiltert) · KW (Abgänge, MAK, Produktivität
je Kalenderwoche) · Fakten (verdichtete Sätze je Stichtag, Quelle, Sparte, VSS, Postkorb, GeVo mit Filterkennzeichen) ·
PPT (Folienkacheln) · Planung und Mitarbeiter (Anwesenheitstool) · Filter (Chip-Zellen, Hilfsgrößen) · Konfiguration · Ladeprotokoll · Snapshot_OPAG / Snapshot_Verbund
(ausgeblendet: Schlüssel des letzten Stands für den Vergleich am nächsten Tag) · Wirksam (ausgeblendet: berechnete MAK).

Einheitlicher Look (zentral in der Klasse `Stil` des Build-Skripts): Titel und eine graue Untertitelzeile je Blatt; Tabellenköpfe
dunkelgrau, OPAG-Bezug rot, Verbund-Bezug petrol, darunter Spaltenköpfe im hellen Ton derselben Farbe. Eingaben sind weiße Felder
mit feinem hellgrauem Rahmen (Eingabetabellen nur mit waagerechter Haarlinie), berechnete Zellen grau gefüllt ohne Rahmen, fehlende
Pflichtfelder zart rot; Legende „Weiße Felder mit Rahmen = Eingaben · graue Felder = berechnet“. Hinweise stehen als Eingabemeldung
der Datenüberprüfung oder als Notiz. Registerfarben: Cockpit/PPT rot, Eingabeblätter petrol, Berichte (Wochenwerte, Rohdatenblatt)
indigo, Hilfs- und Datenblätter grau.

## Build (quellen/)

- `bue_reporting_build.py` – erzeugt die Master-Datei mit xlsxwriter, befüllt sie mit den vorhandenen Rohdaten, trägt
  Makros an die Schaltflächen und Kontrollkästchen in die Zeichnung ein und hängt das VBA-Projekt an.
- `verarbeitung.py` – dieselbe Zähl- und Vergleichslogik wie das VBA (für die Vorbefüllung und als Referenz).
- `ovba.py` – schreibt aus den `.bas`-Quelltexten ein `vbaProject.bin` (OLE-Container, MS-OVBA) ohne Excel.
- `vba/modLaden.bas`, `vba/modCockpit.bas`, `vba/modPPT.bas`, `vba/modFortschritt.bas`, `vba/modTagesablauf.bas`, `vba/modFolienauswahl.bas`, `vba/modStandard.bas`, `vba/modWerkzeuge.bas`, `vba/modUpdate.bas`, `vba/Cockpit.cls` – der VBA-Quelltext (Laden und Import, Cockpit und Planung, PowerPoint-Export, Lade-Overlay, geführter Tagesablauf, Blattmodul für die Chips).
- `lo_vba_check.py` – lädt die Master-Datei in LibreOffice und ruft je Modul eine Prozedur auf (Syntaxprüfung ohne Excel).

Aufruf: `python3 quellen/bue_reporting_build.py` schreibt beide Dateien (leere Master-Datei und befüllte Demo). Die Rohdaten-Sammeldatei
aus dem Upload wird beim ersten Lauf in Tagesdateien je Quelle zerlegt.

## Audit September 2026

Ergebnis und Umsetzung in `AUDIT_2026-09.md`: fremde Dateien werden ohne Makros geöffnet, Laden sperrt die Bedienung,
SUMIFS lesen nur den Fakten-Block des jeweiligen Stichtags (Verlauf!AL:AM), eine Hilfsformel je Fakten-Zeile, Planungshorizont
bis 2030 mit Warnung, 40 Postkörbe, Überlauf-Wachen.

## Prüfstand

Geprüft ohne Excel: Paketstruktur (Makroteil, Zeichnung, Diagramm-XML mit Etikettenversatz und Führungslinien, Namen), Lesbarkeit des
VBA-Projekts (oletools), Formeln vollständig mit LibreOffice Calc (Neuberechnung, keine Fehlerwerte außer den gewollten #NV in
leeren Diagrammplätzen und Produktivitätswochen ohne Daten) und mit dem Python-Paket `formulas`, die Zähllogik in Python gegen die
Rohdaten, das Cockpit als LibreOffice-Render (PDF, Seite 1). Erster Öffnen-Test in Excel mit der leeren Master-Datei: Makros aktivieren,
„Neue Daten laden“ (lädt die vier Abzüge aus Rohdaten, Ladeprotokoll zeigt vier Stände), „Anwesenheit laden“, dann Filter klicken und
die Etiketten neben schmalen Segmenten prüfen. Die Demo-Datei sollte danach dieselben Zahlen zeigen.

Schrift in Zellen, Formen und Diagrammen: Liberation Sans (metrisch gleich Arial; wo sie nicht installiert ist, setzt Office eine Ersatzschrift gleicher Breite).

Kapazität (MAK): Komposit/Leben unten, Gesundheit (KV) darüber – dieselbe Reihenfolge wie in den Rückstandsdiagrammen. PPT-Rückstand: passt ein Wert nicht ins Segment (meist Leben), steht er wie im Cockpit mit Führungslinie neben der Säule.

Stand 12.46: Rechen- und Ladelogik wieder wie vor dem Performance-Update (Version 12.40). Mit den Änderungen 12.41–12.45 (Datenpuffer, Stand aus dem Dateinamen, Hilfsspalten S–V in Fakten, manueller Rechenmodus bei Klicks, Wechselzeilen für Eingänge/Abgänge relativ zur Auswahl) zeigte das Cockpit bei echten Daten falsche Rückstände, obwohl die Rohdaten laut Ladelog identisch gelesen wurden. Behalten wurden nur sichtbare Verbesserungen: Leben-Werte, die nicht ins Segment passen, stehen immer rechts neben der Säule; Kachelüberschriften und Untertexte passen sich der Breite an; PPT-Diagramme werden nur nach dem Laden und vor dem Export nachgezogen; steht Excel beim Öffnen auf manuell, wird auf automatisch gestellt und alles neu berechnet.

Stand 12.47 – Umbuchungen: Eingänge und Abgänge beziehen sich auf die gewählte Auswahl. Ein Fall, der in einen anderen Themenpostkorb oder GeVo wechselt, steht im eigenen Blatt „Umbuchungen“ (je Stichtag, Quelle, Sparte und Paar vorher/heute eine Zeile mit Anzahl und Filterkennzeichen K–P). Führt der Wechsel in die Auswahl hinein, zählt er als Eingang, führt er hinaus, als Abgang; Wechsel innerhalb der Auswahl zählen nicht. Damit gilt für jede Auswahl: Rückstand heute = Rückstand Vortag + Eingänge − Abgänge (OPAG 23.09.: −321 = 559 − 880). Fakten, Rückstand und alle übrigen Formeln bleiben unverändert wie in 12.40; nur Eingänge/Abgänge in Verlauf und Wochenwerte erhalten einen Summanden aus dem Blatt Umbuchungen.


Stand 12.48: Die Kachel „Eingänge und Abgänge“ zeigt nach dem Laden Verbund; liegt der letzte Verbund-Stand mehr als 2 Tage hinter dem letzten OPAG-Stand, zeigt sie OPAG (modLaden.QuelleBewegungenWaehlen).

Stand 12.50 – PPT-Folie: Die Kachel „Kapazität (MAK) und Produktivität je KW“ zeigt unter den MAK-Säulen je KW zwei Boxzeilen: Vorgänge je MAK (Verbund, türkis) und Arbeitsgüter je MAK (OPAG, rot), Werte aus KW!Q und KW!T über Diagrammdaten!BC:BH (Fenster wie das MAK-Diagramm).

Stand 12.51 – PPT-Rückstand: Die schmaleren Säulen aus 12.50 sind zurückgenommen (Komposit-Werte passten nicht mehr in die Säule und fehlten). Stattdessen hat die Zeichenfläche rechts einen Rand, und ein Wert, der nicht ins Segment passt (meist Leben), steht 2 pt rechts neben der Säule auf weißem Grund (modCockpit.EtikettenAuslagern, Schrift 7 pt) – lesbar auch neben der letzten Säule und über dem Rand der Nachbarsäule.

Stand 12.55 – Anwesenheit aus dem Telefonie- und Abwesenheitsplan: „Anwesenheit laden“ erkennt eine Datei mit Blatt „Verwaltung“ (z. B. `Verwaltung_2026.xlsx`, ODPB3D + KBIG2D) und übernimmt die Tage direkt (`modLaden.PlanUebernehmen`): Personen je Teamblock („Team Nord/Mitte/Süd“) mit 1 in der Zeile „Mitarbeiter“, Personen außerhalb der Teams nicht; ohne Schätzung des BÜ-Anteils zählt jede Person voll (BÜ-Kapazität 1,0); „x“ = abwesend (Kalender „A“, U/K bleiben), sonst anwesend; Feiertage („Arbeitsfrei“ = 1) und Wochenenden unberührt; Sparte neuer Personen „Komposit“. Die MAK-Liste je KW funktioniert weiter wie bisher.

Stand 12.56 – Zwei Master-Dateien, Werkzeuge im Cockpit:
- `BUE_Reporting_Master.xlsm` (HS, HSB4 K) bleibt unter diesem Namen (das HR-Sales-Dashboard verknüpft ihn); neu `BUE_Reporting_Master_Makler.xlsm` (Konfiguration!F7 = MAKLER): Titel „BÜ-Reporting Makler“, keine HS-Themenpostkörbe vorbelegt, neue Postkörbe zählen ohne Rückfrage zum Standard (kein Dialog „Neue Themenpostkörbe“), keine SLA-Vorgabe, Blatt Rohdatenblatt (Wochenreport fürs HS-Dashboard) ausgeblendet, Folientitel „Makler | …“.
- Makler mit mehreren Einheiten (ODPB, ODPP, KBI …) und mehreren Abzügen am selben Tag: Die Einheit kommt aus der Kopfzeile `oe_nr = '…'` (ersatzweise Spalte OE_NR). Jede Einheit ist ein eigener Stand je Quelle und Tag (Ladeprotokoll K, Fakten R, Umbuchungen Q, Snapshot F und J:L); ein zweiter Abzug einer anderen Einheit wird dazugeladen, nur derselbe Einheit/Tag fragt nach Ersetzen. Eingänge/Abgänge je Einheit gegen deren letzten Stand. Angezeigt wird die Summe („Einheit: Gesamt“, Standard); der Knopf „Einheit: …“ in der Kopfzeile filtert auf eine Einheit (Filter!L16 in Fakten!P und Umbuchungen!K/L), MAK und Produktivität bleiben Gesamtwerte. Ablagename mit Einheit: `20261007_BUe_Verbund_ODPB-D.xlsx`.
- Cockpit, Abschnitt WERKZEUGE (beide Bereiche, `modWerkzeuge`): „SLA anpassen …“ (Karte mit Eingabefeldern für F3/F4), „Rohdaten löschen …“ (Dateien im Ordner Rohdaten und der Ablage auswählen, 10 je Seite, „geladen“ markiert; nur löschen oder löschen und Tool neu aufbauen), „Zurücksetzen …“ (`modLaden.ToolLeeren`: Fakten, Verlauf, Ladeprotokoll, Umbuchungen, Snapshots, Postkorbliste; optional Mitarbeiter und Kalender – Rohdateien bleiben und werden beim nächsten Laden wieder gelesen), „Ältere Datei aktualisieren …“ (`modUpdate`, seit 12.93: neue Version übernimmt die Daten einer geöffneten älteren Datei und ersetzt sie unter gleichem Namen).
- Produktivitätskachel: Hat die KW des letzten Stands noch keine Abgänge (Montag früh), zeigt die Kachel die letzte KW mit Wert statt „–“ (Filter!O43/O44).

Stand 12.57 – Makler-Einheiten aus OE_NR, Sicht Sparte | Einheit:
- Die Makler-Abzüge enthalten mehrere Einheiten der OE-Ebene 4 in einer Datei (ODPB D, ODPP D, MSUE D mit Unter-OEs wie ODPB1 D, ODPB2HH, MSUE2 M). 12.56 hat die OE-Nummern einer Datei zu einem Namen verkettet (nur die ersten gefundenen) – dadurch war jeder Tag ein „erster Stand“ ohne Eingänge/Abgänge, und der Einheiten-Schalter zeigte lange Ketten. Jetzt: Einheit je Zeile aus OE_NR (`modLaden.EinheitAusOE`, Zuordnung Konfiguration Q11:R40, Vorgabe ODPB/ODPP/MSUE/KBI, sonst führende Buchstaben ohne „HH“); die Einheiten einer Datei bilden ihre Gruppe (`MSUE+ODPB+ODPP`) als Strang für Stand, Snapshot und Ersatz-Frage. Fakten R Einheit / S Gruppe, Umbuchungen Q/S Einheit heute/vorher und R Gruppe, Snapshot F „Gruppe|Einheit“, Ladeprotokoll K Gruppe.
- Sicht der Rückstandsdiagramme (Makler): Chips „Sparte | Einheit“ in der Kopfleiste „Rückstand OPAG“ (Filter!L19). Sicht Einheit stapelt Cockpit- und Folien-Diagramm nach Einheit (Namen Filter!L22:L25, `modLaden.EinheitenNamenSetzen`; Verlauf BA:BH, KW BC:BJ, Diagrammdaten BI/BJ und Reihennamen BK3:BN3); Sicht Sparte zeigt bei Makler zusätzlich „Sonstige“ als vierte Reihe.

Stand 12.58 – Altersstruktur: Zeichenfläche links breiter (die Kategorie „Verbund“ bricht nicht mehr um), rechts Platz für den Wert „über 90 Tage“: Passt er nicht ins schmale Segment, steht er rechts neben dem Balkenende (modCockpit.EtikettenAuslagern, letzte Balkenreihe; beim Bau etiketten_balken_prozent), statt ausgeblendet zu werden. Gilt für Cockpit und Folie.

Stand 12.59 – KPI-Leiste mit sieben Kacheln (je 6 Rasterspalten): neu „Ältester Vorgang“ hinter den Rückständen – Datum = letzter Verbund-Stichtag minus höchstes Rückstandsalter (nach aktivem Filter, Filter!O47), darunter das Alter in Tagen und OPAG mit Datum und Tagen (O48). Das höchste Alter je Faktenzeile schreibt der Lader in Fakten!T (`SP_ALTER_F`); in HS und Makler.

Stand 12.60 – Master-Datei und Rohdaten auf SharePoint, auch ohne OneDrive: `modLaden.BasisOrdner` löst die https-Adresse, die Excel für SharePoint-Dateien liefert, jetzt in dieser Reihenfolge auf: Konfiguration B7 · synchronisierte Bibliothek laut Registry (`HKCU\Software\SyncEngines\Providers\OneDrive`, UrlNamespace → MountPoint) · **WebDAV-Pfad** `\\host@SSL\DavWWWRoot\sites\…` (ohne OneDrive-Client; ist der Explorer noch nicht angemeldet, öffnet das Tool kurz ein Explorer-Fenster auf den Ordner und prüft 15 s lang erneut) · OneDrive-/Bibliotheksordner unter dem Benutzerprofil · Elternordner eines absoluten Rohdaten-Pfads · Ordnerauswahl. Ergebnis je Sitzung zwischengespeichert. B3/B4/B7 dürfen SharePoint-Adressen aus der Browser-Adresszeile sein (auch `…AllItems.aspx?id=/sites/…`); sie werden in WebDAV-Pfade umgesetzt. Voraussetzung für WebDAV: Windows-Dienst „WebClient“ nicht gesperrt.

Stand 12.61 – Verkettung und stabile Einheiten-Gruppe:
- Abweichung Verbund zum MIS-O-Bericht (Makler, 06.10.: Tool 1.939, MIS-O KW 41 1.489; OPAG 3.689 = 3.689): Der MIS-O-Bericht filtert „Verkettungskennzeichen = verkettet, führend / nicht verkettet“, zählt also bei verketteten Vorgängen nur den führenden. Die Rohabzüge (HS wie Makler) haben nur die Filter OE und Rückstandsalter und enthalten auch „verkettet, nicht führend“. KV ist identisch, Komposit/Leben (Cluster-Bündelung) höher. Das Tool erkennt jetzt eine Spalte „Verkettungskennzeichen“ im Abzug und lässt „verkettet, nicht führend“ weg (`NichtFuehrend`, sp(10)); ohne die Spalte zählt es wie bisher. Abhilfe also: Spalte im MIS-O-Abzug ergänzen (oder den Filter im Abzug setzen).
- Einheiten-Gruppe (Makler) nur noch aus den in Konfiguration R11:R40 genannten Einheiten: einzelne Zeilen anderer OEs (z. B. „ODP D“) ändern die Gruppe nicht mehr (am 05.10. entstand dadurch eine neue Gruppe ohne Eingänge/Abgänge).

Stand 12.62 – SharePoint ohne OneDrive, ohne WebDAV (Laden hing endlos):
- Ursache 12.60/12.61: Der Weg über WebDAV (`\\host@SSL\DavWWWRoot\…`) braucht den Windows-Dienst WebClient. Microsoft hat ihn im November 2023 abgekündigt, er startet nicht mehr von selbst, und SharePoint muss als vertrauenswürdige Site eingetragen sein. Ohne ihn sucht Windows den Pfad als Netzwerkfreigabe und jede Prüfung wartet auf Zeitüberschreitungen; dazu startete das Tool ein Explorer-Fenster und prüfte 15 s lang – „Neue Daten laden“ blieb so hängen.
- Neu: `BasisOrdner` sucht ohne Warten und ohne Dialog (B7, lokaler Pfad, synchronisierte Bibliothek, WebDAV nur wenn WebClient läuft – ein Versuch –, Profilordner, Elternordner von B3) und liefert sonst die https-Adresse selbst; das Ergebnis gilt je Sitzung.
- Ist der Rohdaten-Ordner eine https-Adresse, listet `SpListe` ihn über Power Query (Abfrage `BUE_SharePoint_Liste`, `SharePoint.Contents` Ordner für Ordner, sonst `SharePoint.Files` über die Seite; Ergebnis im ausgeblendeten Blatt `SP_Liste`). Dateien werden mit `Workbooks.Open` über https geöffnet. Beim ersten Laden fragt Excel nach der Anmeldung (Organisationskonto).
- Auf SharePoint: keine Umbenennung und keine Monatsablage; Dateien, die im Ladeprotokoll stehen, werden nicht erneut geöffnet; nicht übernommene Dateien und „Rohdaten löschen“ blenden die Datei im Tool aus (`SP_Liste` Spalte J), endgültig gelöscht wird im Browser (Ordner öffnet sich). Celonis-Kopie über Öffnen + `SaveCopyAs`. Ladelog und Celonis-Log unter `%LOCALAPPDATA%\BUE_Reporting`. Anwesenheit: neueste Datei laut Änderungsdatum der Auflistung. PPT: Vorlage über https, Kopie in `Praesentationen` auf SharePoint, sonst in „Dokumente“.

Stand 12.63 – Laufzeitfehler 9 beim Laden von SharePoint behoben: `DateienSammeln` prüfte die Ablage-Ebenen mit `UBound(t) = 0 Or (… t(1) …)`; VBA wertet `Or`/`And` immer ganz aus, bei einer Datei direkt im Ordner Rohdaten gibt es `t(1)` nicht. Zusätzlich: der OPAG-Schlüssel lässt eine fehlende Spalte (Auftrag/Arbeitsgut) leer statt abzubrechen, „Spaltenköpfe unvollständig“ nennt die fehlende Spalte, Ladelog listet die gefundenen Spalten, und jede Fehlermeldung beim Laden nennt den Schritt (Datei, Stand) und den Pfad des Ladelogs.

Stand 12.64 – Celonis-Protokoll auf SharePoint, Ältester Vorgang mit Details:
- Celonis: Im SharePoint-Modus las 12.62/12.63 nur ein lokales Protokoll und übergab deshalb schon übermittelte Dateien erneut. Jetzt wird `Celonis_Upload_Log.txt` neben der Master-Datei über Power Query gelesen (Abfrage `BUE_SharePoint_Text`, Blatt `SP_Liste` ab L1) und nach dem Laden mit den neuen Zeilen über Excel als Text (Tabulator, Windows-1252, wie `Print #`) an derselben Adresse gespeichert – auch nach einem Abbruch. Gelingt das Lesen nicht, wird dort nichts überschrieben. Zusätzlich führt das Tool das Protokoll in `%LOCALAPPDATA%\BUE_Reporting` und im ausgeblendeten Blatt `Celonis_Log`; gelesen wird die Vereinigung. Neu Konfiguration F8 „Celonis ab Stichtag“: ältere Stände gehen nicht an Celonis (für eine neue Master-Datei oder einen Neuaufbau).
- Ältester Vorgang: Fakten U führt je Zeile den Schlüssel des ältesten Datensatzes (VSS|Ordnungsbegriff|LNR, OPAG zusätzlich Auftrag|Arbeitsgut). Die Kachel ist klickbar (›): die Karte zeigt je Quelle Ordnungsbegriff, LNR, GeVo, Themenpostkorb, VSS/Sparte, Einheit und Rohdatei; „In Rohdatei markieren“ öffnet die Rohdatei schreibgeschützt und markiert die Zeile gelb (`modLaden.AeltesterVorgang`, `VorgangMarkieren`). Für Stände, die vor 12.64 geladen wurden, sucht die Markierung die älteste Zeile mit VSS, Postkorb und GeVo.

Stand 12.65 – Ladefenster nach Datum, Celonis-Lücken geschlossen:
- Ladefenster: Schritt 1 (Dateien öffnen, Stichtag und Quelle erkennen) geht die Dateien jetzt nach Datum durch (`DateienChronologisch`: Datum am Namensanfang JJJJMMTT, sonst Änderungsdatum; gleicher Tag nach Name), Schritt 2 verarbeitet wie bisher streng nach Stichtag. Neue Zeile über dem Status (`modFortschritt.FortschrittSchritt`): „Schritt 1 von 2 …“, „Schritt 2 von 2 …“, „Abschluss“; Status „Datei x von n: Name“ bzw. „Stand x von n: Datum Quelle (Datei)“. Die Celonis-Meldung hält den Balken (`ladeAnteil`), statt auf 90 % zu springen.
- Celonis: Im SharePoint-Modus bekommt die Kopie den einheitlichen Namen (`ZielDateiname`, `celonisNamen`), auch wenn die Rohdatei ihren MIS-O-Namen behält. Beim Fortschreiben des SharePoint-Protokolls werden Übergaben, die nur lokal vermerkt sind (12.62/12.63), mit eingetragen. Das Protokoll in `%LOCALAPPDATA%\BUE_Reporting` ist je Bereich getrennt (`Celonis_Upload_Log.txt` HS, `Celonis_Upload_Log_Makler.txt` Makler).
- Ladefenster: eigene kleine Zeile für den Dateinamen (`FortschrittSetzen anteil, status, detail`); jede Zeile wird auf die Breite gekürzt (gemessen über `TextRange2.BoundWidth`, Dateinamen in der Mitte gekürzt) – lange MIS-O-Namen laufen nicht mehr über.
- Schnellere Beladung: Einheitlich benannte Dateien aus der Ablage (`JJJJMMTT_BUe_<Quelle>[_Einheit]`) werden in Schritt 1 nicht geöffnet, Stichtag und Quelle kommen aus dem Namen (`StandAusName`; nicht bei Sammeldateien, schon geladenen Ständen und Makler-Einheiten mit Sonderzeichen). Neue MIS-O-Abzüge mit Originalnamen werden wie bisher geöffnet. Im SharePoint-Modus wird jede Datei nur einmal über https geholt und als lokale Kopie in `%TEMP%\BUE_Cache_…` abgelegt; Verarbeiten und Celonis-Kopie nehmen die Kopie (`QuelleOeffnenRel`, `CacheAufraeumen` an allen Ausgängen). Das per Suche gefundene Blatt landet im Ladeprotokoll.
- Celonis (Befunde aus dem Review): Die Text-Abfrage verschluckt keinen Abruffehler mehr als „Datei fehlt“ und verlangt, dass im gelesenen Ordner die Master-Datei liegt – sonst wird nichts überschrieben. Vor dem Zurückschreiben wird das SharePoint-Protokoll neu gelesen; scheitert das, steht es in der Abschlussmeldung (auch nach einem Abbruch). Jede Übergabe wird vorgemerkt, nur lokal vermerkte werden nachgetragen; Felder ohne Anführungszeichen/Tabulatoren, Lesen entfernt umschließende Anführungszeichen. Übergaben unter dem früheren Namen (MIS-O-Name aus dem SharePoint-Modus, Originalname vor dem Umbenennen) gelten als übergeben und bekommen einen Alias-Eintrag. Gescheiterte Übergaben (Ordner nicht erreichbar, Kopie fehlgeschlagen) stehen in `Celonis_Log` F:H und werden bei jedem Laden erneut versucht. Ersetzte Dateien werden im SharePoint-Modus ausgeblendet; ein lokaler Lauf benennt im SharePoint-Modus ausgeblendete Dateien in `…_verworfen` um.
- Cockpit: orange Box „Beladung läuft“ oben rechts (Filter!L28/L29, `BeladungMarkieren` setzt und leert sie und speichert die Datei, damit Kollegen sie sehen); wer zugleich „Neue Daten laden“ klickt, bekommt den Hinweis zu warten (`BeladungAndererText`, nach 3 Stunden gilt eine Beladung als abgebrochen). Ansicht Tag/Woche sitzt jetzt oben in der Bezugstag-Leiste. Kachel „Ältester Vorgang“ mit Chip „Vorgang öffnen ›“. Version und Datum der Version im Kopf.

Stand 12.66 – Befunde aus dem Review zu 12.65:
- Ladefenster: Am Ende des Ladens (auch nach Ersatz-Frage, leerem Ordner und Fehler) wurde die Datei gespeichert, während das Ladefenster noch über dem Cockpit lag – wer sie danach öffnete, sah es bei 98 % und konnte nichts anklicken. Jetzt entfernt `BeladungMarkieren` das Ladefenster vor dem Speichern, und `Workbook_Open` räumt Reste von Ladefenster und Hinweis-Karte auf allen Blättern weg.
- Beladung läuft: Wer die Datei schon offen hatte, bevor ein Kollege lud, sah dessen Filter!L28/L29 nicht und konnte parallel laden. Neu ist eine Sperrdatei neben der Master-Datei (`<Master>_Beladung.txt`, z. B. `BUE_Reporting_Master_Beladung.txt`: Name und Beginn, nach dem Ende „frei“ mit Name und Ende). „Neue Daten laden“, der Tagesablauf, „Rohdaten löschen“ und „Zurücksetzen“ lesen sie bei jedem Klick frisch – lokal bzw. im synchronisierten Ordner direkt, im SharePoint-Modus über Power Query (Abfrage `BUE_SharePoint_Sperre`, Blatt `SP_Liste` ab N1); geschrieben wird sie wie das Celonis-Protokoll. Die orange Box kommt weiter aus L28/L29; nach 3 Stunden gilt eine Beladung als abgebrochen, die eigene hält nicht auf. Der Hinweis bittet, danach ohne Speichern zu schließen und neu zu öffnen. Im Tagesablauf führt „Beladung läuft“ zur Karte „Nochmal laden / Ohne Laden weiter“ statt zu „erledigt“.
- „Rohdaten löschen“ und „Zurücksetzen“ prüfen die Sperre jetzt vor dem Löschen und Leeren (bisher erst das anschließende Laden – das Tool war dann schon leer).
- Abbruch beim Ersetzen: Kommt ein Fehler mitten im Ersetzen (alter Stand schon entfernt), wird die Datei nicht mehr gespeichert; die Meldung bittet, ohne Speichern zu schließen, neu zu öffnen und erneut zu laden. Sperre und Ladefenster werden trotzdem aufgehoben (eine Sperrdatei „frei“ mit Ende nach dem Beginn gilt auch gegenüber gespeicherten L28/L29).
- Celonis, Alias: Im Alias-Zweig von `CelonisSenden` überschrieben Reste des alten Zweigs den bekannten Wert, die Datei ging ein zweites Mal an Celonis. Jetzt gilt eine Übergabe unter dem früheren Namen nur bei gleicher Größe als erledigt, und „liegt noch im Upload-Ordner“ ist wieder ein eigener Zweig. Beim Ablegen schreibt der lokale Lauf den Alias sofort dauerhaft ins Protokoll (`CelonisAliasAblegen`), damit ein Neuaufbau die Datei nicht erneut übergibt.
- Celonis, offene Übergaben (`Celonis_Log` F:I): Benennt ein Lauf die Rohdatei um und legt sie ab, zieht der vermerkte Pfad mit (`CelonisOffenUmbenennen`). Fehlt die Datei trotzdem, sucht `CelonisOffenNachholen` sie unter dem einheitlichen Namen im Monatsordner (auch `_2` … `_9`); ist sie auch dort nicht, steht das in der Abschlussmeldung und die Zeile entfällt, statt still liegen zu bleiben. Spalte I merkt einen Ersatz, damit die Nachholung die alte Kopie überschreibt; „davon n nachgeholt“ zählt nur wirklich kopierte Dateien.
- Celonis-Protokoll auf SharePoint: Vorhandene Zeilen werden beim Neuschreiben bereinigt (umschließende Anführungszeichen weg), damit sie nicht bei jedem Speichern weitere Anführungszeichen bekommen.
- Makler: Stände werden nicht mehr aus dem Dateinamen übernommen, jede Datei wird geöffnet. Nach einer geänderten Zuordnung OE → Einheit passte die Gruppe im Namen nicht mehr zum Inhalt, und der Neuaufbau brach mit „Blatt … nicht gefunden“ ab.

Stand 12.67:

- Rohdatenblatt, Stand der Werte: Unter dem 1:1-Bereich stehen fest in Zeile 160 (`7VS`, Verbund) und 161 (`7OS`, OPAG) je Wochenspalte der Stichtag, zu dem Zeile 67 bzw. 79 den Rückstand zeigt (`=WENN(I$2=0;"";INDEX(Wochenwerte!$C$8:…$8;I$2))` bzw. Zeile 7 – dieselbe Zelle STICHTAG_VERBUND/_OPAG, die in Wochenwerte das Kriterium der Rückstandszeilen ist), Format TT.MM.JJJJ, leer ohne Stand der Quelle in der KW, Δ-Spalten leer. Das HR-Sales-Dashboard holt ihn wie die Werte über Zeile und Datum.

Stand 12.69 – Verkettung sichtbar:
- Ladeprotokoll, Spalte Hinweis: je Stand „Verkettungskennzeichen: n nicht führende Vorgänge ausgelassen“ bzw. „ohne Spalte Verkettungskennzeichen: verkettete, nicht führende Vorgänge zählen mit (MIS-O-Bericht mit Verkettungsfilter zeigt weniger)“. Bisher stand das nur im Textprotokoll; ein Abzug ohne die Spalte sah im Tool genauso aus wie einer mit.
- Erkennung toleranter: Groß/Klein, Bindestrich/Unterstrich und „ue“ statt „ü“ („nicht-führend“, „verkettet_nicht_fuehrend“).
- Abgleich Makler 06.10.2026 mit MIS-O KW41 (Verbund, Filter verkettet führend / nicht verkettet): KV in allen Einheiten gleich (110/4/2), Komposit/Leben im Tool höher (ODPP Komposit 1.097 statt 842, MSUE Komposit 532 statt 375, ODPP Leben 130 statt 108, ODPB Komposit 18 statt 9), gesamt 1.939 statt 1.489. Die geladenen Abzüge 29.09.–06.10. enthalten die Spalte nicht – Abzüge mit der Spalte (oder mit demselben Filter wie im MIS-O-Bericht) neu ziehen, „Zurücksetzen …“, neu laden.

Stand 12.70 – Anwesenheitsplan laufend (Makler):
- Anlass: Im Makler-Cockpit stand „MAK aktuelle KW 0,0“ ohne Produktivität. Der Plan („Verwaltung 2026.xlsx“, Blatt „Verwaltung“) wurde nur beim allerersten „Neue Daten laden“ automatisch übernommen (solange das Blatt Mitarbeiter leer war), danach nur über „Anwesenheit laden“; gespeichert wurde vor dem Import.
- `modLaden.NeueDatenLaden` übernimmt die Anwesenheit jetzt in Schritt 4b, vor Neuberechnung und Speichern (`AnwesenheitImLaden`, `AnwesenheitLaden stumm, imLaden`), auch wenn kein neuer Abzug im Ordner liegt: solange niemand im Blatt Mitarbeiter steht, immer wenn der letzte Import ein Plan war (Mitarbeiter!W7 = „Plan“) und im Bereich Makler auch bei leerem W7 (Dateien vor 12.70) (`AnwesenheitAutomatisch`). Eine MAK-Liste je KW (W7 = „MAK-Liste“) bleibt ein einmaliger Import. Ist der Plan gerade in Excel offen, liest das Tool die offene Mappe (auch noch nicht Gespeichertes) und lässt sie offen. Ein Fehler beim Import bricht das Laden nicht ab, er steht ohne Fehlernummer in der Meldung („Anwesenheit nicht übernommen: … – MAK und Produktivität rechnen mit dem bisherigen Stand im Kalender“).
- Mitarbeiter!V4:W7 „Import der Anwesenheit“: Datei, Zeitpunkt, Format („Plan“ / „MAK-Liste“).
- `PlanUebernehmen`: Ein A ohne „x“ im Plan wird entfernt, von Hand eingetragene U, K und Anteile bleiben stehen (bis 12.69 löschte der Plan auch U/K – bei jedem Laden wären frühere Wochen nachträglich gekippt). BÜ-Kapazität nur für neue Personen 1,0 (eine gepflegte Kapazität und die Sparte bleiben beim erneuten Übernehmen); heute laut Plan („heute 9 von 13 da, es fehlen …“) für den Tagesablauf; aktive Personen im Blatt Mitarbeiter, die nicht (mehr) im Plan stehen, nennt die Meldung (sie zählen weiter, bis ein Austritt eingetragen ist).
- Tagesablauf Schritt 2: Kommt die Anwesenheit aus dem Plan, fragt die Karte nicht mehr „Ist heute jemand nicht da?“, sondern zeigt, wer heute laut Plan fehlt (Weiter / Im Kalender ansehen); „Ohne Laden weiter“ übernimmt den Plan trotzdem. Konnte der Plan nicht gelesen werden oder steht der heutige Tag nicht darin, steht das gelb über der bisherigen Frage; ein gelungener Erstimport einer MAK-Liste grün. Schritt 3 nennt die Plan-Zeile und Ergänzungen aus dem Kalender. Ohne neue Abzüge heißt die Meldung „Keine neuen Abzüge – alles im Ordner ist schon geladen“.
- Kachel „MAK aktuelle KW“: Unterzeile „laut Plan (Ø Mo–Fr)“ bzw. „laut Kalender (Ø Mo–Fr)“, bei 0 MAK „keine Anwesenheit geladen“ (noch nie importiert) oder „0 MAK laut Plan/Kalender“.
- `modCockpit.KalenderVorbelegen` stellt die Bildschirmaktualisierung auf den vorherigen Stand zurück (im Laden aus). LibreOffice-Profil von `lo_vba_check.py` liegt jetzt in `quellen/lo4/` (ignoriert).
- Bereich Makler: Knopf „Einheit: Gesamt“ in der Kopfzeile entfernt (die Chips „Sparte | Einheit“ über dem Rückstand zeigen die Einheiten); Filter!L16 bleibt „Gesamt“.
- Nachgerechnet mit dem echten Plan (Python, genau nach `PlanUebernehmen`): 13 Personen, A-Tage im Kalender = x-Tage im Plan, KW 40/41/42 = 9,2 / 10,0 / 11,2 MAK. Die Spalte „Anwesend“ des Plans selbst zählt eine Person weniger: ihre Formel `=SUMME($V$5:$AJ$5)-ZÄHLENWENNS(V13:AJ13;"x";$V$5:$AJ$5;1)` endet bei AJ, die letzte Spalte von Team Süd (AK) fehlt; die Teamsummen des Plans stimmen mit dem Tool überein.
- Hinweis KV: Der Plan kennt keine Sparte, neue Personen stehen auf „Komposit“. Solange im Blatt Mitarbeiter niemand auf „Gesundheit“ steht, ist die KV-MAK 0 und die KV-Produktivität „–“; Gesamt rechnet alle Abgänge gegen alle MAK.

Stand 12.76 – Wochensicht als Standard:
- Das Cockpit öffnet in der Wochensicht (Filter!L9 = „Woche“ im Build; `modCockpit.WochensichtBeimOeffnen` in Workbook_Open stellt sie wieder ein, auch wenn die Datei in der Tagessicht gespeichert wurde – geschrieben wird nur, wenn L9 nicht schon „Woche“ ist). „Tagessicht“ bleibt per Klick umschaltbar.

Stand 12.77 – Aktuelle KW, Berichtsdatum unter der KW, ohne Knopf „Zum letzten Verbund-Stand“:
- Der Knopf „Zum letzten Verbund-Stand“ in der Kopfleiste „Rückstand Verbund im Verlauf“ (Form BZ_Verbund) entfällt, ebenso `modCockpit.BezugLetzterVerbund` und `BezugAufQuelle`. Frühere Stichtage weiter über ‹ zurück, vor › und die Auswahlliste im Bezugstag; wie weit Verbund hinter OPAG liegt, zeigt jetzt die Achse der Wochensicht (Datum je Quelle) bzw. der leere Platz in der Tagessicht.
- Wochensicht: Unter jeder KW steht das Berichtsdatum, zweizeilig „KW 41“ / „08.10. (Do)“ (seit „Rückstand je KW (Sonntag)“: „11.10. (So.)“, mit Stern bei fehlendem Sonntagsstand). Regel: letzter Stichtag der KW, an dem die Quelle des Diagramms einen Stand hat (KW!AS OPAG, KW!AT Verbund) – genau der Tag, dessen Rückstand die Säule zeigt (Stand Sonntag der KW, sonst letzter Stand); Eingänge, Abgänge und Produktivität der KW reichen bis zu diesem Tag. Eine KW ohne Stand der Quelle zeigt nur „KW 41“. Der Bezugstag wählt wie bisher nur die letzte KW; innerhalb dieser KW gelten Werte und Datum des letzten Stands der Woche.
- OPAG und Verbund können in einer KW verschiedene letzte Stichtage haben (Verbund kommt oft später). Block A hatte dafür eine gemeinsame Achse (Diagrammdaten!A); jetzt hat jede Quelle ihre eigene: Diagrammdaten!BR (OPAG) und BS (Verbund), Datum in BP/BQ (BO = Datum der Periode). Rückstand OPAG/Verbund (Cockpit und PPT), Bewegungen OPAG/Verbund (PPT) und die Kachel Eingänge/Abgänge (nach Filter!L13) zeigen das Datum ihrer Quelle, die Produktivität ebenso (Block D: Achse I OPAG, J Verbund, Datum K/L; in der Wochensicht jetzt „KW 41“ statt „KW 41/26“). Diagrammdaten!A (Verhältnis Verbund zu OPAG) nennt den späteren der beiden Tage. `modCockpit.DiagrammeAnpassen` setzt die Achsen BR/BS. In der Tagessicht sind alle Achsen gleich (Datum und Wochentag).
- Neuer Chip „Aktuelle KW · Mo–So“ unter „Tagessicht · 7 Stichtage“ (Form ANS_KW, `modCockpit.AnsichtKW`, Filter!L9 = „KW“, Datenüberprüfung Tag/KW/Woche): Tagessicht von Montag bis Sonntag der KW des Bezugstags (Filter!O40; ohne früheren Bezugstag der neueste Stand, also die laufende Woche). Block A Spalte B = Zeile im Verlauf für Montag + j − 1 (leer ohne Stand oder nach dem Bezugstag), Achse aus dem Datum des Platzes, Block D übernimmt die Plätze; Summen rechts „Σ KW 41“ über die Tage der KW (Diagrammdaten!C44), Titel „… · KW 41 (Mo–So)“, PPT-Fußnote „Tagessicht KW 41 (Mo–So)“, Diagrammdaten!AF2 zählt die Tage mit Stand. ‹ zurück / vor › / Neuester Stand verschieben den Bezugstag und damit die KW. `FilterAnzeigen` färbt „Tagessicht“ nur bei „Tag“, „Aktuelle KW“ bei „KW“, „Wochensicht“ bei „Woche“; der Build zeichnet die Chips im Zustand der Voreinstellung (Wochensicht aktiv, bis 12.76 stand ohne Makros fälschlich die Tagessicht gefärbt). `WochensichtBeimOeffnen` stellt beim Öffnen weiter auf „Woche“.
- Layout: Der neue Chip (160 × 20 px, ohne Umbruch) ist in Zeile 12 verankert wie der Tagessicht-Chip und sitzt 4 px darunter (y-Versatz 25 px); er reicht durch Zeile 13 (8,25 pt = 11 px, wie bisher etwa 8 pt) bis 5 px in Zeile 14 (18 pt = 24 px) und endet 19 px über der Kopfleiste der Kacheln in Zeile 15. Das Filterpanel links bleibt unverändert. Texte zur Reihenfolge der Plätze (Anleitung, Hilfe, Diagrammdaten!A2, README) nennen die Ansicht „Aktuelle KW“ mit; die Untertitel der Rückstandskacheln sind Formeln auf Filter!L9 („Montag links bis Sonntag rechts“ statt „neueste Periode rechts“). PPT-Rückstand: Zeichenfläche 61 statt 64 % hoch, damit eine bei 7 pt in Excel umbrochene dritte Achsenzeile („08.10.“ / „(Do)“) nicht in die Fußnote läuft.

Stand 12.79 – Produktivität je Ansicht mit Basis (keine Hochrechnung):
- Kachel „Produktivität Verbund“ (Cockpit) folgt jetzt der Ansicht (Filter!L9) und nennt immer die Basis. Wochensicht: Wert wie bisher = Abgänge der KW ÷ Ø MAK der Arbeitstage (KW!Q, KW des letzten Verbund-Stands bzw. die letzte KW davor mit Wert, Filter!O43); darunter „je MAK in KW 41 · bisher“ und „2 Arbeitstage (Mo–Di)“. Arbeitstage = Stichtage Mo–Fr ohne Feiertage mit Abgängen wie KW!AU/AV; welche Wochentage, zeigt eine Bitmaske aus Verlauf!AQ (OPAG AP), bei Lücken mit Komma („4 Arbeitstage (Mo, Mi–Fr)“). „bisher“ steht, solange die KW läuft: sie ist die KW von heute (Filter!O24) und der letzte geladene Stand der Quelle in dieser KW (KW!AT bzw. AS, auch ein Stand ohne Abgänge oder am Samstag) liegt vor ihrem letzten Werktag (Freitag; ist er Feiertag, der Tag davor – sonst stünde nach Karfreitag oder 25.12. bis Sonntag „bisher“); eine abgeschlossene KW heißt „5 Arbeitstage (Mo–Fr)“. Nach der Endprüfung (B1) hängt „bisher“ am geladenen Stand, nicht mehr an den Tagen mit Abgängen: ein geladener Freitag ohne Abgänge (Prüffall D5) oder ein Samstag nach fehlendem Freitag (D6) beendet die KW – Wochensicht „4 Arbeitstage (Mo–Do)“ wie die Aktuelle KW „4 Tage (Mo–Do)“ (vorher hieß es dort „bisher 4 Arbeitstage“, in der Aktuellen KW ohne „bisher“).
- Feiertage zählen nicht als Arbeitstag (Verlauf!AP/AQ prüfen jetzt FT_Datum), wie es die Konfiguration schon sagte. Bis 12.78 zählte ein Feiertag mit Abgängen als Arbeitstag mit MAK 0 (Kalender „FT“) und drückte den Ø MAK der KW: Prüffall KW 40 mit Feiertag Mi 30.09. (15 Abgänge, MAK 0) ergab 50,35 „5 Arbeitstage (Mo–Fr)“ statt 40,28 „4 Arbeitstage (Mo–Di, Do–Fr)“. Die Abgänge des Feiertags bleiben im Zähler der KW (wie beim Samstag). Der Wochenwert ändert sich damit nur in Wochen mit einem Feiertag, an dem Abgänge gebucht sind. Folge im Tagesdiagramm: ein Feiertag hat keinen Punkt mehr (bisher nur, wenn jemand dort MAK > 0 eingetragen hatte).
- Die Wochensicht rechnet immer die ganze KW (wie alle Wochendiagramme, Wert KW!Q). Ist ein früherer Bezugstag gewählt (Filter!O45 = 1) und liegen Stände dieser KW danach (letzter Stichtag der KW, KW!AT bzw. AS, nach Filter!O40), steht statt der Wochentage „3 Arbeitstage bis 08.10.“ – so ist sichtbar, bis wann gerechnet ist; die Aktuelle KW schneidet dagegen am Bezugstag ab.
- Tagessicht und Aktuelle KW: die durchschnittliche Tagesproduktivität je MAK im gezeigten Zeitraum = arithmetisches Mittel der Tageswerte (Abgänge des Stichtags ÷ MAK an diesem Tag, Verlauf!AR:AW bzw. Diagrammdaten Block D) über die Plätze im Diagramm, nur Montag bis Freitag, ohne Feiertage (Name FT_Datum, Konfiguration N), nur Tage mit Wert – also das Mittel der gezeigten Gesamt-Punkte ohne Wochenend- und Feiertagsplätze. Ein Werktag mit Stand, aber ohne Abgänge zählt nicht mit (er ist kein Arbeitstag, wie in der Wochensicht; im Diagramm ist er leer). Kachel: „Ø je MAK und Arbeitstag“ / „5 Tage (30.09.–07.10.)“, bei Aktueller KW „Ø je MAK/Arbeitstag · KW 41“ / „bisher 3 Tage (Mo–Mi)“ („bisher“ je Quelle wie in der Wochensicht: nach dem letzten Stand der Quelle bis zum Bezugstag folgt in dieser KW noch ein Werktag ohne Feiertag, und die KW läuft oder ein früherer Bezugstag ist aktiv; bis zur Endprüfung galt der Bezugstag für beide Quellen – fehlte Verbund der Freitag, stand „bisher“ nur in der Wochensicht).
- KV und Komp./Leben rechnen in jeder Ansicht genauso wie der Hauptwert (Woche: KW!O/P; Tag: Ø der Tageswerte KV bzw. Komp./Leben, je über ihre eigenen Tage mit Wert). OPAG steht in der Kachel als vierte Zeile, mit eigener, kurzer Basis, wenn seine KW oder Tage von Verbund abweichen: andere KW „OPAG 36,0 KW 41 läuft“ bzw. „OPAG 75,5 KW 40, 4 Tg.“, gleiche KW „OPAG 81,4 (Mo–Do)“ bzw. „(bisher 4 Tg.)“, wenn nur OPAG noch läuft; Tagessicht „OPAG 22,5 (4 Tage)“ (den Zeitraum nennt der Untertitel des OPAG-Diagramms); Aktuelle KW die Wochentage (das einzige Muster mit zwei Spannen ohne Leerzeichen: „Mo–Di,Do–Fr“). In der Kachel heißt Komposit/Leben „Komp./L.“ (Endprüfung B4, siehe Layout).
- Layout: Wert, darunter Zeile 1 und 2 (Basis, Schrumpfen wie bisher), die Polsterzeile (Excel-Zeile 9, Cockpit!AR9:AW9) trägt zwei Zeilen mit festem Umbruch (KV · Komp./L., darunter OPAG) und ist dafür 24 statt 22 pt hoch. Nach der Endprüfung (B4) steht sie in 7,5 pt mit den kurzen Texten oben: Excel rechnet mit ganzzahligen GDI-Glyphenbreiten (8 pt waren bei 100 % 11 px, bei 90 % 10 px; die alte Zeile „KV 21,7 · Komp./Leben 30,4“ hatte nur 1–3 px Reserve, ein zusätzlicher Umbruch hätte die OPAG-Zeile abgeschnitten). Jetzt hat jede mögliche Fassung mindestens 12 % Reserve in 140 px bei 100 % (10 px) und in 126 px bei 90 % (9 px), die breiteste „OPAG 88,8 (Mo–Di,Do–Fr)“ 123 bzw. 108 px; Schrumpfen geht mit Umbruch nicht, deshalb bleibt der feste Umbruch. In den beiden unteren Zeilen stehen Werte ab 100 ohne Nachkommastelle (der Hauptwert behält sie).
- Rechenweg in Filter!N50:P97 („Produktivität je Ansicht“, Spalte O Verbund, P OPAG; Zeilen über die Beschriftung in Spalte N) und Diagrammdaten!M:Z (Tageswerte, die zählen; nur Tag/KW). Wochentage-Text über zwei Stufen CHOOSE (32 Muster), weil LibreOffice ein CHOOSE mit 32 Werten nicht annimmt.
- Produktivitätsdiagramme: Titel unverändert („Abgänge je MAK und KW“ bzw. „… und Tag“), Untertitel je Ansicht aus Filter: Wochensicht „Abgänge der KW ÷ Ø MAK ihrer Arbeitstage (Mo–Fr ohne Feiertage, mit Abgängen)“ und für die laufende KW „· KW 41 läuft: bisher n Arbeitstage“ bzw. „· KW 41 läuft: noch kein Arbeitstag“; Tagessicht/Aktuelle KW „Abgänge des Tages ÷ MAK des Tages · Ø je MAK und Arbeitstag (Mo–Fr ohne Feiertage): 4,7 · 5 Tage (30.09.–07.10.)“ (= Wert der Kachel bzw. ihrer OPAG-Zeile, gleicher Wortlaut wie die Kachel). Die Nenner stehen jetzt in der Legende: „KV (÷ MAK Gesundheit)“, „Komposit/Leben (÷ MAK Komposit)“, „Gesamt (÷ MAK gesamt)“. Alle Untertitel sind auf ≤ 620 px ausgelegt (Kopfleiste 650 px). An der Achse steht in Tagessicht und Aktueller KW ein Feiertag als „01.10.“ / „Do · FT“ (Diagrammdaten!I/J), damit sichtbar ist, warum der Platz leer ist (Wochensicht ohne Kennzeichen).
- PPT: Kopf der Kachel „Kapazität (MAK) und Produktivität je KW“ (PPT!BA9) je Ansicht mit kurzer Basis; die MAK gehören zu der KW, die davor steht: Die MAK-Zahl neben „Vorg. je MAK“ ist deren Nenner (Endprüfung B2): Wochensicht „KW 41: Ø MAK 14,9 · 69,4 Vorg. je MAK, bisher 3 Arbeitstage“ (Ø MAK der gezählten Arbeitstage der KW der Produktivität, KW!AY, Filter „Woche: Ø MAK der Arbeitstage“), Aktuelle KW „Ø MAK 14,9 · Ø 22,7 Vorg. je MAK/Arbeitstag, bisher 3 Tage“, Tagessicht „Ø MAK 14,9 · Ø 28,7 Vorg. je MAK/Arbeitstag (4 Tage bis 08.10.)“ (Ø der Tages-MAK der gezählten Tage, Diagrammdaten!AA/AB, Filter „Tag/KW: Ø MAK der gezählten Tage“). Breite (Feinprüfung): Die erste Fassung „KW 41: Ø MAK 11,2 · Ø 18,2 Vorgänge je MAK/Arbeitstag, bisher 3 Tage“ hatte unter GDI-Rundung (8 pt = 11 px, 359 px Textbreite) nur 1,9 % Reserve, mit dreistelligem Ø MAK lief sie über (das Textfeld bricht um und hätte eine zweite Zeile über das Diagramm gezeichnet). Jetzt „Vorg.“ (die Box darunter heißt „Vorgänge je MAK“), Ø MAK und Wert ab 100 ohne Nachkommastelle, und die Aktuelle KW ohne „KW 41: “ davor – die KW nennt dort die Fußnote („Tagessicht KW 41 · Boxen: je MAK und KW“ bzw. „* KW 41 läuft: …“). Reserve bei 100 % (11 px) und 85 % (9 px) für die breitesten Fassungen mit Ø MAK 99,9: Wochensicht „KW 41: Ø MAK 99,9 · 88,8 Vorg. je MAK, 3 Arbeitstage bis 07.10.“ 12,5 % / 10,8 % (dreistelliger Wert „123“ 13,4 %), Aktuelle KW 18,4 % / 17,7 %, Tagessicht „(5 Tage bis 08.10.)“ 12,3 % / 11,5 %. Vorher stand dort die MAK laut Kalender (KW!N, Mo–Fr ÷ 5, Feiertag 0), die in Feiertagswochen nicht der Nenner ist: „KW 52: MAK 12,9 · 40,7 Vorgänge je MAK, 4 Arbeitstage“, aber 655 Abgänge ÷ 16,1 = 40,7. Entschieden für den Nenner statt einer Umbenennung, weil der Leser die Zeile nachrechnen kann und eine zweite MAK-Angabe nicht in 269 pt passt; die Kalender-MAK zeigen weiter die Säulen darunter (unverändert) und der Kopf, solange es noch keine Produktivität gibt („KW 41: MAK 14,8“). In laufenden Wochen und Feiertagswochen weicht der Ø MAK im Kopf deshalb von der Säule ab. Bei früherem Bezugstag steht in der Wochensicht „3 Arbeitstage bis 08.10.“ ohne „bisher“ (das Datum sagt, bis wann gerechnet ist; mit „bisher“ passt die Zeile nicht). Ohne Wochentagsliste, damit die Zeile in 269 pt passt.
- PPT-Boxen unter den MAK-Säulen bleiben Abgänge je MAK und KW (Diagrammdaten!BE/BG); die laufende KW trägt einen Stern („69,4*“, Zeile der Kachel-KW mit „bisher“). Die Kachel hat dafür eine eigene Fußnote (PPT!BA13 aus Filter „PPT: Fußnote …“): „* KW 41 läuft: Verbund 3, OPAG 4 Arbeitstage“ (Feinprüfung: vorher „Verbund bisher 3, OPAG bisher 4 Arbeitstage“; hinter „Boxen: je MAK und KW · “ blieben in 6,5 pt kursiv unter GDI-Rundung nur 1,3 % Reserve, jetzt 16,9 %), in Tagessicht und Aktueller KW davor „Boxen: je MAK und KW“ (der Kopf zeigt dort den Tages-Ø), in Aktueller KW ohne laufende KW „Tagessicht KW 41 · Boxen: je MAK und KW“ (der Kopf nennt dort keine KW); ohne beides die Filterzeile BA12 wie die übrigen Kacheln. Bei früherem Bezugstag (Endprüfung B3) trägt die Box der Kachel-KW den Stern auch, wenn sie Stände nach dem Bezugstag enthält (wie die Kachel, w_nach; Filter „PPT: Stern …“), und die Fußnote sagt ohne „läuft“, bis wann die Box rechnet: „* KW 41: Verbund 3, OPAG 4 Arbeitstage bis 08.10.“, bei verschiedenen letzten Ständen nur die Daten „* KW 41: Verbund bis 06.10., OPAG bis 07.10.“ (mit den Zahlen passte die Fußnote hinter „Boxen: je MAK und KW · “ nicht in 269 pt) – vorher stand neben dem Kopf „bisher 1 Tag“ (Aktuelle KW bis zum Bezugstag) die Fußnote „* KW 41 läuft: Verbund bisher 3, OPAG bisher 4 Arbeitstage“ mit Ständen nach dem Bezugstag.
- Anleitung (Kennzahlen, neuer Punkt zur PPT-Kachel), Hinweis im Cockpit (B75:G83, siehe unten), Hilfe (`modCockpit.Hilfe`: „Produktivität = Abgänge je MAK ohne Hochrechnung: Wochensicht je KW, Tagessicht und Aktuelle KW Ø je Arbeitstag; Basis in der Kachel.“ – der Satz macht den Absatz eine Zeile länger als in 12.77; zum Ausgleich endet der Werkzeug-Satz jetzt „'Zurücksetzen' leert das Tool (die Rohdateien bleiben).“ statt „… bleiben und werden beim nächsten Laden wieder gelesen.“. Nachgemessen mit ganzzahligen GDI-Glyphenbreiten in 458 pt: 96 dpi 12/13 px 38/39 Zeilen, 120 dpi 16 px 38, 144 dpi 19 px 38 – je genau so viele wie 12.77; die Höhenschätzung der Karte im VBA (Σ 1 + Len/78) bleibt bei 47 wie in 12.77. Die erste 12.79-Fassung hatte 40, die zweite unter GDI 39–41 Zeilen), KW!A2, Konfiguration (Feiertage) und Diagrammdaten beschreiben die Basis. Die Überschrift „Stand Wochenende“ der Rückstandsdiagramme blieb in 12.79 unverändert (seit „Rückstand je KW (Sonntag)“: „Rückstand je KW OPAG/Verbund“). Die Tagesablauf-Karten zeigen keine Produktivität.
- Hinweis im Cockpit links unten (Endprüfung B5): Der Produktivitätssatz heißt jetzt „Produktivität = Abgänge je MAK ohne Hochrechnung, Basis in der Kachel (siehe Anleitung).“, und der verbundene Bereich reicht von B75:G80 (6 × 15 pt = 90 pt) auf B75:G83 (135 pt). Der lange Satz der ersten 12.79-Fassung brauchte in Excel 9–10 Zeilen (≈ 100–110 pt), die letzte wurde abgeschnitten; jetzt 8 Zeilen bei 100 % und 10 bei 90 % (GDI-Breiten) in 135 pt. Zeilenhöhen ändern sich nicht, unter dem Hinweis liegen in B:G weder Zellen noch Formen (letzter Knopf „Zurücksetzen …“ in Zeile 73), es verschiebt sich nichts.

Rückstand je KW (Sonntag):
- Regel: Der Rückstand einer KW ist der Stand vom Sonntag dieser KW; der Montag gehört zur neuen KW. Die Zuordnung der Stände bleibt nach eigenem Stichtag (letzter Stand der KW, KW!AS OPAG, KW!AT Verbund) – die Zahlen ändern sich nicht (nachgerechnet: Block A, Block C/D und KW!A:AT vor/nach identisch in Woche, Tag und Aktueller KW). Fehlt der Sonntagsstand, zählt der letzte Stand der KW mit seinem Datum. Die laufende KW (KW von heute, Filter!O24) zeigt den neuesten Stand.
- Wochensicht, beide Rückstandsdiagramme (Cockpit): Titel „Rückstand je KW OPAG“ bzw. „Rückstand je KW Verbund“ (bisher „Rückstand … im Verlauf · letzte 7 Kalenderwochen (Stand Wochenende)“); Tagessicht und Aktuelle KW behalten ihre Titel. Untertitel „Arbeitsgüter · nach aktivem Filter · Stand Sonntag der KW, laufende KW neuester Stand“ (Vorgänge entsprechend), steht im Diagramm ein Stern, dahinter „· * ohne Sonntagsstand – letzter Stand der KW“ (Diagrammdaten!BV OPAG, BW Verbund). „nach Sparte …, Summe über der Säule“ entfällt dort, damit die Zeile auch im Bereich Makler passt.
- Achse unter der KW: Datum des verwendeten Stands kurz mit Wochentag und Punkt, „11.10. (So.)“, „09.10. (Fr.)“ (bisher „08.10. (Do)“; Mo., Di., Mi., Do., Fr., Sa., So. über CHOOSE(WEEKDAY(…;2)), gebietsschemaunabhängig, ohne TEXT/„TTT“). Abgeschlossene KW ohne Sonntagsstand: Stern am Datum, „25.09. (Fr.)*“ (BV/BW = 1, wenn der letzte Stand kein Sonntag ist und KW!W < Filter!O24). Je Quelle eigene Achse wie bisher: BR (OPAG) und BS (Verbund) mit Stern für den Rückstand (Cockpit Chart 1/2, PPT Chart 10/11); neu BT/BU dieselbe Achse ohne Stern für Eingänge/Abgänge (Cockpit-Kachel über Diagrammdaten!A37:A43, PPT Chart 13/14, `modCockpit.DiagrammeAnpassen` setzt dort BT/BU), Verhältnis (Diagrammdaten!A) nennt weiter den späteren Tag ohne Stern. Tagessicht und Aktuelle KW behalten „Do“ ohne Punkt. Die Produktivitätsachse (Block D) zeigt in der Wochensicht dasselbe Datumsformat ohne Stern.
- PPT-Rückstandskacheln: eigene Fußnoten PPT!BA14 (OPAG) und BA15 (Verbund): Filterzeile BA12 wie bisher; mit Stern statt dessen „* ohne Sonntagsstand – letzter Stand der KW · Wochensicht · Filter wie übrige Kacheln“ (beides zusammen passt bei 6,5 pt nicht in 283 pt). Zeichenfläche unverändert (61 %, Platz für eine dritte Achsenzeile, falls Excel „25.09. (Fr.)*“ bei 7 pt umbricht).
- Texte: Kachel „Eingänge und Abgänge“ in der Wochensicht „· letzte 7 Kalenderwochen“ (ohne Stand-Angabe, es sind Wochensummen), „Verhältnis Verbund zu OPAG · letzte 7 Kalenderwochen (Stand Sonntag)“, KW!AF4/AJ4 „Rückstand OPAG/Verbund je KW (Sonntag, sonst letzter Stand)“, Kommentar Filter!L8, Anleitung (Wochensicht), Diagrammdaten (Kopf BR:BW, A2, Formelkommentare). Die Hilfe (`modCockpit.Hilfe`) ist unverändert; sie spricht nur bei der Produktivität von „ohne Wochenende und Feiertage“.

## 12.80 – Ablage auch im SharePoint-Modus

- Bisher blieben die Rohdateien liegen, wenn die Master-Datei über https geöffnet war (kein Dateipfad, keine Synchronisierung):
  `Name`, `MkDir` und `Kill` gehen dort nicht. Jetzt prüft das Tool einmal je Laden, ob es über die SharePoint-Schnittstelle
  schreiben darf (`SpAblagePruefen`: den Ordner Rohdaten über `_api/web/folders/add` „anlegen“, den es schon gibt). Gelingt
  das, legt es wie mit Dateipfad ab: Monatsordner anlegen, Datei verschieben und einheitlich benennen (`SpVerschieben`,
  `MoveToUsingPath`, sonst `moveto`), nicht übernommene Dateien als `…_verworfen`, ersetzte als `…_ersetzt`. Die Aufrufe laufen
  über Power Query (Abfrage `BUE_SharePoint_Ablage`, Blatt `SP_Liste` ab T1, `Web.Contents` mit Inhalt = POST) mit dem
  Office-Konto; beim ersten Mal fragt Excel nach der Anmeldung für die Web-Adresse („Organisationskonto“).
- Ob eine Verschiebung gelungen ist, entscheidet eine frische Auflistung (neu da, alt weg) – Power Query kann eine Abfrage
  mehr als einmal auswerten.
- Schon geladene Dateien, die noch unsortiert im Ordner Rohdaten liegen (aus früheren Läufen im SharePoint-Modus), werden beim
  nächsten Laden geöffnet, erkannt und abgelegt; ihr Stand ist schon da und wird nicht erneut geladen.
- Lässt SharePoint das Schreiben nicht zu, bleibt alles wie bisher. Die Abschlussmeldung nennt dann die Zahl der unsortierten
  Rohdateien und den Grund; einmal je Sitzung fragt das Tool, ob der Ordner mit OneDrive synchronisiert werden soll
  (`modLaden.OrdnerSynchronisieren`: Kennungen der Bibliothek per Power Query, Abfrage `BUE_SharePoint_Sync` ab AA1, dann
  `odopen://sync`; sonst öffnet sich der Ordner im Browser für „Synchronisieren“ bzw. „Verknüpfung zu OneDrive hinzufügen“).
  Danach findet `BasisOrdner` den synchronisierten Ordner und das Tool arbeitet wieder mit Dateipfad.
- Nicht in Excel getestet (kein SharePoint hier): Ob der Tenant Schreibzugriffe über Power Query zulässt, zeigt das Ladelog
  (`SharePoint-Ablage: moeglich` bzw. `nicht moeglich - <Grund>`).

## 12.81 – Verknüpfung statt Schreiben über Power Query

- Test am 09.10.2026 (Ladelog, Master über „In App öffnen“): `SharePoint-Ablage: nicht moeglich`, die Abfrage brach ohne Antwort von
  SharePoint ab. Power Query schickt POST-Anfragen (Web.Contents mit Inhalt) nur ohne Anmeldung; mit dem Office-Konto lehnt es sie ab.
  Der Fehlertext der Abfrage steht ab 12.81 im Ladelog und in der Meldung (`try` in der Abfrage).
- Verlässlicher Weg, einmal je Person: auf SharePoint beim Ordner der Master-Datei „Verknüpfung zu OneDrive hinzufügen“. Danach findet
  `BasisOrdner` (ProfilSuche) den Ordner im OneDrive-Ordner, auch wenn die Datei über „In App öffnen“ geöffnet wird, und das Tool legt
  die Rohdateien wieder selbst ab. `modLaden.OrdnerSynchronisieren` öffnet dafür den Ordner im Browser (statt `odopen://sync` für die
  ganze Bibliothek).
- Die Abschlussmeldung nennt gescheiterte Ablagen (Zahl, erster Grund) und die Abhilfe – auch im Tagesablauf.

- Nachtrag 12.81: Kein Power Automate im Tenant, Power Query schreibt nicht (Recherche: „POST requests may only be made anonymously“,
  Web.Contents-Referenz). Der Schreibversuch entfällt deshalb. Im SharePoint-Modus bleiben neue Rohdateien liegen; die Meldung sagt
  das ruhig („werden abgelegt, sobald jemand mit OneDrive-Verknüpfung lädt“). Es genügt eine Person mit Verknüpfung: ihr Laden läuft
  mit Dateipfad, öffnet die liegenden (auch schon geladenen) Dateien, legt sie ab und schreibt das Ladeprotokoll auf die neuen Namen um.

## 12.82 – Rohdaten-Ordner über OneDrive-Verknüpfung auch ohne Master-Datei daneben

- Ist die Master-Datei nur als SharePoint-Adresse geöffnet („In App öffnen“), sucht `RohdatenOrdner` jetzt direkt den lokalen
  Rohdaten-Ordner (`LokalFuerOrdner`): erst über die Zuordnung des OneDrive-Clients (Registry, `SyncPfad`), dann unter den
  OneDrive-Ordnern, ihren Unterordnern und den Bibliotheksordnern im Profil (`SuchWurzeln`), mit jedem Ende der Adresse. So zählt
  eine Verknüpfung auf „Rohdaten“, auf „BÜ - HS“ oder auf die ganze Bibliothek „Dokumente“. Ein Ordner gilt nur, wenn darin dieselben
  Dateien liegen wie laut SharePoint-Auflistung (`PasstZurListe`: mindestens drei bzw. alle).
- Vorher wurde nur der Ordner der Master-Datei gesucht (mit der Master-Datei darin). Eine Verknüpfung allein auf „Rohdaten“ – der
  Knopf erscheint in SharePoint in dem Ordner, in dem man gerade steht – wurde deshalb nicht gefunden, die Dateien blieben liegen.
- Gefunden: Laden, Umbenennen und Ablage laufen wie mit Dateipfad; das Ladelog nennt den Ordner. Nicht gefunden: Ladelog-Zeile
  „kein lokaler Ordner …“, Meldung mit Hinweis auf Verknüpfung und OneDrive-Client.

## 12.93 – Ältere Datei aktualisieren (neue Version ohne Neuladen)

Die Master-Datei ist in Benutzung und wird von anderen Dateien verknüpft (z. B. HR Sales Dashboard). Eine neue Version soll
sie ersetzen, ohne dass sie neu beladen werden muss und ohne dass sich Name oder Ort ändern.

- Cockpit, WERKZEUGE: Knopf „Ältere Datei aktualisieren …“ (`modWerkzeuge.UpdateZeigen`, Logik in `modUpdate`). Ablauf: die
  bisherige Datei am gewohnten Ort öffnen („Bearbeitung aktivieren“, Makros dürfen aus bleiben), zusätzlich die neue Datei
  öffnen und dort klicken. Die Karte nennt Datei, Version, Stichtage und Ort.
- `modUpdate.AlteDateiPruefen`: genau eine andere geöffnete Master-Datei (Blätter Cockpit, Fakten, Verlauf, Ladeprotokoll,
  Konfiguration, Filter, Snapshots, Umbuchungen), gleicher Bereich (Konfiguration!F7), Version ab 12.80 und älter als diese
  (Cockpit!O2), gespeichert, nicht schreibgeschützt geöffnet (sonst hat sie jemand anderes offen), keine Beladung (Filter!L28).
- `modUpdate.Ausfuehren`: Sicherung der alten Datei (`SaveCopyAs` nach `Protokolle\Sicherung\<Name>_vor_<Version>_<Zeit>.xlsm`;
  SharePoint ohne Dateipfad: Versionsverlauf), dann übernehmen – Fakten (A:O, R:V, Formeln P/Q aus der Vorlagezeile),
  Umbuchungen (A:J, Q:S, Formeln K:P), Verlauf (Zeile 6 der neuen Version je Stichtag fortgeschrieben, A und AL:AM als Werte),
  Ladeprotokoll, Snapshots (A:F, H2:H3, J2:L41), Dateiinhalt mit Fingerabdruck, Mitarbeiter (A:N, W5:W7), Kalender (Spalten über
  das Datum in Zeile 6; „FT“ der neuen Version bleibt), Konfiguration (nur Eingabebereiche; die Feiertage kommen aus der neuen
  Version), Filter (alle Werte außer Formeln, Postkorbliste B5:C44 genau), SP_Liste J:K und Celonis_Log. Neu berechnen,
  Diagramme anpassen, alte Datei ohne Speichern schließen, diese Datei mit `SaveAs` unter vollem Namen der alten speichern
  (auch https). Die heruntergeladene Datei bleibt unverändert.
- Fehler vor dem Schließen: alte Datei unverändert, Hinweis „diese Datei ohne Speichern schließen“. Fehler beim Speichern: alte
  Datei geschlossen und unverändert, Hinweis auf erneuten Versuch bzw. „Speichern unter“ mit dem genauen Pfad.
- Download-Seite (emailimport): Dateiname mit Version (`BUE_Reporting_Master_12.93.xlsm`), weil Excel zwei Dateien gleichen
  Namens nicht gleichzeitig öffnet; Titel liest die Version aus der Datei; Schritt „Ältere Version schon in Benutzung?“.

## 12.92 – Stand nur einmal laden (doppelter Rückstand)

Im HS-Master (12.90) stand der Rückstand vom 18. bis 22.10.2026 an einzelnen Tagen doppelt (OPAG 18.–21.10., Verbund
18.–20.10. und 22.10.; Eingänge und Abgänge normal). Ursache: Seit 12.69 schreibt jeder normal geladene Stand die
Verkettungs-Angabe in die Spalte Hinweis des Ladeprotokolls („Verkettungskennzeichen: … ausgelassen“ bzw. „ohne Spalte
Verkettungskennzeichen …“). Alle Prüfungen „schon geladen?“ ließen aber nur einen leeren Hinweis oder „erster Stand …“ gelten.
Mit Dateipfad (OneDrive-Verknüpfung, Dateien in der Ablage `JJJJ\MM_Monat`) galt deshalb kein Stand als geladen: ältere
Stände liefen als „übersprungen“ durch, der zuletzt geladene Stand jeder Quelle (Stichtag = letzter Stand) wurde beim nächsten
Laden noch einmal verarbeitet – gegen den eigenen Snapshot, also Rückstand doppelt, Eingänge und Abgänge 0. Im SharePoint-Modus
ohne Dateipfad trat es nicht auf (`DateiSchonGeladen` prüft dort den Dateinamen ohne Hinweis). Im Bereich MAKLER rechnete jedes
Laden die älteren Stände als Nachzügler neu (langsam, aber ohne Doppel) und hängte je Stand eine Protokollzeile an.

- `StandGueltig` entscheidet zentral, ob eine Protokollzeile als geladener Stand zählt: leer, „erster …“ und die
  Verkettungs-Angabe ja; „übersprungen“, „ersetzt“, „neu gerechnet“, „doppelt im Ladeprotokoll“, „keine Datensätze“ nein.
  Alle Stellen nutzen sie (`ProtokollLesen`, `GeladenLesen`, `GeladeneStaende`, `ProtokollErsetztMarkieren`,
  `DateiTraegtGueltigenStand`, `RohdateiGeladen`, `AeltesterVorgang`). Damit greifen auch Ersatz-Frage, Ersetzen (spätere
  Stände werden nachgerechnet) und die Markierung „geladen“ unter „Rohdaten löschen …“ wieder.
- `DoppelteStaendeBereinigen` (am Anfang von „Neue Daten laden“, nur wenn das Ladeprotokoll einen Stand mehrfach gültig
  führt): Fakten behalten je Stichtag, Quelle, Sparte, VSS, Postkorb, GeVo, Einheit und Strang die erste Zeile (ein Durchlauf
  schreibt jeden Schlüssel genau einmal); im Ladeprotokoll bleibt bei gleicher Datei die erste Zeile, die weiteren heißen
  „doppelt im Ladeprotokoll – am … bereinigt (12.92)“, bei verschiedenen Dateien die letzte (frühere: „ersetzt …“). Danach
  `VerlaufGrenzenNeu`. Die Abschlussmeldung nennt die bereinigten Stände. Rohdateien werden dafür nicht geöffnet.

## 12.91 – Makler ignoriert HS-Abzüge

Im Makler-Master standen am 14.10.2026 HS-Daten: HS-Abzüge (OE HSB4 K) lagen im Ordner Rohdaten des
Makler-Reportings und wurden mitgeladen – als Einheit HSB, teils der größten Makler-Einheit des Blatts zugeschlagen und
dann als Eingänge gezählt (Rückstand OPAG +31.396, Verbund +13.974 gegenüber KW 41).

- Zeilen der HS-Einheit (`HS_EINHEITEN` = HSB, HS; Einheit aus OE_NR wie bisher über `EinheitAusOE`) zählen im Bereich
  MAKLER nirgends mit: `GruppeErkennen` zählt sie getrennt, `GruppenEinheit` nimmt sie nie als Strang, `StaendeVerarbeiten`
  überspringt sie; das Ladeprotokoll vermerkt „… Zeilen der HS-Einheit (OE HSB4 K) ignoriert“.
- Ein Blatt nur mit HS-Zeilen ist kein Stand (`BlattErkennen` setzt `blattNurHs`). Eine Datei ohne Makler-Stand, aber mit
  solchen Blättern, ist ein HS-Abzug (`HsAbzugAusmustern`): nicht geladen, nicht an Celonis übergeben, umbenannt in
  `…_HS-ignoriert` (wird wie `…_verworfen` nicht mehr gelesen, `AusgemustertName`); auf SharePoint ohne Dateipfad im Tool
  ausgeblendet. Die Abschlussmeldung nennt die Dateien.
- Stehen schon HS-Zeilen in den Fakten (`HsDatenGeladen`, Einheit HSB in Fakten!R), leert „Neue Daten laden“ das Tool
  (`ToolLeeren` ohne Anwesenheit) und lädt alle Abzüge ohne die HS-Zeilen neu. Danach die Standard-Postkörbe prüfen.
- Blatt Dateiinhalt: der Fingerabdruck trägt die HS-Regel, ältere Einträge werden einmal neu geprüft.

## 12.90 – Textdateien im Ordner Protokolle

Sperrdatei (`<Master>_Beladung.txt`), `Celonis_Upload_Log.txt` und `Ladelog.txt` liegen jetzt im Unterordner `Protokolle`
neben der Master-Datei statt direkt daneben. Mit Dateipfad (lokal, OneDrive) legt das Tool den Ordner an und zieht eine
Datei vom bisherigen Ort beim ersten Zugriff dorthin um (`ProtokollPfad`). Auf SharePoint ohne Dateipfad kann Excel keinen
Ordner anlegen: Gelesen wird zuerst in `Protokolle`, sonst am bisherigen Ort (`SpTextFormel` mit Unterordner); geschrieben
wird nach `Protokolle`, fehlt der Ordner, wie bisher neben die Master-Datei (`SpTextSpeichern`). Den Ordner also einmal im
Browser anlegen; die alten Textdateien neben der Master-Datei können danach weg (das Celonis-Protokoll erst, nachdem es
einmal in `Protokolle` geschrieben wurde – sonst geht die Liste der übergebenen Dateien verloren).

## 12.89 – Produktivität der laufenden KW hochgerechnet, Vorwoche in der Kachel

Solange in der neuesten KW der Stand ihres letzten Werktags fehlt (der Freitag
kommt erst am Montag), rechnet das Tool die Wochenproduktivität hoch: Abgänge bisher ÷ Ø MAK der bisherigen
Arbeitstage × Arbeitstage der KW (Mo–Fr ohne Feiertage) ÷ Arbeitstage bis zum
letzten Stand (KW!BK:BO; Faktor 5/1, 5/2 … bis Freitag geladen ist). Säulen,
Linie, Kachel und PPT-Boxen zeigen den hochgerechneten Wert, Untertitel und
Kachel sagen „hochgerechnet (1 von 5 Tg.)“. Die Kachel nennt in Zeile 1 die
Vorwoche als Vergleich (grün höher, gelb niedriger). Zu kleine Säulen der
Produktivitätsdiagramme tragen ihren Wert darüber (modCockpit.EtikettenUeberSaeule).
Die Übernahme der Anwesenheit aus der Vorversion (12.87) ist wieder entfernt.

Gleiche MIS-O-Dateinamen: Die Ausblendliste (SP_Liste!J, jetzt mit Größe in K)
und „schon geladen“ (`DateiSchonGeladen`, über Blatt Dateiinhalt) gelten bei
MIS-O-Namen nur noch für dieselbe Datei (gleiche Größe). Vorher konnte ein neuer
Abzug, der wie ein früher ausgeblendeter hieß, ungeladen zu …_verworfen werden,
und ein auf SharePoint ersetzter gleichnamiger Abzug wurde nie geladen. Die
Kennung im Blatt Dateiinhalt ist jetzt die Größe (gleich bei SharePoint und
OneDrive).

## 12.88 – Makler: Stand je Einheit, Nachzügler, Blatt Dateiinhalt, Bearbeiter MSUED

MIS-O verteilt die Einheiten nicht jeden Tag gleich auf die Dateien. Bisher war
die Gruppe der Datei („MSUE+ODPB“) der Strang – wechselte die Aufteilung, fehlten
Eingänge/Abgänge oder Rückstände doppelten sich. Jetzt ist jede Einheit aus
Konfiguration!R11:R40 ein eigener Strang (`BlattErkennen` liefert die Einheiten
eines Blatts, `StaendeVerarbeiten` rechnet alle Einheiten eines Stichtags in einem
Durchgang, auch aus mehreren Dateien; ein Wechsel zwischen ihnen ist eine
Umbuchung). Zeilen anderer OEs zählen zur größten Einheit des Blatts. Kommt der
Bericht einer Einheit nach späteren Tagen derselben Einheit, fügt
`StandErsetzen(…, einfuegen:=True)` ihn ein und rechnet die späteren Tage nach
(fehlt eine Rohdatei: übersprungen wie bisher). Ein nachgereichter Stichtag wird
im Verlauf an seiner Stelle eingefügt. Jedes Blatt wird je Laden nur einmal
gelesen, Snapshot und Fakten einmal je Stichtag geschrieben.

Neues Blatt „Dateiinhalt“: je Rohdatei und Blatt Quelle, Stichtag, Einheiten und
Zeilen; eine bekannte Datei (Name, Größe, Änderungszeit) wird zum Erkennen nicht
mehr geöffnet. Ändert sich die Einheiten-Zuordnung, baut es sich neu auf.

Makler-Dateien aus 12.87 oder älter mit Gruppen-Strängen: Das Laden bittet einmal
um „Zurücksetzen …“ (ohne Anwesenheit) und neues Laden.

Bereich Makler: die BÜ-Bearbeiter der Vertriebsunterstützung MSUED (Mail
K. Staudt, 13.10.2026) legt das Tool zusätzlich zum Anwesenheitsplan im Blatt
Mitarbeiter an (Einheit MSUE, Komposit, Kapazität 1).

## 12.87 – Anwesenheit aus der Vorversion, „nur“-Knopf bei Einheiten

Neue Master-Datei auf SharePoint (z. B. BUE_Reporting_Master_2.xlsm neben der
bisherigen BUE_Reporting_Master.xlsm): Steht beim ersten „Neue Daten laden“
noch niemand im Blatt Mitarbeiter, übernimmt `modLaden.AnwesenheitAusVorversion`
Mitarbeiter (A:N, W5:W7) und alle Kalendereinträge aus der ersten anderen
Datei `BUE_Reporting*.xlsm` im selben Ordner (gleicher Bereich HS/Makler,
ohne Demo), deren Blatt Mitarbeiter gefüllt ist. Die Kalenderspalten werden
über das Datum in Zeile 6 zugeordnet. Lokal über `Dir`, auf SharePoint über die
Power-Query-Liste; geöffnet schreibgeschützt ohne Makros. Danach läuft die
Anwesenheit wie gewohnt (Plan wird aufgefrischt). Die Abschlussmeldung nennt die
Quelle. Anschließend kann die alte Datei gelöscht und die neue umbenannt werden.

Einheiten-Chips (Makler): rechts im Chip ein Knopf „nur“ – zeigt ausschließlich
diese Einheit (alle anderen aus, kein Umschalten); „Alle Einheiten“ hebt das auf.

## 12.86 – Einheiten-Chips (Makler)

Im Bereich Makler stehen links zwischen Sparten und Themenpostkörben bis zu
sechs Einheiten-Chips mit Knopf „Alle Einheiten“ (Chip-Nummern 301–306,
`modCockpit.ChipSchalten`, `FilterAlleEinheiten`). Namen und Zustand liegen in
Filter!X5:Y10 (Namen `EH_Liste`, `EH_Aktiv`), gesetzt nach jedem Laden von
`modLaden.EinheitChipsSetzen` (bekannte Einheiten behalten ihren Zustand).
Die Aktiv-Kennzeichen in Fakten (P) und Umbuchungen berücksichtigen die
Chips; damit folgen alle KPI-Kacheln und Diagramme. MAK und Produktivität
folgen über Wirksam (Spalte rechts der Tage: 1 = Einheit der Person im
Filter) in den Tagessummen des Kalenders – sofern Mitarbeiter!B die Einheit
genauso nennt wie die Abzüge. „Auf Standard zurücksetzen“ schaltet alle
Einheiten wieder ein. Die Filterzeile der Folie nennt abgewählte Einheiten.

## 12.85 – Etiketten kleiner Segmente ohne Überlagerung

Passen mehrere Segmente einer Säule nicht für ihre Zahl (z. B. Leben 187 und
Sonstige 13 in „Rückstand je KW“), stehen die Zahlen rechts neben der Säule.
Bisher wurde jedes Etikett nur gegen das zuletzt gesetzte geprüft, so dass
zwei Zahlen aufeinander liegen konnten. Jetzt sammelt `EtikettenAuslagern`
(modCockpit) alle ausgelagerten Etiketten einer Säule und stapelt sie von
oben nach unten ohne Überlappung; der Build (`etiketten_saeulen`) macht es
für die Vorbelegung genauso.

## 12.84 – SharePoint-Wiederholung, GR/AZ aus dem Standard, Ø Alter, Stand mit KW

SharePoint antwortet beim Erstladen vieler Rohdateien gelegentlich kurz nicht
(Fehler 1004 „kann auf die Datei nicht zugreifen“). Bisher brach das Laden dann
ab und musste mit „Nochmal laden“ fortgesetzt werden. Jetzt versucht
`QuelleOeffnen` eine https-Datei bis zu viermal (Pausen 3, 6, 9 Sekunden) und
schreibt jeden Fehlversuch ins Ladelog. Erst wenn alle Versuche scheitern,
erscheint die Fehlermeldung. Lokale Dateien werden wie bisher einmal geöffnet.

Standard der Themenpostkörbe (HS): GR und AZ gehören nicht mehr zur
Voreinstellung, Standard ist KO und MV. Neue HS-Postkörbe aus den Abzügen
kommen mit „nein“ in die Standard-Auswahl und mit ausgeschaltetem Chip ins
Cockpit (bisher war der Chip an). In einer bestehenden Datei GR einmal über
„Standard festlegen“ abwählen.

Der Stand im Cockpit-Kopf zeigt zusätzlich die Kalenderwoche, z. B.
„STAND 11.10.2026 (KW 41)“. Die Zeile „vorheriger Stichtag“ darunter entfällt.
Darunter steht die Beschreibung in Zeile 3 und „Quellen: MIS-O EINZEL
Rohdatenabzüge“ in Zeile 4 (vorher wurde die lange Zeile vom Stand-Feld
abgeschnitten).

Neue Kachel **Ø Alter** neben „Ältester Vorgang“: Durchschnittsalter des
Rückstands am letzten Stichtag, groß Verbund, darunter OPAG. Grundlage ist
die neue Fakten-Spalte V „Alter Summe (Tage)“ (Lader `StandVerarbeiten`,
`FaktenEntfernen`, `ToolLeeren`; Demo über `verarbeitung.py`). Daraus
rechnen Filter!Q47/Q48, Verlauf!BI/BJ (je Stichtag) und Diagrammdaten!CA/CB
(7 Perioden je Ansicht). Die acht Kacheln teilen sich das Raster I:BF mit
den Breiten 6, 6, 6, 4, 5, 5, 6, 5. Stände, die vor 12.84 geladen wurden,
haben keine Alterssumme und bleiben leer. Nach „Zurücksetzen“ und neu Laden
sind alle Stände gefüllt.

Neues Diagramm **„Ø Alter der Vorgänge“** (Linie OPAG und Verbund, 7 Perioden
der Ansicht) rechts neben der Altersstruktur. Die MAK-Kapazität steht dafür
in voller Breite in der untersten Zeile.

Altersstruktur: „über 90 Tage“ ist schwarz. Passt die Zahl nicht ins
Segment, steht sie rechts neben dem Balken als „> 90 Tage: 3“ (vorher nur
„3“).

## 12.83 – Stand neben der Version, KPI-Kacheln je Ansicht

- Kopf: „STAND TT.MM.JJJJ“ groß in Petrol direkt neben der Version (W2:AJ2), gelb als „BEZUGSTAG …“, wenn ein früherer Stichtag
  gewählt ist; darunter der vorherige Stichtag. Die kleine Anzeige rechts oben entfällt.
- KPI-Kacheln folgen der Ansicht (Hilfszellen Diagrammdaten!BY:BZ): Wochensicht = Rückstand der letzten KW wie die Säule rechts,
  Veränderung zur Vorwoche wie das Badge („+373 ggü. KW 40“), Eingänge/Abgänge Verbund (und OPAG darunter) = Summe der KW;
  Aktuelle KW = Rückstand am Stichtag, Eingänge/Abgänge = Summe der Tage der KW bis zum Bezugstag; Tagessicht wie bisher.
