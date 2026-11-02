# PDD Vorprüfung Bestandsübertragung (Prüf-Bot)

Zwei Process Definition Documents im vorgegebenen ITERGO-Robotics-PDD-Format, jeweils
direkt in das Template `quellen/PDD_Template_Vorpruefung_BUE.docx` eingearbeitet:

| Datei | Sparte | Ziel-Notiz |
|---|---|---|
| `PDD_Vorpruefung_BUE_Gesundheit_KV.docx` | Krankenversicherung (KV) | BOT2011 – „BÜ auf Makler Robotics“ |
| `PDD_Vorpruefung_BUE_Komposit_Leben.docx` | Komposit und Leben | BOT1515 – „Bestandsübertragung Robotics PB“ |

## Quellen der Fachlichkeit

- `Prozess_Makler_BÜ_meets_KI_(Komposit_Leben)` – erarbeitete Prüflogik (VNR, Name, Vorname,
  Geburtsdatum, Adresse, Agenturnummer, PNR, Anbindung, Vertriebskanal, BE-Priorisierung).
  **Die PDDs enthalten ausschließlich Prüfungen, die dort beschrieben sind.**
- `Datenpool_Feldbezeichnungen.xlsx` – Feldnamen `BUE_*`. Die dort gestrichenen Felder
  `BUE_LFD_NR`, `BUE_STATUS` und `BUE_VORGANGSTYP` sind entfallen; Ordnungsbegriff ist
  stattdessen die Vorgang-Lfd-Nr des Postkorbvorgangs.
- `quellen/DatenfelderKIDeckblatt.xlsx` – Zielbild des KI-Deckblatts. Liefert die exakten
  Ausprägungen je Feld (Klassifikation, Prüfung Unterlagen, MV-Status, Sparte-Kürzel …).
- Notizmasken BOT2011 (KV) und BOT1515 (Komposit/Leben)

## Datenpool-Beantragung (Stand V1.2, 07.09.2026)

`Datenpoolfelder_Pruef-Bot_BUE.xlsx` füllt das ITERGO-Template
(`quellen/Datenpool_Template_ITERGO.xlsx`) nach den Vorgaben aus der Mail von Bastian Roth
vom 21.08.2026:

- befüllt werden nur `VERW_SYS_SL`, `GEVO_NR` **oder** `DOK_TYP_NR`, `ICR_FLD_NAME`, `Feld_Format`
- `ICR_FLD_NAME`: max. 25 Zeichen, keine Sonderzeichen, Umlaute, Satzzeichen oder Leerzeichen —
  alle 33 Feldnamen sind konform, `BUE_MV_UNTERSCHRIFT_KUNDE` und `BUE_MV_UNTERSCHRIFTSDATUM`
  nutzen die 25 Zeichen vollständig aus
- `Feld_Format`: CH = Text, NU = Zahl, DA = Datum, JN = Boolean; Feldlänge einheitlich 50 Zeichen
- Gesundheit: `VERW_SYS_SL` = KV, Schlüssel über `DOK_TYP_NR`
- Komposit/Leben: Schlüssel über `GEVO_NR`, je `VERW_SYS_SL`/`GEVO_NR`-Kombination eine eigene Zeile
- 33 Felder × 6 Kombinationen = 198 Zeilen

Die Mappe hat zwei Blätter:

- **Daten** – das auszufüllende ITERGO-Antragsblatt (Spaltenlayout unverändert, Spalte
  `Hinweis` bleibt leer, da die Erläuterungen im Blatt `Hinweise` stehen)
- **Feldliste** – die lesbare Abstimmungsfassung im Layout, das den Kollegen bereits
  vorlag: Nr. | Deckblatt-Abschnitt | Deckblatt-Feld | Datenpool-Feldname | Datentyp |
  Ausprägungen / Format | Beispiel. Aufbau, Reihenfolge und Feldbezeichnungen folgen dem
  **aktuellen KI-Deckblatt** (Kopfzeile, Kunde & Vertrag, Makler, Klassifikation & Vorgang,
  Maklervollmacht & Unterschriften, Ergebnis), ergänzt um den neuen Abschnitt
  Unterlagenanforderung.

  Grau hinterlegt und ohne Nummer stehen die Deckblatt-Felder, die **kein eigenes
  Datenpool-Feld** bekommen, jeweils mit Begründung:

  | Deckblatt-Feld | Grund |
  |---|---|
  | Lfd-Nr, Status (Ampel), Vorgangstyp | im Deckblatt gestrichen |
  | Kopfzeile: Klassifikation, Maklervollmacht | Badges, wiederholen `BUE_KLASSIFIKATION` bzw. `BUE_MV_STATUS` |
  | Ergebnis: Zusammenfassung, Hinweis | KI-Freitext ohne Längenbegrenzung, passt nicht in 50 Zeichen und wird vom Prüf-Bot nicht ausgewertet |

  Gegenüber der V1.0, die den Kollegen vorlag, lautet die Konvention jetzt max. 25 statt
  30 Zeichen (Mail Roth).

**Entscheidung vom 02.09.2026 (K. Rypa, Maklerservice):** Statt der bisherigen Aufteilung in
„Untervollmacht erteilt" und „Untervollmacht fehlt" gibt es nur noch **ein** Feld
`BUE_UV_ERTEILT` mit den Ausprägungen ja/nein. `BUE_UV_FEHLT` entfällt; damit sinkt die
Feldzahl von 34 auf 33. „ja" setzt alle drei fachlichen Kriterien voraus: eine Untervollmacht
bzw. ein Unterbevollmächtigter liegt vor, dieser ist namentlich benannt, und aus den Unterlagen
ist erkennbar, dass die Bestandsübertragung an genau diesen Unterbevollmächtigten erfolgen soll.
Welche Kriterien im Fall „nein" verletzt sind, wird im Deckblatt-Feld „Hinweise" mitgeteilt.

