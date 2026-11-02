# Prüfbot-Testing (xlsm) mit Testmail-Generator

Neuaufbau der Arbeitsmappe `Pruefbot_Testing.xlsx` (Testvorbereitung für den BÜ-Prüfbot). Alle Daten, Formeln,
Auswahllisten und bedingten Formate sind erhalten. Neu sind eine einheitliche Gestaltung, eine Startseite als Cockpit
und der Knopf **„Testmail erstellen“**. Er erzeugt zu einem Mail-Auftrag eine Testmail als EML. Angehängt ist die
ausgefüllte und unterschriebene Vollmacht als PDF.

| Datei | Inhalt |
|---|---|
| `Pruefbot_Testing.xlsm` | die Arbeitsmappe (Makros aktivieren) |
| `beispiele/` | erzeugte Beispiele aus dem Prüflauf: MAIL-001 (vollständig) und MAIL-003 (mit Platzhaltern), dazu der Betreuungswunsch von MAIL-008 und die Vorschaubilder der Dokumente. Die Adressen sind Beispieladressen (`example.org`, `ergo.example`). |
| `quellen/` | Build, VBA-Quellen, Original, Prüfwerkzeuge (siehe unten) |

## Bedienung

1. Datei öffnen und **Makros aktivieren**. Liegt die Datei aus einer Mail oder einem Download vor, vorher in den
   Dateieigenschaften „Zulassen“ setzen. Andernfalls sperrt Windows die Makros. Liegt die Datei auf SharePoint: in der
   Excel-Desktop-App öffnen; den Ordner `Pruefbot_Testmails` daneben anlegen, wer die Mails gesammelt haben will (sonst liegen sie direkt neben der Datei, siehe „Ablage auf SharePoint“).
2. **Start & Übersicht** ist das Cockpit. Oben stehen die Kennzahlen. Darunter zeigt der **Ablauf** die Stationen
   „Fachliche Herleitung“ und Schritt A bis D mit Stand („1 von 18 erledigt · 14 blockiert“); der erste nicht erledigte
   Schritt trägt „ALS NÄCHSTES“. Rechts daneben steht der Stand des Testmail-Generators (Pflichtangaben, erzeugte
   Testmails). Es folgen die Prozessschritte A bis D mit Gesamt, offen, erledigt, blockiert und einem
   Fortschrittsbalken, ganz unten die offenen technischen Voraussetzungen mit Status-Auswahl. Ein Klick auf
   „Zum Blatt: …“ öffnet den Schritt.
3. Die Schritte arbeitet man in den Blättern **Stammdaten (A)**, **To-do Vertragsmapping (B)**,
   **To-do Mailerstellung (C)** und **Testfall-Tracking (D)** ab. Hellgelbe Zellen sind Eingaben. Grau hinterlegte Zellen
   werden berechnet.
4. **Testmail erstellen** gibt es als Knopf im Kopfband der Startseite, von To-do Mailerstellung und des
   Testmail-Generators. Jede Funktion und jede Kennzahl steht nur an einer Stelle: Die doppelten Knöpfe im Kasten
   „Testmail-Generator“ der Startseite sind entfallen (Kopfband: „Testmail erstellen“, „Testmail-Generator“), ebenso
   die Zählerleisten auf Mailerstellung und Tracking (Zahlen im Cockpit) und der Block „Agenturzustände“ im Cockpit
   (Kennzahlen auf „Agenturkonstellationen“).

### Gestaltung

- **Kopfband** je Blatt: Kennzeichnung (Schritt A bis D, Herleitung, Werkzeug, Cockpit), Titel und ein Satz dazu, wozu
  das Blatt dient. Die Knöpfe beginnen auf allen Blättern an derselben Stelle und stehen in fester Reihenfolge:
  Hauptaktion („Testmail erstellen“), „Volltext ein/aus“ bzw. „Mail-Aufträge“, „Zur Übersicht“; gleiche Knöpfe sind
  gleich breit. Das Band und die Tabellenköpfe bleiben beim Blättern stehen, auf den breiten Blättern (Stammdaten,
  Vertragsmapping, Mailerstellung, Generator, Tracking, Matrix, Mailanforderungen) auch die Schlüsselspalte(n) mit der ID.
- **Statusfarben** als Pillen: erledigt und ja grün, blockiert rot, bereit blau, in Durchführung amber, nicht
  erforderlich hellgrau. „nein“ und „offen“ stehen zurückhaltend in grauer Schrift ohne eigene Fläche, damit die Werte
  mit Bedeutung auffallen. Gilt für alle Statusspalten mit Auswahlliste, auch „Hostzustand bestätigt“ und
  „Abgeberzuordnung bestätigt“; berechnete Textspalten (Abgebername, Agentur-ID …) bleiben normale Zellen.
- **Blockierte Zeilen**: Meldet die Formel „BLOCKIERT“ (Vertragsmapping: Arbeitsauftrag, Mailerstellung: Betreff), steht
  die ID als rote Pille und der Formeltext in Rot. So findet man die im Cockpit rot gezählten Zeilen. Technische
  Datensätze (Weg B) sind in To-do Mailerstellung gedämpft.
- **Kennzahlen** als Kacheln in einem Stil: Cockpit sowie Agentur- und Vertragskonstellationen (gleich breit, Zahl per
  Textverknüpfung aus der Zelle).
- **Innenabstand**: Text- und Kopfzellen links mit Einzug, Zahlen rechts mit Einzug, Statuspillen zentriert.
- **Lange Texte** wie Mailtext, E-Mail-Checkliste und Herleitungen stehen in Zeilen mit fester Höhe von ganzen
  Textzeilen (3 bis 7 je Blatt; Excel setzt umbrochene 9,5-pt-Zeilen im Abstand von 15 px, die Höhe endet also zwischen
  zwei Zeilen). Ein **Doppelklick** auf eine Zeile klappt den vollen Text auf und wieder zu. Das gilt in berechneten
  Zellen und auf den Herleitungsblättern; Eingabezellen bleiben normal bearbeitbar. **„Volltext ein/aus“** klappt alle
  sichtbaren Zeilen des Blatts auf (auch auf Stammdaten); vom Filter ausgeblendete Zeilen bleiben ausgeblendet.
- **Registerfarben**: Start teal, operative Blätter und Generator dunkelblau, Herleitung hellgrau, Listen sehr hell
  (ausgeblendet).
- Keine Gitternetzlinien. Schrift Liberation Sans (metrisch gleich Arial).

## Testmail-Generator

Das Blatt **Testmail-Generator** hat drei Bereiche:

1. **Einstellungen** (einmalig): Empfänger ist vorbelegt mit CelonisBueMakler@ergo.de (dorthin leiten
   bestandsuebertragung@ergo.de und maklerauftraege@ergo.de weiter, von dort eröffnet der Prüfbot den Vorgang in der ABN),
   Absender mit CelonisBUEStrukturierung@ergo.de; aus diesem Postfach kommen alle Testmails. Die Signatur der Maklermail
   nennt die E-Mail der Agentur aus den Stammdaten (leer = keine E-Mail-Zeile), nicht das Absender-Postfach. Seit 1.3 gibt
   es nur dieses eine Absender-Postfach – keine eigenen Absender (P-01 bis P-04) und keine Anzeigenamen je Mailvariante; die
   Spalte „Postfach“ der Mailanforderungen steuert nur noch die Signatur. Leerer Empfänger: die Mail öffnet in Outlook ohne Empfänger. Der Postkorb, in dem die ABN den Vorgang eröffnet
   (laut Fachbereich „02 23724 HSB4 K BÜ Prüf BOT Themenpostkorb“), steht nicht in der Mail. Optional sind Ort und Datum der Unterschrift (leer bedeutet heute),
   der Testvermerk in der Fußzeile und der Ausgabeordner. Die Spalte „Status“ zeigt „fehlt“ oder „gepflegt“, und das
   Cockpit zählt mit.
2. **Ergänzende Testdaten je Mail-Auftrag** (`tblGeneratorEingaben`, Schlüssel Mail-Auftrags-ID): Abweichungen, die die
   Stammdaten nicht hergeben. Das sind andere oder fiktive Person, abweichendes Geburtsdatum, abweichender Vermittler,
   Untermakler, Unterlagenanforderung und die Unterlagenlücke für PN-01. Optional kommen Anschrift VN, die
   vertretungsberechtigte Person eines Firmenkunden, Registernummer und Anschrift des Bevollmächtigten hinzu. Kräftiges
   Orange mit orangem Rand heißt „für diesen Auftrag noch nötig“ (deutlich anders als das Hellgelb der Eingaben), grau
   heißt „hier ohne Bedeutung“; die Legende zeigt beide. Die Spalte „Benötigte Angaben“ sagt je Auftrag, was gebraucht
   wird. TF-KU-04 (MAIL-013): Bleibt die Person leer, übernimmt der Generator laut Herleitung den Versicherungsnehmer aus
   V03-K01 (Stammdaten), sobald er dort gepflegt ist; die Zellen sind dann nicht mehr orange.
3. **Protokoll** (`tblTestmailProtokoll`): Je erzeugter Mail stehen hier Zeitpunkt, Auftrag, Variante und Datei (als
   Link). Dazu kommen die Anhänge, die Zahl der fehlenden Werte, ob trotzdem erstellt wurde, und wer erstellt hat.

### Ablauf

1. **Auswahlkarte**: Alle Mail-Aufträge stehen mit Testfall, Variante, Agentur und VNR in einer Liste. Eine Ampel zeigt
   „vollständig“ (grün), „n Werte fehlen“ (orange) oder „keine Mail“ (grau). Darüber gibt es Filter (Alle,
   Vollständig, Mit Lücken, Keine Mail), darunter Blättern mit bis zu 8 Aufträgen je Seite (auf kleinen Bildschirmen
   weniger, damit die Knöpfe sichtbar bleiben). Ein fehlerhafter Auftrag (zum Beispiel unlesbares Datum) erscheint mit
   „Prüfung fehlgeschlagen“, die übrigen bleiben wählbar. Steht die Zelle in einer
   Auftragszeile, ist dieser Auftrag vorausgewählt. Technische Datensätze (Weg B: MAIL-010, -014, -020) sind ausgegraut.
   Ein Klick zeigt das Auftragsziel.
2. **Prüfung**: Fehlen Werte, erscheint eine Karte mit Absender, Empfänger, Betreff und Anhang. Darunter steht jeder
   fehlende Wert mit der Stelle, an der er einzutragen ist, und dem Knopf **„Zum Feld“**. Er springt in die Zelle und
   blendet dort „Erneut prüfen“ ein. Daneben stehen Hinweise, zum Beispiel optionale Felder oder „bereits versendet“.
   Die Knöpfe sind **„Trotzdem erstellen“**, „Zur Auswahl“ und „Abbrechen“. Die Zahl der Zeilen richtet sich nach der
   Fensterhöhe („… und n weitere“).
3. **Erzeugen**: Die EML und die PDF-Anhänge landen im Ausgabeordner (siehe „Ablage“). Fehlende Werte bleiben als
   `[PLATZHALTER]` sichtbar. Im PDF sind sie orange gesetzt, eine leere Adresse steht als `Name <>` im Kopf.
4. **Ergebniskarte**: „Mail öffnen“, „Ordner öffnen“, „Als vorbereitet markieren“ (setzt in To-do Mailerstellung die
   Spalte „Mail vorbereitet“ auf „ja“), „Weitere Testmail“. Optional gibt es „Zusätzlich als MSG (Outlook)“. Liegt die
   Mail direkt auf SharePoint, nennt die Karte den SharePoint-Ordner und die lokale Arbeitskopie, „SharePoint-Ordner“
   öffnet den Ordner im Browser, und ein Satz sagt, dass dort nur die EML liegt (Vollmacht-PDFs als Anhang darin).
   Scheitert das Speichern auf SharePoint, heißt die Karte „Testmail erstellt – nur lokal“ und ein oranger Kasten
   sagt, was zu tun ist: meist den Ordner `Pruefbot_Testmails` auf SharePoint anlegen; besteht er schon, fehlen
   Schreibrechte oder die gleichnamige EML ist dort ausgecheckt oder geöffnet. Die Meldung von Excel steht in einer
   Zeile dahinter, der Kasten wächst mit dem Text.
5. **Karten**: Schleier und Karte liegen im sichtbaren Bereich des Fensters, auch wenn Zeilen und Spalten fixiert sind
   und das Blatt gescrollt ist. Klicks auf Karten werden per OnTime ausgeführt (nie im Klick der Form selbst). Sind die
   Karten nach einer Unterbrechung der Makros noch zu sehen, meldet ein Klick „Die Auswahl ist abgelaufen“ statt eines
   Laufzeitfehlers.

### Format und Ablage

- **EML mit `X-Unsent: 1`**: Outlook öffnet die Datei als Entwurf mit Senden-Knopf, Empfänger, Betreff, Text und
  Anhänge sind gesetzt. Die Datei entsteht ohne Outlook, ohne Bibliotheken und ohne Sicherheitsabfrage. MSG ist ein
  binäres Format und ginge nur über Outlook-Automation. Deshalb gibt es MSG nur als Zusatzknopf.
