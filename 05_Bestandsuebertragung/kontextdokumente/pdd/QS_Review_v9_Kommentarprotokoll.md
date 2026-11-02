# Kommentarprotokoll zur Reviewfassung v9 (Stand 23.09.2026)

Grundlage: `PDD_Vorpruefung_BUE_Gesundheit_KV_v9.docx` mit 34 Kommentaren (Jeglorz, Juraschek, Rypa, 24.08.–22.09.2026).
Ergebnis: `PDD_Vorpruefung_BUE_Gesundheit_KV_v10.docx` – zweisprachig nach dem Template (englische Übersetzung in der
dritten Spalte der Schritttabellen, in den „answer“-Spalten der Design-Tabellen und in den Überschriften der Schrittkapitel;
Variablen, Felder, Systeme und Werte bleiben deutsch). Alle Kommentare sind aus dem Dokument entfernt; ihr Stand steht hier.

| Nr | Autor | Kommentar (Anker) | Stand in v10 |
|---|---|---|---|
| 2 | Jeglorz | Process Owner einfügen (Versionierung) | umgesetzt – Dirk Amend (HS) und Christoph-Reber Lucht (ODPP) auf dem Deckblatt und als fachlicher Process Owner in den Ansprechpartnern |
| 3 | Juraschek | SME aus dem Fachbereich eintragen, der das PDD mitgeschrieben hat | umgesetzt – Dirk Amend (SME) auf dem Deckblatt |
| 10 | Jeglorz | Involvierte Geschäftsbereiche durch Robotics ergänzen | offen – Robotics / D. Amend; Tätigkeiten sind auf den v10-Stand gebracht (IS011 statt IS100, Nachbearbeitung statt Ablehnung) |
| 11 | Juraschek | Involvierte Geschäftsbereiche: muss Dirk ausfüllen | offen – D. Amend (Gruppe, Abteilung, Standort) |
| 22 | Jeglorz | Ablaufdiagramm durch Robotics validieren | umgesetzt – Diagramm neu gezeichnet auf die acht Kapitel (ohne Reminder, ohne Klassifikationsprüfung, mit E-Mail-Ermittlung); Validierung durch Robotics offen |
| 25 | Jeglorz | Betriebsparameter durch Robotics validieren | offen – Robotics; Texte auf den v10-Stand gebracht (Datensicherheit: IS011, keine Mails durch den Bot) |
| 34 | Jeglorz | Reporting: Platzhalter, Aufnahme in die finale Version klären | offen – Robotics; Tags im Kapitel „Inhalt der Reports“ auf BE-Klassifikation und Prüfnotizen umgestellt |
| 41 | Jeglorz | Eingangskanal „Eröffnung eines Postkorbvorgangs im EWMS“: noch zu klären | umgesetzt – Celonis eröffnet je Versicherungsnummer über die EMWS-Schnittstelle (E-Mail, Anhänge, KI-Deckblatt, Datenpool) |
| 43 | Juraschek | „Informationen zum Themenpostkorb“ war leer, bitte füllen | umgesetzt – Startpostkorb „MV 23724 BÜ Prüf BOT“ (Postkorb-Nr. 23724, alle Sparten), Dokumenttyp 2015 (KV) bzw. GeVo 108 (Komposit/Leben), Startkriterium Datensatz im Datenpool, Zielpostkorb bei Befund; Abnahmeumgebung TBD (Robotics) |
| 46 | Jeglorz | Design: Review durch Robotics | offen – Robotics; Antworten auf IS011/Scout-Service und EMWS-Eröffnung angepasst |
| 55 | Jeglorz | Variablentabelle validieren, Format gegenchecken | teilweise – Tabelle vollständig auf die Schrittkapitel abgeglichen (IS100-, EOS- und Notiz-Altvariablen entfernt; IS011-KNR-VN, IS011-KNR, IS011-Gebdat, OB726-Email, Makler-Email neu); Formatprüfung durch Robotics offen |
| 56 | Jeglorz | BUE_ART_UNTERLAGEN: Ausprägungen einfügen | umgesetzt – Ausprägungen nach den Kennzeichen der Notizmaske 1515 (Police/Vertragsspiegel/Vertragsauszug/Ersatzrechnung; Schadenaufstellung/Schadenrenta; Sonstige Unterlagen); für KV nicht ausgewertet |
| 59 | Jeglorz | Screenshots (Fachbereich) und englische Übersetzung einfügen, validieren | umgesetzt – englische Übersetzung in der dritten Spalte jeder Schritttabelle (gleiche Struktur, Steuerwörter IF/THEN/ELSE/END IF, Variablen unverändert), Überschriften zweisprachig; Screenshot OB726 E-Mail-Feld fehlt noch (Fachbereich); Validierung durch Robotics offen |
| 62 | Juraschek | Variablen mit Nomenklatur `<Variablenname>` | umgesetzt – durchgehend, auch in der IS011-Logik (`<IS011-KNR-VN>`, `<IS011-KNR>`, `<IS011-Gebdat>`) |
| 63 | Rypa | Postkorb und Postkorbnummer ergänzt | umgesetzt – „MV 23724 BÜ Prüf BOT“, Postkorb-Nr. 23724 (Angabe E. Brenneisen, 23.09.2026) in Start und Eingangskanal |
| 64 | Jeglorz | Verweis auf Liste aller Datenpoolfelder + GeVo-Nummer | umgesetzt – 35 Felder als Liste im Startkapitel; KV läuft über Dokumenttyp 2015, Komposit/Leben über GeVo 108 |
| 68 | Jeglorz | IS011-Logik einfügen | umgesetzt – Logik des Fachbereichs übernommen und bereinigt: Kundennummer über die VNR, Matchcodesuche, Trefferliste/Einzeltreffer, Scout-Service nur zur Bestimmung des BE-Grunds, Geburtsdatum als Prüfnotiz statt BE |
| 72 | Juraschek | Weiche: „Wenn AGT leer BE“ muss in Schritt 1 übernommen werden | umgesetzt – in der Vorprüfung (vor jedem Hostzugriff): `<BUE_AGENTUR_NR>` leer → BE „Agenturnummer nicht vorhanden“; Weiche in Kapitel III verweist darauf |
| 74 | Jeglorz | PNR sauber auslesen: ohne „P,“, nur die siebenstellige Nummer | umgesetzt – `<OB726-PNR>` 7-stellig ohne Präfix; ein gefülltes `BUE_VERMITTLER_NR` wird links mit Nullen auf 7 Stellen aufgefüllt; Prüfung der Auslesbarkeit durch Robotics als Hinweis |
| 75 | Juraschek | Was passiert, wenn BUE_VERMITTLER_TYP leer ist? | entschieden (E. Brenneisen, 23.09.2026): keine eigene Prüfung – ein leerer Typ läuft durch den Makler-Zweig; dort muss eine unterschriebene Maklervollmacht vorliegen, sonst entsteht ohnehin die BE „Unterschrift VN fehlt“. Der Abgleich mit der OB726-Klassifizierung in Kapitel III fängt einen tatsächlichen Mehrfachagenten über die Prüfnotiz „Vermittlertyp abweichend“ |
| 76 | Juraschek | GH040-Prüfung ans Ende des Schritts (kein erneuter OB726-Aufruf) | umgesetzt – ein OB726-Aufruf liest PNR, Name und Klassifizierung, danach GH040; die hinterlegte E-Mail-Adresse kommt aus OB729 (`<OB729-Email>`), OB726 wird nicht erneut aufgerufen |
| 77 | Jeglorz | „Suche die Zeile Status der Beschäftigung“ | umgesetzt – so formuliert |
| 78 | Juraschek | Wo kommt die E-Mail-Adresse her? | umgesetzt – eigener Schritt „E-Mail-Adresse des übernehmenden Vermittlers ermitteln“ mit Rangfolge als Erläuterung vor der Logik: 1. TOP-Makler laut Sonderliste (8 Vermittler, Stand 23.09.2026, Agentur-Nr. als Vergleichswert, Fonds Finanz jetzt mit fester Adresse), 2. in OB729 (Vermittlerkommunikation) zur Agenturnummer hinterlegte Adresse (außer @ergo), 3. Absenderadresse der Eingangsmail; Prüfnotizen bei fehlender oder interner Adresse |
| 81 | Jeglorz | Kapitel „Test auf Fehlerliste“ (neu) | umgesetzt – Kapitel V, alle Sprünge „Weiter mit 11. Schritt“ ersetzt |
| 86 | Jeglorz | Kapitel 12 und 13 zusammenfügen, BE-Handling dahinter | umgesetzt – VI. Abschluss ohne Befund (Notiz + Übergabe), VII. Abschluss mit Befund |
| 88 | Juraschek | `<Makler-Email>`: wo kommt die her? | umgesetzt – siehe 78; Notiztabelle verweist auf den Schritt |
| 89 | Juraschek | „Bearbeitung nach“: Tabelle, wann welcher Wert | umgesetzt – eigene Tabelle (Untervollmacht fehlt / Mit BÜ-Wunsch); Notiz insgesamt als Ausfülltabelle ohne WENN/DANN |
| 90 | Juraschek | Anforderung Unterlagen: irrelevant für KV, für Komposit detaillierter | umgesetzt – aus der KV-Fassung entfernt; in der Komposit/Leben-Fassung eigener Schritt mit Kennzeichen der Notizmaske 1515 |
| 92 | Juraschek | Prozessende: Weiterleitung oder Eröffnung mit Notiz? | umgesetzt – Variante A |
| 93 | Rypa | Variante A | umgesetzt – bestehender Vorgang wird mit Notiz an den 72-Stunden-BOT weitergeleitet |
| 94 | Rypa | Immer an den 72-Stunden-BOT oder HSB4K GR (Makler auf Makler)? | geklärt (E. Brenneisen, 23.09.2026): immer an den 72-Stunden-BOT; der erkennt Makler auf Makler und leitet ohne Wartefrist direkt an den BÜ-BOT weiter – keine Weiche im Prüf-Bot, Hinweis im Kapitel VI |
| 101 | Juraschek | BE-Handling: Screenshot ergänzen, Bearbeitungshinweis KV-Variante | umgesetzt – Bearbeitungshinweis in drei Abschnitten: „BE:“ `<BE-Klassifikation>`, „Fehler:“ je Prüfnotiz aus `<Fehlerliste>` eine Zeile („Fehler: keine“, wenn leer), „Hinweis:“ mit „Weitere VNR: `<BUE_VNR>`; `<BUE_VNR_2>`“ und Platz für spätere Hinweise; Tabelle „Aufbau des Bearbeitungshinweises“ mit Beispiel; Screenshot ErgoNotiz (Vorlage 2011) bleibt; Themenpostkorb HSB4K MV |
| 102 | Jeglorz | BE-Handling für alle BE identisch, Test auf Fehlerliste davor | umgesetzt – Struktur V → VI / VII |
| 103 | Juraschek | Postkorb-Nr. HSB4K MV angeben | offen – Fachbereich (K. Rypa); Platzhalter TBD |

