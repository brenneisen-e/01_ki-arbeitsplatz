# COMMENT RESPONSE LOG – PDD Vorprüfung BÜ Gesundheit/KV, Kommentarrunde 2 vom 16.09.2026

Bearbeitete Datei: `PDD_Vorpruefung_BUE_Gesundheit_KV_1609 (1).docx` (64 Kommentare, davon 33 von Tanja Juraschek und Marco Jeglorz vom 16.09.2026) → Ergebnis `PDD_Vorpruefung_BUE_Gesundheit_KV_1609_QS2.docx`.
Alle 64 Kommentare sind unverändert erhalten (Kommentar-Teile byteidentisch, 64 Anker im Text). Antworten, Protokoll und offene Punkte stehen nur in dieser Datei, nicht im Dokument.

Status-Werte: implemented · partially implemented · not implemented · clarification required.
Zuständigkeiten: Fachbereich · Tanja Juraschek · Marco Jeglorz · Inge Lorusso · Robotics · Celonis · Eingangsmanagement · other.

---

## 41 – Juraschek, Tanja – 16.09.2026 17:24 – Kapitel „Details zum Startereignis „Postkorberöffnung““, Überschrift „Informationen zum Themenpostkorb?“
- **Originaltext:** „Diese Überschrift inkl. Inhalt war im PDD nicht vorhanden. Bitte noch füllen.“
- **Interpretation:** Der aus der PDD-Vorlage eingefügte Abschnitt (Startpostkorb Abnahme/Produktion, Startkriterien, Reporting abgewiesener Vorgänge, BE-Postkorb) ist mit den Werten des Prüf-Bots zu füllen.
- **Umsetzung:** Abschnitt gefüllt: Startpostkorb = Themenpostkorb Prüf-Bot Gesundheit (Nummern Abnahme und Produktion: TBD); Startkriterium ergänzt (Datensatz im Datenpool zu <Vorgang-Lfd-Nr>, nicht bereits bearbeitet, Reihenfolge Eröffnungsdatum); Vorlagenbeispiele Folgeschriftwechsel, Verbundname, Whitelist, Whitelistprüfung, Ersatz-Aussteuerungspostkorb als „Vorlagenbeispiel, für den Prüf-Bot nicht bestätigt – zu klären“ gekennzeichnet (nicht gelöscht); BE-Postkorb „HSB4K MV“ mit Postkorb-Nr. TBD und Bearbeitungshinweis; Reporting abgewiesener Vorgänge als TBD mit Verweis auf Status Referred für BE. Reine Vorlagenanweisungen („bitte nicht Zutreffendes löschen“, „bitte ergänzen oder löschen …“, „bitte anpassen / ergänzen“) entfernt.
- **Status:** partially implemented
- **Begründung:** Postkorb-Nummern, GeVo-Nummer und die Behandlung nicht startfähiger Vorgänge sind weder im Dokument noch in den Kommentaren bestätigt; der in der Projektinformation genannte Produktionspostkorb „MV 23724 BÜ Prüf BOT“ wurde nicht eingetragen, weil seine Zuordnung zu diesem PDD nicht bestätigt ist.
- **Antwortvorschlag:** „Der Abschnitt ist gefüllt. Bitte bestätigen: Postkorb-Nr. und Name für Abnahme und Produktion (ist „MV 23724 BÜ Prüf BOT“ der Produktions-Startpostkorb dieses Bots?), Nummer des BE-Postkorbs HSB4K MV, und ob Folgeschriftwechsel-, Verbund- und Whitelist-Prüfungen für den Prüf-Bot überhaupt gelten.“
- **Offen:** Postkorb-Nummern, GeVo-Nummer, Startkriterien, Ziel für nicht startfähige Vorgänge, Reporting abgewiesener Vorgänge.
- **Zuständig:** Fachbereich, Eingangsmanagement, Tanja Juraschek

## 61 – Juraschek, Tanja – 16.09.2026 11:43 – 1. Schritt, Zeilen „Lese die Vorgang-Lfd-Nr … <Vorgang-VNR>“
- **Originaltext:** „Hier sollte wir nochmal drüber sprechen. Habe mal einen Screenshot aus einem anderen PDD, was zu tun ist.“ (Screenshot: Postkorb öffnen, Verbund prüfen, Absender prüfen, Anzahl GeVos / Folgeschriftwechsel, Eingangskanal)
- **Interpretation:** Einstieg in den Postkorbvorgang nach dem Muster anderer PDDs beschreiben.
- **Umsetzung:** Schritt 1 gliedert jetzt „Werte aus dem EWMS-Postkorb“ (Startpostkorb, GeVo-Nummer TBD, <Vorgang-Lfd-Nr>, <Vorgang-VNR>), „Werte aus dem Datenpool“ (Wechsel in den Datenpool mit <Vorgang-Lfd-Nr>, alle 35 Felder) und „Vom Roboter initialisiert“ (<BE>, <BE-Klassifikation>, <Fehlerliste> = leer). Die Postkorb-Prüfungen des Beispiels sind im neuen Kapitel „Details zum Startereignis“ als Klärungspunkte geführt.
- **Status:** clarification required
- **Begründung:** Welche Postkorb-Prüfungen für den Prüf-Bot gelten, ist nicht abgestimmt.
- **Antwortvorschlag:** „Schritt 1 ist nach dem Muster aufgebaut. Welche der Postkorb-Prüfungen (Verbund/GeVo, Folgeschriftwechsel, Absender, mehrere GeVos) sollen für den Prüf-Bot gelten?“
- **Offen:** Umfang der Postkorb-Prüfungen, GeVo-Nummer.
- **Zuständig:** Tanja Juraschek, Eingangsmanagement, Celonis

