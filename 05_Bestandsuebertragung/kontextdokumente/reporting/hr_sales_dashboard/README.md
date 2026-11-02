# HR Sales Dashboard

Neuaufbau des Dashboards „2025_Dashboard_HS_OPAG.xlsm“ als `HR_Sales_Dashboard.xlsm`. Gebaut wird die Datei aus der
bisherigen Datei (`quellen/quelle/`) mit `python3 quellen/dashboard_build.py`. Rohdaten, Kommentare und Bilder werden
übernommen, Diagramme und Kacheln neu erzeugt.

## Blätter

| Blatt | Inhalt |
|---|---|
| Start | Startseite: Berichtstag (◀ ▶, Automatisch), **Start · Werte eintragen**, Kommentare, PowerPoint, **Zuordnung anpassen**, **BÜ-Reporting verknüpfen**, **Werte aus HS-Dashboard 2025**, Stand je Person (offen, erledigt, Pflichtwerte; nur Personen mit Pflichtwerten) |
| Übersicht | letzter und davor liegender Eintrag je Kennzahl mit Veränderung |
| Deckblatt | Titelfolie (bisher PPT_1) |
| PPT_2 | Serviceparameter (BÜ-Kacheln, 10 KW wie die übrigen Kennzahlen: oben „Bestand (Tsd.)“ je Sparte gestapelt, Summe über jeder Säule, Werte je Sparte nur bei den letzten zwei KW rechts daneben (Reihenfolge des Stapels), SLA gestrichelt mit Wert rechts neben der Überschrift, unter der KW-Nummer das Δ zur Vorwoche als farbige Zahl; unten „Vorgänge je KW (Tsd.)“ – Eingänge rot und Abgänge grau nebeneinander, Werte der letzten zwei KW daneben, unter der KW der Saldo. Alle Werte sind auf die höchste Säule normiert und die Achsen fest, damit Excel nichts selbst skaliert; Datenreihen in Dashboard_Daten ab Spalte Z): BÜ Verbund, BÜ OPAG (Rückstand, Eingänge/Abgänge nach Sparte), Neueinstellungen, Provisionsreklamation AO und Makler, Buchauszug, Ausgleichsanspruch |
| PPT_3 | ext. Faktoren & HS-Ressourcen |
| Rohdaten | Wochenwerte: Zeilen und Spalten 1:1 wie bisher, Formeln vereinheitlicht (Summen, Δ, Y/X-Kennung). Darunter die Monatsblöcke „Mitarbeiter-Kapazitäten“ (bisher Rohdaten_2, MAK 21a–21c mit Verknüpfung auf die Mig-Max-Namensliste) und „Neuverpflichtung“ (bisher Rohdaten_3, 18D …): je Block eine Kopfzeile mit „Monat“ in Spalte A, den Monaten 08.2025–01.2028 (Δ dazwischen) und dem früheren Blatt in Spalte F (ausgeblendet). Die Monate stehen in den Spalten der aktuellen KW (rechtsbündig an der letzten KW), Aug–Okt 2025 wie alte KW eingeklappt. Vormonat des Berichtstags gelb. Erledigungsquote 18E rechnet sich aus fristgerecht erledigt / Gesamt (eine eingetippte Quote bleibt stehen). |
| Kommentare | Text je Kachel für das Kommentarfeld der Folie |
| Zuständigkeiten | Zuordnungs-Cockpit: Kennzahlen nach Thema (Band, einklappbar; Themen ohne Pflichtwert eingeklappt) und Kategorie gegliedert, je Person eine Spalte (Punkt = liefert), Pflicht ja/nein/automatisch (= auf PPT_2/PPT_3 berichtet; BÜ und MAK automatisch), Zyklus (wöchentlich, monatlich, quartalsweise; im Bearbeiten-Modus per Klick), Status am Berichtstag nach Zyklus: wöchentlich = Wert in der Spalte des Berichtstags, monatlich/quartalsweise = Monatszeilen der Vormonat bzw. letzte Monat des Vorquartals, Wochenzeilen ein Wert im laufenden Monat bzw. Quartal („nicht berichtet“ grau); gesperrt, bis „Zuständigkeiten bearbeiten“ geklickt wird; **KPI löschen** |
| Konfiguration | Berichtstag, SLA (Provisionsreklamation C9; BÜ Verbund F9, BÜ OPAG F10 – leer = Vorschlag F11 = SLA Verbund × Ø Rückstand OPAG/Verbund, auf 100 gerundet; Legendentext G9/G11), Folientitel, Personenliste, Ordner, verknüpfte BÜ-Datei, HS-Dashboard 2025 (C62 Datei, C63 zuletzt übernommen) |
| BUE_Serviceparameter, Dashboard_Daten, Feiertage | Hilfsblätter |

## Datenstand der Vorlage (09.10.2026)

Neueste Quelle ist die Arbeitsfassung `quelle/2026_HR_Sales_Dashboard_WIP9.xlsm` (vom Fachbereich gepflegt): eingetippte Werte in
Rohdaten (u. a. Berichtstag 09.10.2026), Verantwortliche in Spalte E, die Punkte in Zuständigkeiten (neue Kollegen, z. B. Köster bei 19,
Buchkremer/Wielpütz bei 12), die Personenliste, zwischengespeicherte MAK-Werte und die Pfade Konfiguration C10 (BÜ-Reporting auf
SharePoint „BÜ - HS“) und C62. Formelergebnisse werden nicht übernommen (die Formeln schreibt der Build selbst fort).
Ältere Nachträge (Stand 07.10.2026):

Basis bleibt `quellen/quelle/2025_Dashboard_HS_OPAG.xlsm` (BÜ-Zeilen 7VA–7OL). `quelle_lesen.py` trägt je Code und Datum nach:
aus `quelle/2025_Dashboard_HS.xlsm` (vom Fachbereich weitergeführtes altes Dashboard, Stand Berichtstag 02.10.2026) alle Werte außer
7V*/7O*, Rohdaten_3 vollständig (Monat September) und die Kommentartexte der Folien; aus `quelle/2026_HR_Sales_Dashboard_WIP2.xlsm`
(Arbeitsfassung) die BÜ-Werte 7V*/7O* aus der Verknüpfung zum BÜ-Reporting. Überschrieben werden nur Datumszellen ohne Formel.
Konfiguration C10 nennt die BÜ-Datei `H:\MaklerBUe\Reporting MISO\BUE_Reporting_Master.xlsm`. Für eine neue Woche die beiden Dateien
in `quelle/` ersetzen und neu bauen.

## Abläufe (Makros)

- **Start** (`modStart`): „Wer bist du?“ → Liste der offenen Pflichtwerte der Person für den Berichtstag → je Wert ein
  Fenster mit Kennzahl, Vorwochenwert und Eingabefeld; die Zelle in Rohdaten ist rot umrandet zu sehen, wird aber nicht
  angeklickt. „Übernehmen“ schreibt den Wert (deutsches Zahlenformat, z. B. 1.234 oder 12,5), „Überspringen“ geht weiter.
- **Zuordnung anpassen** (`modZuordnung`, Blatt Zuständigkeiten): Das Blatt ist gesperrt (Blattschutz, Klicks ändern nichts).
  „Zuständigkeiten bearbeiten“ schaltet frei (Konfiguration!C59 = 1, freie Felder gelb): Klick auf eine Personenspalte setzt
  oder entfernt den Punkt, Klick in „Pflicht“ schaltet ja/nein. „Person hinzufügen“ und „Person entfernen“ (Fenster mit
  Auswahl und Bestätigung) erscheinen nur dann; Namen und Punktspalten werden dabei alphabetisch neu sortiert.
  „Fertig · sperren“ sperrt wieder, beim Öffnen ist das Blatt immer gesperrt. Umbenennen in Konfiguration B28:B57.
  Gliederung: Thema als Band (einklappbar über +/−), darunter die Kategorie (z. B. „1b Offene Vorgänge“) und die Abteilungen.
  Spalte AM (ausgeblendet) hält den vollen Namen „Thema · Kategorie · Abteilung“ für den Assistenten, AN den Code.