## Über die Kommentare hinaus geändert (Abstimmungen vom 22./23.09.2026 und QS-Lauf)

- Vorprüfung ohne Prüfung auf `BUE_KLASSIFIKATION`: Der Prüf-Bot wird nur durch Vorgänge ausgelöst, die als Bestandsübertragung
  in den Themenpostkorb gestellt wurden; die BE „Kein BÜ-Vorgang“ entfällt. `BUE_WUNSCH_VORHANDEN` wird nur beim Mehrfachagenten
  geprüft (beim Makler belegt die Maklervollmacht den Auftrag). Reminder-Prüfung und Abgleich des Vollmachtgebers bleiben gestrichen.
- Notiz: immer Einzel-BÜ („angegebene VNR beachten“), Feldumfang der Notizmaske 1515; für KV ohne „Folgearbeit für Komposit“.
- Geburtsdatum: nur Gegenprobe, wenn der Auftrag eines nennt; Abweichung als Prüfnotiz (in v9 stand an dieser Stelle irrtümlich die
  BE-Klassifikation für nicht aktuelle Verträge).
- Namensabgleich `<OB726-Name>` gegen `<BUE_VERMITTLER_NAME>`: in v9 nicht mehr enthalten, in v10 nicht wieder aufgenommen
  (Freitextvergleich von Firmennamen; bei Bedarf als Prüfnotiz nachrüstbar).
