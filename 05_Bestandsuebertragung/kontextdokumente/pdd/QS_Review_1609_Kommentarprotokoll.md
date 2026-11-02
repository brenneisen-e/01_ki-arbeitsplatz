# COMMENT RESPONSE LOG – PDD Vorprüfung BÜ Gesundheit/KV

QS-Review mit Tanja Juraschek (DTEA2D) und Marco Jeglorz (HSB4K-EXTERN) vom 16.09.2026.
Bearbeitete Datei: `PDD_Vorpruefung_BUE_Gesundheit_KV_1609_Kommentare.docx` → Ergebnis `PDD_Vorpruefung_BUE_Gesundheit_KV_1609_QS.docx`.
Alle 47 Kommentare des Dokuments sind unverändert erhalten (Kommentar-Teile byteidentisch, 47 Anker im Text). Im Dokument wurden keine Antworten und keine neuen Kommentare hinterlegt.

Status-Werte: implemented · partially implemented · not implemented · clarification required.

---

## Kommentar 59

- **Comment ID:** 59
- **Autor:** Juraschek, Tanja (DTEA2D)
- **Datum:** 16.09.2026, 11:43
- **Stelle / PDD-Schritt:** Start, 1. Schritt „Eröffnung Postkorbvorgang und Daten im Datenpool“, Zeilen „Lese die Vorgang-Lfd-Nr … <Vorgang-VNR>“
- **Originaltext:** „Hier sollte wir nochmal drüber sprechen. Habe mal einen Screenshot aus einem anderen PDD, was zu tun ist.“ (Screenshot: Schritte „Postkorb öffnen, Verbund prüfen, Absender prüfen“, „Anzahl GeVos und Folgeschriftwechsel prüfen“, „Absender prüfen“, „Mehr als ein GeVo und FSW“, „Eingangskanal prüfen“ aus einem anderen PDD)
- **Interpretation:** Der Einstieg in den Postkorbvorgang soll nach dem Muster anderer PDDs beschrieben werden: Postkorb mit Bezeichnung öffnen, Verbund/GeVo prüfen, ggf. Folgeschriftwechsel, Absender und Anzahl der GeVos.
- **Umsetzung im Dokument:** Schritt 1 präzisiert: „Postkorbvorgang im EWMS-Postkorb (Themenpostkorb Prüf-Bot Gesundheit) öffnen“, expliziter Wechsel vom EWMS-Postkorb in den Datenpool, vollständige Liste der 35 auszulesenden Felder. <Vorgang-Lfd-Nr> bleibt Ordnungsbegriff, <Vorgang-VNR> bleibt führende VNR für die Hostaufrufe. Die Postkorb-Prüfungen aus dem Beispiel (Verbund/GeVo, Folgeschriftwechsel, Absender-Whitelist, mehrere GeVos) wurden nicht übernommen.
- **Status:** clarification required (Schritt 1 teilweise nach dem Muster ergänzt)
- **Begründung:** Es ist nicht abgestimmt, welche der Postkorb-Prüfungen für den Prüf-Bot gelten; Celonis eröffnet den Vorgang, eine Absenderprüfung entfällt daher voraussichtlich. GeVo-Nummer und Verbundname sind nicht bekannt.
- **Antwortvorschlag:** „Vielen Dank für das Beispiel. Schritt 1 haben wir auf das Muster gezogen (Postkorb öffnen, Wechsel in den Datenpool, vollständige Feldliste). Welche der Postkorb-Prüfungen aus dem Beispiel sollen für den Prüf-Bot gelten: Verbund/GeVo-Nummer, Folgeschriftwechsel, Absender, mehrere GeVos? Aus unserer Sicht entfällt die Absenderprüfung, weil Celonis den Vorgang eröffnet; Verbund/GeVo und FSW klären wir gern im Termin.“
- **Offene Entscheidung / benötigter Input:** Umfang der Postkorb-Prüfungen; GeVo-Nummer und Verbundname des von Celonis eröffneten Vorgangs.
- **Zuständig:** Tanja Juraschek (Robotics) mit Eingangsmanagement und Celonis

## Kommentar 60