- **Kommentare bearbeiten** (`modKommentar`): Fenster je Folie, Kachel links wählen, Nummer, Überschrift und Text rechts.
  Jede Zeile wird ein Punkt, Zeilen mit „-“ werden Unterpunkte. Das Kommentarfeld ordnet sich selbst, bei Platzmangel
  wird die Schrift kleiner. Die Texthöhe wird gemessen und zusätzlich aus Zeichen je Zeile geschätzt (der größere Wert zählt), weil
  Excel die automatische Größe nicht immer sofort nachzieht. Lage und Breite richten sich nach der tatsächlichen Breite von
  `DEKO_Folie`: Excel zeichnet die fest verankerte Folie je nach Rechner waagerecht etwas schmaler oder breiter als 960 pt,
  ohne diesen Faktor ragte der Text rechts aus dem grauen Feld.
- **PowerPoint erzeugen** (`modPPT`): Folien wählen, dann Export auf die Vorlage (Knopf „Vorlage wählen …“ im Fenster, Pfad in Konfiguration C13; leer = `H:\MaklerBUe\Reporting MISO\Vorlage\ERGO_Vorlage.pptx`, ersatzweise derselbe Ordner als `\\CORP.ERGO\public\…`, zuletzt `Vorlage\ERGO_Vorlage.pptx` neben der Datei)
- **Diagramm anpassen** (`modKW`, Knopf über jeder Dashboard-Folie): Kachel wählen, dann Kalenderwochen mit − / + (4 bis 26 KW, Monatskacheln 2 bis 10 Monate; die Kachel Mitarbeiter-Kapazitäten hat feste Monate ohne − / +, dort heißt „Letzte 2“ „Nur Planmonate“) und je Wert der Kachel „Alle“, „Letzte 2 KW“ (wie die Werte neben den BÜ-Säulen) oder „Aus“. Die Balken für Zunahmen/Abnahmen haben zusätzlich eine zuschaltbare Delta-Zeile (Zunahmen − Abnahmen) unter der Achse. Grundlage ist das Verzeichnis in Dashboard_Daten rechts neben den BÜ-Plätzen (Kopf „Verzeichnis: Blatt“); Dashboard_Daten hält 27 Wochen, die Diagramme zeigen die letzten n davon. Die BÜ-Kacheln rechnen ihre Plätze aus `KW_7V` / `KW_7O` (Spalte D). Die Fußnote der Folien nennt die größte gezeigte KW-Spanne (Dashboard_Daten!B3).
  (Titel-Layout und Layout „3/4“), Ablage im Ordner `Praesentationen`.
- **BÜ-Reporting verknüpfen** (`modVerknuepfung`): BUE_Reporting_Master.xlsm wählen; die Zeilen 7VA–7OL in Rohdaten
  holen ihre Werte dann über Zeile und Datum aus dem Blatt „Rohdatenblatt“. Von Hand eingetragene Werte bleiben stehen.
- **KPI löschen** (`modKpiLoeschen`, Knopf im Blatt Zuständigkeiten neben „Zuständigkeiten bearbeiten“): Kennzahlen samt ihren
  Zeilen aus Rohdaten, Wertstand, Zuständigkeiten und Übersicht entfernen (Einzelheiten unter Stand 12.68).
- **Werte aus HS-Dashboard 2025** (`modAltWerte`): holt einmalig die Zahlen der übrigen Kennzahlen (nicht BÜ) aus dem
  bisherigen Dashboard „2025_Dashboard HS.xlsm“ – erst Trockenlauf mit Zusammenfassung, dann „Leere Felder füllen“ oder
  „Auch abweichende überschreiben“ (Einzelheiten unter Stand 12.68).

## Prüfen

```bash
cd quellen
python3 dashboard_build.py                       # baut und prüft die VBA-Quellen (Abbruch bei Befunden)
python3 lo_vba_check.py ../HR_Sales_Dashboard.xlsm   # Module in LibreOffice laden und aufrufen
```

Schrift in Zellen, Formen und Diagrammen: Liberation Sans (metrisch gleich Arial; wo sie nicht installiert ist, setzt Office eine Ersatzschrift gleicher Breite).

Folienblätter (PPT_1–PPT_4): Formen und Diagramme sind absolut (in EMU) verankert, nicht an Zellen. Excel rechnet Spaltenbreiten über die Standardschrift um; an Zellen verankert wurde die Folie je nach Rechner breiter und die Diagramme flacher. Seit 12.66 rechnet die Verankerung mit derselben Spaltenbreite wie xlsxwriter (69 px); vorher war die Folie im Blatt rund 7 % gestaucht.

Prüfen der Darstellung ohne Excel: Beschriftungen aus Zellen (Summen, Spartenwerte, Zu-/Abnahmen, Delta-Zeile) wertet weder LibreOffice noch ONLYOFFICE aus. Für die Sichtprüfung deshalb erst mit Demo-Werten in LibreOffice rechnen, die berechneten Texte in eine Kopie einsetzen und dann rendern. ONLYOFFICE Docs Community (Konverter `x2t`, AGPL, ohne Wasserzeichen) zeigt die Zahlen über den Zu-/Abnahmen richtig (Trägerbalken auf der zweiten Achse), LibreOffice verschiebt diese. Echtes Excel fürs Web (Office-Online-Viewer `view.officeapps.live.com`) braucht eine öffentlich erreichbare Datei-URL. Aspose.Cells setzt ohne Lizenz ein Wasserzeichen.

Startseite: „PPT-Vorlage verknüpfen“ speichert den Pfad der Vorlage in Konfiguration C13; der Export verwendet sie.

Stand 12.61 – SharePoint ohne OneDrive: `modBasis.BasisOrdner` löst eine https-Adresse wie im BÜ-Reporting auf (Konfiguration C12 auch als Browser-Adresse, synchronisierte Bibliothek laut Registry, WebDAV `\\host@SSL\DavWWWRoot\…` mit kurz geöffnetem Explorer-Fenster, Ordner im Profil). PPT-Vorlage (C13) und BÜ-Datei (C10) dürfen SharePoint-Adressen sein: „Vorlage wählen …“ und „BÜ-Reporting verknüpfen“ fragen nach Abbruch des Datei-Dialogs nach der Adresse aus der Adresszeile des Browsers (Ordner oder Datei; `…AllItems.aspx?id=/sites/…` wird verstanden). PowerPoint öffnet die Vorlage direkt über https, die Verknüpfung läuft über die SharePoint-Adresse. Ist der Ordner nicht als Dateipfad erreichbar, bleibt die Präsentation offen statt einer Kopie in „Praesentationen“.

Stand 12.62 – kein Warten mehr auf WebDAV: `WebDavOrdner` startet kein Explorer-Fenster und wartet nicht 15 s; WebDAV wird nur versucht, wenn der Windows-Dienst WebClient bereits läuft (Microsoft hat ihn 11/2023 abgekündigt, er startet nicht mehr von selbst). C12 als Browser-Adresse wird nicht mehr in WebDAV umgesetzt; Vorlage (C13) und BÜ-Datei (C10) laufen immer direkt über https. Das Ergebnis der Ordnersuche gilt je Sitzung, auch wenn keiner gefunden wurde. Die PPT-Kopie landet ohne Dateipfad in `Praesentationen` auf SharePoint (wenn der Ordner dort besteht), sonst in „Dokumente“.

Stand 12.65 – BÜ-Datei automatisch finden: „BÜ-Datei verknüpfen“ sucht zuerst selbst (`BueSuchen`/`BueKandidaten`). Liegt das Dashboard auf SharePoint, eine Ebene höher im Ordner „BÜ - HS“ (auch „BÜ/BÜ - HS“ und beides eine weitere Ebene höher, nicht über die SharePoint-Seite hinaus), danach Konfiguration C10; lokal zuerst C10. Die erste Datei, die sich öffnen lässt (schreibgeschützt, ohne Makros), wird zur Bestätigung angeboten; sonst wie bisher Dateiauswahl bzw. Adresse aus dem Browser.