- Matchcodesuche in zwei Stufen (Entscheidung E. Brenneisen, 23.09.2026): zuerst mit dem Geburtsdatum als Suchfeld wie in der
  IS011-Logik des Fachbereichs; bleibt die Trefferliste leer, einmal ohne Geburtsdatum (Merker `<Suche-ohne-Gebdat>`), danach die
  Gegenprobe des Geburtsdatums als Prüfnotiz. So endet ein falsch angegebenes Geburtsdatum nicht als BE mit falschem Grund.
- IS011-Auswertung ohne Lücke: Einstieg über die VNR ohne Stammdaten → BE „Vertrag zur VNR nicht gefunden“; nach der Matchcodesuche
  sind Trefferliste, Einzeltreffer (gleich / ungleich mit Scout-Service über den Sprung „Grund der Abweichung bestimmen“) und
  unerwartete Maske (System Exception) abgedeckt.
- Agenturnummer: leer im KI-Deckblatt → BE „Agenturnummer nicht vorhanden“ (Vorprüfung); in OB726 unbekannt (IS0042I) → eigene BE
  „Agenturnummer in OB726 unbekannt“, damit die Sachbearbeitung beide Fälle unterscheiden kann.
- Abgebender Bestandsinhaber: leeres Feld „Betreuung“ in VA230 oder in OB726 unbekannte Agentur → Prüfnotiz „Bestandsinhaber nicht
  ermittelbar“ (Vorschlag, statt Weiterarbeit mit leeren Werten).