- **Comment ID:** 60
- **Autor:** Jeglorz, Marco (HSB4K-EXTERN)
- **Datum:** 16.09.2026, 13:18
- **Stelle / PDD-Schritt:** Start, 1. Schritt, Screenshot-Zeile „Datenpool, Datensatz zum Postkorbvorgang“
- **Originaltext:** „Verweis auf Liste aller Felder aus dem Datenpool, die ausgelesen werden sollen + GeVo Nummer“
- **Interpretation:** Schritt 1 soll explizit auf die vollständige Liste der auszulesenden Datenpoolfelder verweisen und die GeVo-Nummer des Postkorbvorgangs nennen.
- **Umsetzung im Dokument:** Alle 35 Felder <BUE_…> sind in Schritt 1 namentlich aufgeführt, mit Verweis auf das Kapitel „Tabelle der genutzten Variablen“ (Herkunft „Datenpool“, dort Format und Pflichtfeldkennzeichen). Die GeVo-Nummer wurde nicht eingetragen.
- **Status:** partially implemented
- **Begründung:** Die GeVo-Nummer liegt weder im Dokument noch in den Kommentaren vor und wurde nicht erfunden.
- **Antwortvorschlag:** „Die Feldliste ist in Schritt 1 ergänzt. Die GeVo-Nummer des von Celonis eröffneten Postkorbvorgangs tragen wir nach, sobald sie durch Eingangsmanagement/Celonis bestätigt ist. Bitte um Nennung.“
- **Offene Entscheidung / benötigter Input:** GeVo-Nummer.
- **Zuständig:** Eingangsmanagement / Celonis, Bestätigung durch Fachbereich

## Kommentar 61

- **Comment ID:** 61
- **Autor:** Juraschek, Tanja (DTEA2D)
- **Datum:** 16.09.2026, 11:49
- **Stelle / PDD-Schritt:** Start, 1. Schritt, Block „Datenpool … öffnen“ bis „<Fehlerliste> = leer“
- **Originaltext:** „Ein Bespiel:“ (Screenshot „7. Postkorb – Datenpool öffnen und auslesen“ mit GESCHV-NR: 100, Verbundname und Tabelle „WENN Datapool-Fieldname | Setze Attribut | Beispiel“)
- **Interpretation:** Muster für die Dokumentation des Datenpool-Zugriffs: Datenpool mit GeVo-Nummer und Verbundname, je Datenpoolfeld die Zuordnung zur Bot-Variablen mit Beispielwert.
- **Umsetzung im Dokument:** Feldliste in Schritt 1 ergänzt; die Zuordnung Datenpoolfeld → Variable, Format und Pflichtfeld steht in der Tabelle der genutzten Variablen, auf die Schritt 1 verweist. Eine zusätzliche dreispaltige Zuordnungstabelle mit Beispielwerten in Schritt 1 wurde nicht angelegt.
- **Status:** partially implemented
- **Begründung:** Dokumentstruktur bewusst beibehalten; GESCHV-NR und Verbundname sind nicht bekannt.
- **Antwortvorschlag:** „Die Zuordnung Datenpoolfeld → Variable steht in der Tabelle der genutzten Variablen; Schritt 1 listet jetzt alle 35 Felder und verweist darauf. Wenn Robotics die Tabelle mit Beispielwerten direkt in Schritt 1 benötigt, ergänzen wir sie. Bitte kurz bestätigen.“
- **Offene Entscheidung / benötigter Input:** Darstellungsform in Schritt 1; GeVo-Nummer / Verbundname.
- **Zuständig:** Tanja Juraschek

## Kommentar 67