- **Aufbau der EML**: reines ASCII, CRLF, jede Kopfzeile in einer Zeile (unter 998 Zeichen), Text als UTF-8 in Base64,
  PDFs in Base64 zu 76 Zeichen. Die Datei enthält **kein Anführungszeichen, keinen Tabulator und kein Komma**, keine
  Zeile beginnt oder endet mit einem Leerzeichen – so übersteht sie den Excel-Textexport für SharePoint unverändert
  (siehe „Ablage auf SharePoint“). Deshalb: in Anzeigenamen und Betreff werden die Wörter mit Sonderzeichen (auch
  Komma oder Punkt) als kodiertes Wort nach RFC 2047 geschrieben statt in Anführungszeichen, der Rest bleibt lesbar
  (`From: Akkurat UV =?UTF-8?Q?Kuhnapfel=2C?= Henrik <…>`, `Subject: Test =?UTF-8?B?QsOc?= TF-GL-01 | KV | …`);
  `boundary=Pruefbot-Grenze-…` und `charset=utf-8` ohne Anführungszeichen; `Date` ohne Wochentag
  (`08 Oct 2026 16:39:34 +0200`, RFC 5322 erlaubt das; der Wochentag bräuchte ein Komma).
- **Absender**: immer das Absender-Postfach aus den Einstellungen, ohne Anzeigenamen. Bei einem Entwurf nimmt Outlook in
  der Regel das eigene Konto; vor dem Senden das Absender-Postfach im Feld „Von“ wählen. Die Ergebniskarte erinnert daran.
- **Dateinamen** (nur ASCII, mit Mailvariante): `MAIL-001_TF-GL-01_M-01_VNR317063119.eml`, ohne VNR
  `…_M-03_VNR-fehlt.eml`. Die Anhänge heißen
  `MAIL-001_TF-GL-01_Maklervollmacht.pdf` (auch `_Pool-Vollmacht`, `_Betreuungswunsch`, `_Untervollmacht`) und liegen
  zusätzlich neben der EML. Eine vorhandene Datei gleichen Namens wird ersetzt; lässt sie sich nicht löschen (geöffnet,
  schreibgeschützt), wird nichts geschrieben und eine Meldung erscheint – so bleiben keine Reste der alten Datei stehen.
  Im Mailkopf steht der Anhangsname als MIME-Token ohne Anführungszeichen (`filename=MAIL-001_…pdf`). Ein Name, der
  kein Token ist (Umlaut, Leerzeichen, Komma), stünde nach RFC 2231 als `filename*=UTF-8''Vollmacht%20M%C3%BCller…`
  in `Content-Disposition` und als umgeschriebener ASCII-Token in `Content-Type` (`name=Vollmacht-Mueller…`) – so
  schreiben es Exchange und Outlook selbst. Die Generator-Dateinamen sind heute immer Token; der Selbsttest prüft den
  anderen Fall.
- **Ordner** (Reihenfolge, `modTmEml.AusgabeZiel`):
  1. Einstellung „Ausgabeordner“, wenn gesetzt: ein lokaler oder Netzwerkpfad wie bisher; eine https-Adresse eines
     SharePoint-Ordners (auch die Browser-Adresse `…/AllItems.aspx?id=…` oder ein Link `…/:f:/r/…`) wird wie in 3.
     behandelt, nur ohne angehängtes `Pruefbot_Testmails`.
  2. Datei lokal geöffnet: `Pruefbot_Testmails` neben der Datei (wie bisher).
  3. Datei über https geöffnet (SharePoint, OneDrive): liegt der SharePoint-Ordner auch lokal – Bibliothek mit OneDrive
     synchronisiert (Windows-Registry `HKCU\Software\SyncEngines\Providers\OneDrive`, `UrlNamespace` → `MountPoint`)
     oder seit 1.3 auch über „Verknüpfung zu OneDrive hinzufügen“ bzw. einen Bibliotheksordner im Profil (Suche wie im
     BÜ-Reporting: OneDrive-Ordner, ihre Unterordner und `…\<Firma>\<Seite> - Dokumente`, Treffer nur, wenn dort die
     Arbeitsmappe liegt) –, dann `Pruefbot_Testmails` neben der Datei in diesem Ordner: EML und PDFs, der Ordner wird
     angelegt, OneDrive lädt hoch. Sonst direkt auf SharePoint in `<Ordner der Datei>/Pruefbot_Testmails` (siehe nächster
     Abschnitt); fehlt dieser Ordner, direkt neben die Arbeitsmappe.
  4. Datei noch nie gespeichert: `Dokumente\Pruefbot_Testmails`.

  Lokale Ordner werden angelegt. Gelingt das nicht, nennt die Meldung den versuchten Ordner und wo ein anderer
  einzutragen ist. WebDAV-Pfade (`\\host@SSL\DavWWWRoot\…`) werden nie benutzt – sie haben Excel in diesem Projekt
  minutenlang hängen lassen.
- **Datum** im Mailkopf: mitteleuropäische Zeit mit Sommerzeit nach EU-Regel, ohne Wochentag.
- **Anzeigenamen und Betreff mit Sonderzeichen** (`modTmEml.KopfWorte`): Wörter, die unverändert stehen dürfen, bleiben
  Klartext – im Anzeigenamen Buchstaben, Ziffern und die übrigen Zeichen aus RFC 5322 `atext` außer `=` und `?`
  (also auch `&`, `'`, `|`, `-`), im Betreff jedes druckbare ASCII-Zeichen außer `"` und `,`. Aufeinanderfolgende
  andere Wörter werden mit den Leerzeichen dazwischen zu **einem** kodierten Wort, als `=?UTF-8?B?…?=` oder
  `=?UTF-8?Q?…?=`, je nachdem, was kürzer ist (höchstens 75 Zeichen, RFC 2047). So stoßen keine zwei kodierten Wörter
  aneinander: Das Leerzeichen dazwischen lassen Outlook und RFC 2047 weg, Python liest es im Anzeigenamen mit – lange
  Namen wie „Mustermann Versicherungsmakler GmbH & Co. KG“ kämen sonst mit doppeltem Leerzeichen oder zerrissenem
  Wort an. Nur ein Lauf von Sonderzeichen-Wörtern über 45 Byte (B) und 63 Zeichen (Q) – etwa 30 Umlaute ohne
  Leerzeichen – wird geteilt, möglichst nach einem Leerzeichen.
- **Zeilenlänge im Mailkopf**: RFC 2047 begrenzt Zeilen mit kodierten Wörtern auf 76 Zeichen. Die Testmails bleiben
  darunter (Betreff rund 60, From/To höchstens 74 Zeichen). Ein langer Anzeigename mit Sonderzeichen samt Adresse kann
  darüber kommen – gefaltet wird trotzdem nicht, denn die Folgezeile begänne mit einem Leerzeichen, und ob der
  Excel-Textexport das unverändert lässt, ist nicht belegt. Outlook und Python lesen solche Zeilen;
  `eml_pruefen.py` meldet sie.