Stand 12.66 – Diagramme und Bedienung:
- BÜ-Kacheln: keine ausgeklappte KW mehr, je KW ein Platz. „Offene Vorgänge (Tsd.)“ gestapelt in den Sev-Farben (Komposit Magenta, Gesundheit Grau, Leben Schwarz), Summe über jeder Säule, Spartenwerte in jeder KW klein im Balken (Kästen in Spartenfarbe; reicht ein Segment nicht, rutscht der Kasten unter den darüber). Zu-/Abnahmen rot/grün direkt nebeneinander, so breit und hoch wie in Provisionsreklamation und Defects. Die Zahl steht mittig über dem eigenen Balken; bei fast gleich hohen Balken eine Zeile versetzt. Technisch sind das unsichtbare Trägerbalken auf der zweiten Achse.
- Nettoveränderung (Zunahmen minus Abnahmen) nur unter den Zu-/Abnahmen, farbig unter der KW, als eigener durchsichtiger Streifen unter jedem Diagramm. So stehen die KW-Zahlen aller Diagramme einer Reihe auf derselben Höhe. Gilt auch für Provisionsreklamation AO und beide Defects-Kacheln.
- Defects: Sev-Stufen gestapelt, jeder Wert (auch 0) als Kasten in Stufenfarbe, Summe darüber, Grundlinie unter den Säulen. Watchlist wie vorher: Linie „Überwachte VNRs (in Tausend)“ ohne Nachkommastelle, darunter je KW Kästen „Treffer VNRs“ (Magenta), „In Bearbeitung“ (Grau), „Erledigt“ (Schwarz). Neueinstellungen: Anzahl weiß in der grauen Säule, Quote schwarz darüber. Legenden überall „Zunahmen in aktueller KW“ / „Abnahmen in aktueller KW“.
- SLA OPAG ohne festen Wert: Legende „SLA 12,3 (Faktor 2,24) TBC“, Faktor = Ø OPAG/Verbund der letzten 10 KW.
- Deckblatt (PPT_1) wie im bisherigen Dashboard: Bild über die ganze Folie, halbtransparente Flächen mit Titel, Untertitel und Stand in Magenta (Calibri), Logo, gedrehter Kreis „Vertraulich“. Der PowerPoint-Export kopiert diese Formen 1:1 auf eine leere Folie der Vorlage.
- Knopf „Kacheln ein-/ausblenden“ auf PPT_2 bis PPT_4 (`modKacheln`): ein Klick blendet eine Kachel aus oder wieder ein, die übrigen ordnen sich neu an (bis drei in einer Reihe, sonst oben die kleinere Hälfte: 7 → 3 + 4, 6 → 3 + 3, 5 → 2 + 3). Nummern bleiben, ausgeblendete Kacheln gehen nicht in die PowerPoint. Kommentare zu einer ausgeblendeten Kachel bleiben im Kommentarfeld, bis sie geleert werden.
- Kommentar-Editor zeigt die Aufzählung wie das Kommentarfeld: Enter im Feld = neuer Punkt, „-“ am Anfang = Unterpunkt, „*“ = wieder Hauptpunkt. Die Knöpfe „Punkt/Unterpunkt“ sind weg, weil Excel während der Texteingabe keine Makros ausführt.
- Start „Wer bist du?“: Umschalter „Nach Person“ / „Nach Kennzahl“. Die Kennzahlen-Sicht listet alle offenen Pflichtwerte des Berichtstags mit Code, Kennzahl und Zuständigen (12 je Seite); ein Klick springt in die Zelle und führt durch die weiteren offenen Werte.

Stand 12.67 – Wochen mit Daten, Stand der Werte:
- Jede Kachel endet bei ihrer letzten KW mit Daten (z. B. BÜ Verbund bei KW 39, wenn das BÜ-Reporting noch keine neueren Werte hat), statt leere Wochen bis zur KW des Berichtstags zu zeigen. Technisch hat jede Kachel ein eigenes Fenster in Dashboard_Daten: eine Hilfszeile (`_H…`, KW-Index, wenn eine Reihe der Kachel dort eine Zahl hat), die letzte KW (`_L…`) und die Fensterzeilen `F_…` ab Spalte F0; die BÜ-Plätze und die Normierung der Zu-/Abnahmen rechnen mit derselben letzten KW. Die SLA-Linie zählt nicht als Daten. Fußnote: „Wochenwerte: je Kachel die letzten KW mit Daten, höchstens bis KW … (Berichtstag …)“.
- Kachelkopf rechts „Stand: TT.MM.JJ“ – das Datum, zu dem die Werte der letzten KW gelten (größtes Datum der Codes der Kachel im ausgeblendeten Blatt `Wertstand`, ohne Eintrag der Berichtstag dieser KW). Reicht der Platz nicht, steht der Stand zweizeilig („Stand:“ / Datum) und die Überschrift wird kleiner (bis 6 pt). „Kacheln ein-/ausblenden“ hält den Stand am rechten Rand.
- Blatt `Wertstand` (ausgeblendet, gleicher Aufbau wie Rohdaten): je Wertzelle das Datum, zu dem die Zahl gilt. Der Assistent „Werte eintragen“ fragt bei jedem Wert „Stand der Zahl (TT.MM.JJJJ)“, vorbelegt mit heute bzw. dem zuletzt eingegebenen Stand; ein Datum in der Zukunft wird abgewiesen, „TT.MM.“ ohne Jahr nimmt das laufende Jahr (liegt es in der Zukunft, das Vorjahr). „BÜ-Datei verknüpfen“ verknüpft für die BÜ-Zeilen auch den Stand: Zeile 160 (Verbund) bzw. 161 (OPAG) des Rohdatenblatts im BÜ-Reporting (ab 12.67) – nach einem Update des BÜ-Reportings einmal neu verknüpfen.
- Start: Abschnitt „BÜ-Werte · automatisch aus dem BÜ-Reporting“ je Verbund und OPAG: grün „aktuell · KW … · Stand: …“, rot „fehlt für KW …“ mit der letzten KW und ihrem Stand, wenn die Werte nicht bis zur KW des Berichtstags reichen.
- Zu-/Abnahmen: Die Zahlen stehen etwas nach außen versetzt (Zunahmen nach links, Abnahmen nach rechts, über geschützte Leerzeichen im Beschriftungstext), damit ein höherer Nachbarbalken sie nicht verdeckt.