- **Comment ID:** 67
- **Autor:** Juraschek, Tanja (DTEA2D)
- **Datum:** 16.09.2026, 11:50
- **Stelle / PDD-Schritt:** 2. Schritt „Ausschlusskriterien“, Bedingung „<BUE_VNR> = „Manuelle Prüfung VNR/Sparte““
- **Originaltext:** „Wie kommt die Info da rein?“
- **Interpretation:** Frage, wie der Ersatzwert in BUE_VNR entsteht und ob ein solcher Vorgang den Bot überhaupt erreichen kann.
- **Umsetzung im Dokument:** Keine Textänderung zu dieser Frage; die Prüfung wurde gemäß Kommentar 68 entfernt. Der Kommentar bleibt erhalten; sein Anker sitzt jetzt am vorangehenden „Ende WENN“ des Reminder-Blocks, weil die kommentierte Zeile entfallen ist.
- **Status:** clarification required
- **Begründung:** Antworten werden nicht ins Dokument geschrieben; die Bestätigung durch Celonis/Eingangsmanagement steht aus.
- **Antwortvorschlag:** „Den Ersatzwert „Manuelle Prüfung VNR/Sparte“ schreibt Celonis in BUE_VNR und BUE_SPARTE, wenn aus der Mail keine normierbare VNR ermittelt werden kann (Datenpool-Antrag V1.6). Solche Eingänge bleiben nach heutigem Verständnis beim Eingangsmanagement und erhalten keinen Postkorbvorgang für den Prüf-Bot; deshalb ist die Prüfung im Bot entfallen. Bitte Celonis/Eingangsmanagement bestätigen, dass kein Postkorbvorgang ohne VNR im Themenpostkorb des Prüf-Bots eröffnet wird.“
- **Offene Entscheidung / benötigter Input:** Bestätigung, dass Vorgänge ohne ermittelbare VNR den Bot nicht erreichen.
- **Zuständig:** Celonis, Eingangsmanagement

## Kommentar 68

- **Comment ID:** 68
- **Autor:** Juraschek, Tanja (DTEA2D)
- **Datum:** 16.09.2026, 13:28
- **Stelle / PDD-Schritt:** 2. Schritt, dieselbe Bedingung
- **Originaltext:** „Rauswerfen und in der Tabelle löschen“
- **Interpretation:** Prüfung „<BUE_VNR> = „Manuelle Prüfung VNR/Sparte““ mit BE-Klassifikation „VNR nicht ermittelbar“ aus dem Prozess entfernen und in der Variablentabelle löschen.
- **Umsetzung im Dokument:** WENN-Block in Schritt 2 entfernt; „VNR nicht ermittelbar“ aus der Werteliste im BE-Handling und aus den Ausschlusskriterien des Ablaufdiagramms gestrichen. Die Tabellenzeile BUE_VNR wurde beibehalten.
- **Status:** partially implemented
- **Begründung:** BUE_VNR wird weiterhin in Schritt 1, im Eingangskanal und im BE-Handling (Bearbeitungshinweis „<BUE_VNR>, <BUE_VNR_2>“) nachrichtlich verwendet und ist mit dem Überlauffeld BUE_VNR_2 gekoppelt, dessen Verbleib noch in Klärung ist. Nur die Tabellenzeile zu löschen, würde offene Verweise erzeugen; über beide Felder soll nicht stillschweigend entschieden werden.
- **Antwortvorschlag:** „Die Prüfung ist entfernt (Schritt 2, BE-Werteliste, Ablaufdiagramm). Die Tabellenzeile BUE_VNR steht noch, weil BUE_VNR und BUE_VNR_2 im BE-Handling nachrichtlich in den Bearbeitungshinweis übernommen werden. Sollen beide Felder komplett aus dem PDD (Schritt 1, Eingangskanal, BE-Handling, Tabelle) gestrichen werden, oder bleiben sie für den Bearbeitungshinweis? Das entscheiden wir am besten zusammen mit BUE_VNR_2.“
- **Offene Entscheidung / benötigter Input:** Verbleib oder Streichung von BUE_VNR und BUE_VNR_2.
- **Zuständig:** Tanja Juraschek, Fachbereich (Inge Lorusso)

## Kommentar 69

- **Comment ID:** 69
- **Autor:** Juraschek, Tanja (DTEA2D)
- **Datum:** 16.09.2026, 11:51
- **Stelle / PDD-Schritt:** 2. Schritt, Bedingung „<BUE_VERMITTLER_TYP> = „MFA““
- **Originaltext:** „Steht das wirklich so im Datenpool?“
- **Interpretation:** Zweifel, ob der Datenpool die Ausprägung genau als „MFA“ (bzw. „Makler“) liefert.
- **Umsetzung im Dokument:** Keine Änderung an der Bedingung. Die neue Bedingung der Unterlagenprüfung verwendet konsistent „<BUE_VERMITTLER_TYP> = „Makler““ (Ausprägungen laut Variablentabelle: Makler, MFA).
- **Status:** clarification required
- **Begründung:** Der Datenpool-Antrag V1.6 übernimmt das Feld „Typ“ des KI-Deckblatts als BUE_VERMITTLER_TYP und verwendet in den Feldbeschreibungen die Ausprägung „MFA“ (z. B. „N/A bei BUE_VERMITTLER_TYP = MFA“). Die tatsächliche Befüllung und Schreibweise durch Celonis ist im Testlauf zu bestätigen.
- **Antwortvorschlag:** „Ja, laut Datenpool-Antrag V1.6 (Feld „Typ“ des Deckblatts) mit den Ausprägungen „Makler“ und „MFA“. Wir lassen die Schreibweise durch Celonis im nächsten Testlauf bestätigen.“
- **Offene Entscheidung / benötigter Input:** Bestätigung der Ausprägungen durch Celonis.
- **Zuständig:** Celonis