## 62 – Jeglorz, Marco – 16.09.2026 13:18 – 1. Schritt, Screenshot-Zeile Datenpool
- **Originaltext:** „Verweis auf Liste aller Felder aus dem Datenpool, die ausgelesen werden sollen + GeVo Nummer“
- **Interpretation:** Vollständige Feldliste referenzieren, GeVo-Nummer nennen.
- **Umsetzung:** Alle 35 Felder <BUE_…> namentlich in Schritt 1 mit Verweis auf die Tabelle der genutzten Variablen (Format, Werteliste, Pflichtfeld). GeVo-Nummer als „TBD“ in Schritt 1 und im Startereignis-Kapitel.
- **Status:** partially implemented
- **Begründung:** GeVo-Nummer nicht dokumentiert.
- **Antwortvorschlag:** „Feldliste ergänzt; die GeVo-Nummer tragen wir nach Bestätigung durch Eingangsmanagement/Celonis ein.“
- **Offen:** GeVo-Nummer.
- **Zuständig:** Eingangsmanagement, Celonis

## 63 – Juraschek, Tanja – 16.09.2026 11:49 – 1. Schritt, Datenpool-Block
- **Originaltext:** „Ein Bespiel:“ (Screenshot „Postkorb – Datenpool öffnen und auslesen“ mit GESCHV-NR und Zuordnungstabelle Feld → Attribut → Beispiel)
- **Interpretation:** Muster für die Dokumentation des Datenpool-Zugriffs.
- **Umsetzung:** Feldliste und Verweis auf die Variablentabelle in Schritt 1; keine zusätzliche Zuordnungstabelle mit Beispielwerten.
- **Status:** partially implemented
- **Begründung:** Struktur beibehalten; GESCHV-NR und Verbundname unbekannt.
- **Antwortvorschlag:** „Die Zuordnung Datenpoolfeld → Variable steht in der Variablentabelle. Wenn ihr die Tabelle mit Beispielwerten direkt in Schritt 1 braucht, ergänzen wir sie.“
- **Offen:** Darstellungsform; GeVo-Nummer.
- **Zuständig:** Tanja Juraschek

## 69 – Juraschek, Tanja – 16.09.2026 11:50 – 2. Schritt, „<BUE_VNR> = „Manuelle Prüfung VNR/Sparte““
- **Originaltext:** „Wie kommt die Info da rein?“
- **Interpretation:** Herkunft des Ersatzwerts und Frage, ob ein solcher Vorgang den Bot erreicht.
- **Umsetzung:** Keine Textänderung zur Frage; Prüfung gemäß Kommentar 70 entfernt. Der Anker sitzt jetzt am vorangehenden „Ende WENN“ (Reminder-Block).
- **Status:** clarification required
- **Antwortvorschlag:** „Den Ersatzwert schreibt Celonis, wenn keine normierbare VNR ermittelt werden kann (Datenpool-Antrag V1.6). Solche Eingänge bleiben nach heutigem Verständnis beim Eingangsmanagement und erhalten keinen Postkorbvorgang für den Bot; bitte durch Celonis/Eingangsmanagement bestätigen.“
- **Offen:** Bestätigung, dass kein Postkorbvorgang ohne VNR im Startpostkorb eröffnet wird.
- **Zuständig:** Celonis, Eingangsmanagement

## 70 – Juraschek, Tanja – 16.09.2026 13:28 – 2. Schritt, dieselbe Bedingung
- **Originaltext:** „Rauswerfen und in der Tabelle löschen“
- **Interpretation:** Prüfung und BE „VNR nicht ermittelbar“ entfernen, Feld in der Variablentabelle löschen.
- **Umsetzung:** WENN-Block entfernt; „VNR nicht ermittelbar“ aus BE-Werteliste und Ablaufdiagramm gestrichen. Tabellenzeile BUE_VNR beibehalten.
- **Status:** partially implemented
- **Begründung:** BUE_VNR wird mit BUE_VNR_2 weiterhin nachrichtlich im Bearbeitungshinweis, in Schritt 1 und im Eingangskanal verwendet; über BUE_VNR_2 darf laut Auftrag nicht stillschweigend entschieden werden. Das Löschen nur der Tabellenzeile würde offene Verweise erzeugen.
- **Antwortvorschlag:** „Prüfung ist raus. Sollen BUE_VNR und BUE_VNR_2 komplett aus dem PDD (Bearbeitungshinweis, Eingangskanal, Tabelle, Datenpool) gestrichen werden oder für den Bearbeitungshinweis bleiben?“
- **Offen:** Verbleib von BUE_VNR/BUE_VNR_2.
- **Zuständig:** Tanja Juraschek, Inge Lorusso, Celonis