Stand 12.68 – Werte aus dem HS-Dashboard 2025, Zirkelbezug, Rahmen, Watchlist:
- Startseite: Knopf „Werte aus HS-Dashboard 2025“ (`modAltWerte`, rechts neben „PPT-Vorlage verknüpfen“) holt einmalig die Zahlen der übrigen Kennzahlen (nicht BÜ) aus dem bisherigen Dashboard, das der Fachbereich bis zur Umstellung weitergeführt hat. Darunter steht, was zuletzt übernommen wurde (Konfiguration C63, „N Werte übernommen am TT.MM.JJJJ hh:mm“; ein Lauf ohne geschriebene Werte ändert C63 nicht), sonst „noch nichts übernommen“ bzw. „noch nichts übernommen (Datei gemerkt)“ nach einem Trockenlauf.
- Datei: Ist die gemerkte Datei oder eine mit einem der beiden Namen schon offen, wird diese genommen und danach nicht geschlossen. Sonst der Reihe nach: die gemerkte (Konfiguration C62, Datei oder Browser-Adresse), im Ordner dieser Datei „2025_Dashboard HS.xlsm“ (Name auf SharePoint) und „2025_Dashboard_HS.xlsm“ (erst lokal bzw. in der synchronisierten Bibliothek, dann auf SharePoint direkt über https, Fehler abgefangen – dort gibt es kein `Dir`), danach lokal alles nach dem Muster `2025*Dashboard*HS*.xls*` (Kopien, „alt“ und Namen mit Klammer zuletzt), zuletzt eine schon geöffnete Mappe nach dem Muster (z. B. ein Download). Nie die OPAG-Fassung und nie diese Datei selbst: Wird sie gewählt (Dateiauswahl, C62), kommt „Das ist diese Datei selbst“, geöffnet oder geschlossen wird sie nicht. Passt die erste gefundene Datei nicht (kein Blatt Rohdaten, kaum gleiche Codes), zeigt die Karte den Grund mit „Andere Datei …“; weitergesucht wird nicht. Sonst Dateiauswahl, nach Abbruch die Adresse aus der Adresszeile des Browsers (wie bei der BÜ-Datei). Geöffnet wird schreibgeschützt, ohne Makros (AutomationSecurity vorübergehend „deaktivieren“) und ohne Aktualisieren der Verknüpfungen; Ereignisse und Bildschirm sind währenddessen aus und werden in jedem Ausgang (auch bei Fehlern) zurückgesetzt. Eine selbst geöffnete Datei wird nach dem Auswerten immer ohne Speichern geschlossen. Die gefundene Datei steht danach in C62.
- Erst ein Trockenlauf (nichts wird geschrieben), dann eine Karte: Dateiname und Ordner, Zahl der neuen Werte (Feld hier leer) und der abweichenden Werte (hier steht eine andere Zahl oder ein Text) jeweils mit Zeitraum TT.MM.JJJJ bis TT.MM.JJJJ, bis zu drei Beispiele für Abweichungen („hier 12, Datei 14“), gleiche Werte, Felder mit Formel, nicht zugeordnete Zeilen mit den ersten Beschriftungen, Texte der Datei an hier leeren Feldern (z. B. „miso fehlt“, mit Beispiel; sie werden nicht übernommen), Hinweis „Bestandsübertragung bleibt unberührt (Verbund/OPAG und die alten Zeilen 7a–7f): BÜ-Werte kommen automatisch aus dem BÜ-Reporting.“ Knöpfe: „Leere Felder füllen“ (nur neue Werte), „Auch abweichende überschreiben“ (neue und abweichende), „Abbrechen“, „Andere Datei …“. Gibt es weder neue noch abweichende Werte: „Schon alles aktuell“.
- Zuordnung (Rohdaten, Rohdaten_2, Rohdaten_3; Zeilennummern beider Dateien stimmen nicht überein, das neue Dashboard hat die Zeilen 7VA–7OL zusätzlich): Zeile mit Code in Spalte A → derselbe Code (getrimmt, Kleinschreibung). Zeile ohne Code (z. B. „Zugänge · HSB 4 K (Gesundheit)“ unter 7e) → letzter Code darüber im selben Thema (Spalte B), sonst der erste darunter im selben Thema („Offene Vorgänge · Provisionsreklamation EASY/Online“ vor 8a, Abstand negativ), plus Abstand zu ihm – nie ein Code aus einem anderen Thema (nach „KPI löschen“ von 7a–7f stünden EASY/Online sonst unter 7OL und würden als BÜ übergangen) –, und die Beschriftung aus Kategorie (C) und Abteilung (D) muss gleich sein – verglichen ohne Groß-/Kleinschreibung, Satz- und Sonderzeichen (`#`, `-`, `/`, Klammern …), geschützte und mehrfache Leerzeichen. Passt der Abstand nicht (Zeile eingefügt oder entfernt), wird im selben Code-Block nach der Beschriftung gesucht; nur ein eindeutiger Treffer zählt, sonst „nicht zugeordnet“. Leerzeilen (ohne Code und Beschriftung) zählen nicht. Spalten über das Datum in Zeile 1 (Datumswert, kein Text). Zeilen der Datei mit Zahlen, die hier keine Zeile finden, und Zahlen an einem Datum ohne Spalte hier werden ebenfalls gezählt (sie bleiben weg).
- Regeln: übernommen werden nur Zahlen (auch berechnete Werte einer Formel der Datei; kein Text, kein Fehlerwert, kein Wahrheitswert, nichts Leeres). Ein Feld mit leerem Text (z. B. Werte eingefügt aus einer Formel mit Ergebnis "") gilt als leer, beim Zählen wie beim Schreiben. Zellen mit Formel werden hier nie angefasst. Das ganze Thema Bestandsübertragung bleibt außen vor – Verbund/OPAG 7VA–7OL und die alte Aufteilung 7a–7f (HSB 4 K, Maklervertrieb) samt Zeilen ohne Code: BÜ-Werte kommen automatisch aus dem BÜ-Reporting und werden nicht mehr von Hand eingetragen. Ausgeschlossen wird über das Thema in Spalte B (gilt bis zum nächsten Thema), nicht über den Code-Block: die Zeilen „Provisionsreklamation EASY/Online“ ohne Code stehen unter 7f, gehören aber zum Thema Provisionsreklamation AO und kommen mit. Für jede geschriebene Rohdaten-Zelle wird dieselbe Zelle in Wertstand geleert, der „Stand“ der Kachel fällt damit auf den Berichtstag der KW zurück (ältere Dateien ohne Wertstand: still übergangen). Rohdaten, Rohdaten_2 und Rohdaten_3 sind nicht geschützt; wäre eines ohne Kennwort geschützt, wird es kurz freigegeben und mit denselben Optionen (Formatieren, Einfügen, Löschen, Sortieren, Filtern, Objekte, Auswahl, Gliederung) wieder geschützt; ein Schutz mit UserInterfaceOnly bleibt stehen (Makros dürfen schreiben); mit Kennwort werden die Werte gezählt und nicht geschrieben. Bruchzahlen in einem Feld ohne Nachkommastellen bekommen das Format `#,##0.0#`.
- Prüfen ohne Dialoge: `modAltWerte.AltWertePlanen(pfad)` liefert `neu=…;abweichend=…;gleich=…;formel=…;nicht_zugeordnet=…;quelle_ohne_ziel=…;ohne_spalte=…;texte=…;datei=…`, `modAltWerte.AltWerteSuchen()` dasselbe für die Datei, die der Knopf finden würde (mit `;pfad=…`, sonst `nicht_gefunden`), `modAltWerte.AltWerteAnwenden(ueberschreiben)` die Zahl der geschriebenen Zellen. Gegen `quelle/2025_Dashboard_HS.xlsm` (LibreOffice): neu 0, abweichend 0, gleich 5.494, Formel 1.239, nicht zugeordnet 0, Datei ohne Ziel 0, Texte 0 – der Build übernimmt seit dem Nachtrag unten auch die Zeilen ohne Code (Provisionsreklamation EASY/Online zum 02.10.2026), die vorher als „neu 6“ offen waren.
- Zirkelbezug in den Zu-/Abnahmen-Kacheln behoben: Provisionsreklamation AO und beide Defects zeigten in Excel 0 und „Stand 0“, weil die normierten Reihen der Zu-/Abnahmen mit der letzten KW der Kachel rechneten und zugleich für sie zählten (LibreOffice und ONLYOFFICE rechneten darüber hinweg). Die letzte KW mit Daten richtet sich jetzt nach den Rohwerten der Zu-/Abnahmen; abgeleitete Reihen zählen nicht. Der Build prüft Dashboard_Daten auf Zirkelbezüge (`zirkel_pruefen`) und bricht bei einem Fund ab.
- Zahlen über den Zu-/Abnahmen ausdrücklich ohne Rahmen und Füllung: Excel am Desktop zeichnete um jede Zahl einen Kasten.
- Watchlist wieder mit 100-%-Säulen wie im bisherigen Dashboard: je KW eine Säule (von unten Treffer VNRs, In Bearbeitung, Erledigt), der Wert jeder Reihe als Kasten mitten im eigenen Abschnitt, darüber die Linie „Überwachte VNRs“.
- Zuständigkeiten: Das ganze Thema Bestandsübertragung (7VA–7OL und 7a–7f) hat „Pflicht: automatisch“ – Pflicht, aber befüllt aus dem BÜ-Reporting. Es zählt bei keiner Person (Startseite „Offen/Erledigt/Pflichtwerte“ zählen nur „ja“), der Assistent „Werte eintragen“ fragt nicht danach, Status „erledigt“ bzw. grau „automatisch“; ein Klick auf „automatisch“ zeigt nur einen Hinweis (BÜ Verbund und OPAG zählen auf der Startseite je einmal bei der Person mit den Punkten auf den BÜ-Zeilen, siehe unten; der frühere Abschnitt „BÜ-Werte“ der Startseite ist entfallen).
- Startseite ohne eigenen BÜ-Abschnitt: BÜ Verbund und BÜ OPAG sind je ein Pflichtwert der Person mit den Punkten auf den BÜ-Zeilen (Zuordnung, heute Amend) und stehen in deren Zeile der Tabelle „Stand der Werte“ (Offen/Erledigt/Pflichtwerte; „Gesamt (Werte)“ +2, zählt nur Zeilen mit Pflicht „ja“ – die BÜ-Zeilen selbst stehen in Zuständigkeiten auf „erledigt“, sobald die KW da ist, und zählten sonst doppelt). Erledigt, sobald das BÜ-Reporting die KW des Berichtstags liefert – Hilfszeilen `_BUE7V`/`_BUE7O` in Dashboard_Daten, Namen `BUE_V_OK`/`BUE_O_OK` (1/0) und `BUE_V_TEXT`/`BUE_O_TEXT` („fehlt für KW 41 · zuletzt KW 39 · Stand: 25.09.26“). Der Assistent „Werte eintragen“ führt die beiden als eigene Einträge (Code 7V/7O, auch in der Sicht „Nach Kennzahl“): statt Eingabefeld eine Karte mit dem Stand, dem Hinweis „BÜ-Reporting neu laden und speichern“ und „Jetzt aktualisieren“ (liest die Verknüpfungen mit `UpdateLink` neu und rechnet; ist die KW dann da, geht es zum nächsten Wert).