## Kommentar 75

- **Comment ID:** 75
- **Autor:** Juraschek, Tanja (DTEA2D)
- **Datum:** 16.09.2026, 13:22
- **Stelle / PDD-Schritt:** 3. Schritt „VNR-Prüfung (VA230)“, Feld „urspr.Vers.beginn“
- **Originaltext:** „Heißt das Feld immer so und auch in jeder Sparte?“
- **Interpretation:** Die Feldbezeichnung muss in VA230 für alle KV-Sparten (Voll-, Zusatz-, Pflegeversicherung) identisch sein, sonst braucht der Bot eine andere Erkennung.
- **Umsetzung im Dokument:** Keine Änderung; <VA230-Vertragsbeginn> bleibt als Existenznachweis des Vertrags erhalten.
- **Status:** clarification required
- **Begründung:** Die Feldbezeichnung je Sparte ist nicht bestätigt.
- **Antwortvorschlag:** „Für KV (Voll, Zusatz, Pflege) gehen wir von einer einheitlichen VA230-Maske aus. Wir lassen die Feldbezeichnung „urspr.Vers.beginn“ durch den Fachbereich für alle drei Sparten bestätigen und ergänzen sonst je Sparte die Bezeichnung.“
- **Offene Entscheidung / benötigter Input:** Feldbezeichnung je Sparte.
- **Zuständig:** Fachbereich (Inge Lorusso)

## Kommentar 82

- **Comment ID:** 82
- **Autor:** Juraschek, Tanja (DTEA2D)
- **Datum:** 16.09.2026, 13:24
- **Stelle / PDD-Schritt:** 3. Schritt, Satz „<VA230-Sparte> und <VA230-Status> werden nachrichtlich mitgeführt …“
- **Originaltext:** „Was bedeutet das?“
- **Interpretation:** Unklar, wozu die Felder gelesen werden, wenn sie keine Prozesswirkung haben.
- **Umsetzung im Dokument:** Satz neu gefasst: <VA230-Sparte> wird nur nachrichtlich mitgeführt und hat keine Auswirkung auf den Prozessablauf (Sparte durch den Postkorb Gesundheit vorgegeben, Notizvorlage BOT2011 fest); <VA230-Status> steuert die Aussteuerung nicht aktueller Verträge. Variablentabelle (VA230-Sparte, VA230-Status), Hinweis in Schritt 1 und Systemtabelle entsprechend angepasst.
- **Status:** implemented
- **Begründung:** Der Satz ist jetzt eindeutig; VA230-Sparte wurde nicht entfernt.
- **Antwortvorschlag:** „Präzisiert: Die Sparte hat keine Prozesswirkung und wird nur mitgeführt; der Status steuert die Aussteuerung nicht aktueller Verträge (siehe Kommentar 83).“
- **Offene Entscheidung / benötigter Input:** Ob <VA230-Sparte> weiterhin gelesen werden soll (Reporting) oder entfallen kann.
- **Zuständig:** Fachbereich

## Kommentar 83