### Ablage auf SharePoint

Die Arbeitsmappe liegt künftig in einer SharePoint-Bibliothek (Ordner `00_Übergreifend`, `01_Fachkonzept`,
`02_Testkonzept`). So wird es eingerichtet:

1. Die Datei in der **Excel-Desktop-App** öffnen („In Desktop-App öffnen“; Excel im Browser führt keine Makros aus) und
   Makros aktivieren.
2. **Den Ordner `Pruefbot_Testmails` neben der Arbeitsmappe anlegen** (empfohlen; fehlt er, legt der Generator die EML seit 1.3 direkt neben die Arbeitsmappe) (im Browser: Neu › Ordner), also im selben
   SharePoint-Ordner wie `Pruefbot_Testing.xlsm`. Excel kann über https keinen Ordner anlegen – wie der Ordner
   `Praesentationen` beim HS-Dashboard muss er bestehen.
3. Die Einstellung „Ausgabeordner“ leer lassen. Wer die Mails woanders sammeln will, trägt dort die https-Adresse eines
   bestehenden SharePoint-Ordners ein (die Adresse aus der Browserzeile genügt).

Was wohin geschrieben wird:

| Fall | Ziel | Inhalt |
|---|---|---|
| Datei lokal oder im Netzlaufwerk | `Pruefbot_Testmails` neben der Datei | EML und PDFs (wie bisher) |
| Bibliothek mit OneDrive synchronisiert | `Pruefbot_Testmails` neben der Datei im synchronisierten Ordner | EML und PDFs, OneDrive lädt hoch |
| Datei nur über SharePoint geöffnet | `<SharePoint-Ordner der Datei>/Pruefbot_Testmails` | **nur die EML** – die Vollmacht-PDFs stecken als Anhang darin |
| | zusätzlich lokal `Dokumente\Pruefbot_Testmails` (Arbeitskopie) | EML und PDFs; „Mail öffnen“ und „Zusätzlich als MSG“ arbeiten damit |
| Ordner `Pruefbot_Testmails` fehlt auf SharePoint (seit 1.3) | `<SharePoint-Ordner der Datei>` direkt neben der Arbeitsmappe | nur die EML; die Ergebniskarte sagt es |
| Speichern auch dort abgelehnt | nur die Arbeitskopie | Ergebniskarte „Testmail erstellt – nur lokal“: häufigster Grund ist der fehlende Ordner `Pruefbot_Testmails` (anlegen); besteht er schon, fehlen Schreibrechte oder die gleichnamige EML ist dort ausgecheckt oder geöffnet. Dazu die Excel-Meldung in einer Zeile |

Das **Protokoll** nennt in „Datei“ die SharePoint-Adresse der EML (als Link), wenn sie dort liegt, sonst den lokalen
Pfad; „Anhänge“ trägt dann den Zusatz „auf SharePoint nur als Anhang in der EML“.

**Wie die EML auf SharePoint kommt** (Muster `CelonisSpZurueckschreiben` im BÜ-Reporting): VBA kann über https keine
Datei schreiben (`Open`/`Put` brauchen einen Dateipfad). Deshalb legt der Generator eine neue Arbeitsmappe an, stellt
Spalte A auf das Zellformat Text (`@`), trägt die EML zeilenweise ein (eine Zeile je Zelle) und speichert die Mappe mit
`SaveAs <https-Adresse>, FileFormat:=20` (xlTextWindows: Tabulator-getrennter Text, Windows-1252, CRLF). Binärdateien
gehen auf diesem Weg nicht, die PDFs liegen auf SharePoint deshalb nur als Anhang in der EML. Vorher speichert Excel
dieselbe Mappe einmal als **Probe** lokal (`%TEMP%\Pruefbot_Excelprobe.txt`); der Generator liest die Probe Byte für
Byte und vergleicht sie mit der EML. Nur wenn sie gleich ist (geduldet wird allein ein fehlendes Zeilenende nach der
Schlussgrenze, das nach RFC 2046 optional ist), geht die Datei nach SharePoint – eine Abweichung (etwa
eine andere Excel-Version oder Ländereinstellung, die doch Anführungszeichen setzt) landet so nie als kaputte Mail
dort, sondern als Hinweis auf der Ergebniskarte. Die Probe wird danach gelöscht.

**Regeln des Excel-Textexports (FileFormat 20)** und wie die EML sie einhält. Microsoft dokumentiert die Regeln nicht
vollständig; belegt ist, was unten als Quelle steht, der Rest ist vorsichtig angenommen und durch die Probe abgesichert.

| Regel | Quelle / Begründung | Folge für die EML |
|---|---|---|
| Eine Zelle mit **Komma** oder **Anführungszeichen** wird in `"…"` gesetzt, innere `"` werden verdoppelt – auch im Zellformat Text und beim Tabulator-Export | Microsoft, zitiert in der CTAT-Nutzergruppe (2011): Felder mit „comma, quotation mark, or other character that could be misinterpreted when you reopen the file“; Microsoft Q&A „Excel 2011 Save As tab delimited txt file with quotation marks“ (Spalte im Format Text, Werte „Nachname, Vorname“ kommen in Anführungszeichen); excel.tips.net „Getting Rid of Extra Quote Marks in Exported Text Files“ (verdoppelte innere Anführungszeichen); BÜ-Reporting `LogText`/`TextFeld` | kein `"` und kein `,` in der Datei: Wörter mit solchen Zeichen in Namen und Betreff als kodierte Wörter, Parameter ohne Anführungszeichen, Datum ohne Wochentag |
| **Tabulator** trennt Felder, **Zeilenumbruch** beendet den Datensatz; beides in einer Zelle führt ebenfalls zu `"…"` | Format selbst („other character that could be misinterpreted“) | kein Tabulator (Text in Base64), je Zelle genau eine Zeile ohne CR/LF |
| Ein führendes `'` ist das **Präfixzeichen** und gehört nach `Range.Value` nicht zum Zellwert | Excel-Verhalten (PrefixCharacter) | keine Zeile beginnt mit `'` |
| Führende `=`, `+`, `-`, `@` | ungefährlich: das Zellformat Text wird **vor** dem Eintragen gesetzt, Excel legt den Wert als Text ab statt als Formel | Grenzzeilen `--Pruefbot-Grenze-…` und Base64-Zeilen mit `+` am Anfang bleiben, wie sie sind |
| Leerzeichen am Zeilenrand | kein sicherer Beleg (eine Forenquelle nennt sie für CSV) | vorsichtshalber vermieden: Kopfzeilen werden nicht gefaltet (dafür kann eine Zeile mit kodiertem Wort bei langen Namen über die 76 Zeichen aus RFC 2047 kommen, siehe „Zeilenlänge im Mailkopf“), keine Zeile endet mit einem Leerzeichen, leerer Betreff als `Subject:` |
| Semikolon (Listentrennzeichen bei deutschen Einstellungen) | keine Quelle nennt es für den Tabulator-Export | in MIME unvermeidbar (`Content-Type: …; boundary=…`); abgesichert durch die Probe |
| Länge | Zelle bis 32.767 Zeichen; RFC 5322 erlaubt 998 Zeichen je Zeile | jede Zeile unter 998 Zeichen (heute höchstens rund 100) |
| Genutzter Bereich, letzte Zeile | Excel schreibt von der ersten bis zur letzten nicht leeren Zeile, jede Zeile mit CRLF (auch die letzte); leere Zellen dazwischen ergeben leere Zeilen | EML endet mit `--Pruefbot-Grenze-…--` und CRLF; erste und letzte Zeile sind nie leer. Fehlte bei einer Excel-Version das letzte CRLF, bliebe die Mail gültig (RFC 2046) – die Probe duldet genau diesen Unterschied |
| Textzellen mit mehr als 255 Zeichen zeigt Excel als `####` | Excel-Anzeige im Zellformat Text; ob der Export dann den Text schreibt, ist nicht belegt | die längste Zeile der Testmails hat rund 100 Zeichen; eine längere fiele in der Probe auf |
| Zeichensatz, Zeilenende | xlTextWindows: Windows-ANSI (1252), CRLF | EML ist reines ASCII mit CRLF – in 1252 byte-gleich |
| Fehlende Trennzeichen am Zeilenende nach Zeile 16 | betrifft nur mehrere Spalten | nur Spalte A |