Neu gegenüber der Abstimmungsfassung sind die beiden Felder für die
Unterlagenanforderung: `BUE_ANF_UNTERLAGEN` (JN, ja/nein) und `BUE_ART_UNTERLAGEN`
(CH, Freitext, mehrere Angaben mit Semikolon getrennt). Der Prüf-Bot befüllt daraus die
Roboternotiz (Komposit/Leben: Ankreuzfelder „Folgearbeit für Komposit"; KV: Kennzeichen
„Anforderung von Unterlagen").

### Schlüssel

Aus der Abstimmung zum BÜ-Reporting (Fachkonzept v2, 29.06.2026):

| Sparte | Schlüssel | Bezeichnung | Bestätigt durch |
|---|---|---|---|
| Komposit / Leben | GeVo **469** | Bestandsübertragung | S. Koeberer / D. Amend, 25.06.2026 |
| Komposit / Leben | GeVo **108** | Bestandsübertragung (2. Schlüssel) | S. Koeberer / D. Amend, 25.06.2026 |
| KV / Gesundheit | ID **02015** | Maklervollmacht | Betrieb Gesundheit, 27./29.06.2026 |
| KV / Gesundheit | ID **06065** | Betreuung / Anfrage Betreuung | Betrieb Gesundheit, 27./29.06.2026 |

Der ursprünglich genannte „SV 496" war ein Zahlendreher — korrekt ist 469.
Schlüsselart laut Input Management: `DOK_TYP_NR` bei KV, `GEVO_NR` bei Komposit/Leben.

**Noch offen:** (1) Welche Verwaltungssystemschlüssel gelten für Komposit? Für Leben ist
`LF` hinterlegt; je weiterem System ist der Block je GeVo zu vervielfältigen.
(2) Die Schlüssel sind für das Reporting bestätigt — für den Datenpool ist zu bestätigen,
dass es dieselben Geschäftsvorfälle sind. (3) Hinweis H. Klindworth: ob neben 469/108
weitere GeVo aufzunehmen sind, wird noch geprüft.
(4) Feldlänge 50 Zeichen: bei `BUE_ART_UNTERLAGEN` (Freitext, Semikolon-getrennt) und
`BUE_VERMITTLER_NAME` ist zu klären, ob 50 Zeichen reichen.
(5) Das Geburtsdatum wird im aktuellen Deckblatt-Template als Zeitstempel ausgegeben
(Beispiel `869443200000`) — für den Datenpool wird `DA` / TT.MM.JJJJ benötigt.

## Regenerieren

```bash
pip install python-docx openpyxl cairosvg
cd quellen
python3 diagram.py KV diag_KV.png && python3 diagram.py KL diag_KL.png
python3 build.py            # erwartet template.docx + diag_KV.png/diag_KL.png im selben Ordner
```

`audit.py` prüft das Ergebnis gegen die Vorgaben des Templates (Kapitelstruktur,
Formatvorlagen, WENN/DANN-Paarigkeit, Schleifenpaarigkeit, BE-Texte, Vollständigkeit
der Variablentabelle, leere Übersetzungsspalte).

`build.py` öffnet das Template, füllt die vorhandenen Tabellen und Kapitel und ersetzt
ausschließlich das Kapitel „Schritt für Schritt-Beschreibung“. Formatvorlagen, Seitenformat
(A3 quer), Spaltenbreiten (7211 / 7504 / 6968 dxa) und Kapitelstruktur des Templates
bleiben unverändert.

## Offene Punkte (im Dokument kursiv markiert)

- Datenpoolfelder für geschützten Bestand (KV) bzw. Rahmenvertrag und VNR-Umfang (Komposit/Leben)
- Zuordnungstabellen: Nummernkreise Vertriebskanal, unbesetzte Agenturen, Dopix-Textbausteine,
  TOP-Makler-E-Mail-Adressen
- Namen der Themenpostkörbe für die Aussteuerung
- Umgang mit Verträgen im Mahnverfahren (Komposit/Leben)
- Umgang mit Firmenanschriften beim Namensabgleich

## Stand 03.09.2026 – Sichtung mit Robotics (U. Gerhards)

`PDD_Vorpruefung_BUE_Gesundheit_KV.docx` enthält die Beschlüsse der Sichtung vom 03.09.2026
(Transkript: `quellen/transkript_sichtung_pdd_20260903.txt`, Umsetzung: `quellen/umsetzen_robotics_0309.py`):

- Business Exceptions über `<BE>` = „Hart“/„Weich“ und `<BE-Klassifikation>` (Grund); weiche BE sammeln
  `Merke Prüfnotiz „…“` in `<Prüfnotizen>`, harte BE springen sofort ins zentrale Kapitel „BE-Handling“.
- Ausbaustufe 1: Hart und Weich gehen an den Themenpostkorb „HSB4K MV“ mit Bearbeitungshinweis
  („Kriterium für Ablehnung“ bzw. „Nachprüfung erforderlich“); Positivfall immer an den 72-Stunden-BOT (BOT2011 unverändert).
- Harte BE auch mitten im Prozess (Agentur-/Vermittlernummer nicht vorhanden, „Keine Zusammenarbeit“, PNR leer).
- Offene Punkte: Themenpostkorb-Name/-Anzahl, Notizform (Herr Tegge), Wortlaut der Bearbeitungsnotiz,
  Abnahmeumgebung + Bot-User, zusätzliche Datenpool-Felder Unterlagen, MV-Kriterien als Prüfschritt.
- Das Komposit/Leben-PDD ist noch auf diese Notation nachzuziehen.

## Stand 07.09.2026 – Kommentare M. Jeglorz (HSB4K-EXTERN, 04.09.2026)

Umsetzung über `quellen/umsetzen_kommentare_jeglorz_0409.py`: Klassifizierung Hart/Weich entfernt (`<BE>`,
`<BE-Klassifikation>` und Kapitel „BE-Handling“ bleiben), Prüfnotizen werden mit `Merke Prüfnotiz „…“ in <Fehlerliste>`
gesammelt, neues Kapitel „III. Test auf Fehlerliste“, „SONST / Weiter“-Blöcke entfernt, 72-Stunden-BOT und Notizbestückung
zusammengeführt, BE-Handling hinter das Prozessende verschoben, BE-Handling für alle BE identisch.

## Datenpool V1.2 (07.09.2026)

Neues Feld `BUE_UMFANG` (CH, Werteliste Gesamt | Einzel | Mehrere) für den Umfang der Bestandsübertragung,
entsprechend „Betroffene VNR“ der Telefonnotiz 1515. Ausbaustufe 1: Gesamt und Einzel werden verarbeitet,
Mehrere wird als Business Exception ausgesteuert. Damit 34 Felder x 6 Kombinationen = 204 Zeilen im Blatt
„Daten“. Offen: Ausprägungen für `BUE_ART_UNTERLAGEN` (Vorschlag entlang der Kennzeichen der Notiz 1515)
und die Prompt-Erweiterung für `BUE_UMFANG` mit Celonis. Datei: `Datenpoolfelder_Pruef-Bot_BUE_v1.2.xlsx`
(identisch mit `Datenpoolfelder_Pruef-Bot_BUE.xlsx`).

## Datenpool V1.3 (08.09.2026)

`BUE_VNR` und `BUE_SPARTE` tragen die Normierungsregeln aus der Abstimmung Maklerservice / ODPB / Celonis
vom 08.09.2026: zwei Buchstaben Spartenkürzel plus neun Ziffern (11 Zeichen), links mit Nullen aufgefüllt,
Sonderzeichen und alles danach entfallen, mehrere Nummern semikolongetrennt, Ersatztext bei fehlender oder
unvollständiger VNR. `BUE_UMFANG` ist nach der Anforderung von M. Jeglorz vom 08.09.2026 präzisiert
(Einzel / Gesamt / Mehrere mit der jeweiligen Bot-Logik). Neue offene Punkte 8 und 9: Der Ersatztext
„Manuelle Prüfung aufgrund fehlender/unvollständiger VNR“ hat 55 Zeichen und passt nicht in die Feldlänge 50;
in `BUE_VNR` passen bei Feldlänge 50 höchstens vier normierte Nummern.
Datei: `Datenpoolfelder_Pruef-Bot_BUE_v1.3.xlsx` (identisch mit `Datenpoolfelder_Pruef-Bot_BUE.xlsx`).

## Stand 09.09.2026 – VNR aus dem Postkorbvorgang, BUE_UMFANG, Ersatzfeld BUE_VNR_2

Freigabe N. Garcia-Fernandez („Fertig zur Umsetzung“): Ersatzfeld `BUE_VNR_2`, Vermerk „Manuelle Prüfung VNR/Sparte“.
Datenpool V1.4 (`Datenpoolfelder_Pruef-Bot_BUE_v1.4.xlsx`, 35 Felder, 210 Zeilen). PDD Gesundheit/KV über
`quellen/umsetzen_vnr_umfang_0909.py`: Der Prüf-Bot arbeitet mit `<Vorgang-VNR>` (Nummer, mit der Celonis den
Postkorbvorgang eröffnet hat, bereits normiert); die Normierung im Bot entfällt. `BUE_VNR`/`BUE_VNR_2` dienen dem
Abgleich (Prüfnotiz „VNR im Datenpool abweichend“) und bei `BUE_UMFANG` = Mehrere dem Bearbeitungshinweis.
Neue BE in der Vorprüfung: „Mehrere Versicherungsnummern“ und „VNR nicht ermittelbar“.
Das Ablaufdiagramm im PDD ist jetzt eine editierbare Word-Zeichnung (Formen und Verbinder, erzeugt über
`quellen/zeichnung.py`) statt eines Bildes. `Walkthrough_Pruef-Bot_Gesundheit_KV.html` erklärt den Ablauf als
Schritt-Wizard mit drei Beispielvorgängen (sauber, Prüfnotizen, harte BE).

## Stand 09.09.2026 (2) – Mehrfachagenten (MFA), BUE_UMFANG in der Notiz

Abstimmung S. Schwarz / M. Koch („Fertig zur Umsetzung“): Bei `BUE_VERMITTLER_TYP` = MFA gibt es keine Maklervollmacht;
`BUE_MV_ENTHALTEN`, `BUE_MV_STATUS`, `BUE_MV_VOLLUMFAENGLICH` und `BUE_UV_ERTEILT` erhalten die Ausprägung N/A
(Datenpool V1.5, `BUE_MV_ENTHALTEN` und `BUE_UV_ERTEILT` deshalb CH statt JN). PDD (`quellen/umsetzen_mfa_0909.py`):
Vorprüfung verzweigt nach Vermittlertyp (Makler: Unterlagen; MFA: Betreuungswunsch auf den MFA und Unterschrift VN als
harte BE), Abgleich Vermittlertyp gegen OB726-Klassifizierung als Prüfnotiz, „Bearbeitung nach“ = „mit BÜ“ bei MFA.
`BUE_UMFANG`: Mehrere ist eine weiche BE (Prüfnotiz, weitere VNR im Bearbeitungshinweis); Einzel und Gesamt werden in
der Notiz unter „Betroffene VNR“ übernommen. Walkthrough entsprechend aktualisiert.

## Stand 10.09.2026 – Weiterleitung immer an den 72-Stunden-BOT, Vertriebskanal-Ermittlung entfällt

PDD-Touchpoint mit Robotics (U. Gerhards, I. Lorusso, A. Wesche, M. Jeglorz): Der 72-Stunden-BOT verarbeitet
nachweislich alle Vorgänge und erkennt AO-Bestandsinhaber selbst (keine 72-Stunden-Information, keine
Wiedervorlage bei Makler-Bestandsinhabern). Der Prüf-Bot verzichtet deshalb auf die Ermittlung des Vertriebskanals
und des Vorgangstyps; alle freigegebenen Vorgänge gehen mit bestückter Notiz BOT2011 an den 72-Stunden-BOT.
PDD Gesundheit/KV über `quellen/umsetzen_72h_bot_1009.py`: Schritt „Ermittlung Vertriebskanal“ samt Tabelle
entfernt, Variablen `<Vertriebskanal>` und `<Vorgangstyp-BUE>` sowie die Report-Tags „Zielbot“ und „Vorgangstyp“
gestrichen, Systembeschreibung, Kurzbeschreibung, Design-Kapitel und Hinweis zur Weiterleitung angepasst,
Ablaufdiagramm (Knoten „II. Übernehmender Makler“) aktualisiert. Walkthrough ohne den Schritt Vertriebskanal
(12 Schritte). Stand: `PDD_Vorpruefung_BUE_Gesundheit_KV_1009_72h.docx` (identisch mit `PDD_Vorpruefung_BUE_Gesundheit_KV.docx`).
Offen aus dem Termin: ein Widerruf wird im Prüf-Bot nicht geprüft (taggleiche Verarbeitung, später eingehende
Widerrufe fängt der BÜ-Bot über die Weiterleitungssperre ab); Vorschlag zum BÜ-Umfang (Vorgang je VNR, `BUE_UMFANG`
ohne „Mehrere“) liegt als Mailentwurf `Mail_Entwurf_Antwort_Koch_BUE_Umfang_100926.eml` zur Abstimmung vor.

## Stand 10.09.2026 (2) – Ein Vorgang je genannter VNR, BUE_UMFANG ohne „Mehrere“

Vorschlag aus dem PDD-Touchpoint (I. Lorusso: ein Widerruf kann nur einen der genannten Verträge betreffen;
A. Wesche: heute wird je genannter VNR ein eigener Vorgang angelegt). `BUE_UMFANG` hat nur noch die Ausprägungen
„Einzel“ und „Gesamt“; nennt eine Makler-Mail mehrere Versicherungsnummern, eröffnet Celonis je Nummer einen
eigenen Postkorbvorgang mit derselben Mail und einer eigenen führenden VNR. Kommt zusätzlich die gesamte
Kundenverbindung vor, tragen alle Vorgänge „Gesamt“. PDD Gesundheit/KV über `quellen/umsetzen_umfang_je_vnr_1009.py`:
Prüfnotiz „Mehrere Versicherungsnummern“ und das zugehörige Ausschlusskriterium entfallen, der Bearbeitungshinweis
führt die weiteren VNR jetzt anhand von `BUE_VNR`/`BUE_VNR_2` nachrichtlich mit, Feldbeschreibungen, Eingangskanal
und Ablaufdiagramm angepasst. Walkthrough entsprechend (Szenario „Harte BE“ jetzt mit Umfang „Einzel“).
Stand: `PDD_Vorpruefung_BUE_Gesundheit_KV_1009_Umfang.docx` (identisch mit `PDD_Vorpruefung_BUE_Gesundheit_KV.docx`).
Der Abgleich <Vorgang-VNR> gegen <BUE_VNR> (Prüfnotiz „VNR im Datenpool abweichend“) entfällt ersatzlos
(`quellen/umsetzen_vnr_abgleich_entfaellt_1009.py`): Celonis eröffnet den Vorgang mit der Nummer, die es selbst
aus der Mail ermittelt hat; ein Vergleich zweier Felder derselben Quelle kann nur bei einem technischen Fehler
anschlagen und hätte den Vorgang über die Fehlerliste unnötig ausgesteuert. Der Bot arbeitet durchgehend mit
<Vorgang-VNR>; `BUE_VNR` und `BUE_VNR_2` sind nachrichtliche Information für den Bearbeitungshinweis.

Offen: Bestätigung durch Fachbereich und Celonis (Mailentwurf `Mail_Entwurf_Antwort_Koch_BUE_Umfang_100926.eml`);
`Datenpoolfelder_Pruef-Bot_BUE_v1.5.xlsx` führt bei `BUE_UMFANG` noch „Mehrere“ und wird nach der Bestätigung
auf V1.6 gezogen; für „Gesamt“ ist mit Robotics zu klären, wie der BÜ-Bot die Kundenverbindung bei mehreren
Vorgängen nur einmal überträgt.

## Datenpool V1.6 (11.09.2026) – BUE_UMFANG ohne „Mehrere“, kein VNR-Abgleich

Nachzug des Datenpool-Antrags auf den PDD-Stand vom 10./11.09.2026. `BUE_UMFANG` kennt nur noch
„Einzel“ und „Gesamt“; nennt eine Makler-Mail mehrere Versicherungsnummern, eröffnet Celonis je Nummer
einen eigenen Postkorbvorgang mit derselben Mail und eigener führender VNR. `BUE_VNR` und `BUE_VNR_2`
werden nicht mehr gegen die VNR des Postkorbvorgangs abgeglichen, sondern führen nachrichtlich alle im
Auftrag genannten Nummern für den Bearbeitungshinweis. Umfang unverändert: 35 Felder, 210 Zeilen.
Datei: `Datenpoolfelder_Pruef-Bot_BUE_v1.6.xlsx` (identisch mit `Datenpoolfelder_Pruef-Bot_BUE.xlsx`).
Offen bleibt die Bestätigung durch den Fachbereich und die Rückmeldung von Celonis zur Umsetzbarkeit
der Mehrfacheröffnung (Mailentwurf `Mail_Entwurf_Antwort_Koch_BUE_Umfang_100926.eml`).

## Stand 16.09.2026 – Umfang „Gesamt“ wird nach vollständiger Prüfung ausgesteuert

Ergebnis des Tests vom 15.09.2026 (M. Koch): Zwei Vorgänge derselben Kundenverbindung mit Umfang „Gesamt“
haben im BÜ-Bot die Ablöse doppelt verbucht. Deshalb geht nur noch ein Vorgang mit `BUE_UMFANG` = „Einzel“ und
durchweg positiver Prüfung an den 72-Stunden-BOT. Vorgänge mit „Gesamt“ durchlaufen alle Prüfschritte unverändert,
werden im Kapitel „Test auf Fehlerliste“ aber immer als Business Exception „Gesamte Kundenverbindung“ an den
Themenpostkorb HSB4K MV ausgesteuert; der Bearbeitungshinweis enthält neben der BE-Klassifikation die Prüfnotizen
der Fehlerliste, damit die Sachbearbeitung auf dem Prüfergebnis aufsetzt und die Kundenverbindung manuell überträgt.
PDD Gesundheit/KV über `quellen/umsetzen_umfang_gesamt_be_1609.py`: neuer WENN-Block vor dem Fehlerlisten-Test,
Notizfeld „Betroffene VNR“ nur noch mit „angegebene VNR beachten“, Hinweise in Vorprüfung und Kapitel III,
Feldbeschreibung `BUE_UMFANG`, BE-Klassifikationsliste, Kurzbeschreibung und Ablaufdiagramm (Entscheidung
„Fehlerliste gefüllt oder Umfang „Gesamt“?“, Kanten „nein“/„ja“, Quelle `quellen/zeichnung.py`) angepasst.
Walkthrough mit neuem Beispielvorgang „Gesamte Kundenverbindung“ (Schritt 9 löst die BE aus).
Stand: `PDD_Vorpruefung_BUE_Gesundheit_KV_1609_Gesamt.docx` (identisch mit `PDD_Vorpruefung_BUE_Gesundheit_KV.docx`).
Offen: `Datenpoolfelder_Pruef-Bot_BUE_v1.6.xlsx` beschreibt bei `BUE_UMFANG` noch die Übernahme von „Gesamt“ in die
Notiz; Nachzug auf V1.7 nach Bestätigung des Fachbereichs.

## QS-Review 16.09.2026 (T. Juraschek, M. Jeglorz) – Kommentare eingearbeitet

Grundlage ist die kommentierte Reviewfassung der Robotics-QS (Basis: Stand 10.09., 47 Kommentare, davon 16 vom
16.09.2026). Eingearbeitet über `quellen/umsetzen_qs_juraschek_1609.py`, alle Kommentare und Anker bleiben erhalten:
Schritt 1 mit explizitem Wechsel EWMS-Postkorb → Datenpool und vollständiger Liste der 35 Datenpoolfelder; Prüfung
`BUE_VNR = „Manuelle Prüfung VNR/Sparte“` (BE „VNR nicht ermittelbar“) entfällt; unvollständige Unterlagen sind im
Makler-Zweig eine Prüfnotiz statt einer sofortigen BE; nicht aktuelle Verträge (`VA230-Status <> „aktuell“`) werden
ausgesteuert (Klassifikation als Platzhalter, durch Fachbereich festzulegen); Vor- und Nachname kommen über den
Scout-Service zu IS100; Straßenvergleich zweistufig mit beschriebener Normalisierung; Agenturnummer aus EMMA ohne „A“,
PNR ohne „P“ und Trennzeichen; GH040 über die Zeile „Status der Beschäftigung“; Diagramm und Systemtabelle angepasst.
Ergebnis: `PDD_Vorpruefung_BUE_Gesundheit_KV_1609_QS.docx` (nicht identisch mit `PDD_Vorpruefung_BUE_Gesundheit_KV.docx`,
das den Vorschlag „Gesamt → BE“ vom 16.09. enthält; Zusammenführung nach Entscheidung des Fachbereichs).
Kommentarprotokoll: `QS_Review_1609_Kommentarprotokoll.md`, offene Punkte: `QS_Review_1609_Offene_Punkte.md`.

## QS-Review 16.09.2026, Runde 2 (T. Juraschek, M. Jeglorz) – 33 Kommentare eingearbeitet

Grundlage ist die zweite kommentierte Reviewfassung (64 Kommentare, davon 33 vom 16.09.2026, u. a. Startereignis-
Kapitel aus der Vorlage, Telefonnotiz als Freitext, KNR, E-Mail-Herkunft, GH040-Zeilenparsing, EOS, BE-Postkorbnummer).
Eingearbeitet über `quellen/umsetzen_qs_juraschek_runde2_1609.py`, alle Kommentare und Anker erhalten. Zusätzlich zu
Runde 1: Kapitel „Details zum Startereignis“ gefüllt (Nummern TBD, Vorlagenbeispiele als Klärungspunkte), Schritt 1 nach
Quellen gegliedert, Wertelisten als vollständig ausgewiesen, Agenturzweig ohne Kopie von `BUE_AGENTUR_NR` (INAKTIV vor
Namensvergleich, GH040 ans Ende, PNR aus der Kopfzeile bereinigt, Klassifizierung als Text hinter der Nummer),
E-Mail-Ermittlung einmalig als gemeinsamer Abschluss, EOS-Zweig mit Rollenklärung und Platzhalter für die Auswahlregel,
GH040 ohne Variablen, Telefonnotiz mit Beispiel und TBD-Markern (Vorlage oder Freitext, Weiterleitung oder
Neueröffnung), `<BE> = „ja“` und Status Referred im BE-Handling, Postkorb-Nr. TBD.
Ergebnis: `PDD_Vorpruefung_BUE_Gesundheit_KV_1609_QS2.docx`; Protokoll `QS_Review_1609_Runde2_Kommentarprotokoll.md`,
offene Punkte `QS_Review_1609_Runde2_Offene_Punkte.md`.

## Budgetabstimmung 2027 Celonis – Folien im ERGO-Folienmaster (17.09.2026)

Die Budgetfolien zur Celonis-Ausbaustufe 2 sind in die Vorlage `20260916_Abstimmung_Budget_2027_Celonis.pptx` (ERGO-
Folienmaster, Layouts „Only Title“ und „Grey_2/3“) eingebaut: `20260917_Abstimmung_Budget_2027_Celonis.pptx`, erzeugt
über `quellen/budgetplanung_ppt_master_build.py` (python-pptx, Aufruf aus `quellen/`, Vorlage liegt daneben). Sechs
Folien: Titel, Kernbotschaft (Kacheln, Empfehlung, Entscheidungsbedarf), Budgetentwicklung als Wasserfall mit
Aufschlüsselung im grauen Tafelbereich (Spalten „davon MBS 2026“ und „davon 2027“: die 75.000 EUR gehen zeilenweise auf, 66.180 EUR plus 8.820 EUR Anzahlung Stufe 2; Finanzierungsblock: Restanteil 38.592 abzüglich HS-Beitrag 25.000 = 13.592 EUR ungedeckt, zuzüglich Bot-Wartung 10.000 EUR = 23.592 EUR Bedarf 2027; die Wartung steht nur im Finanzierungsblock, damit die Positionszeilen mit 75.000 + 38.592 = 113.592 aufgehen), Leistungspakete und Kostentreiber der Ausbaustufe 2, Optionen A/B mit
Bedarf 2027 (38.592 rot, 25.000 HS, 23.592 schraffiert) und nächsten Schritten, Backup zum neuen Agentenkonzept.
Zahlen: IT-Aufwände 2026 113.592 EUR gegenüber 66.900 EUR am 10.06. (Ausbaustufe 1 −9.344, Eingangsmanagement +8.624,
Ausbaustufe 2 +47.412 laut Angebot Infomotion, 32 PT, zehn Wochen); MBS-Budget 75.000 EUR, Deckungslücke 38.592 EUR.
Empfehlung: Umsetzung 2026, 8.820 EUR aus MBS 2026, 38.592 EUR als Kosten 2027; dort HS-Beitrag 25.000 EUR und
Bot-Wartung 10.000 EUR, verbleibender Bedarf 2027 23.592 EUR (AI-Lizenz 2027 TBD). EMWS-Anbindung vorgezogen, damit der
Prüf-Bot ab Anfang Oktober aufgebaut werden kann. Fußzeile des Masters auf „Abstimmung Budget 2027 Celonis - 17.09.2026“
umgestellt. Die frühere Standalone-Fassung `Budgetplanung_2026_2027_Celonis_Ausbaustufe_2.pptx` bleibt als Vorstufe.
Begleitmail zum Termin am 17.09.2026, 15:30 Uhr (Richarz, Steiner, Boulanger, Burnik, Reinhard):
`Mail_Entwurf_Termin_Budget_2027_Celonis_170926.eml/.txt` mit angehängtem Deck, als vorbereitende Unterlage und
Vorschlag formuliert; erzeugt über `quellen/mail_termin_budget_2027_build.py`.

## Datenpool V1.7 (17.09.2026) – ein Schlüssel je Sparte: GeVo 108 und Dokumenttyp 02015

Für den Datenpool werden nur noch **GeVo 108** (Bestandsübertragung, Komposit/Leben) und **Dokumenttyp 02015**
(Maklervollmacht, KV) beantragt. GeVo 469 und Dokumenttyp 06065 entfallen im Antrag; sie bleiben Schlüssel des
BÜ-Reportings. Damit sind die offenen Punkte 2 (gleiche Geschäftsvorfälle für Reporting und Datenpool) und 3
(weitere GeVo, H. Klindworth) erledigt. Umfang zunächst: 35 Felder × 3 Kombinationen (KV/02015, LF/108, Komposit/108) =
105 Zeilen, der Komposit-Block mit Platzhalter für den Verwaltungssystemschlüssel (offener Punkt 1).

**Stand 21.09.2026 – Komposit-Schlüssel ergänzt, voller Schlüsselsatz wieder hergestellt.** B. Roth (Input
Management 2) meldet, dass die Felder für KV und LF im Test (DV/FA) bereitstehen und in der Anforderung nur noch die
Verwaltungssystemschlüssel für Komposit fehlen. M. Koch (ODPBD) präzisiert am 22.09. mit der Anlage
`Spartenpräfix.xlsx`: Es sind **alle Werte der Spalte „Obersparte“** möglich, ausdrücklich auch `HA`, `AS`, `TR`, `IT`
und `DA`. Der Antrag führt deshalb alle Obersparten der Komposit-Welt — `AS`, `DA`, `HA`, `IT`, `KR`, `SV`, `TR`,
`UV` —, jeweils mit GeVo 108 und 469; der Platzhalterblock entfällt, offener Punkt 1 ist erledigt. Zugleich ist die am 17.09. erwogene Reduzierung auf je einen
Schlüssel je Sparte zurückgenommen: Es gelten wieder alle Schlüssel aus V1.6 — GeVo 108 und 469 für Komposit/Leben,
Dokumenttyp 02015 und 06065 für KV. Neuer Umfang: 35 Felder × 20 Kombinationen = 700 Zeilen — KV mit Dokumenttyp
02015 und 06065, dazu LF, AS, DA, HA, IT, KR, SV, TR und UV mit GeVo 108 und 469. Nachgezogen über
`quellen/datenpool_v17_schluessel.py`, das das Blatt „Daten“ vollständig neu schreibt und auf der gebauten Datei
arbeitet, weil das ITERGO-Template nicht im Repository liegt; `quellen/datenpool_antrag.py` ist inhaltsgleich
mitgeführt.
Zugleich nachgezogen: `BUE_UMFANG` beschreibt jetzt den PDD-Stand vom 16.09.2026 („Gesamt“ durchläuft alle
Prüfschritte und wird als Business Exception ausgesteuert, Notiz nur „angegebene VNR beachten“).
Datei: `Datenpoolfelder_Pruef-Bot_BUE_v1.7.xlsx` (identisch mit `Datenpoolfelder_Pruef-Bot_BUE.xlsx`); Build über
`quellen/datenpool_antrag.py` mit `quellen/datenpool_feldliste.py` (erwartet `dp_template.xlsx` und
`kideckblatt.xlsx` im Arbeitsordner, Modulname `feldliste`).

## Vorschlag 17.09.2026 (T. Juraschek) – Partnerprüfung über IS011 statt Feldvergleich in IS100

Mailentwurf `Mail_Entwurf_Partnerpruefung_IS011_170926.eml/.txt` (Build `quellen/mail_partnerpruefung_is011_build.py`)
an Juraschek, Jeglorz, Wesche, Koch, Rypa, Amend: Statt Nachname/Vorname (Scout-Service), Geburtsdatum, Straße
(zweistufig mit Normalisierung) und PLZ zeichengenau gegen IS100 zu vergleichen, sucht der Bot den Kunden in IS011
mit Name, Geburtsdatum und den ersten drei bis vier Zeichen der Straße und vergleicht die Kundennummer des Treffers
mit der des Versicherungsnehmers am Vertrag. Betroffen wären Schritt I (Namens-, Geburtsdatums-, Adressprüfung →
ein Schritt IS011), die Prüfnotizen, die Variablen `IS100-*`, System- und Designtabelle, Diagramm und Walkthrough;
Datenpool und Deckblatt bleiben unverändert. Noch nicht im PDD umgesetzt; Klärung am Montag (Suchlogik, Quelle der
Kundennummer, juristische Personen, Mehrfachtreffer, Geltung für Komposit/Leben).

## End-to-End-Prozess und Lösungsarchitektur (18.09.2026) – Folienvorschlag im ERGO-Master

`20260918_E2E_Prozess_Architektur_Makler_BUE_KI.pptx` (Build `quellen/e2e_prozess_ppt_build.py`, Vorlage wie beim
Budgetdeck). Sechs Folien: Titel; Zielprozess als Swimlane über fünf Phasen (Eingang, KI-Strukturierung, Einsteuerung,
Prüfung, Folgebearbeitung) und sechs Lanes: Makler-Eingang (maklerauftraege@/bestandsuebertragungen@ergo.de, Umleitung
an bustrukturierung@ergo.de); Celonis (Action Flow, VNR-Abruf über die VDB, KI-Deckblatt je VNR, GeVo-Weiche);
Eingangsmanagement KWAD (AIDA-OCR, Indizierung in die Sparte); Postkorb (Eröffnung über die EMWS-Schnittstelle, ein
Vorgang je VNR = immer Einzel-BÜ, triggert je Sparte den Prüf-Bot); Robotics (Prüf-Bot KV / Komposit-Leben);
Folgebearbeitung (BE oder Fehler: KV → HSB4K MV, K/L nach abgebendem Bestandsinhaber Makler → ODPB, AO → HSB4K MV;
sauber geprüft → 72-Stunden-BOT bzw. BÜ-Bot). Weiche als Entscheidungstabelle (BÜ Makler, MFA, Kündigung
Maklervollmacht → Postkorb; übrige Anliegen → KWAD; Reminder/Spam zu klären); Prüfung und Nachbearbeitung je Sparte;
Lösungsarchitektur (EMWS nur als Schnittstelle, Datenpool als Teil des Postkorbvorgangs); Annahmen und zu bestätigende
Punkte. Gestaltung nach den üblichen Regeln für Prozessfolien: wenige Lanes, ein Fluss von links nach rechts ohne
Kreuzungen, Weichen als Rauten mit beschrifteten Ausgängen, Entscheidungslogik als Tabelle statt Gateway-Kaskade,
Systemnamen nur in der Architekturfolie.

## Prozessübersicht in acht Schritten (21.09.2026) – HTML

`Prozess_Pruef-Bot_BUE_8_Schritte.html`: eigenständige HTML-Seite ohne externe Abhängigkeiten, die den Prüfprozess als
acht Oberschritte mit je vier bis acht Unterschritten erklärt. Oberschritte: 1 Vorgang eröffnen (Celonis, VDB-Abruf
aller zu übertragenden VNR, Postkorbvorgang je VNR über die EMWS-Schnittstelle, Trigger für den Prüf-Bot der Sparte),
2 Business Exceptions aus dem Deckblatt (beginnend mit dem
Einstieg des Bots: Vorgang aus dem Themenpostkorb nehmen, Ordnungsbegriff und führende Versicherungsnummer setzen,
Datenpool lesen, BE-Variablen zurücksetzen), 3 Kunde (**neu:** Partnersuche in IS011 mit Vorname, Nachname, Geburtsdatum, PLZ
und den ersten zwei Buchstaben der Straße; alle Treffer mit dem Status „VN“ werden übernommen, je Kundennummer werden
über eine Schnittstelle die zugehörigen Versicherungsnummern abgerufen, und der Kunde gilt als bestätigt, sobald eine
davon die Vorgangs-VNR führt — Mehrfachtreffer sind damit unkritisch), 4 abgebender Bestandsinhaber, 5 übernehmender
Makler (**seit 21.09. auf IS011 umgestellt:** Suche über Name und Postleitzahl, Bestätigung über die eingereichte Agentur-
oder Personalnummer, danach Vermittlertyp, Zusammenarbeit, Anbindung in GH040 und die Agenturnummer für die Notiz), 6 Vertrag, 7 Anforderung Unterlagen, 8 Abschluss.

Schritt 7 „Anforderung Unterlagen“ ist am 21.09. als eigenes Kapitel dazugekommen. Er trennt ausdrücklich zwei Dinge,
die beide das Wort Unterlagen tragen: „Prüfung Unterlagen“ (`BUE_PRUEFUNG_UNTERLAGEN`) bewertet die eingereichten
Unterlagen und führt in Schritt 2 gegebenenfalls zur Prüfnotiz; „Anforderung Unterlagen“ (`BUE_ANF_UNTERLAGEN`)
steuert dagegen, ob beim übernehmenden Makler etwas nachgefordert werden soll. Steht es auf „ja“, entsteht weder BE
noch Prüfnotiz — der Bot liest zusätzlich „Art der Unterlagen“ (`BUE_ART_UNTERLAGEN`, nur dann Pflichtfeld) und setzt
die Kennzeichen in der Notiz; der Vorgang läuft dunkel weiter. Schritt 8 „Abschluss“ beschreibt das Ende vollständig: Test auf die
Fehlerliste, Bearbeitungshinweis (BE-Klassifikation, vollständige Fehlerliste, alle genannten VNR), dann zwei
Sparten-Weichen. Mit Befund: Krankenversicherung immer Themenpostkorb HSB4K MV; Komposit und Leben nach abgebendem
Bestandsinhaber — Makler in die Nachbearbeitung ODPB, alle übrigen Fälle einschließlich nicht ermittelbarem
Bestandsinhaber in den Themenpostkorb HSB4K KO. Das Routing ist für harte Business Exceptions und für „Nachprüfung
erforderlich“ identisch, es unterscheidet sich nur im Inhalt des Bearbeitungshinweises. Ohne Befund: Notiz Zeile für
Zeile (Maklername, Agenturnummer, KNR, laufende Nummer, betroffene VNR), Zeile „Bearbeitung nach“ aus der
Vollmachtslage, Kennzeichen aus Schritt 7 — danach Krankenversicherung immer über den 72-Stunden-BOT, Komposit
und Leben über den 72-Stunden-BOT nur bei abgebender Ausschließlichkeit, bei abgebendem Makler direkt an den BÜ-Bot
BOT1515. Die Sparten-Weichen sind als echte Gabelung dargestellt (zwei Spalten, der Spartenfilter dimmt den jeweils
anderen Zweig); abgefragt wird die Sparte nicht, sie steht über den startenden Prüf-Bot fest.

Dazu der Abschnitt „Die Notiz Feld für Feld“ nach der Vollmachtsvertiefung: eine Tabelle aller Felder der Maske
„Telefonnotiz erstellen“ mit der Vorlage „1515 – Bestandsübertragung Robotics PB“ (Komposit und Leben) samt
Ausprägungen und Herkunft — Eingangsdatum, Maklername, Agenturnummer, Personalnummer, E-Mail des aufnehmenden Maklers,
„Bearbeitung nach“ (genau zwei Auswahlen: Mit BÜ-Wunsch, Untervollmacht fehlt), die beiden Rahmenvertrags-Kennzeichen,
„Betroffene VNR“ (drei Auswahlen), das VNR-Freitextfeld, die drei festen Kennzeichen unter „Folgearbeit für Komposit“,
„Dokumente für weitere VNR hochladen / eröffnen“, das Freitextfeld „Komposit / Leben / KV“ und die laufende Nummer aus
der Vorgangsdatenbank. Aus dem Abgleich mit der PDD kommen fünf neue offene Punkte: Die PDD-Kaskade erzeugt bei
„Bearbeitung nach“ zusätzlich den Wert „BÜ mit UV“, für den die Maske keine Auswahl hat; für „angegebene VNR nicht
beachten“ nennt die PDD keinen Fall; die Rahmenvertrags-Kennzeichen haben keine Regel, obwohl die PDD Rahmenverträge
ausdrücklich wie alle anderen Verträge behandelt; das Datenpoolfeld `BUE_ART_UNTERLAGEN` ist heute Freitext, während
die Notiz drei feste Kennzeichen kennt — der Vorschlag aus V1.2, die Werteliste genau darauf festzulegen, ist als
OFFEN 6 im Datenpool-Antrag mit ODPBD und MSU in Abstimmung; und die Maske zur KV-Vorlage BOT2011 liegt noch nicht vor, weshalb auch offen bleibt, ob es
das in der PDD genannte Feld „KNR Makler“ dort wirklich gibt — in der Vorlage 1515 fehlt es. Schritt 2 bündelt seit dem 21.09. alle harten Ausschlusskriterien, die sich allein aus dem
KI-Deckblatt ablesen lassen — Klassifikation, BÜ-Wunsch, Erinnerung sowie die Gabelung Makler/Mehrfachagent. Im
Makler-Zweig stehen dort die Unterschrift des Versicherungsnehmers auf der Maklervollmacht, die Vollmacht auf den
übernehmenden Makler, die Vollständigkeit der Unterlagen sowie Pool und Untervollmacht; im MFA-Zweig der auf den
Mehrfachagenten lautende Betreuungswunsch. Dahinter steht das Ordnungsprinzip: eine harte Business Exception soll vor dem ersten Hostzugriff
und nur aus dem Deckblatt entstehen; alles, was die Schritte 3 bis 6 in den Systemen finden, ist ein Prüfbefund, wird
in der `<Fehlerliste>` gesammelt und erst in Schritt 7 bewertet. Die HTML hält offen fest, dass die heutige PDD diese
Linie noch nicht durchhält („VNR nicht korrekt“, „Vertrag nicht aktuell“, „Agenturnummer nicht vorhanden“, „Keine
Zusammenarbeit“ brechen heute hart ab). Dazu ein eigener Abschnitt „Makler, Pool und Untervollmacht“ mit Feldtabelle (`BUE_POOL`,
`BUE_UV_ERTEILT`, `BUE_MV_STATUS`) und Konstellationsmatrix mit den Spalten „Auf wen wird übertragen“, Wirkung auf die Prüfung und Zeile „Bearbeitung
nach“ in der Notiz; dort sind auch die drei Rollen Vollmachtgeber, Vollmachtnehmer und Übertragungsziel getrennt, eine
Gegenüberstellung aller Abbruchgründe, Prüfnotizen und der fünf mit IS011 entfallenden Notizen, eine Zuordnung jedes
Schritts zum jeweiligen PDD-Kapitel samt Änderungsbedarf sowie die offenen Punkte. Jeder Ober- und Unterschritt nennt
seine Fundstelle in der PDD. Rechts neben dem Fließtext steht bei jedem Unterschritt ein fester Kasten. Ganz oben eine Marke, wie der Schritt zur
heutigen PDD steht: „So in der PDD“ (unverändert übernommen, 23 Schritte), „In der PDD, an anderer Stelle“ (vorhanden,
aber in einem anderen Kapitel oder nur als Feldbeschreibung — beim Überarbeiten zu verschieben, 15 Schritte), „Neu“
(bisher nicht beschrieben, 16 Schritte), „In der PDD, Streichvorschlag“ (2) und „Nicht Teil der PDD“ (2, gehört zu
Celonis). Unter der Marke steht die Stelle: das Kapitel, in dem der Schritt heute beschrieben ist — etwa „Vorprüfung –
Ausschlusskriterien, vierte WENN-Abfrage“ oder „nur als Feldbeschreibung zu `BUE_MV_AUF_MAKLER` in der Tabelle der
genutzten Variablen“ —, bei neuen Schritten stattdessen, was sie ersetzen oder wo sie zu ergänzen sind. Darunter
„Datenpoolfeld“: Bezeichnung im Datenpool und Variablenname, oder „keines“ mit der tatsächlichen Quelle — etwa VA230,
OB726, GH040, EOS, IS011 oder die Fehlerliste des Bots. Darunter die Prüfung als kleine Prozessskizze: die Bedingung
als Formel (`<BUE_KLASSIFIKATION> ≠ „BÜ-Vorgang“`) und darunter beide Ausgänge — „ja“ mit dem Ergebnis und „nein“ mit
dem Weiterlauf, jeder mit einfarbigem Lucide-Icon: Haken grün für „weiter“, Kreuz rot für die Business Exception,
Ausrufezeichen gelb für die Prüfnotiz, Pfeil türkis für einen Zweig. Schritte ohne Abfrage zeigen statt der Skizze
„Keine Prüfung“ und wofür der Wert gebraucht wird. Unter 1100 px rutscht der Kasten unter den Text. Filter für Sparte (beide, KV, Komposit/Leben) und „nur Abbruchgründe“; druckbar.
Als Idee aufgenommen: auch den abgebenden Bestandsinhaber und die Poolzugehörigkeit über IS011 statt über VA230 und
GH040 zu ermitteln. Der Vermittlertyp ist in den Schritten 2 und 3 als echte Gabelung dargestellt (Spalten Makler und
Mehrfachagent mit je eigenen Kriterien); ein Filter blendet den jeweils anderen Zweig aus. Jeder Zwischenschritt nennt
zusätzlich eine Begründung („Warum gibt es diesen Schritt“) und die genaue Fundstelle in der PDD mit dem dortigen
Schrittnamen, etwa „PDD-Schritt ‚Vermittler-Nr. (PNR) des übernehmenden Maklers (Anwendung OB726)‘, Zeile GH040
‚Status der Beschäftigung‘“. Ein eigener Abschnitt „Was könnte IS011 in den Schritten 4 und 5 übernehmen“ schlüsselt die neun Einzelinformationen
auf, die der Bot heute aus OB726, GH040, EOS und VA230 liest, und bewertet je Zeile, ob das Partnersystem sie führt.
Ergebnis: Existenz, Name, Zusammenarbeit und E-Mail-Adresse sprechen für IS011, der Anbindungsstatus bleibt bei GH040,
Agenturbeziehung, Stammagentur und Poolzugehörigkeit sind zu prüfen. Kämen die ersten vier aus IS011, entfiele OB726
in Schritt 5 vollständig. Am 21.09. ist der Abschnitt um den Vorschlag erweitert worden, die Suche umzudrehen: nicht mit
der Nummer in OB726 einsteigen, sondern den Vermittler in IS011 über Name und Postleitzahl suchen
(`BUE_VERMITTLER_NAME`, `BUE_MAKLER_PLZ`) und die eingereichte Agentur- oder Personalnummer als Bestätigung des Treffers
verwenden — findet sich unter den Treffern einer, der diese Nummer führt, zeigen Name und Nummer aus dem Auftrag auf
denselben Partner. Vorteile: Der zeichengenaue Namensvergleich entfällt (Firmennamen mit „GmbH & Co. KG“ oder „u.“ statt
„und“ erzeugen heute Prüfnotizen ohne fachlichen Gehalt), die Identität ist von zwei Seiten belegt statt nur von einer,
und die Doppelstruktur mit zwei Einstiegen wird zu einem Weg. Nicht ersetzt wird die Zulassungsprüfung in GH040 und die
Stammagentur aus EOS. Tragende Annahme, die zu bestätigen ist: dass IS011 Vermittler als Partner führt und Agentur- und
Personalnummer dort als Ordnungsbegriffe stehen. In Schritt 6 entfällt die Abfrage der Sparte: Der Postkorbvorgang
startet je Sparte den passenden Prüf-Bot, damit steht sie implizit fest, und mit ihr die Notizvariante. Der PDD-Schritt
„VNR-Prüfung (Anwendung VA230)“ liest `<VA230-Sparte>` heute noch nachrichtlich aus; der Schritt bleibt in der
Übersicht sichtbar, ist aber als Streichvorschlag markiert. Neu hinzugekommen ist ein Abschnitt „Wann gilt der Kunde
als bestätigt“ mit einer Bewertungsmatrix (bestätigt, Prüfnotiz oder Abbruch). Am 21.09. auf drei Spalten gestrafft:
Nachname, Geburtsdatum und Adresse. Der Vorname ist entfallen, weil er in keiner Zeile etwas entschied; Postleitzahl
und Straße werden als ein Merkmal „Adresse“ gelesen. Der Platzhalter „egal“ heißt jetzt „—“ und ist in der Legende
gegen „abw.“ und „fehlt“ abgegrenzt. Die neun Zeilen decken alle zwölf Kombinationen ab — dabei ist eine Lücke
geschlossen worden: „Nachname passt, Geburtsdatum weicht ab, Adresse weicht ab“ war vorher nicht geregelt und führt
jetzt zur Prüfnotiz „Stammdaten unplausibel“ sowie einer zweiten Tabelle für den Abgleich des Vollmachtgebers aus der Maklervollmacht gegen den in
IS011 gefundenen Partner. Beides ist als Diskussionsvorschlag gekennzeichnet. Als offene Punkte aufgenommen sind
außerdem, ob harte Business Exceptions ausschließlich aus dem Deckblatt entstehen sollen. Als Änderungsbedarf an der
PDD festgehalten: Die Abfrage `<BUE_MV_UNTERSCHRIFT_KUNDE>` steht dort außerhalb der Weiche und wirkt dadurch auch für
den Mehrfachagenten. Das ist fachlich falsch — die Unterschrift steht auf der Maklervollmacht, und der Mehrfachagent
hat keine; für ihn zählt allein der Betreuungswunsch. Die Abfrage gehört in den Makler-Zweig. Jeder Ober- und Unterschritt trägt einen Abstimmungsstand: „Bestätigt“ setzt einen grünen Haken an Überschrift und
Schrittleiste, „Zu prüfen“ öffnet zwei Felder (was ist zu prüfen, von wem) und setzt ein gelbes Ausrufezeichen; der
Vermerk steht danach als farbige Zeile unter dem Schritt, mit Datum. Die Filterzeile zählt mit („3 bestätigt, 2 zu
prüfen“), ein Filter „Nur ungeklärte“ blendet Bestätigtes aus, und „Alle Marken löschen“ setzt zurück. Die Marken
liegen automatisch im Browser des jeweiligen Rechners; „Stand speichern“ schreibt sie als JSON-Datei
(`Abstimmungsstand_Pruefprozess_JJJJMMTT.json`), „Stand laden“ liest sie dort oder auf einem anderen Rechner wieder
ein. Beim Drucken erscheinen die Knöpfe nicht, die gesetzten Vermerke schon.
Filterzeile und Schrittleiste bleiben beim Scrollen stehen; die Schrittleiste markiert den gerade
gelesenen Schritt. Vor den Detailabschnitten steht ein fachlicher Überblick: je Oberschritt eine Leitfrage
(„Gehört der Vertrag zu dem Kunden, der unterschrieben hat?“) und zwei bis vier Sätze, was dort passiert — bewusst
ohne Systemnamen, dazu die Zahl der in diesem Schritt definierten Business Exceptions. Ein Klick springt in den Schritt. Jeder Schritt lässt sich ein- und ausklappen, Schritt 1 ist beim Öffnen zugeklappt. Die Begriffe
sind an die PDD angeglichen: Das Datenpoolfeld heißt „Personalnummer“, OB726 zeigt dieselbe Nummer als
„Vermittler-Nr. (PNR)“, das Notizfeld heißt wieder „Personalnummer“; die Vereinheitlichung steht als
Änderungsbedarf in der PDD-Zuordnung.

## Bewertungsmatrix Kundenprüfung über IS011 (21.09.2026) – Folien und Mail

`20260921_Kundenpruefung_IS011_Bewertungsmatrix.pptx` (Build `quellen/is011_matrix_ppt_build.py`, ERGO-Vorlage wie beim
Budgetdeck): fünf Folien mit Kernbotschaft (heute fünf Einzelvergleiche, künftig eine Suche und eine Matrix), dem
Ablauf in fünf Teilschritten samt Gegenüberstellung zur heutigen PDD, der Bewertungsmatrix mit neun Kombinationen aus
Nachname, Vorname, Geburtsdatum, PLZ und Straße sowie der Tabelle zum Abgleich des Vollmachtgebers, den zu
bestätigenden Fragen und den technisch offenen Punkten. Dazu der Mailentwurf
`Mail_Entwurf_Bewertungsmatrix_IS011_210926.eml/.txt` (Build `quellen/mail_matrix_is011_build.py`) an Juraschek,
Jeglorz, Wesche, Koch und Rypa mit Amend in Kopie: ausdrücklich als eigener Vorschlag formuliert, mit der Bitte um
Bestätigung oder Korrektur, und mit dem Deck als Anhang.

## Mail zum Walkthrough (21.09.2026)

`Mail_Entwurf_Walkthrough_Pruefprozess_210926.eml/.txt` (Build `quellen/mail_walkthrough_build.py`) an Juraschek,
Jeglorz, Wesche, Koch und Rypa, Amend und die eigene ERGO-Adresse in Kopie. Kündigt den Termin am 22.09. um 09:30 Uhr
an, mit `Prozess_Pruef-Bot_BUE_8_Schritte.html` als Anhang. Begründet den Walkthrough mit dem Format der PDD, nicht mit
der Runde — die Prüfungen stehen dort über mehrere Kapitel verteilt. Nennt den Inhalt in sechs Punkten, erklärt das
Vorgehen im Termin (Schritt für Schritt, „Bestätigt“ oder „Zu prüfen“ mit Name, Stand anschließend als Datei teilen),
stellt das Vorablesen ausdrücklich frei und bittet nur zu zwei Punkten um einen Gedanken vorab: harte Business
Exceptions ausschließlich aus dem Deckblatt, und die Vermittlerprüfung über IS011 mit der eingereichten Nummer als
Bestätigung.

## PDD nach dem Walkthrough (22.09.2026)

`PDD_Vorpruefung_BUE_Gesundheit_KV_2209_Walkthrough.docx` (Build `quellen/pdd_umbau_2209.py` mit
`quellen/pdd_formatierung.py`, Eingabe ist die im Termin gezeigte Fassung). Die Schritt-für-Schritt-Beschreibung ist
auf die acht Schritte des Walkthroughs umgestellt und trägt sprechende Kapitelnamen: Start – Vorgang aus dem
Themenpostkorb übernehmen; Vorprüfung – Business Exceptions aus dem KI-Deckblatt; I. Kunde (VN) – Partnerprüfung über
IS011; II. Abgebender Bestandsinhaber; III. Übernehmender Makler; IV. Vertrag; V. Anforderung von Unterlagen;
VI. Test auf Fehlerliste; VII. Abschluss ohne Befund; VIII. Abschluss mit Befund.

Inhaltlich eingearbeitet: die Reminder-Prüfung ist gestrichen; die Unterschriftsprüfung steht im Makler-Zweig; die
Kundenprüfung läuft über IS011 mit der Versicherungsnummer als Identitätsnachweis, als einzige Stammdatenprüfung
bleibt das Geburtsdatum (die IS100-Einzelvergleiche zu Name, Vorname, Straße und PLZ sind samt ihren Abschnitten
entfernt); der Abgleich des Vollmachtgebers entfällt; die Existenzprüfung des Vertrags und das Auslesen der Sparte
entfallen; der abgebende Bestandsinhaber steht vor dem übernehmenden Makler; die Notiz wird Feld für Feld bestückt;
das BE-Handling routet je Sparte und bei Komposit/Leben nach abgebendem Bestandsinhaber (Makler nach ODPB, sonst
HSB4K KO).

Richtiggestellt: EMWS ist die Schnittstelle, über die Celonis den Postkorbvorgang eröffnet, kein Postkorb. Die
Bezeichnung „EWMS-Postkorb“ ist im ganzen Dokument durch „Themenpostkorb“ ersetzt, die Überschrift der Startzeile
lautet „Werte aus dem Postkorbvorgang“.

Formal: WENN-Blöcke sind wie Code eingerückt, verschachtelte Blöcke tiefer. Systemnamen stehen fett, Felder aus dem
Datenpool dunkelblau, im Lauf erzeugte Variablen dunkelgrün. Hinweis- und Formatzeilen stehen kursiv und bekommen
Abstand nach oben, ebenso jeder neue WENN-Block auf oberster Ebene und jeder Absatz nach einem Block — das trennt die
Abschnitte sichtbar. Die 34 Datenpoolfelder im Startkapitel stehen als alphabetisch sortierte Aufzählung statt als
Fließtext. Der Formatierer lässt Absätze mit Screenshots
unangetastet; die Bildschirmabzüge bleiben bei ihrem Schritt — die fünf IS011-Masken sind auf die Teilschritte
verteilt, die Masken der entfallenen IS100-Prüfungen sind mit diesen entfernt.


Nachgezogen nach der Sichtung der Kapitel als Bild (`quellen/pdd_vorschau.py` rendert die Schritt-Kapitel als HTML,
weil sich LibreOffice in dieser Umgebung nicht starten lässt): Die `<BE-Klassifikation>` steht dunkelrot, in der PDD
wie im Walkthrough-HTML. Schleifen sind wie WENN-Blöcke eingerückt, auch über Zeilengrenzen hinweg — die Schleife
über die Kundennummern öffnet in einer Zeile und schließt erst mehrere Screenshot-Zeilen später. Ein Eingabeblock
steht eingerückt unter seiner Ankündigung (Matchcodesuche, Initialisierung der BE-Variablen, Wertelisten am Ende),
und eine neue Ankündigung beendet die vorige Liste mit Abstand. Querverweise („Weiter zu …“) stehen fett und
unterstrichen; die im Dokument als Sprungmarke hinterlegten Verweise bleiben als Hyperlink erhalten und tragen den
neuen Kapitelnamen, statt doppelt geschrieben zu werden.

Fachlicher Stand statt Änderungsprotokoll: Alle Hinweise mit Datumsbezug („am 22.09.2026 gestrichen“, „seit dem
22.09.2026“, „nicht mehr“, „bisher“) sind entfernt oder auf die geltende Regel reduziert. Die Kurzbeschreibung im
Vorspann folgt den zehn Kapiteln der Schritt-für-Schritt-Beschreibung; der Notationsabsatz unter „Schritt für
Schritt-Beschreibung“ erklärt die Farblogik als Lesehilfe (Systeme fett, Datenpoolfelder dunkelblau, erzeugte
Variablen dunkelgrün, `<BE-Klassifikation>` dunkelrot, Steuerwörter türkis in der Formatvorlage „WENN DANN“,
Querverweise fett unterstrichen, Hinweise kursiv). Die Steuerwörter WENN / DANN / SONST / Ende WENN behalten die
Formatvorlage „WENN DANN“ der Vorlage (türkis, fett); der Formatierer setzt nur die Einrückung.

Die Notiz beauftragt immer eine Einzel-BÜ für die `<Vorgang-VNR>` („Betroffene VNR“ = „angegebene VNR beachten“),
nie eine Gesamt-BÜ; `<BUE_UMFANG>` = „Gesamt“ geht nur nachrichtlich in den Bearbeitungshinweis ein. Die Weiche
„Agentur-Nr. vorhanden / PNR vorhanden“ führt bei Einstieg nur über die PNR nicht mehr auf eine harte BE, sondern
in den PNR-Einstieg (OB726, EOS), wie es die Schrittbeschreibung vorgibt.

Behoben: Eine doppelte Löschschleife im Build hatte neben den drei IS100-Tabellen auch die drei Tabellen des
übernehmenden Maklers entfernt (Weiche, Agenturnummer-Einstieg in OB726 mit Namensabgleich, Klassifizierung mit
Prüfnotiz „Vermittlertyp abweichend“); sie sind wieder enthalten. Die verwaisten Unterüberschriften der
entfallenen Prüfungen (VNR-Prüfung, Namensprüfung, Geburtsdatum, Adressprüfung in IS100) sind entfernt, die
Partnerprüfung heißt „Partnersuche und Abgleich über die Versicherungsnummer (Anwendung IS011)“.

## Antwort an S. Schwarz zur GeVo-Steuerung (22.09.2026)

`Mail_Entwurf_Antwort_Schwarz_GeVo_Steuerung_220926.eml/.txt` (Build `quellen/mail_gevo_steuerung_schwarz_build.py`)
an Stefan Schwarz (Celonis). Antwort auf seine vier Fälle zur GeVo-Steuerung im Zielprozess und seine Frage, ob die
Wechselwirkung aus EMWS-Eröffnung und Weiterleitung der Unterlagen bei 1 und 2 ein Problem erzeugt. Knapp gehalten:
je Fall eine Überschrift und die Antwort, die Klärungspunkte direkt an ihn gerichtet.

Kernaussage: Bei 1 (reine BÜ-Anfrage) und 2 (BÜ mit Anforderung von Unterlagen) eröffnet Celonis den
Postkorbvorgang — die Unterlagen gehen deshalb **nicht** zusätzlich an `kwad@ergo.de`. Sonst entsteht ein zweiter
Eingang zum selben Sachverhalt: bei Gesundheit eine zweite Postkorberöffnung, bei Komposit/Leben der
Folgeschriftwechsel. Das deckt sich mit der Fußzeile seiner eigenen Folie (reine BÜ-Anfragen inklusive
Unterlagenanforderung laufen nicht mehr über das Eingangsmanagement). Celonis eröffnet den Vorgang mitsamt
Unterlagen: die E-Mail mit allen Anhängen, dem neuen KI-Deckblatt und dem Datenpool.

Zu seiner Frage bei 3 (Verbunderöffnung Sparten-GeVo + BÜ-GeVo durch das Eingangsmanagement): Celonis soll den
Datenpool schreiben, weil der BÜ-GeVo nach der Abarbeitung in der Sparte weitergeleitet wird und der Prüf-Bot dann
auch für diese Fälle eingesetzt werden kann — er liest seine Vorgangsdaten ausschließlich aus dem Datenpool. Dazu zwei Klärungen — technisch, wie der Datensatz an einen nicht von Celonis eröffneten Vorgang kommt, und
fachlich, dass der BÜ-Teil `BUE_KLASSIFIKATION` = „BÜ-Vorgang“ tragen muss, weil der Bot sonst sofort mit der BE
„Kein BÜ-Vorgang“ aussteuert. Bei 4 kein Datenpool, der Bot sieht diese Fälle nie.

Zusätzlich angemerkt: Bei 2 eröffnet Celonis laut Folie einen eigenen GeVo „Anforderung von Unterlagen“, während der
Prüf-Bot die Anforderung über das Notizkennzeichen aus `BUE_ANF_UNTERLAGEN` / `BUE_ART_UNTERLAGEN` setzt — einer der
beiden Wege ist festzulegen, sonst wird dieselbe Unterlage zweimal angefordert.

## BUE_KLASSIFIKATION: alle Ausprägungen mit Steuerlogik (23.09.2026)

`Mail_Entwurf_Klassifikation_Steuerlogik_230926.eml/.txt` (Build `quellen/mail_klassifikation_steuerlogik_build.py`)
an Stefan Schwarz (Celonis) und das Fachteam (Koch, Wesche, Lorusso, Garcia-Fernandez, Gerhards; Amend, Jeglorz, Mai,
Lütke, Rypa in Kopie) zur Bestätigung. Antwort auf seine Frage, was das KI-Deckblatt bei VN-Wechsel, Kündigung und
Fristverkürzung ausgeben soll — als Aufstellung aller zwölf Ausprägungen mit Vergaberegel und der Steuerung, die
daraus folgt.

Die Steuerung hängt an zwei Feldern: `BUE_KLASSIFIKATION` sagt, was das Anliegen ist, `BUE_WUNSCH_VORHANDEN`, ob
eine BÜ folgt. Drei Wege: A — Celonis eröffnet über EMWS (BÜ-Vorgang, Kündigung Maklervollmacht); B — KWAD mit
Folge-BÜ (jedes Sparten-Anliegen mit Wunsch = ja: Verbunderöffnung Sparten-GeVo + BÜ-GeVo, Sparte zuerst, dann
Weiterleitung in den Themenpostkorb und Prüf-Bot; Celonis schreibt den Datenpool); C — KWAD ohne Folge-BÜ (Wunsch =
nein oder Kein-Makler-Vorgang: nur Sparten-GeVo, kein Datenpool). Je Weg steht, was Celonis tut, was das
Eingangsmanagement tut und was danach folgt, samt Hinweistext für die KWAD-Mail. Neu gegenüber der Feldliste V1.7:
die fünf Sparten-Ausprägungen vom 11.09. und die Kündigung Maklervollmacht als eigene Ausprägung (Weg A, aber
Freibestand und MV-Felder N/A). Folge für die PDD nach Bestätigung: Die Vorprüfung lässt alle B-Ausprägungen mit
Wunsch = ja passieren; „Kein BÜ-Vorgang“ bleibt für Kein-Makler-Vorgang und Vorgänge ohne Wunsch.

## PDD v10 nach dem Review v9 (23.09.2026) – KV und Komposit/Leben, zweisprachig

`PDD_Vorpruefung_BUE_Gesundheit_KV_v10.docx` und `PDD_Vorpruefung_BUE_Komposit_Leben_v10.docx`, dazu
`QS_Review_v9_Kommentarprotokoll.md` mit dem Stand aller 34 Kommentare aus der Reviewfassung v9 (Jeglorz, Juraschek,
Rypa). Die Kommentare sind aus dem Dokument entfernt; was umgesetzt ist und was beim Fachbereich oder bei Robotics
offen bleibt, steht im Protokoll.

Bau in zwei Stufen aus der Kundenfassung v9 (`quellen/pdd_kv_v10.py`, `quellen/zeichnung_v10.py`,
`quellen/pdd_zweisprachig.py`, Formatierer `quellen/pdd_formatierung.py`):

```bash
cd 05_Bestandsuebertragung/kontextdokumente/pdd/quellen
python3 pdd_kv_v10.py <v9.docx> /tmp/kv_de.docx KV       # deutscher Stand (KL für Komposit/Leben)
python3 pdd_zweisprachig.py /tmp/kv_de.docx ../PDD_Vorpruefung_BUE_Gesundheit_KV_v10.docx uebersetzung
python3 pdd_vorschau.py ../PDD_Vorpruefung_BUE_Gesundheit_KV_v10.docx vorschau.html --alles   # HTML-Sichtprüfung
```

LibreOffice startet in der Build-Umgebung nicht; die Sichtprüfung läuft über die HTML-Vorschau (ganzes Dokument mit
`--alles`) und Playwright-Screenshots. Die Übersetzungen liegen in `quellen/uebersetzung/` als JSON-Paare (`chunk_NN_de.json` /
`chunk_NN_en.json`, je Eintrag `de`, `en`, `art`; Regeln in `glossar.md`) vor und werden mit `validate_chunk.py` geprüft: Variablen `<…>`,
`BUE_`-Felder und alles in „…“ müssen identisch bleiben, Werte beginnen mit dem deutschen Original.

Zweisprachig nach dem Template („Rohformat“): Die englische Fassung ist kein zweites Dokument. Sie steht in der
dritten Spalte jeder Schritttabelle (Screenshot | Beschreibung | Übersetzung) mit derselben Struktur und Farblogik
(IF / THEN / ELSE / END IF in der Formatvorlage „WENN DANN“, Datenpoolfelder dunkelblau, Variablen dunkelgrün,
`<BE-Klassifikation>` dunkelrot, Querverweise als Links), in der Spalte „answer“ der Design-Tabellen, in den
Überschriften der Schrittkapitel und fachlichen Kontexte („Deutsch / English“), als zweiter Absatz in den
Hilfstabellen (Weiche, Sonderliste, Notiz, Bearbeitung nach) und als englische Absätze hinter Notation und
Lesehilfe. Variablen, Datenpoolfelder, Systeme, Masken und Werte in „…“ bleiben deutsch, weil der Roboter sie so
liest und schreibt.

Fachlich neu gegenüber der Walkthrough-Fassung vom 22.09.:

- Vorprüfung nur gegen das KI-Deckblatt und vor jedem Hostzugriff: Vermittlertyp leer → Prüfnotiz (Vorschlag,
  Kommentar 75); `<BUE_AGENTUR_NR>` leer → BE „Agenturnummer nicht vorhanden“ (Kommentar 72, T. Juraschek, aus der
  Weiche nach vorn gezogen); beim MFA BÜ-Wunsch und Betreuungswunsch auf MFA, beim Makler Unterschrift VN; Unterlagen
  unvollständig → Prüfnotiz. Keine Prüfung auf `BUE_KLASSIFIKATION` mehr, die BE „Kein BÜ-Vorgang“ entfällt.
- Kunde (VN) über IS011 (Kommentar 68, Logik des Fachbereichs übernommen): Kundennummer über die Versicherungsnummer
  (`<IS011-KNR-VN>`), Matchcodesuche VAF121 mit den Angaben aus dem Auftrag, Trefferliste oder Einzeltreffer,
  Scout-Service nur zur Bestimmung des BE-Grunds („Vertrag gehört nicht zum Kunden“ / „Kunde ist nicht
  Versicherungsnehmer“), leere Trefferliste → BE „Kunde in IS011 nicht gefunden“, Geburtsdatum als Prüfnotiz.
- Übernehmender Makler: Reihenfolge OB726 (PNR ohne Präfix „P,“, Klassifizierung) → GH040 → neuer Schritt
  „E-Mail-Adresse ermitteln“ (Kommentare 76, 78, 88): Sonderliste TOP-Makler (Blau direkt, Dema, Jung DMS Pool und
  Pro, Qualitypool, Apella mit fester Adresse; Fonds Finanz immer `<BUE_MAKLER_EMAIL>`), sonst die in OB726
  hinterlegte Adresse, bei @ergo-Adresse oder leer die Absenderadresse aus dem Datenpool, mit Prüfnotizen.
- Kapitel V „Test auf Fehlerliste“ (Kommentar 81), VI „Abschluss ohne Befund“ mit Notiz als Ausfülltabelle nach den
  Feldern der Notizmaske 1515 (Feld | Pflicht | Eintrag | Quelle) und eigener Tabelle „Bearbeitung nach“ (Kommentar
  89), immer Einzel-BÜ; Übergabe nach Variante A (Kommentare 92, 93).
- VII „Abschluss mit Befund“ für alle BE identisch (Kommentar 102). Der Bearbeitungshinweis hat drei Abschnitte: „BE:“ mit
  `<BE-Klassifikation>`, „Fehler:“ mit je einer Zeile pro Prüfnotiz aus `<Fehlerliste>` („Fehler: keine“, wenn leer) und
  „Hinweis:“ mit „Weitere VNR: `<BUE_VNR>`; `<BUE_VNR_2>`“ – der Abschnitt nimmt später weitere Hinweise auf, ohne den
  Aufbau zu ändern. Die Tabelle „Aufbau des Bearbeitungshinweises“ zeigt Zeilen, Regel und ein Beispiel. Auch bei einer
  harten BE stehen die bis dahin gemerkten Prüfnotizen im Abschnitt „Fehler:“.
- E-Mail-Adresse mit erklärter Rangfolge vor der Logik: 1. TOP-Makler laut Sonderliste (8 Vermittler, Stand 23.09.2026,
  Agentur-Nr., Name, Adresse; Fonds Finanz jetzt mit fester Adresse, die Ausnahme entfällt), 2. in OB729 hinterlegte Adresse
  (außer @ergo), 3. Absenderadresse der Eingangsmail. Verglichen wird nur die Agentur-Nr.
- Aus dem QS-Lauf (sechs Prüfer: Logik, Vorspann, Kommentare, Format per Screenshot, Komposit/Leben, Vollständigkeit):
  Matchcodesuche in zwei Stufen (mit Geburtsdatum, bei leerer Trefferliste einmal ohne, danach Gegenprobe als Prüfnotiz), IS011-Auswertung ohne Lücke
  (BE „Vertrag zur VNR nicht gefunden“, System Exception bei unerwarteter Maske), BE „Agenturnummer in OB726 unbekannt“,
  Prüfnotiz „Bestandsinhaber nicht ermittelbar“, Unterlagenprüfung mit Feldwert und ohne Prüfnotiz bei leer oder Reminder,
  OB726 nur einmal aufgerufen (E-Mail-Adresse im OB726-Block gelesen), SIPOC und Inhaltsverzeichnis neu aufgebaut, altes
  Diagramm aus dem Fallback entfernt, Vorspann ohne IS100 und ohne „Ablehnung“, Linkfarbe automatisch statt Dunkelrot.
- Variablentabelle alphabetisch mit neuer Spalte „Verwendung (Kapitel)“, die je Variable die Kapitel nennt, in denen
  sie gelesen oder gesetzt wird; Querverweise in den Schritten sind Links auf Textmarken der Zielkapitel, das
  Inhaltsverzeichnis aktualisiert sich beim Öffnen.
- Komposit/Leben: gleicher Aufbau, eigene Sparten- und Datenschutzantworten, GeVo 108/469, Notizmaske 1515 als
  Screenshot mit Schritt „Anforderung von Unterlagen kennzeichnen“ (Kommentar 90), im Kapitel IV Prüfung auf
  Mantelvertrag bei `BUE_SPARTE` = KR mit BE „KR Flottenvertrag“ (noch zu validieren, K. Rypa),
  Routing bei Befund nach der Klassifizierung des abgebenden Bestandsinhabers aus OB726 (Makler → ODPB, sonst „HSB4K KO“);
  die Telefonnotiz wird erst nach dem Schritt „Anforderung von Unterlagen“ gespeichert.

Bestätigt am 23.09.2026: Schreibweise EMWS, Prüfnotizen für fehlenden Vermittlertyp und nicht ermittelbaren Bestandsinhaber,
BUE_ANF_UNTERLAGEN als Anforderung des Maklers, Matchcodesuche in zwei Stufen.

Nachträge 23.09.2026: Process Owner Dirk Amend (HS) und Christoph-Reber Lucht (ODPP), SME Dirk Amend; Startpostkorb
„MV 23724 BÜ Prüf BOT“ (Nr. 23724) für alle Sparten, KV über Dokumenttyp 2015, Komposit/Leben über GeVo 108; die hinterlegte
E-Mail-Adresse kommt aus OB729 Vermittlerkommunikation (Aufruf mit der Agenturnummer, nur ohne Sonderlisten-Treffer); BE für
nicht aktuelle Verträge „Vertrag nicht aktuell: `<VA230-Status>`“.

Routing am Ende (23.09.2026): Start für beide Sparten im selben Themenpostkorb; ohne Befund an den 72-Stunden-BOT über „HSB4K 72“ (TBD);
mit Befund bei KV nach „HSB4K MV“, bei Komposit/Leben nach „HSB4K KO“, wenn der abgebende Bestandsinhaber der AO angehört, sonst an
ODPB (Postkorb offen). Die Notizen unterscheiden sich weiterhin: KV Vorlage BOT2011 ohne Folgearbeit, Komposit/Leben Vorlage 1515 mit
Anforderung von Unterlagen.

Offen (siehe Protokoll und `Mail_Entwurf_Offene_Punkte_PDD_v10_230926.eml`): Postkorb-Nummern, ODPB-Postkorb, AO-Erkennung in OB726,
Geschäftsbereiche, Abnahmeumgebung, Screenshots, Validierung der KR-Mantelprüfung. Makler auf Makler ist geklärt: immer an den
72-Stunden-BOT, der den Fall erkennt und ohne Wartefrist an den BÜ-BOT weiterleitet (Hinweis im Kapitel VI).

Vermittlertypen aus EMMA (24.09.2026, M. Koch / S. Schwarz): Werteliste Makler, MFA, Courtagefortzahler, Kontaktgeber; leer und
„Fremdversicherungsunternehmen“ laufen wie Makler. Courtagefortzahler und Kontaktgeber erhalten keine Bestände: neue BE „Keine
Bestandsübertragung möglich: `<BUE_VERMITTLER_TYP>`“ als erste Prüfung der Vorprüfung, der Typ wird für die spätere automatische
Ablehnungsnachricht mitgeführt. Antwort zu den Pflichtfeldern des KI-Deckblatts für diese Typen:
`Mail_Antwort_Koch_Vermittlertyp_240926.eml/.txt` (Build `quellen/mail_antwort_koch_vermittlertyp_build.py`).

Start liest nur, was gebraucht wird (23.09.2026): Der Schritt „Postkorbvorgang und Datenpool lesen“ zählt nur die Datenpoolfelder
auf, die eine Prüfung, ein Notizfeld oder der Bearbeitungshinweis benötigt (KV 19, Komposit/Leben 22 von 35; Listen `GELESEN` und
`NICHT_GELESEN` im Build-Skript). Die übrigen Felder stehen weder im Start-Schritt noch in der Variablentabelle: Sie sind keine
Variablen des Bots. Die Spalte „Verwendung“ nennt nur die Kapitel, in denen die Variable wirklich benutzt wird – „Start“ (die
Initialisierung) erscheint nur bei Variablen, die sonst nirgends vorkommen. Hinweise im Start-Schritt, die nicht gelesene Felder
als Variablen nannten (Sparte, Klassifikation, MV-Felder beim MFA), sind ohne diese Verweise formuliert.

Unterlagenanforderung nur über ein Feld (23.09.2026): `BUE_ANF_UNTERLAGEN` und die Hilfsvariable `Anforderung-Arten` sind gestrichen.
Die drei Kennzeichen „Folgearbeit für Komposit“ der Notizmaske 1515 steuert allein `BUE_ART_UNTERLAGEN`: leer heißt keine Anforderung,
sonst je enthaltener Art ein Kennzeichen. Komposit/Leben liest damit 21 Datenpoolfelder, KV unverändert 19.

Lesbarkeit der Prüfungen (23.09.2026): Prüfnotizen stehen orange (`ORANGE` in `pdd_formatierung.py`) und dreizeilig – „Merke Prüfnotiz“,
die Notiz eingerückt in eigener Zeile, dann „in <Fehlerliste>“ (Zeilenumbrüche im Absatz, `_teile` liefert dafür die Art `br`).
Zwischen zwei Prüfungen auf oberster Ebene setzt `formatiere_zelle` eine kurze graue Linie („________“) als optischen Trenner;
der zweisprachige Lauf lässt Trenner unverändert und findet die umgebrochenen Prüfnotizen über ihre einzeilige Form.

Vermittlertyp leer (23.09.2026): Die Prüfnotiz „Vermittlertyp nicht angegeben“ ist gestrichen. Leer läuft der Makler-Zweig, der eine
unterschriebene Maklervollmacht verlangt (sonst BE „Unterschrift VN fehlt“); Kapitel III gleicht gegen die OB726-Klassifizierung ab
(Prüfnotiz „Vermittlertyp abweichend“ jetzt auch bei leerem Feld und Mehrfachagent in OB726). `BUE_VERMITTLER_TYP` ist optional.

## PDD v11 nach der Rückmeldung K. Rypa (25.09.2026)

`PDD_Vorpruefung_BUE_Gesundheit_KV_v11.docx` und `PDD_Vorpruefung_BUE_Komposit_Leben_v11.docx`, Protokoll
`QS_Review_v10_Rueckmeldung_Rypa_250926.md`, Antwort `Mail_Entwurf_Antwort_Rypa_PDD_v11_250926.eml/.txt`
(Build `quellen/mail_antwort_rypa_pdd_v11_build.py`). Bau wie bei der v10 (v9 → `pdd_kv_v10.py` → `pdd_zweisprachig.py`,
neue Übersetzungen in `uebersetzung/chunk_19_*.json`). Die Screenshots aus den beiden zurückgesandten Dateien liegen in
`quellen/screenshots_2509/` und werden im Build über `bilder_setzen` gesetzt (nichts selbst geschwärzt; Schwärzung ist Sache des Fachbereichs).

- KR-Flottenvertrag (Komposit/Leben): VA230/VAF230, Feld „Sparte/Vers.Art“, mittlerer Wert `<VA230-VersArt>`; „FK“ → BE „KR Flottenvertrag“,
  „KR“ = normaler Vertrag; jeder Vertrag unter einem Mantel wird ausgesteuert (K. Rypa, 25.09.2026).
- Routing bei Befund (Komposit/Leben) über den Vertriebskanal des abgebenden Bestandsinhabers aus OB726 (`<OB726-AGT-Inh-Vertriebskanal>`):
  Makler/Koop 2200, 2215, 2271, 2281, 2300, 2301, 2302, 2400 → „ODPP1 D - Ma/Ma Bestandsübertragungen“, alle übrigen (AO, z. B. 2050, 2100,
  2111, 2130, 2151, 2800) → „HSB4 K KO Komposit / Leben Posteingang“; 2720 offen.
- Themenpostkörbe mit den Bezeichnungen aus der Postkorbverwaltung: „HSB4 K 72 - Erstinformation“, „HSB4 K MV Gesundheit Posteingang“,
  „HSB4 K KO Komposit / Leben Posteingang“, „ODPP1 D - Ma/Ma Bestandsübertragungen“; Nummern weiterhin TBD.
- Screenshots: KI-Deckblatt in der Vorprüfung, IS011 (geschwärzt), OB729 Betreuungsvermerk, KV-Notizvorlage BOT2011, VA230 KR und Flotte.

## PDD Komposit / Leben v12 nach den Kommentaren ODPBD (02.10.2026)

`PDD_Vorpruefung_BUE_Komposit_Leben_v12.docx` entsteht direkt aus der zurückgesandten Fassung
(`quellen/rueckgabe_0210/…_Rueckgabe_ODPBD.docx`, mit deutschen Änderungen ohne Nachverfolgung) über `quellen/pdd_kl_v12.py` – nicht
aus der v9-Kette, damit die Änderungen des Fachbereichs (Ansprechpartner, Postkörbe, Sonderliste, Ablaufdiagramm) erhalten bleiben.
Das Skript zieht die englische Übersetzung nach, setzt die Kommentare um und entfernt sie. Protokoll:
`QS_Review_v11_Kommentare_ODPBD_021026.md`; eine Mail an N. Garcia-Fernandez (Build `quellen/mail_pdd_kl_v12_build.py`) mit den
Änderungen, der Erklärung der Fehlerliste und der Frage, ob der BÜ-Bot Verträge im Mahnverfahren berücksichtigt.

- Unterlagenprüfung mit einer Bedingung: Prüfnotiz, wenn `<BUE_PRUEFUNG_UNTERLAGEN>` einen Mangel nennt (leer und Reminder entfallen
  als eigene Unterbedingungen, Ergebnis gleich).
- Sonderliste TOP-Makler wird laufend geprüft und geändert; Notizfelder „Komposit / Leben / KV“ und „Laufende Nr. aus
  Vorgangsdatenbank“ werden nicht befüllt.
- Unterschrift VN bleibt `<> „ja“`; Postkorb-Nummern ODPP1 D (AA 23949) und HSB4 K KO (KO 23724) auch im BE-Handling.
- Die KV-Fassung ist unverändert (v11).

## Testfallkatalog Prüf-Bot (28.09.2026) – Excel und Folien im ERGO-Master

`20260928_Testfaelle_Pruef-Bot.xlsx` (Arbeitsdokument) und `20260928_Testfaelle_Pruef-Bot.pptx` (50 Folien), beide aus einer Datenquelle
`quellen/testfaelle/katalog.py` gebaut (Grundlage PDD v11). Gegenstand ist der **Robotic-Test**: Der Prüf-Bot startet immer mit einem
Postkorbvorgang je VNR samt Datensatz; Celonis (Extraktion, Aufteilung einer Mail auf mehrere VNR, EMMA-Abgleich) und EMWS liefern nur die Eingabe.

```bash
cd 05_Bestandsuebertragung/kontextdokumente/pdd/quellen/testfaelle
python3 katalog.py                  # Selbstprüfung: Abdeckung jeder BE, Prüfnotiz und jedes Merkmals; Testdatenbedarf
python3 testfaelle_xlsx_build.py    # Excel
python3 testfaelle_ppt_build.py     # Folien (Vorlage ../20260916_Abstimmung_Budget_2027_Celonis_Vorlage.pptx)
```

- **25 Testfälle (22 Muss, 2 Soll, 1 Kann), je Testfall genau ein Vorgang auf einer VNR:** je harte BE ein Fall (14 BE,
  dazu der zweite Auslöser von „Keine Zusammenarbeit“ als Soll), alle 7 Prüfnotizen der Fehlerliste in zwei Sammeltests
  (TF-BH-01 echte Mail, TF-BH-02 Datensatz), vier Glattfälle als Gegenprobe (je zwei KV und Non-KV), drei Technikfälle, ein Soll-Fall Kundensuche.
- **Nur was geprüft wird, muss vorliegen:** Endet ein Fall in der Vorprüfung, ist die VNR beliebig und von der Agentur zählt nur der EMMA-Typ
  (Testeintrag genügt); Hostanforderungen an die Agentur erst, wenn Kapitel III erreicht wird (`katalog.relevanz`).
- **Testdaten:** 8 Pflichtverträge bei 6 Kunden, 6 Pflichtagenturen mit EMMA-Eintrag, optional V-09, A-07;
  vier Absender-Postfächer, 13 Mail-Vorlagen. Courtagefortzahler und Kontaktgeber teilen sich A-05 (EMMA-Typ wird umgestellt).
  Anforderungen stehen als Stichpunkte.
- Folien: Agenda im CI-Layout „Agenda short“ (Foto der Titelfolie, Seitenzahlen aus den Trennern), Lesehilfe, je Kapitel ein Trenner
  im Layout „Titelfolie Designfeld 3 ohne Bild“ mit Kapitelnummer; Herleitung (PDD-Kapitel mit harten BE und Prüfnotizen → Testlogik, „Warum 25“, Fehlerliste,
  Glattfälle), Aufbau des Tests (Testschema, Umgebung und Datenfluss mit Start des Robotic-Tests, Wege A/B aus dem Testkonzept vom 23.09.2026),
  Testdaten, Überblick und Abdeckung, ein Onepager je Testfall, Abnahme. Tabellen ohne Gitter mit farbiger Kopflinie.
- Excel-Blätter: Übersicht (Kennzahlen aus dem Status, Herleitung), Testdatenbedarf (Matrix über Formeln, Annahmen), Testfälle,
  Testfallblatt (Onepager per Auswahlliste), Testdaten, Mail-Vorlagen, Abdeckung, Abnahmekriterien.

## Testkonzept Prüf-Bot: Testdatenbereitstellung (23.09.2026) – Folien im ERGO-Master

`20260923_Testkonzept_Pruef-Bot_Testdaten.pptx` (Build `quellen/testkonzept_ppt_build.py` aus der Master-Vorlage
`quellen/20260916_Abstimmung_Budget_2027_Celonis_Vorlage.pptx`, Aufruf aus `pdd/quellen/`). Ausgangspunkt ist die
Skizze „Testdatenbereitstellung“ des Fachbereichs (zwei Folien: Umgebungsbild und Stichpunkte). Drei Inhaltsfolien:

- **Testdatenbereitstellung:** Umgebungsbild mit Abnahme Celonis (cloud.abn.ergo.com, EMMA), Abnahme Prüf-Bot (ergodev,
  strukturierte Daten, Datenpool), Abnahme Host (IMSI: EMWS, Themenpostkorb MV 23724, Host-Transaktionen, Datenbestand)
  und Produktion (IMS). Der PTU-Abzug IMS → IMSI ist als roter Pfad gezeichnet; daneben, was er liefert (Vertragsdaten
  nahezu identisch, Kundendaten anonymisiert, VNR zugeschoben, OE-Nr. angeben) und welche Auftragsdaten vor dem Start
  auf IMSI-Stand zu bringen sind (Makler-E-Mail, Agentur-Nr., PNR, Kunde, VNR).
- **Vorgehen:** Vorbereitung in fünf Schritten (Testfälle aus BE und Prüfnotizen der PDD, OE-Nr. und VNR finden, PTU-Abzug,
  Kundendaten in IMSI, Makler und Vermittler prüfen), daneben Weg A End-to-End und Weg B Datenmanipulation als Schrittketten
  mit Bewertung; Empfehlung: Start mit B, Weg A vor dem Go-Live verpflichtend.
- **Testfälle:** Tabelle aus der PDD abgeleitet (Glattfälle Makler und MFA, Agenturnummer, Unterschrift, Kunde in IS011,
  Geburtsdatum, Makler inaktiv, E-Mail-Adresse, Vertrag nicht aktuell, Unterlagen, mehrere VNR, Komposit/Leben) mit
  erwartetem Ergebnis, benötigten Daten und Quelle (IMSI oder angepasster Datensatz).

Sichtprüfung ohne PowerPoint: `scratchpad/tk/pptx_svg.py` rendert die Formen als SVG, Playwright legt Standbilder ab.

Korrektur des Umgebungsbilds (24.09.2026, Abstimmung mit T. Juraschek, Transkript „Makler BÜ Meets KI – Test“): Der Datenpool gehört in die
IMSI-Umgebung, nicht nach ergodev; EMWS eröffnet den Postkorbvorgang und schreibt Datenpool und Vorgangs-DB; der Prüf-Bot greift nur lesend
zu (Themenpostkorb, Datenpool, Host-Transaktionen). EMMA ist kein System, sondern ein Excel-Abzug für den Abgleich der Agenturnummer.