- **Comment ID:** 83
- **Autor:** Juraschek, Tanja (DTEA2D)
- **Datum:** 16.09.2026, 13:58
- **Stelle / PDD-Schritt:** 3. Schritt, dieselbe Stelle
- **Originaltext:** „Bitte noch die Aussteuerung bei nicht aktuellen Verträgen ergänzen“
- **Interpretation:** Verträge mit Status ungleich „aktuell“ (historische Verträge) sind als Business Exception auszusteuern (vgl. Kommentar 81 von Inge Lorusso vom 04.09.: „Historische Verträge sollen ausgesteuert werden“).
- **Umsetzung im Dokument:** Neuer Block nach dem Lesen des Status: WENN <VA230-Status> <> „aktuell“ DANN <BE-Klassifikation> = „<Klassifikation für nicht aktuelle Verträge – durch Fachbereich festzulegen>“, Weiter zum Kapitel „BE-Handling“. Werteliste im BE-Handling um den Platzhalter ergänzt; Variablentabelle VA230-Status, Systemtabelle, Kurzbeschreibung, Hinweis in Schritt 1 und Ablaufdiagramm angepasst.
- **Status:** partially implemented
- **Begründung:** Die BE-Klassifikation ist nicht abgestimmt; in der Variablentabelle stand bisher „sonst „Storno““, ohne dass „Storno“ in der Werteliste geführt war. Die Klassifikation wurde nicht erfunden, sondern als Platzhalter gesetzt.
- **Antwortvorschlag:** „Die Aussteuerung ist ergänzt. Bitte die BE-Klassifikation festlegen, z. B. „Vertrag nicht aktuell“ oder „Storno“. Außerdem: Welche Statuswerte gibt VA230 neben „aktuell“ aus, damit die Bedingung testbar ist?“
- **Offene Entscheidung / benötigter Input:** Klassifikationstext; Liste der VA230-Statuswerte.
- **Zuständig:** Fachbereich (Inge Lorusso)

## Kommentar 85

- **Comment ID:** 85
- **Autor:** Juraschek, Tanja (DTEA2D)
- **Datum:** 16.09.2026, 14:00
- **Stelle / PDD-Schritt:** 4. Schritt „Namensprüfung (IS100)“, Zeile „IS100 mit <Vorgang-VNR> öffnen.“
- **Originaltext:** „Wir rufen dafür einen Scout-Service auf, um Vor- und Nachname separat zu erhalten“
- **Interpretation:** Nachname und Vorname werden nicht aus dem gemeinsamen Namensfeld in IS100 gelesen, sondern über einen Scout-Service getrennt geliefert.
- **Umsetzung im Dokument:** Schritt 4: nach dem Öffnen von IS100 Aufruf des Scout-Service, Übernahme von Nachname und Vorname aus dessen Ergebnis in <IS100-Nachname> und <IS100-Vorname>, erläuternder Hinweis (Geburtsdatum, Straße, PLZ weiterhin direkt aus IS100). Systemtabelle um die Zeile „Scout-Service (Namensauflösung zu IS100)“ ergänzt; Herkunft in der Variablentabelle, Kurzbeschreibung, Design-Kapitel und Ablaufdiagramm angepasst. Prüfnotizen „Nachname abweichend“ / „Vorname abweichend“ unverändert.
- **Status:** partially implemented
- **Begründung:** Bezeichnung, Schnittstelle, Aufruf und Rückgabeformat des Scout-Service sind nicht bekannt und wurden nicht erfunden.
- **Antwortvorschlag:** „Der Scout-Service ist als eigener Schritt eingebaut. Bitte um Bezeichnung, Aufruf und Rückgabefelder des Scout-Service (technischer Absatz Robotics), damit die Schnittstelle im PDD benannt werden kann. Zusätzlich: Wie verhält sich der Service bei juristischen Personen ohne Vornamen?“
- **Offene Entscheidung / benötigter Input:** Technische Angaben zum Scout-Service.
- **Zuständig:** Robotics (Tanja Juraschek)

## Kommentar 90

- **Comment ID:** 90
- **Autor:** Juraschek, Tanja (DTEA2D)
- **Datum:** 16.09.2026, 14:01
- **Stelle / PDD-Schritt:** 4. Schritt, Zeile „Lese das gelb markierte Feld aus und speichere als <IS100-Vorname>.“
- **Originaltext:** „Wir rufen dafür einen Scout-Service auf, um Vor- und Nachname separat zu erhalten“
- **Interpretation:** wie Kommentar 85, bezogen auf den Vornamen.
- **Umsetzung im Dokument:** Zeile geändert in „Vorname aus dem Ergebnis des Scout-Service übernehmen und speichere als <IS100-Vorname>.“; Variable <IS100-Vorname> beibehalten.
- **Status:** partially implemented
- **Begründung:** wie Kommentar 85 (technische Details offen).
- **Antwortvorschlag:** „Umgesetzt, siehe Kommentar 85.“
- **Offene Entscheidung / benötigter Input:** wie Kommentar 85.
- **Zuständig:** Robotics (Tanja Juraschek)