- Unterlagenprüfung: Prüfnotiz mit dem Feldwert („Unterlagen nicht vollständig: `<BUE_PRUEFUNG_UNTERLAGEN>`“); ein leeres Feld und
  „Reminder - keine Vollst.-Prüfung“ lösen keine Prüfnotiz aus (sonst wäre jede Erinnerung eine verdeckte Reminder-Prüfung).
- Vorspann auf den Stand der Schritte: „Ziel der Prozessautomatisierung“ (IS011 statt IS100, keine Ablehnung, BE beendet sofort,
  Prüfnotizen werden gesammelt), Eingangskanal (Postkorbdaten: Vorgang-Lfd-Nr, Vorgang-VNR, Eröffnungsdatum, Dokumenttyp),
  Datensicherheit (Scout-Service, Betriebsmails aus dem Bot-Postfach, interne Adressen „@ergo“), SIPOC auf die v10-Kette,
  Inhaltsverzeichnis aus den aktuellen Überschriften neu aufgebaut, altes Diagramm im Fallback entfernt, Systemtabelle mit
  ErgoNotiz (Bearbeitungshinweis) und – für Komposit/Leben – ODPB.
- Querverweise: alle Kapitel-, Schritt- und Tabellennennungen im Text sind Links auf Textmarken (auch im Vorspann), Steuerwort
  „SONST WENN“ in der Lesehilfe erklärt; Variablentabelle alphabetisch mit Spalte „Verwendung (Kapitel)“.

## Komposit / Leben (`PDD_Vorpruefung_BUE_Komposit_Leben_v10.docx`)

Die Mantelvertragsprüfung nutzt das Datenpoolfeld `BUE_SPARTE` = „KR“ (bei mehreren Kürzeln das an der Position der `<Vorgang-VNR>`); das Routing bei Befund liest in Kapitel II die Klassifizierung des abgebenden Bestandsinhabers aus OB726
(`<OB726-AGT-Inh-Klassifizierung>`, AO → HSB4K KO, sonst ODPB); die Telefonnotiz wird erst nach dem Schritt „Anforderung von
Unterlagen“ gespeichert; `BUE_ANF_UNTERLAGEN` ist als Anforderung des Maklers (Police, Vertragsspiegel, Schadenaufstellung) beschrieben
und unabhängig von der Vollständigkeitsprüfung – Bedeutung durch den Fachbereich zu bestätigen; ODPB ist in der Systemtabelle
erklärt, Art der Übergabe und Postkorb-Nr. offen; die Screenshots stammen aus der KV-Fassung und sind zu ersetzen.