`eml_pruefen.py` prüft jede EML auf diese Regeln (kein `"`, kein Tabulator, kein Komma, keine Zeile mit Leerzeichen am
Rand oder `'` am Anfang, alle Zeilen unter 998 Zeichen) und simuliert den Export (Zeilen in Zellen, Export nach den
Regeln oben); die Simulation muss byte-gleich dieselbe Datei ergeben. In VBA prüft `modTmEml.ExcelTextSicher` dasselbe
vor dem Speichern auf SharePoint. Dazu prüft `eml_pruefen.py` RFC 2047 im Mailkopf: kodierte Wörter höchstens 75
Zeichen, Zeilen mit kodierten Wörtern höchstens 76 Zeichen (mit `--lange-kopfzeilen` nur als Hinweis), in From/To keine
aneinanderstoßenden kodierten Wörter.

### Betreff, Text und Signatur

Betreff und Text kommen aus den Vorlagen in `tblMailanforderungen`. Die Platzhalter werden genau wie in den Formeln
von `tblMailAuftraege` ersetzt: `[TESTFALL-ID]`, `[SPARTE]`, `[IMSI-VNR]`, `[AGENTURNAME]`, `[AGENTURNUMMER]`,
`[VERMITTLERNUMMER]` und `[VN-ODER-FIRMENNAME]`.

- **Datenquelle**: Der Generator liest nur die Eingabezellen der Stammdaten, der Testfall-Matrix und der Vorlagen. Er
  rechnet also auch dann richtig, wenn Excel noch nicht neu berechnet hat.
- **Ausnahme M-10 und M-11**: Hier steht die andere bzw. die fiktive Person statt des Versicherungsnehmers. Sonst würden
  BE-07 bis BE-09 nicht ausgelöst.
- **Signatur**: Bei den Maklermails (Postfach-Spalte P-01, P-02) stehen Agenturname, Agenturnummer, Vermittlernummer
  (sofern gepflegt) und die E-Mail der Agentur. M-12 (unbekannter Absender) und M-13 (interne Weiterleitung) haben keine
  Signatur; der Weiterleitungskopf von M-13 nennt das Absender-Postfach.
- **M-13**: Die Mail ist eine interne Weiterleitung mit Kopf (Von, Gesendet, An, Betreff) und der ursprünglichen
  Maklermail nach Basisvorlage M-01.

### Varianten

| Variante | Postfach (Signatur) | Anhang | Abweichung im Dokument |
|---|---|---|---|
| M-01, M-08 | P-01 | Maklervollmacht | keine |
| M-02 | P-01 | Betreuungswunsch | Betreuer = MFA |
| M-03 | P-02 | Pool-Vollmacht + Untervollmacht | Gesamtumfang angekreuzt, Untervollmacht „ja“, Unterlagenanforderung (4e und Untervollmacht) |
| M-04 | P-02 | Maklervollmacht | Bevollmächtigter = Pool, Untervollmacht „nein“, keine Untervollmacht beigefügt |
| M-05 | P-01 | Maklervollmacht | Unterschriftsfeld leer, Ort und Datum gefüllt |
| M-06 | P-01 | Betreuungswunsch | Absatz zum BÜ-Wunsch entfällt ganz |
| M-07 | P-01 | Betreuungswunsch | Betreuer = abweichender Vermittler (Vorbelegung A-01, fachlich bestätigen) |
| M-09 | P-01 | Maklervollmacht | Geburtsdatum mit vertauschtem Tag und Monat (oder Eingabe „Abweichendes Geburtsdatum“) |
| M-10 / M-11 | P-01 | Maklervollmacht | Vollmachtgeber = andere vorhandene bzw. fiktive Person (Eingabe) |
| M-12 | P-04 | Maklervollmacht | Bevollmächtigter leer, keine Agenturnummer, keine PNR |
| M-13 | P-03 | Maklervollmacht | Geburtsdatum vertauscht, eine Unterlagenlücke laut Eingabe (Datum, Vollmachtsumfang oder Anschrift fehlt) |
| Weg B | – | – | keine Mail |

### Fehlende Werte

Als **fehlend** gilt, was als Platzhalter in Mail oder Dokument stehen bliebe. Dazu zählt auch eine fehlende
aufnehmende Agentur in der Testfall-Matrix (leer oder „keine“ bei einer anderen Variante als M-12) und ein nicht
lesbares Datum in den ergänzenden Testdaten (zum Beispiel „12.03.198500“ oder „31.02.1980“). Dazu gehören auch die Pflichtfelder des
Dokuments, die Eingaben für die gezielten Abweichungen und die Adresse des Absenderpostfachs.
Beispiele sind Absenderadresse, VNR, Sparte, VN-Name, Agenturname und -nummer,
IMSI-Geburtsdatum bei M-09 und M-13, Person bei M-10 und M-11, Untermakler und Unterlagenanforderung bei M-03,
abweichender Vermittler bei M-07, Unterlagenlücke bei M-13 und die Anzeigenamen von P-03 und P-04.