## Kommentar 93

- **Comment ID:** 93
- **Autor:** Juraschek, Tanja (DTEA2D)
- **Datum:** 16.09.2026, 14:05
- **Stelle / PDD-Schritt:** 6. Schritt „Adressprüfung (IS100)“, Zeile „Format: „Straße / Str. / etc. (z. B. Weg)“.“
- **Originaltext:** „Bitte ausformulieren, was in dem String abgeschnitten werden soll vor der Prüfung“
- **Interpretation:** Die Normalisierung vor dem Straßenvergleich muss eindeutig und testbar beschrieben sein: welche Bestandteile werden vereinheitlicht oder entfernt.
- **Umsetzung im Dokument:** Zweistufiger Vergleich: zuerst Originalwerte; bei Abweichung Normalisierung beider Werte und erneuter Vergleich; Prüfnotiz „Straße abweichend“ nur, wenn die normalisierten Werte weiterhin abweichen. Normalisierung: „Straße“ und „Strasse“ werden, auch als Wortbestandteil (z. B. „Bahnhofstraße“), durch „Str.“ ersetzt; Leerzeichen am Anfang und Ende sowie doppelte Leerzeichen werden entfernt; Hausnummer und andere Bezeichnungen wie „Weg“ bleiben unverändert. Variablentabelle (BUE_KUNDE_STRASSE, IS100-Strasse) angepasst. PLZ-Prüfung unverändert.
- **Status:** partially implemented
- **Begründung:** Aufgenommen wurden nur die im Dokument bestätigten Varianten (Straße, Strasse, Str.). Weitere Regeln (Groß-/Kleinschreibung, Weg/Platz/Allee, Hausnummernzusätze, Sonderzeichen) sind nicht bestätigt.
- **Antwortvorschlag:** „Die Normalisierung ist ausformuliert (Straße/Strasse → Str., Leerzeichen). Sollen weitere Regeln gelten, z. B. Groß-/Kleinschreibung ignorieren, „Weg“/„Platz“/„Allee“ abkürzen, Hausnummernzusätze („12a“ vs. „12 a“) angleichen? Beispiele aus dem Bestand wären hilfreich.“
- **Offene Entscheidung / benötigter Input:** Vollständige Normalisierungsregeln.
- **Zuständig:** Fachbereich (Inge Lorusso) und Robotics

## Kommentar 96

- **Comment ID:** 96
- **Autor:** Jeglorz, Marco (HSB4K-EXTERN)
- **Datum:** 16.09.2026, 14:22
- **Stelle / PDD-Schritt:** 7. Schritt „Agenturnummer des übernehmenden Maklers (OB726)“, Zeile „<AGT-Uebernehmer> = <BUE_AGENTUR_NR>“
- **Originaltext:** „Beschreiben, woran dies fest gemacht wird. Fehlermeldung einfügen, damit Roboter erkennt, dass die Agenturnummer nicht übereinstimmt“
- **Interpretation:** Die Bedingung „Agentur nicht vorhanden“ muss für den Roboter erkennbar beschrieben sein: Rückmeldung von OB726 (Fehlermeldung) und Abgleich, dass die angezeigte Agentur zur eingegebenen Nummer passt.
- **Umsetzung im Dokument:** Bedingung konkretisiert: „OB726 zeigt nach dem Einstieg keine Agenturdaten an bzw. gibt die Fehlermeldung „<Text der OB726-Fehlermeldung – durch Robotics zu ergänzen>“ aus ODER der in OB726 angezeigte Ordnungsbegriff (gelb markiert, Format „A,…“) enthält <BUE_AGENTUR_NR> nicht“. Formatzeile und Variablentabelle BUE_AGENTUR_NR: Lieferung aus EMMA ohne Präfix „A“ und ohne Kommata oder Trennzeichen; der Bot verwendet den bereinigten Zahlenwert für den Einstieg in OB726.
- **Status:** partially implemented
- **Begründung:** Der Text der OB726-Fehlermeldung ist nicht bekannt (Platzhalter). Ob OB726 den Einstieg ohne „A“ akzeptiert, ist nicht getestet; der Screenshot zeigt den Ordnungsbegriff als „A,002220291“.
- **Antwortvorschlag:** „Die Erkennung ist beschrieben. Bitte den genauen Fehlermeldungstext von OB726 bei unbekannter Agenturnummer ergänzen. Zusätzlich testen: Einstieg in OB726 ohne Präfix „A“ sowie mit 7-, 8- und 9-stelligen Nummern (führende Nullen).“
- **Offene Entscheidung / benötigter Input:** Fehlermeldungstext; Testergebnis OB726-Einstieg ohne „A“.
- **Zuständig:** Robotics (Marco Jeglorz, Tanja Juraschek)