Ursprünglicher Aufbau: 
Gleicher Aufbau, Unterschiede: Sparten und Datenschutzantworten, Postkorb und GeVo 108/469, Notizmaske 1515 mit Screenshot und
Schritt „Anforderung von Unterlagen in der Notiz kennzeichnen“, im Kapitel IV die Prüfung auf Mantelvertrag bei `BUE_SPARTE` = KR
(BE „KR Flottenvertrag“, noch zu validieren durch K. Rypa), Routing bei Befund nach abgebendem Bestandsinhaber (Makler → ODPB,
sonst Themenpostkorb „HSB4K KO“).

## Offene Punkte für Fachbereich und Robotics

- Geschäftsbereiche (Gruppe, Abteilung, Standort), Abnahmeumgebung, Postkorb-Nummern HSB4K 72 (Dunkelverarbeitung, beide Sparten), HSB4K MV (KV mit Befund), HSB4K KO (Komposit/Leben mit Befund, Bestandsinhaber AO) und der Themenpostkorb von ODPB (Komposit/Leben, Bestandsinhaber nicht AO).
- Ein Themenpostkorb für alle Sparten (MV 23724) am Start; die Fassungen unterscheiden sich in Notiz und Routing am Ende. Woran der Bot in OB726 die AO-Zugehörigkeit des abgebenden Bestandsinhabers erkennt, ist zu benennen.
- Mail-Entwurf mit allen offenen Punkten: `Mail_Entwurf_Offene_Punkte_PDD_v10_230926.eml/.txt` (Build `quellen/mail_offene_punkte_pdd_v10_build.py`).
- Schreibweise der Schnittstelle: „EMWS“ (bestätigt 23.09.2026); v9 schrieb „EWMS“.
- Hinterlegte E-Mail-Adresse aus OB729 Vermittlerkommunikation (wie in den Vorfassungen); Screenshot des Felds fehlt; Sonderliste TOP-Makler gilt einmalig (Stand 23.09.2026, M. Abbas).
- Screenshots: Datenpool-Datensatz (Start) fehlt; IS011/VAF017 zeigt vollständige Personendaten – Testdaten der Abnahmeumgebung bestätigen oder schwärzen;
  Beispielkette in Kapitel II (VA230 nennt Betreuung A 002580219, der OB726-Screenshot zeigt den übernehmenden Makler) angleichen; Komposit/Leben-Screenshots liefern.
- Bestätigt (23.09.2026): Prüfnotiz „Bestandsinhaber nicht ermittelbar“ bleibt Prüfnotiz; „Vermittlertyp nicht angegeben“ ist gestrichen (siehe Kommentar 75);
  `BUE_ANF_UNTERLAGEN` bedeutet, dass der Makler Unterlagen zum Vertrag von ERGO anfordert; Matchcodesuche in zwei Stufen.
- BE für nicht aktuelle Verträge: „Vertrag nicht aktuell: `<VA230-Status>`“ (führt den gelesenen Status mit). Fachlich zu bestätigen: Mantelvertragsprüfung bei KR (K. Rypa),
  Zuordnung der Spartenkürzel zu Komposit und Leben für das Notizfeld. Makler auf Makler ist geklärt (siehe Kommentar 94).

## QS-Lauf 2 (Word-Darstellung, 23.09.2026)

Prüfung der DOCX-Struktur auf Darstellungsfehler, die Word zeigt, die HTML-Vorschau aber nicht: Schrittüberschriften hatten zwei
Nummerierungszähler (springende „n. Schritt“-Nummern) – direkte Nummerierung entfernt, eine fortlaufende Zählung aus dem Stil, Schritte
nicht mehr im Inhaltsverzeichnis; fünf Tabellen mit Einzug über den rechten Rand – Einzug entfernt, alle Tabellen auf Satzbreite;
unsichtbare Überschrift „Synchronität des Prozesses“ (weiß auf weiß) als Überschrift 2; Variablentabelle mit breiterer Namens- und
Prüfspalte; Kopfzeilen aller Hilfstabellen im Stil Table Heading mit Schattierung, lange Tabellen mit wiederholter Kopfzeile;
Inhaltsverzeichnis mit den zweisprachigen Kapiteltiteln; SIPOC auf Satzbreite; Leerabsatzstapel vor Hauptkapiteln entfernt und
Hauptkapitel auf neue Seite; je Screenshot eine Unterschrift unter dem Bild, leere Screenshot-Zellen mit Vermerk; Template-Reste
(„Nicht zutreffendes bitte Löschen“, Versionshinweis, Tippfehler) bereinigt; fehlende Links auf Schritt- und Tabellennamen ergänzt.
Bewusst so gelassen: Datensicherheit als Zwei-Spalten-Tabelle mit deutschen Antworten (Template), Vorspann-Überschriften ohne
englischen Teil, wo das Template sie einsprachig führt.