## 71 – Juraschek, Tanja – 16.09.2026 11:51 – 2. Schritt, „<BUE_VERMITTLER_TYP> = „MFA““
- **Originaltext:** „Welche Werte können noch in dem Feld stehen? Ihr fragt später nochmal bestimmt Werte ab“
- **Interpretation:** Für alle in Bedingungen genutzten Datenpoolfelder muss die vollständige Werteliste in der Variablentabelle stehen.
- **Umsetzung:** Wertelisten in der Variablentabelle als „Vollständige Werteliste“ gekennzeichnet für BUE_VERMITTLER_TYP (Makler, MFA; weitere Werte nicht vorgesehen), BUE_KLASSIFIKATION, BUE_WUNSCH_VORHANDEN, BUE_REMINDER, BUE_UMFANG, BUE_PRUEFUNG_UNTERLAGEN, BUE_ANF_UNTERLAGEN. BUE_MV_AUF_MAKLER, BUE_MV_UNTERSCHRIFT_KUNDE und BUE_UV_ERTEILT waren bereits vollständig beschrieben (ja, nein, nicht prüfbar bzw. ja, nein, N/A).
- **Status:** partially implemented
- **Begründung:** Die Wertelisten stammen aus dem PDD und dem Datenpool-Antrag V1.6; die fachliche Bestätigung gegen die Deckblatt-Spezifikation (Celonis) steht aus, insbesondere für BUE_VERMITTLER_TYP und BUE_KLASSIFIKATION.
- **Antwortvorschlag:** „Die Wertelisten sind in der Variablentabelle vollständig ausgewiesen (Makler/MFA usw.). Bitte Celonis bestätigen lassen, dass keine weiteren Ausprägungen geliefert werden.“
- **Offen:** Bestätigung der Wertelisten.
- **Zuständig:** Celonis, Fachbereich

## 77 – Juraschek, Tanja – 16.09.2026 13:22 – 3. Schritt VA230, Feld „urspr.Vers.beginn“
- **Originaltext:** „Heißt das Feld immer so und auch in jeder Sparte?“
- **Umsetzung:** Keine Änderung am Feld; Hinweis auf die zu bestätigende Feldbezeichnung je KV-Sparte im VA230-Absatz (TBD).
- **Status:** clarification required
- **Antwortvorschlag:** „Für KV (Voll, Zusatz, Pflege) gehen wir von einer einheitlichen Maske aus; Bestätigung durch den Fachbereich erbeten.“
- **Offen:** Feldbezeichnung je Sparte.
- **Zuständig:** Inge Lorusso

## 84 – Juraschek, Tanja – 16.09.2026 13:24 – 3. Schritt, Satz „nachrichtlich mitgeführt“
- **Originaltext:** „Was bedeutet das?“
- **Umsetzung:** Satz neu gefasst: VA230-Sparte ohne Prozesswirkung (Notiz durch Postkorb vorgegeben, nicht durch die Sparte); VA230-Status steuert die Aussteuerung. Variablentabelle angepasst; ob VA230-Sparte weiter gelesen werden muss, ist als offen markiert.
- **Status:** implemented
- **Antwortvorschlag:** „Präzisiert; die Sparte hat keine Prozesswirkung.“
- **Offen:** Ob VA230-Sparte entfallen kann.
- **Zuständig:** Fachbereich

## 85 – Juraschek, Tanja – 16.09.2026 13:58 – 3. Schritt, dieselbe Stelle
- **Originaltext:** „Bitte noch die Aussteuerung bei nicht aktuellen Verträgen ergänzen“
- **Umsetzung:** WENN <VA230-Status> <> „aktuell“ DANN <BE-Klassifikation> = „<Klassifikation für nicht aktuelle Verträge – durch Fachbereich festzulegen>“, direkte BE. Werteliste, Variablentabelle, Systemtabelle, Kurzbeschreibung, Diagramm nachgezogen.
- **Status:** partially implemented
- **Begründung:** Klassifikationstext nicht abgestimmt (bisher „sonst Storno“ in der Tabelle).
- **Antwortvorschlag:** „Aussteuerung ergänzt; bitte Klassifikation (z. B. „Vertrag nicht aktuell“) und die VA230-Statuswerte neben „aktuell“ nennen.“
- **Offen:** Klassifikation, Statuswerte.
- **Zuständig:** Inge Lorusso