## Kommentar 97

- **Comment ID:** 97
- **Autor:** Jeglorz, Marco (HSB4K-EXTERN)
- **Datum:** 16.09.2026, 14:23
- **Stelle / PDD-Schritt:** 8. Schritt, Block „Lese das gelb markierte Feld aus und speichere als <OB726-PNR>“ bis „Format: < 7 stellige Zahlen“
- **Originaltext:** „Prüfung, ob das Feld sauber ausgelesen werden kann - Auslesen ohne P, - nur die siebenstellige Nummer speichern“
- **Interpretation:** PNR ohne Präfix „P“ und ohne Komma/Trennzeichen auslesen, nur den Zahlenanteil speichern, siebenstellige PNR vollständig übernehmen, führende Nullen erhalten.
- **Umsetzung im Dokument:** Leseanweisung: „Übernimm nur den Zahlenanteil ohne das Präfix „P“ und ohne Komma oder sonstige Trennzeichen (führende Nullen bleiben erhalten) und speichere ihn als <OB726-PNR>.“ Formatzeilen (Variante A und B): „nur Ziffern; bisherige PNR weniger als 7 Stellen, neue PNR 7-stellig; führende Nullen bleiben erhalten“. Variablentabelle OB726-PNR ergänzt. Expliziter Wechsel „von OB726 nach GH040 mit dem bereinigten <OB726-PNR>“.
- **Status:** implemented
- **Begründung:** Keine Auffüllung auf 7 Stellen ergänzt, da keine Normierungsregel abgestimmt ist.
- **Antwortvorschlag:** „Umgesetzt. Hinweis aus den Screenshots: OB726 zeigt „P,216697“ (6-stellig), GH040 wurde mit „P,0216697“ (7-stellig, führende Null) aufgerufen. Bitte prüfen, ob der Bot beim GH040-Einstieg auf 7 Stellen auffüllen und das Präfix „P,“ ergänzen muss (Testfall führende Nullen).“
- **Offene Entscheidung / benötigter Input:** Einstiegsformat GH040 (Präfix, Auffüllung).
- **Zuständig:** Robotics

## Kommentar 98

- **Comment ID:** 98
- **Autor:** Jeglorz, Marco (HSB4K-EXTERN)
- **Datum:** 16.09.2026, 14:27
- **Stelle / PDD-Schritt:** 8. Schritt, GH040-Block (Variante A)
- **Originaltext:** „Suche die Zeile „Status der Beschäftigung““
- **Interpretation:** Der Anbindungsstatus wird in GH040 aus der Zeile „Status der Beschäftigung“ gelesen; die Zeilenbezeichnung ist exakt zu nennen.
- **Umsetzung im Dokument:** In allen drei GH040-Blöcken (Variante A, Variante B, Bestandsinhaber): „Suche die Zeile „Status der Beschäftigung“ und lese den Wert dieser Zeile (gelb markiert) aus; speichere ihn als <GH040-Anbindung-Makler> bzw. <GH040-Anbindung-Inhaber>.“ Vergleich mit „aktiv“ und Konsequenzen unverändert (BE „Keine Zusammenarbeit“; Prüfnotiz „Anbindung Bestandsinhaber nicht aktiv“). Screenshot-Beschriftungen, Variablentabelle, Systemtabelle und Ablaufdiagramm auf die Zeilenbezeichnung umgestellt; Wechsel von OB726 bzw. VA230 nach GH040 explizit.
- **Status:** implemented
- **Begründung:** –
- **Antwortvorschlag:** „Umgesetzt.“
- **Offene Entscheidung / benötigter Input:** keine.
- **Zuständig:** –