## Nachtrag (23.09.2026): Start liest nur benötigte Datenpoolfelder

Der Start-Schritt las alle 35 Datenpoolfelder. Jetzt liest er nur die Felder, die eine Prüfung, ein Notizfeld oder der
Bearbeitungshinweis braucht (KV 19, Komposit/Leben 22). Die übrigen Felder sind keine Variablen des Bots und stehen weder im
Start-Schritt noch in der Variablentabelle. Die Spalte „Verwendung“ führt „Start“ nicht mehr als Fundstelle, sondern nur die
Kapitel, in denen die Variable wirklich verwendet wird.

## Nachtrag (23.09.2026): Unterlagenanforderung nur über BUE_ART_UNTERLAGEN

Rückfrage E. Brenneisen, wozu `Anforderung-Arten`, `BUE_ANF_UNTERLAGEN` und `BUE_ART_UNTERLAGEN` gebraucht werden. Einziger Zweck sind
die drei Kennzeichen „Folgearbeit für Komposit“ in der Notizmaske 1515. `Anforderung-Arten` war nur die zerlegte Liste, `BUE_ANF_UNTERLAGEN`
ist redundant („ja“ genau dann, wenn `BUE_ART_UNTERLAGEN` gefüllt ist). Beide gestrichen; die Kennzeichen werden direkt aus
`BUE_ART_UNTERLAGEN` gesetzt (leer = keine Anforderung). Ob die Kennzeichen überhaupt vom Bot gesetzt werden sollen, bleibt eine
fachliche Bestätigung (Mail).

## Nachtrag (23.09.2026): Prüfnotiz „Vermittlertyp nicht angegeben“ gestrichen

Rationale: Ein leerer `BUE_VERMITTLER_TYP` ist kein eigener Fehler. Der Wert steuert nur die Weiche MFA/Makler in der Vorprüfung; leer läuft
der Makler-Zweig, der eine vom Versicherungsnehmer unterschriebene Maklervollmacht verlangt. Fehlt sie, entsteht ohnehin die BE „Unterschrift
VN fehlt“; liegt sie vor, ist der Vorgang sauber. Den tatsächlichen Typ liefert OB726 in Kapitel III; ein Mehrfachagent bei leerem Feld
löst dort die Prüfnotiz „Vermittlertyp abweichend“ aus (Bedingung erweitert auf `<> „MFA“`). Die Prüfung stand zudem an erster Stelle vor
den harten Ausschlusskriterien. Änderungen: Schritt entfernt, Werteliste der Prüfnotizen um den Eintrag gekürzt, `BUE_VERMITTLER_TYP`
optional, Hinweise in Vorprüfung und Kapitel III angepasst.

## Nachtrag (24.09.2026): Vermittlertypen Courtagefortzahler und Kontaktgeber

Abstimmung M. Koch (ODPBD) / S. Schwarz (DSTPB) zum EMMA-Abzug (Spalte D, rund 3 % der Fälle): „leer“ und „Fremdversicherungsunternehmen“
werden wie Makler behandelt; „Courtagefortzahler“ (ausgeschrieben) und „Kontaktgeber“ kommen so in das KI-Deckblatt und führen fachlich zur
direkten BÜ-Ablehnung, die übrigen Felder stehen wie beim MFA auf N/A. In der PDD: neue BE „Keine Bestandsübertragung möglich:
`<BUE_VERMITTLER_TYP>`“ als erste Prüfung der Vorprüfung (vor der Agenturnummer), Werteliste des Vermittlertyps erweitert, Werteliste der
BE-Klassifikation ergänzt. Antwort auf die Frage nach den Pflichtfeldern: `Mail_Antwort_Koch_Vermittlertyp_240926.eml/.txt`
(Build `quellen/mail_antwort_koch_vermittlertyp_build.py`).