Nur **Hinweise** sind leere optionale Felder (Anschrift, PNR, Makler-E-Mail, Geburtsdatum außerhalb von M-09 und M-13),
„bereits versendet“, „Abgeberzuordnung unvollständig“, P-03 ohne „@ergo“ (PN-07 entstünde nicht), M-12 mit Ziffern
oder Agenturnamen im Anzeigenamen, die EMMA-Freiheit von P-04, Firmenkunde ohne vertretungsberechtigte Person, die
Übernahme der Person aus V03-K01 (TF-KU-04), „Formel meldet BLOCKIERT“ und Namen mit Zeichen, die die Vollmacht nicht
darstellen kann (siehe unten).

Stand der Datei heute: MAIL-001 ist vollständig (Empfänger und Absender vorbelegt).

### Die Vollmacht

Die Beschriftungen folgen der Vorlage des Fachbereichs: Vertragsnummer, Sparte, Versicherungsnehmer / Firma, Anschrift,
Geburtsdatum, Makler / aufnehmende Agentur, Agenturnummer, Vermittlernummer / PNR, Kontakt, Vollmachtsumfang, Ort,
Datum, Unterschrift Versicherungsnehmer. Auch der Satz zum Vollmachtsumfang und der Korrespondenzsatz stammen aus der
Vorlage. Ergänzt um die üblichen Bestandteile einer Maklervollmacht:

- Anschrift des Maklers und Registrierungsnummer nach § 34d GewO
- „sowie alle weiteren Verträge“ (Gesamtumfang) als Kästchen
- **ausdrücklicher BÜ-Wunsch** (fett, damit die Deckblatt-Erkennung ihn findet)
- Befugnis zur Untervollmacht ja/nein
- bei KV und Leben die Einwilligung und Schweigepflichtentbindung für Gesundheitsdaten
- Geltung und Widerruf, einschließlich Widerruf früherer Vollmachten
- bei Firmen kein Geburtsdatum, dafür ein Hinweis zur vertretungsberechtigten Person

Die Unterschrift ist ein handschriftlich wirkender Pfad aus dem Namen. Sie ist deterministisch: gleicher Name, gleiche
Unterschrift; „ß“ wird als „ss“ geschrieben. Bei Firmenkunden unterschreibt die eingetragene vertretungsberechtigte
Person, ihr Name steht unter der Linie („Vertretungsberechtigte Person: …“); ohne Eintrag entsteht die Unterschrift aus
dem Firmennamen und ein Hinweis erscheint.

**Zeichen außerhalb der PDF-Schrift**: Die Dokumente nutzen die Standardschrift Helvetica (Zeichensatz Windows-1252).
Buchstaben außerhalb davon werden im PDF und in der Unterschrift auf den Grundbuchstaben umgeschrieben (Ł → L, Ż → Z,
ı → i, ş → s, ő → ö …), statt als „?“ zu erscheinen. Die Mail selbst behält den Namen unverändert (UTF-8); der
Generator weist auf den Unterschied hin, weil Mail und Vollmacht dann voneinander abweichen. Betreuungswunsch (Mehrfachagent) und Untervollmacht (Pool an Untermakler) sind gleich aufgebaut. Jedes
Dokument hat eine Seite (A4), die Fußzeile „Testdokument Prüfbot | MAIL-xxx | TF-xx | erstellt …“ lässt sich
abschalten. Die PDFs entstehen direkt in VBA und brauchen weder Drucker noch Vorlage.

## Datenerhalt

- **Übernommen** ist alles Inhaltliche:
  - alle 12 Tabellen mit gleichen Namen und Spalten, allen Werten und allen Formeln wörtlich, samt zwischengespeicherter
    Ergebnisse
  - 72 dynamische Arrayformeln
  - abweichende Einzelzellen in berechneten Spalten
  - 16 Gruppen von Datenüberprüfungen, als normale Listen mit Bezug auf „Listen & Parameter“
  - alle Regeln der bedingten Formate in gleicher Reihenfolge, aber mit neuen Farben
  - 11 Kommentare (als Notiz)
  - der mailto-Link
- **Lage**: Jedes Blatt ist um eine Randspalte und einige Zeilen verschoben, die Zeilen 1 bis 4 trägt das Kopfband.
- **Neu**:
  - das Blatt Testmail-Generator
  - die Tabelle `tblPruefnotizen`: der Prüfnotizenkatalog auf BE Übersicht, vorher ein loser Bereich mit denselben
    Zellen
  - Auswahllisten, die im Original fehlten: Abgeber-Status und -Owner, Auftragsart, Status der Voraussetzungen
  - Zusatzregeln für die Pillenfarben
  - eine ergänzte Liste in „Listen & Parameter“, Spalte K
- `quellen/vergleich.py` meldet **0 FEHLER** (Original gegen Neubau, mit `quellen/zuordnung.json`). Die 194 HINWEISE
  betreffen nur Lage, Tabellenstil, Farben, zusätzliche Regeln und Listen sowie das zusätzliche Blatt.
- Bewusst ersetzt sind 17 Zellen; die Begründung steht in `zuordnung.json`:
  - Die fünf Kennzahl-Kacheln der Startseite waren Texte wie „14\nBusiness Exceptions“. Jetzt sind Zahl und
    Bezeichnung getrennt, und die Zahl ist eine Formel aus der jeweiligen Tabelle mit gleichem Ergebnis.
  - Die drei Navigationstexte „Zurück zu Start & Übersicht | …“ sind jetzt ein Knopf; der beschreibende Teil steht
    unverändert als Untertitel.
  - Die Zählerleisten „fachliche Testfälle 21 | operative … 24“ auf To-do Mailerstellung und Testfall-Tracking
    (je 4 Zellen) entfallen, weil dieselben Zahlen im Cockpit stehen.
  - Der Block „Agenturzustände“ der Startseite (G3) entfällt; dieselben Zahlen stehen als Kennzahlen auf
    „Agenturkonstellationen“.
- **Vertraulichkeitskennzeichnung** (MIP-Label) des Originals wird 1:1 übernommen (`docMetadata/LabelInfo.xml`,
  Beziehung und Inhaltstyp).