## 87 – Juraschek, Tanja – 16.09.2026 14:00 – 4. Schritt, „IS100 mit <Vorgang-VNR> öffnen.“
- **Originaltext:** „Wir rufen dafür einen Scout-Service auf, um Vor- und Nachname separat zu erhalten“
- **Umsetzung:** Ablauf: IS100 mit <Vorgang-VNR> öffnen → Kundenverbindung zum VN aufrufen → Scout-Service aufrufen → Nachname/Vorname getrennt als <IS100-Nachname>/<IS100-Vorname> speichern → Vergleich mit <BUE_KUNDE_NACHNAME>/<BUE_KUNDE_VORNAME>, Prüfnotizen unverändert. Systemtabelle, Variablentabelle, Kurzbeschreibung, Design, Diagramm angepasst.
- **Status:** partially implemented
- **Begründung:** Name, Aufruf und Rückgabefelder des Scout-Service nicht dokumentiert.
- **Antwortvorschlag:** „Scout-Service eingebaut; bitte technischen Absatz (Bezeichnung, Aufruf, Rückgabefelder) liefern.“
- **Offen:** Technische Beschreibung.
- **Zuständig:** Robotics (Tanja Juraschek)

## 92 – Juraschek, Tanja – 16.09.2026 14:01 – 4. Schritt, Vorname
- **Originaltext:** wie 87.
- **Umsetzung:** „Vorname aus dem Ergebnis des Scout-Service übernehmen und speichere als <IS100-Vorname>.“
- **Status:** partially implemented (technische Details wie 87)
- **Zuständig:** Robotics

## 95 – Juraschek, Tanja – 16.09.2026 14:05 – 6. Schritt, „Format: „Straße / Str. / etc.““
- **Originaltext:** „Bitte ausformulieren, was in dem String abgeschnitten werden soll vor der Prüfung“
- **Umsetzung:** Zweistufiger Vergleich (Originalwerte, dann normalisiert). Normalisiert: Straße/Strasse → Str. (auch als Wortbestandteil), Leerzeichen am Rand und Mehrfach-Leerzeichen. Ausdrücklich nicht normalisiert und als TBD markiert: Groß-/Kleinschreibung, Satzzeichen, Hausnummernformat, andere Bezeichnungen wie „Weg“. PLZ unverändert.
- **Status:** partially implemented
- **Begründung:** Nur bestätigte Varianten aufgenommen.
- **Antwortvorschlag:** „Normalisierung ist ausformuliert; bitte entscheiden, ob Groß-/Kleinschreibung, Satzzeichen und Hausnummernformat zusätzlich normalisiert werden sollen.“
- **Offen:** Vollständige Regeln.
- **Zuständig:** Inge Lorusso, Robotics

## 98 – Juraschek, Tanja – 16.09.2026 16:26 – 7. Schritt, „WENN <BUE_AGENTUR_NR> = leer DANN weiter zum PNR-Zweig“
- **Originaltext:** „Da macht keinen Sinn, da wir in dem nächsten Schritt die Vermittlernr. Benutzen, um die PNR auszulesen“
- **Interpretation:** Die Verzweigung zwischen Einstieg über Agenturnummer und Einstieg über Vermittler-Nr. ist unklar beschrieben; im PNR-Zweig wird die Vermittler-Nr. aus dem Datenpool verwendet, im Agenturzweig die PNR aus OB726 gelesen.
- **Umsetzung:** Verzweigung beibehalten, aber mit erläuterndem Hinweis versehen: Einstieg über Agenturnummer (PNR wird aus OB726 gelesen) bzw. Einstieg über Vermittler-Nr. (Stammagentur über EOS); beide Zweige münden in den gemeinsamen Abschluss (E-Mail).
- **Status:** clarification required
- **Begründung:** Ob der PNR-Zweig entfallen kann (immer Einstieg über Agenturnummer) oder beide Einstiege bleiben, ist eine offene fachliche Entscheidung.
- **Antwortvorschlag:** „Der Datenpool liefert entweder Agenturnummer oder Vermittler-Nr.; deshalb gibt es zwei Einstiege. Wenn ihr den PNR-Zweig anders aufbauen wollt (z. B. immer OB726 über PNR und dann EOS), passen wir die Reihenfolge an – bitte kurz bestätigen.“
- **Offen:** Zweigstruktur.
- **Zuständig:** Tanja Juraschek, Fachbereich