Stand 12.71 – Pflicht = berichtet, Einklappen, KPI löschen:
- Pflicht = berichtet: Pflicht sind nur noch die Werte, die auf PPT_2 oder PPT_3 berichtet werden. Der Build merkt sich beim Bau der
  Kacheln jede Reihe, die ein Diagramm, eine Beschriftung oder der Kachelkopf („Stand“) zeigt, samt ihrer Herkunft in Rohdaten
  (`Daten.quellen`/`Daten.benutzt`), und erweitert die Menge um die Eingabezeilen von Formelzeilen: steht in der Spalte des
  Berichtstags eine Formel, gehören die Zeilen dazu, auf die sie in derselben Spalte verweist (rekursiv). Heute: 6a, 7VA–7VL, 7OA–7OL, 8a, 8b, 8c, 8e, 10b, 11a–11l, 13a–13d, 18c, 19, 20, dazu die Zeilen ohne Code 103/104
  (Provisionsreklamation EASY/Online offen, 8a), 106/107 (Zugänge, 8b), 109/110 (Abgänge, 8c), 122–124 und 126–128 (Defect Fixing
  Zu-/Abgänge je Sev, 11e/11f), 134–136 und 138–140 (Defects operativer Betrieb, 11k/11l). 11a und 11g zählen, weil die Summe über dem
  Stapel dieselbe Zahl zeigt. Am Ende prüft der Build an der fertigen Datei unabhängig davon (`berichtet_pruefen`): jede Rohdaten-
  bzw. Wertstand-Zeile, die über Diagrammreihen und Textverknüpfungen von PPT_2/PPT_3 erreicht wird, liegt in der Menge (sonst Abbruch).