## Kommentar 112

- **Comment ID:** 112
- **Autor:** Juraschek, Tanja (DTEA2D)
- **Datum:** 16.09.2026, 13:42
- **Stelle / PDD-Schritt:** 13. Schritt „Umgang mit Business Exceptions (zentral)“, Platzhalter „Screenshot“
- **Originaltext:** „Screenshot ergänzen und Bearbeitungshinweis durch die KV-Variante ersetzen“
- **Interpretation:** Der Screenshot des Bearbeitungshinweises am Postkorbvorgang und der Wortlaut sollen in der KV-Variante eingefügt werden (nicht die Non-KV-Variante mit Unterscheidung Makler/HS).
- **Umsetzung im Dokument:** Keine; Platzhalter „Screenshot“ und der bestehende Aufbau des Bearbeitungshinweises (<BE-Klassifikation>, <Fehlerliste>, <BUE_VNR>/<BUE_VNR_2>) sowie Zielpostkorb „HSB4K MV“ beibehalten.
- **Status:** not implemented
- **Begründung:** KV-Screenshot und exakter KV-Wortlaut liegen nicht vor; die Komposit/Leben-Unterscheidung wurde nicht übertragen.
- **Antwortvorschlag:** „Bitte den Screenshot der KV-Notiz bzw. des Bearbeitungshinweises am Postkorbvorgang und den KV-Wortlaut liefern; wir tauschen dann Platzhalter und Text aus.“
- **Offene Entscheidung / benötigter Input:** KV-Screenshot und Wortlaut.
- **Zuständig:** Fachbereich (Inge Lorusso), Tanja Juraschek

---

## Weitere Änderungen ohne eigenen Kommentar vom 16.09.2026

Diese Änderungen sind durch ältere Kommentare oder die im Review abgestimmten Anforderungen gedeckt.

| Änderung | Grundlage | Stelle |
|---|---|---|
| Unvollständige Unterlagen: Prüfnotiz „Unterlagen nicht vollständig“ in <Fehlerliste> statt sofortiger BE; Bedingung auf den Makler-Zweig eingeschränkt (<BUE_VERMITTLER_TYP> = „Makler“); Ausnahme <BUE_ANF_UNTERLAGEN> = „ja“ erhalten; „Unterlagen nicht vollständig“ von der BE-Werteliste in die Prüfnotizliste verschoben | Anforderung 4 (Review 16.09.) | 2. Schritt, Hinweis, Variablentabelle, Kurzbeschreibung, Diagramm |
| BUE_UMFANG: jeder Vorgang wird mit eigener <Vorgang-VNR> geprüft; für „Gesamt“ ist die Verarbeitung offen (manuelle Bearbeitung oder BE, Klassifikation nicht festgelegt) | Anforderung 3 | 2. Schritt Hinweis, Variablentabelle |
| Softwarewechsel explizit: EWMS-Postkorb → Datenpool, IS100 → Scout-Service, OB726 → GH040, VA230 → GH040 | Anforderungen 1, 6, 10, 11, 13 | Schritte 1, 4, 8, 9 |
| Begriffe „hart/weich“ in der Zielbeschreibung und in der Diagrammlegende entfernt | Kommentare 64 und 88 (04.09.2026) | Kapitel „Ziel der Prozessautomatisierung“, Ablaufdiagramm |
| Ablaufdiagramm: Ausschlusskriterien ohne „VNR nicht ermittelbar“, Unterlagen als Prüfnotiz, Vertragsstatus in VA230, Scout-Service, Zeile „Status der Beschäftigung“ | Kommentare 68, 83, 85, 98; Anforderung 4 | Kapitel „Prozessdiagramm“ |

Nicht verändert (außerhalb des Auftrags, siehe Offene-Punkte-Liste): Reporting-Kapitel (Platzhalter laut Kommentar 32, enthält noch „harte Ablehnungsgrund“ / „weiche Abweichungen“), Formulierung „hartes Kriterium“ in den Feldbeschreibungen BUE_MV_AUF_MAKLER und BUE_MV_UNTERSCHRIFT_KUNDE, Inhaltsverzeichnis (Seitenzahlen nicht aktualisiert).