- **Bewusste Abweichungen**:
  - Fixiert sind nur Kopfband bzw. Tabellenkopf, nicht die ID-Spalten: Excel zeichnet Text, der über die Fixierlinie
    hinausläuft, im rechten Bereich nicht weiter – Untertitel und Legende im Kopfband wären abgeschnitten.
  - Statusfarben: „nein“ war im Original rot, „bereit“ grün, „offen“ im Tracking gelb. Jetzt sind „nein“ und „offen“
    zurückhaltend grau und „bereit“ blau; rot sind „blockiert“ und die Zeilen, deren Formel „BLOCKIERT“ meldet. Die
    Regeln des Originals sind mit gleichen Bedingungen und in gleicher Reihenfolge vorhanden; davor stehen die
    Zusatzregeln für die neuen Farben.
  - Die 11 verketteten Kommentare (Threaded Comments) auf Stammdaten stehen als klassische Notizen mit gleichem Text an
    der verschobenen Stelle; Unterhaltungsfunktion, Zeitstempel und Personen-ID entfallen.
  - Der Ablauftext der Startseite (Original E6) steht unverändert in der ausgeblendeten Hilfsspalte O; die Stationen
    zeigen seine Teile.
  - Der Prüfnotizenkatalog auf BE Übersicht hat eine breitere Spalte „Besonderheit“; die Summenzeile von tblBE zeigt
    „Summe 21“ (Zahlenformat, Wert unverändert). tblBE[Sortierung] behält das Textformat „@“.

## Prüfen

Aus `quellen/`:

```bash
python3 pruefen.py /tmp/pruefbot_pruefung   # alles in einem Zug
```

1. **Build**: VBA-Prüfung, cp1252-Prüfung und Option Explicit.
2. **Vergleich** mit dem Original (0 FEHLER).
3. **LibreOffice**:
   - alle Module laden
   - `GeneratorVersion`
   - `TestmailFehlend` für MAIL-001, MAIL-003 und MAIL-010
   - `TestmailErzeugen` für MAIL-001 (mit Beispieladressen, nur in der geladenen Kopie) und MAIL-003 (trotzdem)
   - `EmlSelbsttest`: Anzeigenamen mit Komma, Umlauten und Zeichen außerhalb Windows-1252, ein langer Anzeigename
     (Wort über 45 Byte mit Komma, dazu `&` und Punkt), Betreff mit Anführungszeichen, Komma, Semikolon und `=?`, Text
     mit Tabulator, ein Anhangsname mit Umlaut, Komma und Leerzeichen (RFC 2231)
   - `KopfWorte` für 22 Anzeigenamen und Betreffe (lange Maklernamen, Komma, Punkt, `&`, `|`, Semikolon, Umlaute,
     Zeichen außerhalb der BMP, mehrere Leerzeichen, Tabulator): mit Python (`policy.default` und `compat32`)
     dekodiert gleich der Eingabe, exportsicher, kodierte Wörter höchstens 75 Zeichen, im Anzeigenamen nie
     aneinanderstoßend (Ausnahme nur der absichtlich unteilbare Lauf aus 30 Umlauten); `EinZeilig` für eine
     mehrzeilige Excel-Fehlermeldung
   - Pfadwahl `AusgabeZiel` mit lokalen Pfaden, https-Adressen (direkt, mit `%20`, Browser-Adresse mit `?id=`,
     Freigabelink `/:f:/r/`) und einer synchronisierten Bibliothek (Test-Zuordnung über `SyncTestSetzen` statt der
     Registry; Datei im Sync-Ordner vorhanden bzw. nicht vorhanden, andere Bibliothek)
   - SharePoint-Zweig von `TestmailErzeugen` (Vorgabe = https-Adresse): Arbeitskopie in `Dokumente\Pruefbot_Testmails`.
     LibreOffice ignoriert `FileFormat:=20` und schreibt eine XLS-Datei; die Probe muss das erkennen, auf SharePoint
     wird dann nichts abgelegt und die Mail bleibt lokal (geprüft über `GeneratorAblage`)
4. **`eml_pruefen.py`**:
   - MIME lesbar, Anzeigenamen und Dateinamen dekodiert
   - Excel-Textexport: Regeln und Simulation (siehe „Ablage auf SharePoint“)
   - Anhänge byte-gleich mit den PDFs daneben
   - PDF-Syntax geprüft (qpdf über pikepdf)
   - je eine Seite
   - RFC 2047 im Mailkopf (Länge der kodierten Wörter und Zeilen, keine aneinanderstoßenden Wörter in From/To)
   - beim Selbsttest mit `--erwarte`: Anzeigenamen, Adressen, Betreff, Text und Dateinamen wie eingegeben
5. **Bilder** der Blätter.

Die Werkzeuge einzeln: `pruefbot_build.py`, `vergleich.py`, `lo_pruefen.py` (mit `--json` für die Rückgaben,
`--ruf-json` für Argumente mit `|` oder Zeilenumbruch), `eml_pruefen.py` (mit `--erwarte Feld=Wert`,
`--lange-kopfzeilen`), `rendern.py`.
LibreOffice läuft dabei mit eigenem Profil und eigenem Port (änderbar über `LO_PORT`, `LO_PROFIL` und
`LO_PROFIL_RENDER`, wenn parallel andere LibreOffice-Läufe arbeiten).

LibreOffice setzt umbrochene Zeilen etwas enger als Excel (etwa 10,7 statt 11,25 pt). In der Vorschau ragt deshalb bei
kompakten Zeilen unten der Anfang der nächsten Textzeile hinein; in Excel endet die Zeile zwischen zwei Textzeilen.

Die LibreOffice-Vorschau zeigt in Zellen, deren Formel ein leeres Ergebnis hat, `#NAME?`. LibreOffice kennt XLOOKUP und
LET nicht und rechnet diese Zellen neu. Beim Original ist das genauso; Excel rechnet beim Öffnen ohnehin alles neu. Die
Karten (Dialoge) sind nur in Excel zu sehen.

### Funktionen ohne Dialog (VBA)

- `TestmailFehlend(auftragsId) As String` liefert die fehlenden Werte als Zeilen „Feld – wo eintragen“. Leer heißt
  vollständig, „KEINE MAIL: …“ steht bei Weg B oder einem technischen Datensatz.
- `TestmailHinweise(auftragsId) As String` liefert die Hinweise als Zeilen.
- `TestmailErzeugen(auftragsId, ordner, trotzdem) As String` liefert den Pfad der EML im lokalen Ausgabe- bzw.
  Arbeitsordner und schreibt die Protokollzeile. `ordner` darf auch eine https-Adresse sein. Bei einem Fehler ist das
  Ergebnis leer; den Grund liefert `GeneratorLetzterFehler()`.
- `GeneratorAblage() As String`: Ablage der letzten Testmail als `Art|Quelle|Ziel|SharePoint-Datei|Hinweis`.
- `EmlSelbsttest(ordner, mitExcel) As String`: Selbsttest des EML-Formats (siehe „Prüfen“). Mit `mitExcel = True`
  speichert Excel die EML zusätzlich über den Textexport (mit Probe) als `SELBSTTEST_Excel.eml` und vergleicht sie –
  so lässt sich in Excel prüfen, ob der Export auf diesem Rechner byte-gleich ist (Direktfenster:
  `?modTestmail.EmlSelbsttest("C:\Temp", True)`, danach `?modTestmail.GeneratorLetzterFehler()` – leer heißt gleich).