- Formeln fortgeschrieben (`formeln_fortschreiben`): Im bisherigen Dashboard standen manche Summen nur bis zur letzten gefüllten KW
  (der Fachbereich kopiert sie jede Woche weiter). Ohne sie blieben die Kacheln 8a/8b/8c und 11k/11l am Berichtstag leer, obwohl
  Startseite und Assistent „erledigt“ zeigten. Ist der jüngste Eintrag einer Zeile in der Basisdatei (ohne Nachträge) eine Formel mit
  Zellbezug, schreibt der Build sie relativ verschoben in jede leere Datumsspalte dahinter: heute 8a, 8b, 8c, Abgänge Online-Formular
  (Zeile 110: Bestand Vorwoche + Zugänge − Bestand), 11g, 11k, 11l ab 09.10.2026. Sie bleiben leer, solange die Eingaben derselben
  Spalte leer sind (`IF(COUNT(…)=0,"",…)`; Plus/Minus-Rechnungen mit `N()` je Bezug, damit eine noch leere Teilsumme wie 110 in 8c
  kein #WERT! ergibt), zählen also nicht als Daten der KW. Pflicht und Formelzeile richten sich nach der Spalte
  des Berichtstags (nicht mehr nach den letzten sechs Spalten bis zum Build-Tag): Pflicht „ja“ haben die Eingaben EASY/Online
  (103/104, 106/107, 109) und die Sev-Zeilen, die Summen und Zeile 110 rechnen. Dazu prüft der Build (`pflicht_pruefen`): jede
  berichtete Zeile hat am Berichtstag Pflicht „ja“/„automatisch“ oder eine Formel, deren Eingaben derselben Spalte wieder so geliefert
  werden (sonst Abbruch).
- Nachtrag aus dem bisherigen Dashboard auch für Zeilen ohne Code (`quelle_lesen.schluessel`, dieselbe Zuordnung wie
  `modAltWerte`): zum 02.10.2026 Provisionsreklamation EASY/Online offen, Zugänge, Abgänge (103/104/106/107/109/110) und HSB 4 K
  Gesundheit Zu-/Abgänge. Die Abgänge Online am 09.10. rechnen mit dem Bestand vom 02.10. (Zeile 104).
- Zuständigkeiten: Pflicht „automatisch“ für 7VA–7OL (wie bisher), „ja“ für berichtete Zeilen mit Person und ohne Formel am Berichtstag, sonst
  „nein“ – die alte BÜ-Aufteilung 7a–7f ist damit „nein“. Nicht berichtete Zeilen mit Person zeigen im Status grau und kursiv
  „nicht berichtet“ (im Build je Zeile entschieden; wer eine solche Zeile auf „ja“ schaltet, sieht wieder offen/erledigt). Kopfhinweis:
  „Pflicht = auf PPT_2 oder PPT_3 berichtet; BÜ automatisch“. Themen ohne Pflichtwert (ja oder automatisch) sind beim Öffnen
  eingeklappt (Plus am Themenband): heute 1–5, 9 Haftungsdach, 10 Arbeitsanweisung, 12 Revisionsanforderungen, 14 Workaround,
  15 Generalquittung. Spalte A ist jetzt die Formel `=ROW(Rohdaten!$A$n)` (Wert = Zeile, stimmt auch nach „KPI löschen“), die
  ausgeblendete Spalte AO die Art der Zeile (T Themenband, K Kategorieband, W Wertzeile). modZuordnung verträgt die eingeklappten
  Zeilen: Sortieren und Entfernen schreiben über alle Zeilen, Klicks erreichen nur sichtbare. Spalte D („Laut Rohdaten“) liest bei
  verbundenen Zellen in Rohdaten Spalte E (z. B. E103:E111) den Namen aus der ersten Zeile des Verbunds (`INDEX/MATCH("*")` über den
  Bereich vom Verbundanfang bis zur eigenen Zeile – der Bereich schrumpft mit, wenn „KPI löschen“ Zeilen entfernt). Lange Kennzahlen
  (z. B. 8d „… Ticket-System (ab 12.2023 – 06.2024)“, EASY/Online) brechen um, die Zeile wird so hoch wie nötig. Zeilen mit eigenem
  Code, aber ohne Kategorie und Abteilung (16, 17, 18d) heißen „(ohne Beschriftung)“ statt die Kategorie der Zeile davor zu zeigen.
- Startseite „Stand der Werte“: nur Personen mit mindestens einem Pflichtwert (Pflicht „ja“ plus BÜ bei der BÜ-zuständigen Person), in
  der Reihenfolge der Konfiguration, lückenlos, darunter „Gesamt (Werte)“: jeder Pflichtwert einmal, gleich wie viele Personen ihn
  liefern (die Personenzeilen zählen einen Wert mit mehreren Zuständigen bei jeder Person – deshalb ist Gesamt nicht ihre Summe; ein
  Hinweis über der Tabelle sagt das). Technisch: ausgeblendete Hilfsspalten U:AA je Person der Konfiguration (Offen, Erledigt,
  Pflichtwerte, laufende Nummer), die Tabelle G10:J40 holt Zeile j über INDEX/MATCH (keine dynamischen Arrays), bedingte Formate über
  die Art der Tabellenzeile (Person/Gesamt). Drei Hinweise stehen über der Tabelle („Personen ohne Pflichtwerte erscheinen nicht“, BÜ,
  mehrere Zuständige). Startseite und Assistent zählen gleich (geprüft je Person mit `modStart.PflichtZaehlen`). Berichtstag links mit
  deutschem Wochentag (Zahlenformat `[$-407]dddd, dd.mm.yyyy`).
- Rohdaten: je Thema (Spalte B, gilt bis zum nächsten Eintrag) sind Blöcke nicht berichteter Zeilen gruppiert und eingeklappt; die erste
  sichtbare Zeile des Blocks (Thema bzw. Code) bleibt stehen, trägt das Plus (Symbole oberhalb, dieselbe Einstellung wie die
  Spaltengliederung der alten KW) und ist so hoch, wie der umbrochene Themenname braucht (Spalte B, Wörter länger als die Spalte
  auch mitten im Wort: „Nachträge / Vertragsverlängerungen, …“ vier Zeilen, „Unterstellungsänderungen / Umstrukturierung“ und
  „Generalquittung - Restantenmanagement“ drei). Heute: 1–4 (je ab der ersten Zeile), 6b/6c, 15–17,
  18a/18b und 18d–18f. Schon ausgeblendete Zeilen (7a–7f) bleiben ausgeblendet. Der Assistent blendet eine Zielzeile bei Bedarf ein.
- **KPI löschen** (Knopf in Zuständigkeiten, `modKpiLoeschen`): Karte mit den Themen aus Rohdaten (gleiche Themen hintereinander
  zusammen). Klick auf ein Thema wählt das ganze Cluster (größte löschbare Menge), ▸ klappt es auf: darunter die KPIs (Zeile mit Code
  samt den Zeilen ohne Code, auf die ihre Formel verweist, sonst die folgenden – z. B. „1a · Gesamtvorgänge pro Woche“ mit den
  sieben Abteilungen) und deren einzelne Wertzeilen zum Einzelwählen; 12 Einträge je Seite. Gesperrt (grau mit Grund): BÜ-Zeilen
  7VA–7OL, Zeilen, auf die ein anderes Blatt verweist (Dashboard_Daten = Kacheln PPT_2–PPT_4, BUE_Serviceparameter, Namen; auch über
  Wertstand), und Zeilen, auf die eine verbleibende Formel in Rohdaten verweist (Einzelbezug, ganzer Bereich oder Summe im selben
  Thema) – sie werden wählbar, sobald die Zeile mit der Formel mitgewählt ist. Die Kopfzeile (Code) einer KPI mit Zeilen ohne Code
  (z. B. 1a, 2b mit den Abteilungen, 7f mit HSB 4 K/Makler) ist nur zusammen mit diesen löschbar – sonst blieben Zeilen ohne Code
  stehen, die keiner KPI mehr gehören („Werte aus HS-Dashboard 2025“ ordnete sie der KPI darüber zu, das Kategorieband in
  Zuständigkeiten bliebe stehen). Namen sperren nur, wenn sie sichtbar und eigene sind: Filter- und Druckbereiche
  (`_FilterDatabase`, `Print_Area`, `Print_Titles`), `_xlfn.`/`_xlnm.` und ausgeblendete Namen zählen nicht (sonst sperrte ein
  Filter in Rohdaten jede Zeile). Danach Bestätigungskarte mit Anzahl, Beschriftungen,
  betroffenen Blättern und „Nicht rückgängig zu machen – vorher speichern“, Knöpfe „Endgültig löschen“, „Zurück“, „Abbrechen“.
  Vor dem ersten Löschen prüft `Loeschen`, dass Übersicht, Zuständigkeiten, Rohdaten und Wertstand beschreibbar sind: Schutz ohne
  Kennwort wird aufgehoben und danach mit denselben Optionen wieder gesetzt (Zuständigkeiten über `modZuordnung.Schuetzen`); ist ein
  Blatt mit Kennwort geschützt, bricht es ab, bevor etwas gelöscht ist („fehler;Blatt „Rohdaten“ ist mit Kennwort geschützt …“).
  Löschen: Übersicht (Einträge zu den Zeilen), Zuständigkeiten (Wertzeilen und leer gewordene Kategorie-/Themenbänder), Wertstand und
  Rohdaten (dieselben Zeilen) jeweils mit `EntireRow.Delete` von unten nach oben, erst die Blätter, die auf Rohdaten verweisen.
  Verbundene Zellen in Rohdaten (Thema in B, z. B. B3:B21, Verantwortlich E103:E111) werden vorher getrennt und über die verbliebenen
  Zeilen neu verbunden; Kategorie (C) und Thema (B) einer gelöschten ersten Zeile wandern in die neue erste Zeile (erst die Kategorie,
  sonst endete ihr Block am schon eingetragenen Thema; beim Thema mit der Linie oben); verliert eine eingeklappte Gruppe ihre Kopfzeile, wird in Excel die nächste Zeile der neue Kopf (LibreOffice kennt
  `OutlineLevel` nicht: dort werden die Zeilen eingeblendet). Dashboard_Daten Spalte C („Rohdaten Z. n“) ist eine Formel und zählt
  mit. Danach prüft es, dass Wertstand Zeile für Zeile auf dieselbe Rohdaten-Zeile zeigt. Bricht etwas nach dem ersten Löschen ab,
  meldet es „teilweise;… schon gelöscht: Übersicht, Zuständigkeiten …“ und rät, die Datei ohne Speichern zu schließen; die Berechnung
  bekommt in jedem Fall ihren vorigen Modus zurück. Ist die Auswahl verloren (Modulvariablen nach einem Laufzeitfehler zurückgesetzt),
  sagt „Endgültig löschen“ das, statt still nichts zu tun. Der Knopf „KPI löschen“ ist bewusst auch ohne „Zuständigkeiten
  bearbeiten“ bedienbar: er ändert Rohdaten, nicht die Zuordnung, und hat die eigene Bestätigungskarte mit Warnung.
  „BÜ-Datei verknüpfen“ sucht die BÜ-Zeilen in der BÜ-Datei jetzt über den Code (nach dem Löschen stehen sie hier weiter oben).
  Prüfen ohne Dialoge: `KpiLoeschbar(zeile)` („“ oder Grund), `KpiLoeschenZeilen("3-22,112")` („ok;rohdaten=…;wertstand=…;
  zustaendigkeiten=…;baender=…;uebersicht=…;zeilen=…“, „fehler;…“ = nichts gelöscht, „teilweise;…“), `KpiLoeschenProbe("thema:1")` usw. (Auswahl wie per Klick),
  `KpiLoeschenVersion()`. Getestet in LibreOffice auf einer Kopie: ganzes Thema „Nachträge / Vertragsverlängerungen“ (20 Zeilen,
  17 in Zuständigkeiten inkl. 3 Bänder), danach 8d und 18a einzeln (je ein Eintrag in der Übersicht weg, Thema „Neueinstellungen“
  wandert samt Verbund auf 18b): kein #BEZUG! in keinem Blatt, keine neuen Fehlerwerte, Dashboard_Daten vorher/nachher in allen Zellen
  gleich (außer der Quellangabe), Wertstand und Zuständigkeiten zeigen auf dieselben Zeilen wie Rohdaten; 8a gesperrt
  („in einer Kachel verwendet“). Die Karten selbst laufen nur in Excel (LibreOffice kennt `OnAction` an Formen nicht).
  Zweiter Lauf (Version 2): 2b bzw. 1a nur Kopfzeile → abgelehnt („Kopfzeile der KPI …“), 2b ganz (31–38) → gelöscht samt
  Kategorieband; 7f samt HSB/Makler und das ganze Thema 7a–7f → „Werte aus HS-Dashboard 2025“ ordnet EASY/Online weiter 8a zu
  (neu 0, nicht zugeordnet 0); Rohdaten bzw. Zuständigkeiten mit Kennwort geschützt → „fehler“, kein Blatt verändert; Filter-/
  Druckbereich-Namen sperren nicht, ein eigener Name auf Zeile 141 schon; erste Zeile von „Neueinstellungen“ (18a) gelöscht bei leerer
  Kategorie in 18b → Thema und Kategorie wandern beide nach 18b.
- Offen: Plus/Minus der Gruppen nach dem Löschen und die Karten von „KPI löschen“ sind nur in LibreOffice bzw. im Code geprüft, nicht
  in Excel. In LibreOffice (kein `OutlineLevel`) werden die Zeilen einer Gruppe, deren Kopf gelöscht wurde, nur eingeblendet und
  hängen dann sichtbar in der Gruppe davor (z. B. 4b nach dem Löschen von 4a unter dem Plus von Thema 3); Excel macht die nächste
  Zeile zum Kopf. Fürs Rendern mit LibreOffice: es ignoriert „Zusammenfassung oberhalb“ und klappt in Zuständigkeiten die Gruppe über
  einem eingeklappten Themenband zu (Excel liest die Datei richtig).

Mitarbeiter-Kapazitäten (PPT_3, Kachel 6) – feste Monate statt der letzten sechs:
- Genau vier Säulenpaare SOLL MAK | (V)IST MAK (21b/21c aus Rohdaten_2 Zeile 4/5, gerundet über 21b_r/21c_r, Werte über den Säulen
  wie bisher): Vormonat und laufender Monat des Berichtstags (Konfiguration C6, sonst nächster Freitag – am 09.10.2026 also Sep 26 und
  Okt 26), dazu Januar des Folgejahres und Januar des übernächsten Jahres (Jan 27, Jan 28). Alles aus dem Berichtstag gerechnet, nichts
  fest eingetragen; ◀ ▶ auf der Startseite schiebt die Monate mit.
- Rohdaten_2 hat dafür schon Spalten: Monate 08.2025 bis 12.2026, danach 01.2027 und 01.2028 (Formeln auf die externe Mig-Max-Datei
  `[1]Dashboard!Z4/AA4`, gespeichert Soll 192,52 / 192,52, Ist 205,06 / 197,27). Gesucht wird über das Datum in Zeile 1; fehlt die
  Spalte (z. B. ab Berichtstag 01.2027 der Januar 2029) oder steht dort keine Zahl, bleibt die Säule leer (#NV in Dashboard_Daten,
  kein Fehlerwert), der Monat steht trotzdem auf der Achse. Gesucht wird seit 12.87 über die Kopfzeile des Monatsblocks
  „Mitarbeiter-Kapazitäten“ in Rohdaten (bisher Rohdaten_2), Monate dort fortlaufend bis 01.2028.
- Planmonate abgesetzt: Achsentext „Jan 27 (Plan)“, „Jan 28 (Plan)“ und eine dünne graue Linie (`K6_Trenn`) zwischen Okt und Jan, von
  der Höhe der Werte bis in die Monatszeile. „Kacheln ein-/ausblenden“ hält Formen mit `_Trenn` anteilig in der Mitte der Kachel; die
  PowerPoint nimmt die Linie wie alle `K6_`-Formen mit.
- Dashboard_Daten: eigener Block „Vormonat | Lfd. Monat | Plan Jan +1 | Plan Jan +2“ rechts neben den Fenster-Spalten (Zeile 4 Datum,
  Zeile 5 Achsentext), das Verzeichnis für „Diagramm anpassen“ rückt vier Spalten nach rechts (modKW findet es über den Kopf) und
  trägt die Masse „Fest von“/„Fest Anzahl“. Diagrammart `F` (feste Monate): kein − / + für Monate, Chip „2 Monate + 2 Plan“, Werte
  „Alle“, „Nur Planmonate“ oder „Aus“. Neueinstellungen (Kachel 3 auf PPT_2) bleibt bei den letzten sechs Monaten bis zum Vormonat.
- Fußnote der Folien ergänzt: „… · Monatswerte bis September 2026 · MAK bis Oktober 2026 und Plan Jan 27/28“.
- Werte aus HS-Dashboard 2025 und Kommentare: unverändert (Zuordnung über das Datum in Zeile 1, die MAK-Zeilen sind Formeln und werden
  nicht überschrieben; Kommentar der Kachel ist leer). Hinweis: Die Übersicht nimmt als „letzten Eintrag“ von 21b/21c die letzte Spalte
  mit Zahl – das ist der Planwert 01.01.2028.
- Geprüft: Build ohne Befunde, `lo_vba_check.py` (modKacheln Version 2), LibreOffice neu gerechnet ohne Fehlerwerte; Kachel gerendert
  (Sep 26 225 | 224, Okt 26 225 | 221, Jan 27 (Plan) 193 | 205, Jan 28 (Plan) 193 | 197).

Provisionsreklamation AO und Makler (PPT_2, Kacheln 4 und 5) – gemeinsame Werteachse:
- Die SLA-Linie (gestrichelt) steht in beiden Kacheln auf derselben Höhe, ebenso jeder andere Wert: gleiche Zahl = gleiche Höhe in
  der Kachel. Beide SLA kommen aus derselben Quelle (Name `SLA_PV` = Konfiguration C9, heute 500; Reihe `SLA` in Dashboard_Daten).
  Die Legendentexte „SLA HS (500)“ / „SLA HS (500 Vorgänge)“ sind fester Text und ändern sich mit C9 nicht.
- Technik wie in den BÜ-Kacheln (`pv_linie`, `pv_bezug` im Build): Die Linien „Offene Vorgänge“ (8a bzw. 8e) und die SLA sind auf
  einen gemeinsamen Bezug normiert – `PV_M` in Dashboard_Daten = MAX(SLA, höchster gezeigter Wert von 8a in Kachel 4, höchster
  gezeigter Wert von 8e in Kachel 5); „gezeigt“ heißt je Kachel die letzten n KW bis zu ihrer letzten KW mit Daten. Die Achsen haben
  feste Grenzen, Excel skaliert nichts selbst; neue Daten, eine höhere SLA oder mehr/weniger KW („Diagramm anpassen“) verschieben
  nur die normierten Werte, beide Kacheln bleiben gleich skaliert. Die Zahlen an der Linie sind eigene Beschriftungen aus
  Dashboard_Daten (`8a_pvt`/`8e_pvt` im Zeitfenster), „Alle / Letzte 2 KW / Aus“ wirken wie bisher.
- Kachel 4 legt den Maßstab fest: Zeichenfläche wie bisher (oberer Teil, darunter die Zu-/Abnahmen unverändert), Achse 0 bis 1,21
  (1,0 = PV_M, darüber 10 pt für die Zahl). Kachel 5 behält ihre ganze Fläche mit den KW-Zahlen unten (gleiche Höhe wie die
  Nachbarkacheln), bekommt aber Minimum und Maximum so (heute −0,84 bis 1,26), dass Null und Punkt je Einheit gleich sind: ihre
  Grundlinie (Wert 0) liegt auf der Höhe der Grundlinie in Kachel 4, darunter bleibt Platz frei. Der Build gibt die Geometrie aus
  („Provisionsreklamation Kachel 4/5: Zeichenfläche …, Werteachse …“).
- Zahl der KW: Kachel 4 nutzt die Zelle der Zu-/Abnahmen (`BW_PPT_2_4_kw`), Kachel 5 hat jetzt eine eigene (`PV_PPT_2_5_kw`, im
  Verzeichnis als KW-Zelle eingetragen); `modKW` schreibt sie und rechnet neu, bevor es die Bereiche setzt. VBA unverändert.
- „Kacheln ein-/ausblenden“ verschiebt Kacheln nur ganz und ändert ihre Höhe nicht – die Lage relativ zur Kachel bleibt, in einer
  gemeinsamen Reihe also auch die gleiche Höhe. Der PowerPoint-Export kopiert die Diagramme mit ihren festen Achsen (gleiches Bild).
- Weitere Kacheln mit SLA: BÜ Verbund und BÜ OPAG (Kacheln 1/2) – verschiedene SLA (Konfiguration F9 bzw. F11), je Kachel auf die
  eigene höchste Säule normiert; nicht angeglichen.
- Geprüft: Build ohne Befunde (keine Zirkelbezüge), `lo_vba_check.py` ohne Fehler, LibreOffice neu gerechnet ohne Fehlerwerte;
  Kacheln 4 und 5 mit eingesetzten Beschriftungen gerendert (300 dpi): SLA-Linie in beiden Kacheln in denselben Pixelzeilen
  (Abweichung 0 px), Grundlinien ebenfalls gleich hoch.

## 12.87 – Eine Rohdaten-Mappe, Reportingzyklus, Erledigungsquote, Stand WIP9

- Rohdaten_2 und Rohdaten_3 sind als Monatsblöcke in Rohdaten aufgegangen (siehe Blätter). Dashboard_Daten, Übersicht, Startassistent
  und „Werte aus HS-Dashboard 2025“ (Rohdaten_2/_3 der Datei landen in den Blöcken mit derselben Herkunft, Spalte F der Kopfzeile)
  lesen die Monatswerte über die Kopfzeile ihres Blocks (`modBasis.KopfZeile`, `MonatsKopf`, `BlockEnde`).
- Zuständigkeiten: neue Spalte G „Zyklus“, Status in H. Der Startassistent zählt offen/erledigt nach diesem Status und trägt
  Monatswerte in die Spalte des fälligen Monats ein („WERT FÜR SEPTEMBER 2026“, darüber der Vormonat). MAK-Zeilen „automatisch“.
- PPT_4 entfernt, PPT_1 heißt „Deckblatt“ (Export: Deckblatt, PPT_2, PPT_3).
- Neueinstellungen: Die Prozentwerte fehlten, weil Excel die je Säule verknüpften Beschriftungen verwirft, sobald sich der
  Datenbereich ändert (−/+ bei den Monaten); in WIP9 standen sie nicht mehr im Diagramm. `modKW.TextBeschriftungen` schreibt alle
  Beschriftungen aus Zellen als Text neu: beim Öffnen, beim Wechsel auf PPT_2/PPT_3, nach −/+ und vor dem PowerPoint-Export.
  Die Quote selbst (Dashboard_Daten 18E) liest auch Text („96 %“, „0,96“; Werte über 1,5 gelten als Prozent) und rechnet sonst
  fristgerecht erledigt / Gesamt.
- Geprüft: Build ohne Befunde, `lo_vba_check.py` ohne Fehler (neue Funktionen: Kopfzeilen 159/165, fälliger Monat September 2026 in
  Spalte 287), LibreOffice neu gerechnet ohne Fehlerwerte außer den gewollten #NV-Lücken; Erledigungsquote Dez 25–Sep 26 gefüllt
  (Sep 26: 94 %), MAK Sep/Okt 26 und Plan Jan 27/28 wie vorher (225/224, 225/221, 192,52/205,06, 192,52/197,27).

## 12.88 – Weniger Doppelklicks

- Alle Knöpfe laufen über eine Warteschlange (`modKarte.Planen` / `PlanAusfuehren`): die Prozedur läuft per OnTime gleich nach
  dem Klick, danach setzt `FokusZurueck` den Fokus auf die Zellen des Blatts. Vorher blieb Excel nach einem Klick, dessen Makro
  Formen löscht und neu zeichnet, oft am alten Klick hängen – der nächste Knopf reagierte erst nach einem Klick in eine Zelle.
- Werte eintragen: Die markierte Zelle ist ausgewählt, Zahl tippen und Enter übernimmt sie (`Rohdaten.Worksheet_Change` ->
  `modStart.ZellEingabe`, Stand aus dem Feld der Karte). Das Feld „Wert“ mit „Übernehmen“ bleibt als zweiter Weg; dort beendet
  der erste Klick weiterhin nur die Texteingabe im Feld (Excel-Verhalten bei Textfeldern).

## 12.90 – Berichtstag flexibel (Montag), Beschriftungen ohne Kasten

- Konfiguration: Wochentag des Berichtstags (F4, Vorgabe Montag), Feiertage am Standort (F5: K, D, M, HH, B, MA; Blatt
  Feiertage, Hilfsspalte T = Name `FeiertageBT`), Stichtag (F6) und „Wochentag gilt ab“ (F7, Vorgabe 19.10.2026; davor wurde am
  Freitag gemeldet). Berichtstag von Hand (C5) geht weiterhin vor.
- Die Wochenwerte einer KW gehören zu ihrem Freitag (Name `Stichtag`, Spalten in Rohdaten bleiben Freitage). Gemeldet wird am
  Wochentag F4 nach diesem Freitag; ist er ein Feiertag, am nächsten Werktag. Automatisch gilt die erste KW, deren Meldetag noch
  nicht vorbei ist (Hilfswerte Konfiguration H4:I6): am 09.10.2026 KW 41 mit Berichtstag heute, ab Samstag KW 42 mit Berichtstag
  Montag 19.10.2026. Ostermontag 29.03.2027 → Dienstag 30.03. meldet KW 12; der Stichtag hängt am Freitag der KW, nicht am
  verschobenen Tag (Donnerstag-Feiertag → Freitag meldet trotzdem die Vorwoche).
- Feiertage 2027: das Datum kommt aus der Berechnungsspalte L (in M:R standen die von Ostern abhängigen Tage eine Woche zu spät),
  die Standortspalte sagt nur, ob der Tag dort gilt.
- Gelbe Spalte in Rohdaten, Status in Zuständigkeiten, Assistent, BÜ-Werte, Fußnote und KW auf der Startseite rechnen mit dem
  Stichtag; Übersicht graut Einträge älter als die Vorwoche der gemeldeten KW; BÜ-Serviceparameter nennt KW und Stand.
- PowerPoint: Die Zahlen der Provisionsreklamation AO/Makler standen seit 12.88 in einem Kasten. Excel gibt einer Beschriftung mit
  festem Text (`modKW.TextBeschriftungen`) oft einen Rahmen; die Beschriftungen sind jetzt ausdrücklich ohne Rahmen angelegt, und
  das Makro schaltet den Rahmen nach jedem Setzen des Textes wieder ab (`TextSetzen`).

## 12.91 – Pfeile springen je KW

- ◀ ▶ auf der Startseite gehen eine KW zurück/vor und setzen deren Meldetag (Wochentag F4 nach dem Freitag, vor F7 der Freitag,
  Feiertag → nächster Werktag): am Freitag 09.10.2026 führt ▶ zu Montag 19.10.2026 / KW 42 (vorher: Freitag 16.10.). Trifft der
  Pfeil den automatischen Berichtstag, wird C5 geleert; beim Öffnen ebenso, wenn C5 inzwischen dem automatischen Tag entspricht.
- Berichtstag von Hand (C5): Stichtag = Freitag der jüngsten KW, deren Meldetag am oder vor C5 liegt (Konfiguration H7).

## 12.92 – Kachel 5 Grundlinie unten, BÜ-Werte aus dem BÜ-Reporting, Altwerte Verbund, Kommentare KW 41

- Kachel 5 (Provisionsreklamation Makler): Grundlinie unten auf der Höhe der Nachbarkacheln, SLA-Linie auf derselben Höhe wie in
  Kachel 4 (eigener Faktor `PV_F_5` = 1/PV_M + Abstand der Grundlinien/SLA; reicht der Platz für den höchsten Wert nicht, wird er
  gedeckelt).
- „BÜ-Datei verknüpfen“: feste Werte in 7VA–7OL (z. B. Freitagsstände aus der Vorlage) werden durch die Verknüpfung ersetzt, sobald
  das BÜ-Reporting für Code und Woche eine Zahl hat (dort der Stand vom letzten Stichtag der KW). Vorher blieben sie stehen, daher
  passten Bestand und Δ Saldo nicht zusammen (OPAG KW 40: 26.600 statt 27.739). Einmal neu verknüpfen.
- Kachel 1: KW ohne Spartensplit zeigen den Gesamtwert aus dem bisherigen Reporting (7a, Säule „Gesamt bisher“) und Zu-/Abnahmen
  aus 7e/7f (dort nur HSB 4 K Gesundheit, Kombo/LV „miso fehlt“). Die Zeilen sind nur gelesen, keine Pflicht.
- Kommentare PPT_2 auf Stand KW 41 (`KOMMENTARE_STAND`), neu Kachel 2: Erklärung der OPAG-Zählweise und des SLA-Faktors.

## 12.93 – Wochenspalten ab KW 42 am Meldetag (Montag)

- Rohdaten: Bis KW 41 heißen die Wochenspalten wie bisher nach dem Freitag der KW, ab KW 42 nach dem Meldetag Montag (19.10.,
  26.10., 02.11. …; `quelle_lesen.montage`, Konstante `UMSTELLUNG`). Die Spalte 19.10. ist KW 42 – die KW einer Spalte ist immer die
  Woche des Freitags am oder vor ihrem Datum, so bleibt die Achse lückenlos (…, 41, 42, 43).
- Namen: `KWFreitag` = Freitag der gemeldeten KW (Konfiguration H6/H7), `Stichtag` = die Wochenspalte dieser KW in Rohdaten (Datum
  vom Freitag bis 6 Tage danach, `MAXIFS` über `RD_Kopf`), `VorStichtag` = die Spalte davor. Dashboard_Daten holt die Wochen als
  „vorige Spalte in Rohdaten“ statt „7 Tage zurück“; Monats- und Quartalsfenster in Zuständigkeiten rechnen mit `KWFreitag`.
- „BÜ-Datei verknüpfen“ sucht im BÜ-Reporting den Freitag der KW (dort je KW der Freitag mit dem Sonntagsstand); einmal neu verknüpfen.
- Pfeile ◀ ▶ und der Assistent rechnen mit dem Freitag der KW (`modBasis.KwFreitag`).

## 12.94 – Stand WIP12

- Arbeitsfassung `quelle/2026_HR_Sales_Dashboard_WIP12.xlsm` (12.10.2026) übernommen; sie hat schon den neuen Aufbau. `_wip_lesen`
  liest beide Formen: Wochenwerte (nur oberhalb der Monatsblöcke), Verantwortliche, Punkte in Zuständigkeiten (auch auf den Zeilen
  der Monatsblöcke), Zyklus, Personen, Konfiguration (C9, F9, F10, C10, C13, C62), Monatswerte aus den Blöcken und alle Texte aus dem
  Blatt Kommentare (gehen `KOMMENTARE_STAND` vor). Neue Zahlen gegenüber WIP9: keine (KW 42 noch offen).