## 99 – Juraschek, Tanja – 16.09.2026 16:24 – 7. Schritt, „SONST <AGT-Uebernehmer> = <BUE_AGENTUR_NR>“
- **Originaltext:** „Das neu speichern der Variable man sich eigentlich schenken. Wir nur für die Not(z verwendet. Da könnte man auch das BUE_AGENTUR_NR nehmen, oder?“
- **Umsetzung:** Zuweisung und SONST-Zweig entfernt (Anker der Kommentare 99/100 sitzen jetzt an der WENN-Bedingung). Notizfeld „Agenturnummer“ = <BUE_AGENTUR_NR> beim Einstieg über Agenturnummer bzw. <AGT-Uebernehmer> beim Einstieg über PNR (EOS). Variablentabelle (AGT-Uebernehmer, BUE_AGENTUR_NR) entsprechend.
- **Status:** implemented
- **Antwortvorschlag:** „Ja, umgesetzt: <BUE_AGENTUR_NR> wird direkt verwendet; <AGT-Uebernehmer> bleibt nur im PNR/EOS-Zweig.“
- **Zuständig:** –

## 100 – Jeglorz, Marco – 16.09.2026 14:22 – 7. Schritt, dieselbe Stelle
- **Originaltext:** „Beschreiben, woran dies fest gemacht wird. Fehlermeldung einfügen, damit Roboter erkennt, dass die Agenturnummer nicht übereinstimmt“
- **Umsetzung:** Bedingung „Agentur nicht vorhanden“ konkretisiert: keine Agenturdaten bzw. Fehlermeldung „<Text der OB726-Fehlermeldung – durch Robotics zu ergänzen>“ ODER angezeigter Ordnungsbegriff („A,…“, gelb markiert) enthält <BUE_AGENTUR_NR> nicht. Einstieg mit bereinigtem Zahlenwert aus EMMA (ohne „A“, ohne Trennzeichen).
- **Status:** partially implemented
- **Begründung:** Fehlermeldungstext unbekannt; Einstieg ohne „A“ nicht getestet.
- **Antwortvorschlag:** „Erkennung beschrieben; bitte Fehlermeldungstext ergänzen und den Einstieg ohne „A“ testen.“
- **Offen:** Fehlermeldung, Test.
- **Zuständig:** Robotics (Marco Jeglorz)

## 101 – Juraschek, Tanja – 16.09.2026 16:27 – 7. Schritt, INAKTIV-Prüfung
- **Originaltext:** „Würde ich vor dem Vergleichsschritt machen“
- **Umsetzung:** Im Agenturzweig: Name lesen → Prüfung „enthält INAKTIV“ (direkte BE) → danach Namensvergleich (Prüfnotiz). Tabellenzeilen entsprechend getauscht; Screenshot bleibt erhalten.
- **Status:** implemented
- **Begründung:** Im PNR-Zweig blieb die Reihenfolge unverändert, weil der Kommentar sich auf den Agenturzweig bezieht; Angleichung auf Wunsch.
- **Antwortvorschlag:** „Umgesetzt (Agenturzweig). Soll der PNR-Zweig gleich gezogen werden?“
- **Zuständig:** Tanja Juraschek

## 102 – Jeglorz, Marco – 16.09.2026 14:23 – 7. Schritt, PNR lesen
- **Originaltext:** „Prüfung, ob das Feld sauber ausgelesen werden kann - Auslesen ohne P, - nur die siebenstellige Nummer speichern“
- **Umsetzung:** Feld in der OB726-Kopfzeile lokalisieren (angezeigt als „P,216697“), Wert lesen, Präfix „P“ und Komma/Trennzeichen entfernen, nur Zahlenanteil als <OB726-PNR> speichern, führende Nullen erhalten; Formatzeile: bisherige PNR unter 7 Stellen, neue 7-stellig. <OB726-PNR> wird für GH040 und EOS verwendet.
- **Status:** implemented
- **Antwortvorschlag:** „Umgesetzt. Hinweis: GH040 wurde im Screenshot mit „P,0216697“ aufgerufen – bitte prüfen, ob beim GH040-Einstieg Präfix und Auffüllung auf 7 Stellen nötig sind.“
- **Offen:** GH040-Einstiegsformat.
- **Zuständig:** Robotics

## 103 – Juraschek, Tanja – 16.09.2026 16:29 – 7. Schritt, GH040-Block
- **Originaltext:** „Würde ich ans Ende der Schrittes setzen, da wir sonst die OB728 nochmal aufrufen müssen.“
- **Umsetzung:** GH040-Zeile im Agenturzweig hinter die Klassifizierung (letzter OB726-Lesezugriff) verschoben; danach Verweis auf den gemeinsamen Abschluss (E-Mail). OB726 muss so nicht erneut geöffnet werden.
- **Status:** implemented
- **Antwortvorschlag:** „Umgesetzt. Anmerkung: Der Kommentar nennt OB728, das PDD OB726 bzw. OB729 (E-Mail) – bitte die Anwendungsbezeichnungen bestätigen.“
- **Offen:** Anwendungsname OB728/OB729.
- **Zuständig:** Tanja Juraschek

## 104 – Jeglorz, Marco – 16.09.2026 14:27 – 7. Schritt, GH040-Block
- **Originaltext:** „Suche die Zeile „Status der Beschäftigung““
- **Umsetzung:** Alle GH040-Prüfungen: Tabelle nach der Zeile „Status der Beschäftigung“ durchsuchen (Kennziffer, „=“, Wert), Wert hinter „=“ lesen, sofort mit „aktiv“ vergleichen. Übernehmender Vermittler: BE „Keine Zusammenarbeit“; Bestandsinhaber: Prüfnotiz. Keine Variablen <GH040-Anbindung-…> mehr (Tabellenzeilen entfernt), da der Wert nur für den Vergleich benötigt wird.
- **Status:** implemented
- **Zuständig:** –

## 105 – Juraschek, Tanja – 16.09.2026 16:30 – 7. Schritt, Klassifizierung
- **Originaltext:** „Die ganze Zeile ist ein Feld…. Bitte genauer beschreiben, was wir auslesen sollen. Z.B. alles hinter der Nummer und dann auf bestimmte Begriffe ….. @Lorusso, Inge (HSB4K): Habt ihr das im BÜ-Bot schon mal gemacht?“
- **Umsetzung:** OB726-Kopfzeile mit der Vermittler-Nr. lesen, Text hinter der Nummer (im Screenshot „Makler Industrie A“) als <OB726-Klassifizierung> speichern und auf die Begriffe Makler, Mehrfachagent, Courtagefortzahler prüfen. Variablentabelle angepasst.
- **Status:** partially implemented
- **Begründung:** Ob der BÜ-Bot dieselbe Zeile bereits parst, ist unbeantwortet.
- **Antwortvorschlag:** „Auslesen ist beschrieben (Text hinter der Nummer, Begriffsprüfung). Frage an Inge Lorusso: Wird die Zeile im BÜ-Bot bereits so ausgewertet?“
- **Offen:** Erfahrung aus dem BÜ-Bot.
- **Zuständig:** Inge Lorusso, Robotics

## 107 – Juraschek, Tanja – 16.09.2026 16:33 – 7. Schritt, Vergleich Vermittlertyp/Klassifizierung
- **Originaltext:** „Bedeutet das, dass alle anderen Kombinationen richtig sind?“
- **Umsetzung:** Keine Änderung der Logik. Geprüft werden: BUE MFA ohne OB726 „Mehrfachagent“ und BUE Makler mit OB726 „Mehrfachagent“ (Prüfnotiz). Als stimmig gelten Makler/Makler und MFA/Mehrfachagent. Die Kombinationen Makler/Courtagefortzahler und MFA/Courtagefortzahler sind nicht festgelegt.
- **Status:** clarification required
- **Begründung:** Behandlung von „Courtagefortzahler“ nicht bestätigt; eine vollständige Entscheidungsmatrix wurde nicht erfunden.
- **Antwortvorschlag:** „Nein. Stimmig sind Makler/Makler und MFA/Mehrfachagent. Wie soll „Courtagefortzahler“ behandelt werden (stimmig, Prüfnotiz oder BE)?“
- **Offen:** Matrix für Courtagefortzahler.
- **Zuständig:** Fachbereich (Inge Lorusso)

## 108 – Juraschek, Tanja – 16.09.2026 16:45 – 7. Schritt, „<Makler-Email>“
- **Originaltext:** „Wo kommt die Email-Adresse her?“
- **Umsetzung:** E-Mail-Ermittlung einmalig als gemeinsamer Abschluss beider Einstiege (Ende des fachlichen Kontexts „Vermittler-Nr. (PNR)“): 1. Sonderliste TOP-Makler über <OB726-PNR>, 2. <BUE_MAKLER_EMAIL>, 3. OB729 über die Agenturnummer; danach Prüfnotiz bei „@ergo.de“; bleibt die Adresse leer, keine Prüfnotiz. Verwendung: nur für die Prüfnotiz, kein Versand im Prüf-Bot. Im Agenturzweig nur noch der Verweis.
- **Status:** partially implemented
- **Begründung:** Reihenfolge stammt aus der Variablentabelle des PDD; Anwendung OB729 vs. OB728 (Kommentar 103) nicht bestätigt.
- **Antwortvorschlag:** „Die Quellenreihenfolge ist jetzt an einer Stelle beschrieben. Bitte bestätigen: OB729 als Fallback-Anwendung, und die Sonderliste TOP-Makler (Pflege, Ablageort).“
- **Offen:** Anwendungsname, Sonderliste.
- **Zuständig:** Fachbereich, Tanja Juraschek

## 110 – Juraschek, Tanja – 16.09.2026 16:39 – 8. Schritt, EOS
- **Originaltext:** „Da ist muss bitte etwas ausführlicher beschrieben werden.“
- **Umsetzung:** Wechsel OB726 → EOS mit <OB726-PNR>; in der Übersicht die dem übernehmenden Vermittler zugeordnete Stammagentur ermitteln (Auswahlregel bei mehreren Zeilen als Platzhalter), Agentur-Nr. als <AGT-Uebernehmer> für das Notizfeld speichern; Prüfnotiz bei leerem Ergebnis. Rollen klargestellt: übernehmender Vermittler, dessen Stammagentur (EOS), bisheriger Bestandsinhaber (VA230). Die frühere Aussage „Stammagentur = zum Vertrag hinterlegte Agentur des Bestandsinhabers“ entfernt.
- **Status:** partially implemented
- **Begründung:** Auswahlregel bei mehreren EOS-Agenturzeilen (Screenshot OB719 zeigt viele Agenturinhaber-Zeilen) nicht bestätigt.
- **Antwortvorschlag:** „Beschreibung ausgebaut. Bitte die Auswahlregel nennen, wenn EOS mehrere Agenturzeilen zum Vermittler zeigt (z. B. führende OE, erste Zeile, Beziehungsart).“
- **Offen:** EOS-Auswahlregel.
- **Zuständig:** Fachbereich, Robotics

## 111 – Juraschek, Tanja – 16.09.2026 16:39 – 8. Schritt, „<Makler-Email> = <BUE_MAKLER_EMAIL>“
- **Originaltext:** „Wo kommt die her?“
- **Umsetzung:** siehe 108 (gemeinsamer Abschluss an dieser Stelle aufgebaut).
- **Status:** partially implemented
- **Zuständig:** Fachbereich, Tanja Juraschek

## 113 – Juraschek, Tanja – 16.09.2026 16:43 – 9. Schritt, GH040 Bestandsinhaber
- **Originaltext:** „Siehe anderer Kommentar zur GH040. Tabelle auslesen und Eintrag mit „Status der Beschäftigung“ finden. Dann Wert hinter „=“ lesen. Wenn man die Information nicht weiter verwendet, braucht man das auch nicht zu speichern.“
- **Umsetzung:** Wechsel VA230 → GH040 mit <VA230-AGT-Inhaber>; Zeile suchen, Wert hinter „=“ lesen, sofort vergleichen; Prüfnotiz „Anbindung Bestandsinhaber nicht aktiv“; keine Variable. Variablentabelle bereinigt; <VA230-AGT-Inhaber> bleibt als Einstiegsschlüssel.
- **Status:** implemented
- **Zuständig:** –

## 122 – Juraschek, Tanja – 16.09.2026 16:51 – 11. Schritt, Screenshot-Zeile Notiz
- **Originaltext:** „Soll der alten Vorgang nicht abgelegt werden und dann ein neuer mit der Telefonnotiz angelegt werden? Wir können dafür leider keine Templates benutzen. Anbei ein Beispiel, wie wir das für non-KV beschrieben können. Die Notz wird dann als „Freitext“ so geschrieben, wie es nach der Vorlage zu sehen wäre. Beispiel“ (Screenshots: Vorgang erstellen, ErgoNotiz, Freitextnotiz)
- **Umsetzung:** Abschnitt umgebaut: Telefonnotiz wird zeilenweise beschrieben; die Nutzung der Vorlage BOT2011 ist nicht mehr als gegeben dargestellt, sondern als Platzhalter „<TBD Fachbereich: Freitext-Telefonnotiz im Aufbau der Vorlage … alternativ Bestückung der Vorlage>“. Screenshot-Zeile als TBD (KV-Screenshot). Prozessende mit den beiden Varianten (Weiterleitung / Ablage und Neueröffnung) als Platzhalter, genau eine Variante gilt.
- **Status:** clarification required
- **Begründung:** Fachbereich hat weder Freitext noch Neueröffnung bestätigt; beide Aktionen dürfen nicht gleichzeitig beschrieben werden.
- **Antwortvorschlag:** „Aufgenommen als Variante B (Ablage + Neueröffnung mit Freitext-Telefonnotiz). Bitte Fachbereich bestätigen, ob Variante A (Weiterleitung mit Notiz) oder B gilt und ob der Aufbau der bisherigen Vorlage als Freitext übernommen werden darf.“
- **Offen:** Prozessende, Notizform, KV-Screenshot.
- **Zuständig:** Fachbereich (Inge Lorusso), Robotics

## 123 – Juraschek, Tanja – 16.09.2026 16:48 – 11. Schritt, „<KNR-Uebernehmer>“
- **Originaltext:** „Wo kommt die KNR her?“
- **Umsetzung:** Kein Leseschritt für die KNR existiert im PDD. Notizzeile und Variablentabelle als TBD markiert (Quelle in OB726 und Erfordernis für die KV-Telefonnotiz zu bestätigen); nicht mehr als Pflichtfeld geführt.
- **Status:** clarification required
- **Antwortvorschlag:** „Die KNR hat im PDD keine Quelle. Wird sie für die KV-Notiz gebraucht, und wo steht sie in OB726? Sonst streichen wir sie.“
- **Offen:** Quelle/Erfordernis KNR.
- **Zuständig:** Fachbereich (Inge Lorusso)

## 124 – Juraschek, Tanja – 16.09.2026 16:48 – 11. Schritt, „Laufende Nr. aus Vorgangsdatenbank“
- **Originaltext:** „Wofür wird die benötigt?“
- **Umsetzung:** Zeile um „(Verweis auf den Postkorbvorgang, Ordnungsbegriff des Prüf-Bots)“ ergänzt.
- **Status:** partially implemented
- **Begründung:** Ob der 72-Stunden-/BÜ-Bot die Nummer fachlich benötigt, ist nicht dokumentiert.
- **Antwortvorschlag:** „Die Nummer verknüpft Notiz und Postkorbvorgang. Bitte Fachbereich/Robotics bestätigen, ob der BÜ-Bot sie auswertet; sonst entfällt die Zeile.“
- **Offen:** Erfordernis.
- **Zuständig:** Fachbereich, Robotics

## 125 – Juraschek, Tanja – 16.09.2026 17:00 – 11. Schritt, Unterlagenanforderung
- **Originaltext:** „Wie steht das nach Ausfüllen der Notizvorlage in der Notiz?“
- **Umsetzung:** „Ergebnis in der Notiz“ ergänzt für Unterlagenanforderung (Zeile „Anforderung von Unterlagen: ja“ + je Unterlagenart eine Zeile) und für „Bearbeitung nach“ (mit BÜ / UV fehlt / BÜ mit UV je Fall). Beispiel einer Telefonnotiz mit Maximalausprägung (Platzhalter) in der linken Spalte, Reviewer-Zeile „Gerne mal ein Beispiel einhängen …“ dafür ersetzt.
- **Status:** partially implemented
- **Begründung:** KV-Wortlaut der Zeilen nicht bestätigt; Pool und Untervollmacht sind keine dokumentierten Notizfelder und fehlen im Beispiel.
- **Antwortvorschlag:** „Beispiel und Ergebniszeilen ergänzt. Bitte KV-Wortlaut bestätigen und sagen, ob Pool/Untervollmacht als eigene Zeilen in die Notiz sollen.“
- **Offen:** KV-Wortlaut, Pool/UV-Zeilen.
- **Zuständig:** Fachbereich (Inge Lorusso)

## 127 – Juraschek, Tanja – 16.09.2026 17:15 – 12. Schritt Prozessende
- **Originaltext:** „Weiterleitung oder Eröffnung mit Notiz? Was sagt der Fachbereich dazu?“
- **Umsetzung:** Prozessende als Platzhalter mit genau einer zu bestätigenden Variante (A Weiterleitung / B Ablage + Neueröffnung); Status Completed nur nach vollständigem Prozessende. Diagramm-Endknoten entsprechend.
- **Status:** clarification required
- **Antwortvorschlag:** „Entscheidung des Fachbereichs erbeten; danach wird nur die gültige Variante beschrieben.“
- **Offen:** Variante A/B, Reihenfolge Ablage/Kennzeichnung.
- **Zuständig:** Fachbereich, Robotics

## 130 – Juraschek, Tanja – 16.09.2026 13:42 – 13. Schritt BE-Handling, „Screenshot“
- **Originaltext:** „Screenshot ergänzen und Bearbeitungshinweis durch die KV-Variante ersetzen“
- **Umsetzung:** Keine; Platzhalter beibehalten.
- **Status:** not implemented
- **Begründung:** KV-Screenshot und KV-Wortlaut liegen nicht vor.
- **Antwortvorschlag:** „Bitte KV-Screenshot und Wortlaut liefern.“
- **Zuständig:** Inge Lorusso, Tanja Juraschek

## 132 – Juraschek, Tanja – 16.09.2026 17:16 – 13. Schritt, „HSB4K MV“
- **Originaltext:** „Bitte noch die Nr. angeben“
- **Umsetzung:** „HSB4K MV“ mit „Postkorb-Nr. TBD“ im BE-Handling (Hinweis und Weiterleitungsschritt) und im Startereignis-Kapitel; zusätzlich <BE> = „ja“ als erster Schritt und Status Referred ergänzt.
- **Status:** partially implemented
- **Begründung:** Nummer nicht dokumentiert.
- **Antwortvorschlag:** „Bitte Postkorb-Nummer (Abnahme und Produktion) von HSB4K MV nennen.“
- **Zuständig:** Fachbereich

---

## Weitere Änderungen ohne eigenen Kommentar (Anforderungen des Reviews)

| Änderung | Grundlage |
|---|---|
| Unvollständige Unterlagen als Prüfnotiz statt sofortiger BE, nur Makler-Zweig, Ausnahme bei Unterlagenanforderung; Feld als fachliche Ausprägung beschrieben | Anforderung 9 |
| BUE_UMFANG: ein Vorgang je VNR, eigene <Vorgang-VNR>; Verhältnis Einzelprüfung zu „Gesamt“ offen, keine BE erfunden | Anforderung 8 |
| Systemwechsel explizit (EWMS → Datenpool, IS100 → Scout-Service, OB726 → GH040/EOS, VA230 → GH040) | Anforderung 3 |
| Begriffe „hart/weich“ aus Zielbeschreibung und Diagrammlegende entfernt | Kommentare 66/90 vom 04.09. |
| Ablaufdiagramm: Ausschlusskriterien, VA230-Status, Scout-Service, Status der Beschäftigung, Endknoten Telefonnotiz | Kommentare 70, 85, 87, 104, 122 |
| Systemtabelle: Zeile Scout-Service, GH040-Zeile, BOT2011-Zeile als Telefonnotiz mit Vorbehalt | Anforderungen 3, 21 |

Nicht verändert: Reporting-Kapitel (Platzhalter laut Kommentar 32/34, enthält „harte Ablehnungsgrund“/„weiche Abweichungen“), Formulierung „hartes Kriterium“ in zwei Feldbeschreibungen, Inhaltsverzeichnis (alte Seitenzahlen), Überschrift „Prozessende mit Status Exception: BE-Handling“ der Reviewer (widerspricht dem Reporting-Kapitel: BE = Referred; siehe offene Punkte).