- `modTmEml.AusgabeZiel(vorgabe, einstellung, dateiOrdner, dateiName) As String`: Pfadwahl ohne Dialog und ohne
  Schreiben, Rückgabe `Art|Quelle|Ziel|Arbeitsordner` (Art `LOKAL`, `SYNC`, `SHAREPOINT`, `DOKUMENTE`; Quelle `Vorgabe`,
  `Einstellung`, `Datei`). `modTmEml.SyncTestSetzen(adresse, ordner)` ersetzt für die Prüfung die Registry durch eine
  Zuordnung (leer = Registry).
- `GeneratorVersion() As String`

## Aufbau der Quellen

| Datei | Inhalt |
|---|---|
| `quellen/pruefbot_build.py` | baut die xlsm. Es liest das Original roh aus dem XML, schreibt mit xlsxwriter, bearbeitet nach (Formen, Makros, Array-Kennzeichen, leere Textergebnisse) und schreibt `zuordnung.json`. |
| `quellen/vba/modTmBasis.bas` | Tabellenzugriff (ListObjects, in LibreOffice Kopfsuche), Einstellungen, Formate |
| `quellen/vba/modTmModell.bas` | Modell der Testmail je Auftrag: Platzhalter, Varianten, Dokumentfelder, fehlende Werte |
| `quellen/vba/modTmPdf.bas` | PDF-Erzeugung (reines ASCII, xref) und die vier Dokumente |
| `quellen/vba/modTmSign.bas` | Unterschrift als Bezier-Pfad |
| `quellen/vba/modTmEml.bas` | UTF-8, Base64, RFC 2047/2231, EML (exportsicher), binäres Schreiben (Put), Ausgabeweg (`AusgabeZiel`, Registry-Zuordnung, SharePoint-Adressen), Speichern über den Excel-Textexport mit Probe |
| `quellen/vba/modTestmail.bas` | Knopf, Karten, Erzeugen, Protokoll, „Als vorbereitet markieren“, MSG |
| `quellen/vba/modKarte.bas` | Karten als Formen (modale Fenster) |
| `quellen/vba/modNav.bas` | Doppelklick und „Volltext ein/aus“ |
| `quellen/vba/*.cls` | Blattmodule für den Doppelklick |
| `quellen/ovba.py` | erzeugt `vbaProject.bin` aus den Quellen |
| `quellen/vba_pruefung.py`, `xlsxroh.py`, `vergleich.py` | Prüfwerkzeuge |
| `quellen/quelle/` | Original `Pruefbot_Testing.xlsx` und `Maklervollmacht_Vorlage.pdf` (Bezug) |

## Offene Punkte

- **Stammdaten**: Nur V01-01 und A-01 sind gepflegt. Deshalb fehlen den meisten Aufträgen noch Werte; die
  Auswahlkarte zeigt je Auftrag, welche.
- **Fachlich zu bestätigen**:
  - M-03: Ist A-03 der Pool? So ist es angenommen.
  - M-07: Ist A-01 als abweichender Vermittler richtig? So ist es vorbelegt.
  - M-13: Welche Unterlagenlücke soll PN-01 auslösen, ohne eine harte BE?
  - M-13: Liest der Bot den ursprünglichen Absender aus dem Weiterleitungskopf? Dann gefährdet die P-01-Adresse dort
    PN-07.
  - M-13: Ist die Basisvorlage M-01 als weitergeleitete Mail richtig?
  - M-09 und M-13: Soll das falsche Geburtsdatum auch im Mailtext stehen? Bisher steht es nur in der Vollmacht.
  - M-12: Soll überhaupt eine Vollmacht beiliegen?
  - V01-01 hat als Geburtsdatum 01.01.2000. Vertauschen wirkt dort nicht, der Generator verlangt dann ein abweichendes
    Geburtsdatum.
  - Firmenkunden: Soll die vertretungsberechtigte Person Pflicht werden? Bisher optional (ohne Eintrag Unterschrift aus
    dem Firmennamen).
  - Namen mit Zeichen außerhalb Windows-1252: Reicht der Hinweis, oder soll auch die Mail die umgeschriebene Form nutzen?
- **Werte außerhalb der Auswahlliste schon im Original**: Stammdaten „anhand des konkreten Produktivvertrags
  bestimmen“ (Abgebender Agenturtyp, Liste: „anhand Produktivvertrag zu bestimmen“) und „gemäß ausgewähltem
  Produktivvertrag beziehungsweise Hostzustand bestätigen“ (Abgeberstatus). Unverändert übernommen; „Ungültige Daten
  einkreisen“ markiert sie. Fachbereich: Listenwerte angleichen.
- **Nicht in Excel getestet**: Karten (auch ihre Lage bei fixierten und gescrollten Bereichen), Knöpfe, Doppelklick,
  „Volltext ein/aus“ mit aktivem Filter, MSG über Outlook und das Öffnen in Outlook. Geprüft sind
  die VBA-Quellen statisch (Excel-Kompilierregeln) und die Logik in LibreOffice: alle Module laden, alle 21
  Testmail-Aufträge erzeugt und geprüft.
- **SharePoint, nicht in Excel getestet**: das Speichern über den Excel-Textexport (Probe und `SaveAs` auf https), die
  Registry-Zuordnung einer synchronisierten Bibliothek und das Öffnen des SharePoint-Ordners im Browser. Ob Excel bei
  deutschen Ländereinstellungen Zeilen mit Semikolon in Anführungszeichen setzt, ist nirgends belegt; die Probe fängt
  es ab (dann „nur lokal“ mit Hinweis). Erster Test in Excel: `?modTestmail.EmlSelbsttest("C:\Temp", True)` im
  Direktfenster, danach eine Testmail mit der Datei auf SharePoint und dem Ordner `Pruefbot_Testmails`.
- **Outlook**: Kodierte Wörter (RFC 2047, B und Q, auch gemischt mit Klartext im selben Anzeigenamen),
  Anhangsnamen nach RFC 2231 und Parameter ohne Anführungszeichen sind Standard und werden von Outlook selbst so
  geschrieben; geprüft ist das hier mit dem Python-Paket `email`, nicht mit Outlook. Vor dem ersten Versand eine EML aus
  dem neuen Stand in Outlook öffnen (Entwurf mit Anhang, Absender, Betreff) – am besten die des Selbsttests
  (`SELBSTTEST_Pruefbot.eml`, langer Empfängername mit Komma und `&`).
- **Lange Anzeigenamen mit Sonderzeichen**: Zeilen mit kodierten Wörtern können dann über 76 Zeichen kommen (RFC 2047);
  bewusst nicht gefaltet, siehe „Zeilenlänge im Mailkopf“.
