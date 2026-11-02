# Outlook-Regeln: Auswertung und Umbau-Makro

Zwei Ergebnisse aus demselben Regel-Export (beide nicht im Repo, siehe `.gitignore`):

| Datei | Inhalt |
|---|---|
| `Regeln_Vergleich_Bestand_Makler.xlsx` | Auswertung ohne Makros: Auf einen Blick, Vergleich, Anlegen, Übersicht, Regel-Logik, Elemente, Zielordner, Prüfhinweise, Diagnose (neues Exportformat) |
| `Regeln_Umbau.xlsm` | dieselbe Auswertung plus Blatt **Umsetzung** (zweites Blatt), Blatt **Ordner** (drittes Blatt, Plan 3.0) und die Blätter Live, Sicherung, Ordner-Sicherung, Protokoll. Ein Excel-Makro passt die Regeln des Gruppenpostfachs Bestandsuebertragungen@ergo.de in Outlook nach Vorbild von Maklerauftraege@ergo.de an (Umsetzung) und ordnet die Archiv-Ordner beider Postfächer in nummerierte Gruppen (Ordner). |

```bash
cd quellen
python3 -I bau_regeln.py <Export.xlsx> <ziel>/Regeln_Vergleich_Bestand_Makler.xlsx    # ohne Makros
python3 -I bau_regeln.py <Export.xlsx> <ziel>/Regeln_Umbau.xlsm                        # Makro-Mappe
python3 -I pruefe.py <Export.xlsx> <ziel>/Regeln_Umbau.xlsm <ziel>/Regeln_Vergleich_Bestand_Makler.xlsx
python3 test_umbau.py <Export.xlsx> <arbeitsordner> [szenario ...]                     # Ablauftest in LibreOffice
```

## Exportformat

`bau_regeln.py` findet die Spalten der Übersicht über die Kopfzeile. Es liest das neue Format des
Outlook-Regeln-Werkzeugs v1.3 (14 Spalten mit „Bedingung lesbar“ in I, Blatt Diagnose) und weiterhin das alte
13-Spalten-Format. Pseudo-Einträge wie „keine Bedingung sichtbar“ im Blatt Elemente zählen nicht als Bedingung.
„nicht im Export“ steht im Vergleich nur noch, wenn der Export die Bedingung nicht lesen konnte (altes Format ohne
Bedingung bzw. „Bedingung lesbar“ = Nein/teilweise). „keine sichtbar“ heißt: Outlook liefert keine Bedingung –
Sammelregel oder in Outlook im Web angelegt.

Der Plan v2 ist auf den neuen Export ausgelegt. Mit dem alten Export (Bedingungen größtenteils nicht lesbar) entsteht die
Mappe zwar, Zeile 8 hat dann aber keine Wörter und blockiert.

`pruefe.py` vergleicht jeden Wert aller Export-Blätter (neuer Export: 3471 Werte, inkl. Diagnose) mit der neuen
Datei, prüft bei der .xlsm Blattreihenfolge, Plan, Namen, Beschriftungen, Links, Knöpfe und VBA-Module, und vergleicht
die erzeugten Blätter Auf einen Blick, Vergleich und Anlegen mit der .xlsx. Erlaubt sind dabei nur Links und Zeilen zum
Makro und der erweiterte Hinweistext.

## Bedienung (Blatt „Umsetzung“)

1. **Sicherung exportieren** – in Outlook: Datei › Regeln und Benachrichtigungen verwalten › Optionen › Regeln
   exportieren, oben zuerst das Zielpostfach wählen. **Danach den Dialog schließen**, sonst kann Outlook das Speichern
   ablehnen. Knopf **Regeln aus Outlook lesen** zeigt den aktuellen Stand beider Postfächer im Blatt Live (nur lesen,
   mit Diagnose).
2. **Vorschau** – liest beide Postfächer und spielt den Plan Zeile für Zeile durch. Spalte „Vorschau“: `bereit …`,
   `schon erledigt`, `blockiert: <Grund>`, `nicht ausgewählt`; fehlende Ordner erscheinen als „Ordner wird angelegt: …“,
   ein Schritt, der eine Regel ohne sichtbare Bedingung ändert, endet auf „· Regel ohne sichtbare Bedingung“. Neue
   Absender-Ausnahmen werden mit Namen genannt („Absender ist + „Microsoft Outlook““, bei vielen die ersten drei und
   „und n weitere“). Ein nicht auflösbarer Empfänger erscheint mit Name, Adresstyp und gekürzter Adresse, z. B.
   `blockiert: Empfänger nicht auflösbar: Microsoft Outlook (EX /o=…/cn=microsoftexchange…, Adresstyp 0, keine
   SMTP-Adresse)`. Schreibt nichts nach Outlook, auch keine Ordner.
3. **Ausführen …** – nur nach einer Vorschau ohne Blocker. Drei Rückfragen, vorausgewählt ist jeweils „Nein“:
   .rwz-Export erledigt und Dialog geschlossen? – Regeln ohne sichtbare Bedingung bestätigen (nur wenn es welche gibt) –
   (nur wenn Spalte L Absender überspringt: „Absender überspringen“, je Zeile die Namen) – Liste der Änderungen (Zeilen an einer Regel ohne sichtbare Bedingung enden auf „· Regel ohne sichtbare Bedingung“,
   die Schlusszeile „… und n weitere“ zählt solche Zeilen mit; „Jetzt ausführen?“ steht immer am Ende, der volle Text
   im Blatt Protokoll, Zeile `RÜCKFRAGE`). Ändert sich die Lage in Outlook während der Rückfragen (Regel nicht mehr
   lesbar, Regel ohne sichtbare Bedingung jetzt vor aktiven Regeln), sperrt das Makro vor dem Speichern und setzt
   „Stand Zielpostfach“ neu; mit „Trotz …“ = Ja kommt stattdessen eine vierte Rückfrage mit der neuen Lage (Vorgabe
   „Nein“). Spalte „Ergebnis“: `erledigt (geprüft)`, `erledigt (geprüft, Bedingung nicht prüfbar)`,
   `erledigt (geprüft, ohne sichtbare Bedingung)` (Schritt an einer Regel ohne sichtbare Bedingung),
   `gespeichert, Prüfung weicht ab: …` oder `nicht ausgeführt: …`; jede Aktion steht im Blatt Protokoll. Fragt Outlook
   beim Speichern nach, dort bestätigen (Fenster ggf. in der Taskleiste). Die Abschlussmeldung passt in eine MsgBox
   (Wichtiges zuerst, sonst gekürzt); der volle Text steht im Blatt Protokoll (Zeile `ERGEBNIS`).

Einstellungen: Zielpostfach (wird geändert), Quellpostfach (Regeln nur gelesen – seine Ordner stellt seit Plan 3.0 das
Blatt Ordner um), „Trotz nicht lesbarer Bedingungen speichern
(Sicherung als .rwz vorhanden)“ – Standard **Nein**.

Das Blatt hat keine fixierten Zeilen; die Knöpfe stehen links neben den Schritten, Vorschau und Ergebnis direkt hinter
Regel und Position (Spalten G, H). Spalte L „Überspringen: nicht auflösbare Absender“ ist im vorbefüllten Plan leer
(Standard: blockieren), Spalte M „Warum“ erklärt die Zeile.

### Plan v2 (vorbefüllt, aus den Daten der Auswertung abgeleitet; Makro „Plan 3.0“)

| Nr | Ausführen | Aktion | Regel | Was |
|---|---|---|---|---|
| 1 | Ja | ZIELORDNER | Kopie von Automatische Antworten aussortieren | Verschieben nach `Archiv\Automatische Antworten` (neuer Ordner, richtig geschrieben; der Makler-Ordner heißt „Auotmatische Antworten“). Bedingung ist schon identisch zu Makler #1. |
| 2 | Ja | UMBENENNEN | dieselbe Regel | → „Automatische Antworten aussortieren“ |
| 3 | Ja | KOPIEREN | Automatische Antworten 1zu1 aussortieren | aus Makler (Absender noreply@1zu1.ag UND Mailtext …), Verschieben nach `Archiv\Automatische Antworten` |
| 4 | Ja | POSITION | Automatische Antworten 1zu1 aussortieren | nach „Automatische Antworten aussortieren“ |
| 5 | Ja | POSITION | Automatische Antworten aussortieren (2) | `nach: … 1zu1 aussortieren || Automatische Antworten aussortieren` – Regel bleibt |
| 6 | Ja | KOPIEREN | Eskalations-GPF in den Prio-Ordner | aus Makler, Verschieben `Prio`, Kopieren `Archiv\Archiv: Dopplung der Neuzugänge` |
| 7 | Ja | POSITION | Eskalations-GPF in den Prio-Ordner | vor „Beschwerden/Prio in den Prio-Ordner“ |
| 8 | Ja | BEDINGUNG_WORT_ERGAENZEN | Beschwerden/Prio in den Prio-Ordner | `Betreff enthält: "Eskalation"` (wie Makler #9) |
| 9 | Ja | UMLEITEN_STATT_WEITERLEITEN | KV Solo | Weiterleiten aus, Umleiten an dieselben Empfänger |
| 10 | Ja | AUSNAHMEN_UEBERNEHMEN | KV Solo | Ausnahmen von Makler „KV Solo“ (Betreff „Unzustellbar“, 36 Absender) |
| 11 | Ja | AUSNAHMEN_UEBERNEHMEN | E - KWAD – Gruppenpostfach | Ausnahmen von Makler „E - KWAD – Gruppenpostfach“ |
| 12–14 | Nein | KOPIEREN | Erinnerungen JungDMS / Qualitypool / FondsFinanz | Ziel `Archiv\<Unterordner wie Makler>` (wird angelegt), Position nach „Umleitung FL Verträge an VSLV3D“ in Makler-Reihenfolge (Ausweich-Bezüge mit `||`) |

Nur im Blatt Anlegen (Klären/Info, nicht im Plan): KV@Qualitypool (schiebt alle Mails von kv@qualitypool.de ins
Archiv), CCPI, „KWAD-Rückläufer … (an Verwaltung)“, „Teil/Gesamt-BÜ an Vermittlerverwaltung“; Info: „Mails von
BÜ-Bot“ (Bestand bewusst breiter). Unter der Soll-Reihenfolge stehen Hinweise für Maklerauftraege (Makler #3
inaktiv/nur Client/ohne Zielordner; Makler fehlt die Bestand-Regel „(2)“). Eigene Schritte gehen in die sechs leeren
Planzeilen. Aktionen (Spalten E–L):

- `ORDNER_ANLEGEN` (I) – Ordner samt fehlender Elternordner, erst unmittelbar vor dem Speichern.
- `ZIELORDNER` (E, I und/oder J) – Ziel von „In Ordner verschieben“ (I) bzw. „kopieren“ (J); die Aktion muss aktiv sein.
- `UMBENENNEN` (E alt, F neu) – spätere Zeilen finden die Regel unter beiden Namen (zweiter Lauf: „schon erledigt“).
- `UMLEITEN_STATT_WEITERLEITEN` (E) – Umleiten an genau die Weiterleitungsempfänger. Enthält „Umleiten an“ schon
  andere Empfänger (auch ausgeschaltet), ist die Zeile blockiert; „schon erledigt“ nur bei gleicher Empfängerliste.
- `POSITION` (E, F) – `nach: Regel`, `vor: Regel`, `Platz n`. Der ganze Text zählt zuerst als Regelname (ein einzelnes
  `|` gehört zum Namen, z. B. „TEST | Komplett an Celonis 09.10.2026“). Ausweich-Bezüge mit `||`: die erste vorhandene
  Regel zählt, die Vorschau nennt den Ausweich-Bezug.
- `KOPIEREN` (E neuer Name, F Position optional, I/J Ziele, K Quellregel):
  a) Regel mit dem neuen Namen vorhanden → nur Ordner/Position angleichen; ohne sichtbare Bedingung blockiert;
  b) „Kopie von <Quelle>“ (vom Outlook-Knopf „Kopieren…“) vorhanden → umbenennen, Ordner, Position; Bedingungen müssen
     gleich der Quelle sein. Lässt sich die Quelle nicht lesen (Quellpostfach fehlt, Quellregel fehlt oder nicht lesbar),
     sagt die Vorschauzeile „Hinweis: … – nicht mit der Quellregel verglichen“ (bei a ebenso);
  c) sonst neu anlegen, nur wenn die Quellregel mindestens eine aktive, lesbare Bedingung hat und alle aktiven
     Bedingungen, Ausnahmen und Aktionen anlegbar sind (benannte Eigenschaften **und** Index-Durchlauf). Wörter und
     Adressen werden genau wie in der Quelle übernommen (nicht getrimmt). Vor dem Speichern wird die neue Regel gegen
     die Quelle geprüft (gleiche Bedingungs-/Ausnahmetypen und Werte, alle Empfänger übernommen); Abweichung = kein
     Speichern;
  d) sonst blockiert mit Anleitung „Diese Regel bitte einmal in Outlook kopieren: …“. Nie eine Regel ohne Bedingung.
- `BEDINGUNG_WORT_ERGAENZEN` (E, F = `Betreff enthält: "Wort", "Wort"`; auch Mailtext, Betreff oder Mailtext,
  Nachrichtenkopf, Absender-/Empfängeradresse) – nur in aktiver, lesbarer Bedingung; vorhandene Wörter bleiben genau
  so, wie Outlook sie liefert (auch Leerzeichen am Rand und Reihenfolge), nur fehlende werden angehängt – getrimmt,
  also ohne Leerzeichen am Rand, auch wenn sie in den Anführungszeichen stehen (`"  Eskalation "` → `Eskalation`).
  Verglichen wird ohne Groß-/Kleinschreibung und ohne Leerzeichen am Rand; nach dem Setzen prüft das Makro, dass die
  vorhandenen Werte unverändert an ihrer Stelle stehen. (Anders bei `KOPIEREN` und `AUSNAHMEN_UEBERNEHMEN`: Werte aus
  der Quellregel werden roh übernommen.)
- `AUSNAHMEN_UEBERNEHMEN` (E Zielregel, K Quellregel, L optional) – fehlende Einträge der Quell-Ausnahmen ergänzen,
  vorhandene Ausnahmen bleiben unverändert (wie bei den Wörtern), neue Werte wie in der Quelle; Empfänger werden über
  die Kandidaten-Kaskade aufgelöst (siehe „Empfänger“ unten; nicht auflösbar = blockiert); nur übernehmbare Typen. Eine
  ausgeschaltete Ausnahme mit fremden Einträgen blockiert (sie würden sonst mit eingeschaltet).
  **Spalte L „Überspringen: nicht auflösbare Absender“** (Standard leer): Namen oder Adressen, mit „;“ getrennt, z. B.
  `Microsoft Outlook`. Nur ein Absender, der sich über **keinen** Kandidaten auflösen lässt **und** in L steht, wird
  nicht übernommen; jeder andere nicht auflösbare blockiert weiter, ein auflösbarer wird trotz Eintrag übernommen. Die
  Vorschau endet dann auf „· übersprungen (nicht auflösbar, Spalte L): „…““ (ein Eintrag in L, der nichts trifft:
  „· Hinweis: Spalte L nennt …“), vor dem Ausführen kommt eine eigene Rückfrage (Vorgabe Nein, je Zeile die Namen),
  das Protokoll hält „Nicht übernommen (nicht auflösbar, Spalte L): …“ fest, das Ergebnis endet auf „· übersprungen
  (nicht auflösbar): …“; ein zweiter Lauf meldet „schon erledigt · übersprungen …“. Bleibt für einen Ausnahmetyp kein
  Absender übrig und hatte das Ziel dort bisher keinen, bleibt diese Ausnahme aus (nie eine leere Absender-Ausnahme).
  **Begründung:** Eine Ausnahme schränkt eine Regel nur ein. Fehlt ein einzelner Absender, behandelt die Regel dessen
  Mails wie bisher (das Ziel hatte die Ausnahme vorher nicht) – sie greift nie breiter als heute. Darum gibt es L nur
  hier; bei `KOPIEREN` (die Kopie muss gleich der Quelle sein) und `UMLEITEN_STATT_WEITERLEITEN` (ein fehlender
  Empfänger bekäme keine Mails mehr) blockiert ein Eintrag in L die Zeile.
- `DEAKTIVIEREN` (E). Löschen gibt es nicht.

Ordner, die das Blatt Ordner umgestellt hat: Nennt eine Zeile in I/J einen alten Pfad, den es nicht mehr gibt, und ist
der Ordner laut Blatt Ordner (Zeilen `ORDNER_VERSCHIEBEN`/`ORDNER_UMBENENNEN`) unter dem neuen Pfad da, gilt der neue Pfad
(`modOrdner.UmzugPfad`, aufgerufen in `modPlan.SchrittPruefen`); die Vorschauzeile endet dann auf „· Ordner laut Blatt
Ordner umgezogen: <alt> jetzt <neu>“. Ohne das legte die Vorschau nach der Umstellung z. B. `Archiv\Automatische
Antworten` neu an und setzte Regel 1 dorthin zurück. Der Plan v2 behält deshalb seine alten Pfade und funktioniert vor
und nach der Ordner-Umstellung.

## Bedienung (Blatt „Ordner“, Plan 3.0)

1. **Vorschau** – liest Ordnerbaum und alle Regeln beider Postfächer und spielt den Plan Zeile für Zeile durch:
   `bereit · verschieben nach „Archiv\01) …“, neuer Name „…“ · mit n Unterordnern · n Regeln zeigen danach dorthin`,
   `schon erledigt`, `blockiert: <Grund>`. Spalte J nennt je Zeile die Regeln (beider Postfächer, auch eine Regel aus dem
   anderen Postfach), die heute in den Ordner oder einen Unterordner verschieben bzw. kopieren, mit dem Pfad danach
   (mehr als sechs: Rest im Protokoll). Schreibt nichts nach Outlook.
2. **Ausführen …** – nur nach einer Vorschau ohne Blocker, mit unverändertem Plan (Prüfwert) und unverändertem Stand in
   Outlook (gleiche Berechnung, gleiche Ergebnisse). Eine Rückfrage (Vorgabe Nein, Liste der Änderungen, voller Text im
   Protokoll), dann Ordnerliste und Regelziele beider Postfächer ins Blatt **Ordner-Sicherung**, dann die Schritte in
   Planreihenfolge. Jeder gelungene Outlook-Schritt steht sofort danach in der Ordner-Sicherung (`angelegt`,
   `verschoben`, `umbenannt`, fortlaufende `Folge`, Stand `ausgeführt`). Ein Fehler stoppt sofort; die Meldung nennt,
   was schon angelegt bzw. umgezogen ist. Danach (auch nach einem Abbruch) die **Nachprüfung**: Ordner und alle Regeln
   beider Postfächer neu lesen; jede eingeschaltete Aktion „In Ordner verschieben/kopieren“ muss auf einen vorhandenen
   Ordner zeigen, die betroffenen auf den erwarteten neuen Pfad. Ergebnis je Zeile `erledigt (geprüft) · n Regeln zeigen
   auf den neuen Pfad`; Abweichungen stehen als „Achtung, Regeln weichen ab (n): …“ vorn in Meldung und Stand, an der
   Zeile („· Achtung: Regel „…“ weicht ab“) und je Regel im Protokoll (`REGELPRÜFUNG`).
3. **Regeln prüfen** – nur lesen, jederzeit: Ziele aller Regeln beider Postfächer vorhanden? Wie viele liegen unter den
   neuen bzw. noch unter den alten Pfaden des Plans? Eine ausgeschaltete Regel ohne Zielordner (Makler „Umleitung -
   Technische Fehler“, in Outlook „(Fehler)“) ist ein Hinweis, kein Alarm.
4. **Ordner zurück …** – nimmt die Schritte mit Stand `ausgeführt` aus der Ordner-Sicherung in umgekehrter Reihenfolge
   (`Folge` absteigend) zurück: erst im Abbild vorab geprüft (Ordner unter dem neuen Pfad da, gleiche EntryID, alter
   Platz frei – sonst „nicht möglich – nichts geändert“), Rückfrage (Vorgabe Nein), Sicherung, dann Schritt für Schritt
   mit Stopp beim ersten Fehler; Stand wird `zurückgenommen …`. Angelegte Gruppenordner bleiben stehen (Meldung nennt
   sie, „ohne Unterordner“), Stand `bleibt stehen`. Danach dieselbe Regelprüfung.

Regeln werden dabei nie geändert und nie gespeichert (kein `Rules.Save`, in keinem Postfach): Outlook merkt sich in einer
Regel den Zielordner selbst (EntryID), nicht seinen Pfad. Maklerauftraege bleibt für Regeln nur lesend; Ordner werden
dort mit diesem Blatt umgestellt. Gelöscht wird nichts.

### Plan 3.0 (vorbefüllt, vom Nutzer bestätigt; Ordnernamen genau wie in Outlook)

| Zeilen | Postfach | Aktion | Was |
|---|---|---|---|
| 1–6, 30–35 | beide | ORDNER_ANLEGEN | `Archiv\01) Automatische Antworten`, `02) Erinnerungen Pools`, `03) BeMaS - eBIS`, `04) Neuzugänge`, `05) Weiterleitungen`, `06) Technische Fehler` |
| 7–18 | Bestand | ORDNER_VERSCHIEBEN | Automatische Antworten, No Reply Mails etc. (→ No-Reply-Mails) → 01); Erinnerung JungDMS (→ Erinnerungen JungDMS), Erinnerungen Fonds Finanz, Erinnerungen Qualitypool → 02); Archiv: BeMaS-Kennzeichen …, Archiv: BeMaS an KWAD → 03) ohne „Archiv:“; Archiv: Dopplung der Neuzugänge → 04); Archiv: Weitergeleiteten Mails zu FL an VSLV3 (→ Weitergeleitete Mails an VSLV3 (FL)), Archiv: Weiterleitung an KWAD (mit Unterordnern), BÜ-Archiv: Weitergeleiteten Mails an Celonis (oberste Ebene, → Weitergeleitete Mails an Celonis) → 05); Umleitung - Technischer Fehler (oberste Ebene) → 06) |
| 19–29 | Bestand | ORDNER_UMBENENNEN | Unterordner von „Rückläufer EPL und FL Verträge“: Abbas → 01) Abbas … Witt → 10) Witt (Nass-Kluske behält seine Unterordner); UBR\Witt → UBR\01) Witt |
| 36–47 | Makler | ORDNER_VERSCHIEBEN | Auotmatische Antworten (Tippfehler → Automatische Antworten), Nachricht nicht zustellbar (Archiv) (oberste Ebene, → Nachricht nicht zustellbar) → 01); Erinnerung JungDMS (→ Erinnerungen JungDMS), Erinnerungen Fonds Finanz, Erinnerungen Qualitypool, KV Qualitypool → 02); BeMaS an KWAD, EBIS / BeMAs (mit Unterordnern) → 03); Archiv zu den Neuzugängen im Postfach (mit Unterordnern, → Neuzugänge im Postfach) → 04); Archiv zu den weitergeleiteten Mails an Celonis (→ Weitergeleitete Mails an Celonis), Teil/Gesamt-BÜ nicht an KWAD sondern an Verwaltung → 05); Umleitung - Technische Fehler → 06) |

Bewusst nicht im Plan (Bot-Zugriff über den Pfad möglich): Bestand `Archiv\Archiv: Vorabinfo` (mit „Entwurf aus BOT
Postf.“), `BÜ-Bot-Mails`, Posteingang und Unterordner; Makler `Archiv\Archiv zu den weitergeleiteten Mails an KWAD`
(XLS-Dateien), Posteingang und Unterordner (KI-Vorblatt, Prio, Vorlagen), `Postausgang\Livelink Retrieve`, `Rückläufer
FL Verträge (ODPB3D)` samt `BÜ-Bot Mails`; alle übrigen Ordner der obersten Ebene. Die Spalte „Warum“ nennt je Zeile die
Regeln laut Export, die heute dorthin zeigen.

Aktionen (Spalten D Postfach, F Pfad heute, G Pfad neu; Pfade relativ zum Postfach der Zeile oder mit `\\postfach\`,
„/“ im Namen wie in Outlook, `%2F` geht auch):

- `ORDNER_ANLEGEN` (G) – Elternordner muss da sein oder von einer Zeile darüber kommen; vorhanden = schon erledigt.
- `ORDNER_VERSCHIEBEN` (F, G) – `Folder.MoveTo` in einen anderen Ordner desselben Postfachs, danach `Folder.Name`, wenn G
  anders endet (zwei Outlook-Schritte, je ein Eintrag in der Ordner-Sicherung). Quelle weg und Ziel da = schon erledigt;
  Quelle und Ziel da = blockiert (Namenskonflikt, nichts wird zusammengeführt); Quelle fehlt = blockiert mit ähnlichen
  Namen im Elternordner (Normierung ohne Satzzeichen/Umlaute, Teilstring, Editierabstand) und gleichnamigen Ordnern an
  anderer Stelle – „das Makro rät nicht“; Zielordner fehlt = blockiert („entsteht erst durch Zeile n“, wenn eine andere
  Zeile ihn anlegt); alter Name im Zielordner schon vergeben = blockiert (Zwischenschritt); gleicher Elternordner =
  blockiert (→ UMBENENNEN); Pfad in einem anderen Postfach = blockiert; Standardordner (Posteingang, Archiv, Gesendete
  Elemente …, oberste Ebene) werden nie verschoben oder umbenannt.
- `ORDNER_UMBENENNEN` (F, G) – gleicher Elternordner, neuer Name; sonst wie oben.

Vergleiche ohne Groß-/Kleinschreibung und ohne Leerzeichen am Rand. Eine ausgewählte Zeile mit unbekanntem Postfach
macht die Vorschau unmöglich (Meldung mit Zeile); auf Nein bleibt sie außen vor.

## Sicherheitsregeln und wo sie im Code stehen

| Regel | Umsetzung |
|---|---|
| Blatt umgebaut | Zellen über Namen (`UM_ZIEL`, `UM_PLAN`, …); Zeilen einfügen/löschen verschiebt sie mit. `modPlan.LayoutPruefen` prüft vor jedem Lauf Beschriftungen und Plan-Kopfzeile; passt etwas nicht, läuft nichts. Ziel = Quelle (auch als Postfach-Identität) und Ziel = Quellpostfach dieser Mappe werden abgelehnt – Letzteres auch, wenn das Ziel unter anderem Anzeigenamen eingetragen ist (`VorschauBerechnen` prüft nach `PostfachFinden` den aufgelösten `PostfachName` und den Anzeigenamen). |
| Vorschau schreibt nichts | `modUmbau.VorschauBerechnen` nutzt nur `modOlLesen`, `modModell`, `modPlan`. Schreibende Zugriffe gibt es nur in `modOlSchreiben`; der Build prüft das statisch (`umbau.nur_lesend_pruefen`), der Test zählt jeden Schreibzugriff der Attrappe. |
| Sperre | `modOlLesen.RegelLesen`: nicht lesbar bei Zugriffsfehler, Lesefehler bei Aktiv, Nur lokal, Regeltyp oder Reihenfolge (keine stillen Standardwerte), Bedingungs-/Ausnahmetyp 0 bzw. unbekannt, nicht lesbaren Werten (auch Empfänger ohne Adresse) und aktiver Aktion unbekannten Typs (0); auch deaktivierte Regeln, weil Save sie mitschreibt. `modPlan.Simulieren` setzt dann alle speicherpflichtigen Zeilen auf „blockiert: Speichern gesperrt“; Freigabe nur über „Trotz …“ = Ja (dann sagt auch die Meldung von „Regeln aus Outlook lesen“ „freigegeben (Einstellung „Ja“)“ statt „Speichern gesperrt“). |
| Regeln ohne Bedingung | Eine lesbare Regel ganz ohne Bedingung (z. B. die Sammelregel „E - KWAD – Gruppenpostfach“) sperrt **nicht**, solange sie ausgeschaltet ist (TEST …) oder als letzte aktive Regel steht: Sie greift bei allen Mails, die bis zu ihr kommen. Die Vorschau listet sie (Stand Zielpostfach: „Speichern möglich mit Bestätigung“), Zeilen, die sie ändern, enden auf „· Regel ohne sichtbare Bedingung“, vor dem Ausführen muss man sie ausdrücklich bestätigen (zweite Rückfrage). Ob eine in Outlook im Web angelegte Bedingung beim Speichern erhalten bleibt, kann das Makro nicht prüfen – darum Export und Bestätigung. |
| Regel ohne Bedingung vor aktiven Regeln | Verschiebt oder stoppt eine aktive Regel ohne sichtbare Bedingung und stehen dahinter noch aktive Regeln gleichen Typs (Empfangen), würde sie alles Folgende abfangen – unplausibel, ihre Bedingung ist vermutlich nur nicht sichtbar und könnte beim Speichern verloren gehen. Das sperrt das Speichern wie eine nicht lesbare Regel (`modModell.AbfangDahinter`; Begründung im Stand Zielpostfach, in der Vorschau-Meldung und in der Diagnose im Blatt Live; Freigabe ebenfalls nur über „Trotz …“ = Ja). **Entscheidung:** maßgeblich ist der Stand nach allen ausgewählten Planzeilen, denn den speichert Outlook – eine neue Regel ohne Position („ans Ende“) hinter der Sammelregel sperrt, ebenso eine Position, die die Sammelregel nach vorn oder eine aktive Regel hinter sie setzt; ein Plan, der eine solche Regel ans Ende setzt oder deaktiviert, hebt die Sperre auf (der Stand nennt dann „in Outlook steht noch … – nach dem Plan nicht mehr“). Nicht lesbare Regeln zählen dahinter nicht mit (Platz womöglich unbekannt; sie sperren ohnehin). `PostfachAusfuehren` prüft nach den Schritten im Speicher noch einmal (frisch gelesener Stand, alle Schritte durchgespielt; zweite Sperrprüfung) und speichert sonst nicht. Hat sich die Lage seit der Vorschau geändert (z. B. in Outlook während der Rückfragen), setzt es „Stand Zielpostfach“ neu (Protokoll `STAND`); wird eine Regel erst nach der Vorschau nicht lesbar, führt es ab da keinen Schritt mehr in Outlook aus. Mit „Trotz …“ = Ja gilt die Freigabe nur für die Lage der Vorschau: Für eine neue Lage fragt es vor dem Speichern eigens nach („Lage seit der Vorschau geändert“, nennt neue und alte Lage, Vorgabe Nein). |
| Ausführen nur nach Vorschau ohne Blocker | `AusfuehrenLauf`: Prüfwert des Plans (Eingabespalten und Einstellungen) muss zur Vorschau passen; keine ausgewählte Zeile blockiert; die Berechnung wird mit frisch gelesenem Outlook-Stand wiederholt und muss dieselben Ergebnisse liefern. |
| Rückfragen | Export (mit „Dialog schließen“), Regeln ohne Bedingung, Liste der Änderungen (je Zeile, was sich ändert; Zeilen an einer Regel ohne sichtbare Bedingung gekennzeichnet; so viele Zeilen, wie in die MsgBox passen, Rest „… und n weitere (Spalte Vorschau), davon m an Regeln ohne sichtbare Bedingung“). Nennt bei freigegebener Sperre die nicht lesbaren Regeln bzw. die Regel ohne Bedingung vor aktiven Regeln (lange Namenslisten gekürzt, damit beide Warnungen sichtbar bleiben). Der volle Text (alle Zeilen, alle Namen) steht vor der Antwort im Blatt Protokoll (`RÜCKFRAGE`). |
| Meldungen | `modUmbau.MeldungKurz`: Abschlussmeldungen (Lesen, Vorschau, Ausführen), die Liste der Änderungen (Rückfrage 3), die Rückfrage zur geänderten Lage und die Rückfragen nach dem Speichern bleiben unter der MsgBox-Grenze (1000 Zeichen); gekürzt wird hinten an einer Zeilen-/Wortgrenze mit „(gekürzt – vollständig im Blatt Protokoll)“, die Frage („Jetzt ausführen?“ usw.) bleibt immer stehen. Die Abschlussmeldung nach dem Ausführen nennt Wichtiges zuerst (Deaktivierung, Regel vor aktiven Regeln), dann Abweichungen und Hinweise. |
| Sicherung | `SicherungSchreiben` hängt alle Regeln des Zielpostfachs mit Zeitstempel an das Blatt Sicherung an. |
| Je Postfach: alles im Speicher, bei Fehler kein Save | `PostfachAusfuehren` → `modOlSchreiben.SchrittAusfuehren` je Zeile auf demselben Rules-Objekt; jede Änderung wird im Speicher nachgelesen; jeder Fehler bricht ab, Status „nicht ausgeführt“. |
| Ordner erst unmittelbar vor dem Save | Fehlende Ordner werden nur vorgemerkt; `OrdnerAnlegenUndZuweisen` legt sie erst nach fehlerfreien Schritten und nach `ReihenfolgeAngleichen` an, direkt vor `RegelnSpeichern`. |
| Neue Regel erst einschalten, wenn ihr Zielordner da ist (Plan 2.3) | Outlook prüft eine Regel schon beim Einschalten (`Rule.Enabled = True`), nicht erst bei `Rules.Save`: Ist eine Verschieben-/Kopieren-Aktion eingeschaltet, aber ohne Ordner, wirft es „Mindestens eine Regel kann aufgrund von ungültigen Aktionen oder Bedingungen nicht gespeichert werden.“ So brach Plan 2.2 im echten Outlook in Zeile 3 ab (`KOPIEREN` Fall c, Ziel `Archiv\Automatische Antworten`, das erst Zeile 1 anlegt): `AktionenKopieren` hatte `MoveToFolder` eingeschaltet, den Ordner nur vorgemerkt, danach setzte `neu.Enabled = eQuelle.Enabled` die Regel auf aktiv. Seit Plan 2.3 schaltet `SchrittAusfuehren` (`KOP_C`) die neue Regel direkt nach `Rules.Create` aus (Outlook legt sie eingeschaltet an; Ausschalten prüft nichts). Fehlt ein Zielordner noch, bleiben die Ordner-Aktion und die Regel aus; `OrdnerAnlegenUndZuweisen` legt den Ordner an, weist ihn zu, schaltet die Aktion ein und danach die Regel wie ihre Quelle – alles vor `RegelnSpeichern` (Protokoll der Zeile: „Regel bleibt ausgeschaltet …“, „Zielordner zugewiesen und Aktion eingeschaltet“, „Regel … eingeschaltet (wie die Quelle)“). Ist der Ordner schon da, wird wie bisher sofort eingeschaltet. Ein Fehler beim Zuweisen oder späten Einschalten gehört zur Planzeile, die es vorgemerkt hat (`gFehlerZeile`; Ergebnis und `ABBRUCH` im Protokoll bei dieser Zeile, die übrigen „abgebrochen wegen Fehler in Zeile n“); gespeichert wird dann nichts, schon angelegte Ordner nennt die Meldung. Die Nachprüfung erwartet unverändert den Endzustand aus dem Abbild (Regel aktiv wie die Quelle, Ordner gesetzt). `ZIELORDNER` und `KOPIEREN` Fall a/b ändern nur den Ordner einer bestehenden Regel, deren Aktion schon eingeschaltet ist und auf den alten Ordner zeigt; `Rule.Enabled` wird dort nicht gesetzt, der neue Ordner wird ebenfalls vor dem Save zugewiesen. |
| Nach dem Save prüfen | `Nachpruefen`: Regeln neu lesen; jede Regel wird mit dem erwarteten Abbild verglichen (Name, Platz, Aktiv, Bedingungen und Ausnahmen mit Werten, Ziele, Empfänger, Stopp); jede ausgeführte Zeile muss „schon erledigt“ melden. Weichen bei einer aktiven Regel die Bedingungen ab (z. B. neue Regel ohne Bedingung), bietet das Makro an, sie sofort zu deaktivieren und erneut zu speichern (Vorgabe Ja). Weichen **nur** Ausnahmen ab, fragt es eigens mit Vorgabe Nein: Fehlen nur die neu übernommenen Ausnahmen, gilt der alte Zustand weiter (die Meldung sagt, ob die früheren Ausnahmen alle da sind), und Deaktivieren würde die ganze Regel abschalten – bei einer Sammelregel die Umleitung aller übrigen Mails. Eine im Lauf **neu angelegte** Regel (`KOPIEREN` Fall c) hat keinen alten Stand: Jede Abweichung bei Bedingungen **oder** Ausnahmen zählt wie eine Abweichung der Bedingungen (Vorgabe Ja, Text „neu angelegte Regel greift breiter als die Vorlage“); `PostfachAusfuehren` markiert dafür die neuen Regeln im erwarteten Stand (`sollNeu`). Bei nicht lesbaren Regeln sagt die Meldung, dass deren Bedingung nicht prüfbar war. |
| Nur Plan-Regeln anfassen | Geändert werden nur Regeln aus Planzeilen. Ausnahme: Ordnet Outlook ExecutionOrder anders als „herausnehmen und einfügen“, stellt `ReihenfolgeAngleichen` die Soll-Reihenfolge Platz für Platz her (wird protokolliert). |
| Regeln des Quellpostfachs nur lesen | `gQuellRegeln` wird nur gelesen; gespeichert wird ausschließlich das Rules-Objekt des Zielpostfachs. Das Blatt Ordner speichert keine Regeln (auch nicht im Zielpostfach). |
| Ordner: Vorschau schreibt nichts | `modOrdner.OrdnerVorschauLauf` liest nur (Ordnerbaum, `GetRules`, Aktionen); geschrieben wird nur über `modOlSchreiben.OrdnerNeuAnlegen`, `OrdnerVerschiebenNach`, `OrdnerNameSetzen`. `umbau.nur_lesend_pruefen` kennt `.MoveTo` und `.Name =`; der Test zählt jedes `Folders.Add`, `MoveTo` und Umbenennen der Attrappe. |
| Ordner: Ausführen | Prüfwert des Plans, keine blockierte Zeile, erneute Berechnung mit gleichem Ergebnis, Rückfrage (Vorgabe Nein), Sicherung, Schritte in Planreihenfolge. Vor jedem Schritt wird der Ordner frisch über den Pfad gesucht und seine EntryID mit der Vorschau verglichen; nach jedem Schritt: Ordner am neuen Platz, alter Platz leer, gleiche EntryID. Bekommt der Ordner beim Verschieben eine neue EntryID, stoppt der Lauf (Regeln, die per EntryID dorthin zeigen, fänden ihn womöglich nicht mehr), die neue EntryID wird in der Ordner-Sicherung nachgetragen. |
| Ordner: nichts löschen, rückgängig | Es gibt kein Löschen. Jeder Schritt steht sofort in der Ordner-Sicherung; „Ordner zurück“ prüft alle Rückschritte vorab im Abbild und ändert sonst nichts. Erwarteter Stand der Regeln = Ziele vor dem Lauf, Pfade über die ausgeführten Schritte abgebildet (`OAbbilden`) – nach einem Abbruch also genau der Teil, der umgezogen ist. |
| Empfänger | `modOlLesen.EmpfKandidaten`: Kaskade je Empfänger – SMTP über `GetExchangeUser` → `GetExchangeDistributionList` → `AddressEntry.PropertyAccessor` PR_SMTP_ADDRESS (`0x39FE001F`, dann `0x39FE001E`; liefert auch dynamische Verteiler und Einträge ohne ExchangeUser) → `Recipient.Address`/`AddressEntry.Address` mit „@“ → Exchange-DN („/o=…“) → Name. **Eintragen** (`EmpfEingabe`, Vorschau und Ausführen gleich): der erste Kandidat, den `Session.CreateRecipient(…).Resolve` auflöst (flüchtig, die Vorschau schreibt weiter nichts); ein Weg über DN oder Name steht im Protokoll. Keiner auflösbar = blockiert, die Meldung nennt Name, Adresstyp und gekürzte Adresse (`EmpfAnzeige`). **Vergleichen** (`EmpfaengerAdresse`, für Quell- und Zielliste gleich, auch in der Nachprüfung): der erste Kandidat; ist er keine SMTP-Adresse (nur DN oder Name), der erste Kandidat des aufgelösten Empfängers – ein im Ziel schon vorhandener Eintrag, der nur als DN/Name lesbar ist, zählt so als vorhanden und wird nicht doppelt eingetragen. Ergebnisse gelten je Lauf (`EmpfaengerSitzung` in Lesen/Vorschau/Ausführen). Ausführen löst per `ResolveAll` auf und kontrolliert danach, dass alle Schlüssel übernommen sind. |

Outlook wird spät gebunden (`modOlZugang.OutlookHolen`), Konstanten als Zahlen. Benannte Bedingungen mit den Namen aus
Microsoft Learn (u. a. `SenderInAddressList`, `OnLocalMachine`). `MoveOrCopyRuleAction.Folder`: Microsofts Beispiel zu
`Rules.Create` weist ohne `Set` zu; das Makro versucht `Set` und fällt auf `CallByName … VbLet` zurück (beide Wege
getestet). Belegt (Microsoft Learn): `Rules.Create` setzt die neue Regel auf Platz 1 und schiebt die anderen um 1;
`Rules.Item(i)` ist die Regel mit ExecutionOrder i. Kein Workbook_Open, keine Auto-Makros.

## Aufbau

```
outlook_regeln/
  README.md, .gitignore
  quellen/
    bau_regeln.py        Auswertung (xlsx) bzw. Makro-Mappe (xlsm); --test baut die Testvariante
    umbau.py             Makro-Teil: Plan v2 aus den Daten, Blatt Umsetzung, Live/Sicherung/Protokoll, VBA-Projekt
    pruefe.py            Wertetreue, Prüfung des Makro-Teils, Vergleich mit der .xlsx
    test_umbau.py        Ablauftest in LibreOffice gegen die Outlook-Attrappe
    ovba.py              vbaProject.bin aus Quelltext (Kopie aus pruefbot_testing, um Klassenmodule erweitert)
    vba_pruefung.py      statische VBA-Prüfung (Kopie)
    lo_pruefen.py        Makros in LibreOffice aufrufen (Kopie, Port/Profil angepasst)
    rendern.py           PDF/PNG über LibreOffice (Kopie)
    vba/                 Produktivmodule
      modUmbau           Knöpfe, Ablauf, Rückfragen, Blätter Live/Sicherung/Protokoll, Prüfwert, Nachprüfung
      modPlan            Layout-Prüfung, Plan lesen, Schritt bewerten und im Abbild nachziehen, Sperre
      modModell          Abbild der Regeln (IDs, Reihenfolge, Werte je Bedingungstyp, Signatur)
      modOlLesen         nur lesend: Postfächer, Ordner, Regeln, Bedingungen mit Werten, Aktionen, Empfänger
      modOlSchreiben     einzige Stelle mit Schreibzugriff: Schritte, Prüfung der Kopie, Reihenfolge, Ordner, Save;
                         Ordner-Umstellung: OrdnerNeuAnlegen, OrdnerVerschiebenNach, OrdnerNameSetzen
      modOrdner          Blatt Ordner: Plan lesen, Ordnerbaum und Regelziele beider Postfächer, Vorschau, Ausführen,
                         Regelprüfung, Ordner zurück; UmzugPfad für modPlan
      modOlZugang        Outlook-Zugang (GetObject/CreateObject), RuleActions.Stop
      modDialog          MsgBox-Rückfragen
      modLayout          (vom Build erzeugt) Blattnamen, Namen, Beschriftungen, Spalten (auch Blatt Ordner, OSP_*, OS_*)
    vba_test/            nur Testvariante: modOlZugang/modDialog ersetzt, Attrappe (clsAt*, modAttrappe),
                         modAttrappeDaten wird aus dem Export erzeugt; clsAtAdr/clsAtPa: AddressEntry mit
                         PropertyAccessor und Eintragsarten (siehe Tests)
```

Knöpfe (Formen mit Makro): „Regeln aus Outlook lesen“ → `modUmbau.RegelnLesen`, „Vorschau“ → `modUmbau.Vorschau`,
„Ausführen …“ → `modUmbau.Ausfuehren`; Blatt Ordner: „Vorschau“ → `modOrdner.OrdnerVorschau`, „Ausführen …“ →
`modOrdner.OrdnerAusfuehren`, „Regeln prüfen“ → `modOrdner.OrdnerRegelnPruefen`, „Ordner zurück …“ →
`modOrdner.OrdnerZurueck`. Kein Knopf wird im eigenen Klick gelöscht.

## Tests

- Bei jedem Build: `vba_pruefung` (Excel-Kompilierfehler), cp1252, Option Explicit, Zeilenlänge, „nur lesend außerhalb
  modOlSchreiben“ und Einzeilen-`If … Else` mit Prozeduraufruf (kompiliert LibreOffice nicht und legt dann das ganze
  Projekt still). Ein Befund bricht den Build ab.
- `test_umbau.py` baut `Regeln_Umbau_Test.xlsm` und ruft in LibreOffice die echten Makros auf. Die Attrappe bildet
  Stores, Folders (FolderPath mit %2F, Item, Add), Rules (Item nach ExecutionOrder, Create auf Platz 1, Save mit Prüfung
  wie Outlook, ExecutionOrder „einfügen“ oder „tauschen“), Rule, RuleConditions (31 Einträge in nicht sortierter
  Reihenfolge wie laut Diagnose, benannte Eigenschaften mit den Learn-Namen), RuleActions (inkl. Typ 0),
  Recipients (Add, ResolveAll, AddressEntry mit Exchange-DN) nach, befüllt mit den 43 Regeln des neuen Exports.
  Szenarien: Lesen, Vorschau, erster vollständiger Lauf und zweiter Lauf (idempotent), Erinnerungsregeln in beiden
  Reihenfolge-Arten, Sperre (Typ 0, Zugriffsfehler, Aktion Typ 0) und Freigabe, umbenannte nicht lesbare Regel,
  Kopieren blockiert (Abwesenheitsnotiz, ohne Bedingung, Ziel-Regel ohne Bedingung), Outlook-Kopie (Fall b), Verlust
  der Bedingung beim Speichern (Deaktivieren angenommen/abgelehnt), still verlorener Empfänger, alte Empfänger in
  ausgeschalteter Umleitung, Blatt umgebaut, Ziel = Quelle, Namen mit „|“ und Ausweich-Bezüge, nur benannt sichtbare
  Bedingungen (Typ 25/27), `.Folder` nur per Let, ungültige Pfade, Outlook nicht erreichbar, Fehler im Schritt,
  Save-Fehler, Plan/Outlook nach der Vorschau geändert, alle drei Rückfragen verneint, nicht auflösbare Empfänger,
  weitere Aktionen. Reihenfolge am Ende = Soll-Reihenfolge aus dem Blatt Anlegen.
  Dazu je ein Szenario zu den Befunden der Gegenprüfung: `abfang` (Sammelregel in Outlook mitten in der Liste sperrt;
  Plan setzt sie ans Ende und hebt die Sperre auf; neue Regel ohne Position hinter ihr sperrt, obwohl der Stand in
  Outlook unauffällig ist; Freigabe mit „Ja“ und Ausführen; Position nach vorn bzw. aktive Regel dahinter sperrt;
  ausgeschaltete Regel ohne Bedingung in der Mitte nur mit Bestätigung), `ohne_bed` (Hinweis in der Vorschauzeile,
  Ergebnis „erledigt (geprüft, ohne sichtbare Bedingung)“), `werte_roh` (Leerzeichen am Rand bleiben bei Wörtern,
  Ausnahmen und neuer Regel erhalten), `lesefehler` (Aktiv, Nur lokal, Regeltyp, Reihenfolge), `kopie_quelle`
  (Outlook-Kopie mit nicht lesbarer Quelle bzw. fehlendem Quellpostfach), `ziel_alias` (Quellpostfach unter anderem
  Anzeigenamen als Ziel), `ausnahmen_abw_nein`/`_ja` (nach dem Speichern fehlen nur Ausnahmen, Vorgabe Nein) und
  `meldung` (MsgBox-Grenze, voller Text im Protokoll, Wichtiges vorn). Zur zweiten Gegenprüfung: `neu_ausverlust_ja`/
  `_nein` (neu angelegte Regel verliert beim Speichern ihre Ausnahmen: eine Rückfrage mit Vorgabe Ja und Text „neu
  angelegte Regel greift breiter als die Vorlage“, nicht „frühere Ausnahmen alle da“), `lage_neu` (während Rückfrage 3
  rückt die Sammelregel in Outlook vor aktive Regeln bzw. wird eine Regel nicht lesbar: gesperrt, Stand Zielpostfach
  neu, ohne Schreibzugriff; mit „Ja“ vierte Rückfrage mit Vorgabe Nein, verneint bzw. bejaht), `rueckfrage_lang`
  (Rückfrage 3 mit drei langen nicht lesbaren Regeln und Freigabe: höchstens 1000 Zeichen, beide Warnungen und „Jetzt
  ausführen?“ sichtbar, voller Text im Protokoll); erweitert: `werte_roh` (neues Wort `"  Eskalation "` wird getrimmt
  geschrieben), `abfang` (Lesen mit „Ja“ meldet „freigegeben“; keine vierte Rückfrage bei unveränderter Lage),
  `ohne_bed` und `voll` (Kennzeichnung in der Liste der Änderungen). Die Attrappe kann dafür Regeln umsetzen
  (`AtPlatz`), Lesefehler je Eigenschaft auslösen (`AtLeseFehler`), beim Speichern Ausnahmen verlieren (`ausverlust`),
  das Makler-Postfach umbenennen (`anzeigename`) und den gespeicherten Stand während einer Rückfrage ändern
  (`beifrage`: „n|platz|Regel|Platz“ bzw. „n|bedfehler|Regel|“); die Test-Rückfragen protokollieren die Vorgabe der
  MsgBox. Zum Befund aus echtem Outlook (Plan 2.2: Zeile 10 meldete 10 von 36 Absendern „nicht auflösbar“, Zeile 11
  „Microsoft Outlook“): Das Verzeichnis der Attrappe kennt je Eintrag eine Art (`AtVzArt`) – `pa` (kein
  ExchangeUser/-DistributionList, SMTP nur über `PropertyAccessor` PR_SMTP_ADDRESS, Name nicht auflösbar; so die acht
  VL-Verteiler), `dn` (nur Exchange-DN, nur per DN auflösbar; „KBI VH Muenchen - Gruppenpostfach“), `tot` (über nichts
  auflösbar; „Microsoft Outlook“); `AtAusEmpfDn` legt im Ziel einen schon vorhandenen Absender an, der nur als DN
  lesbar ist. `ResolveAll` lässt wie Outlook schon aufgelöste Empfänger stehen. Szenarien `aufloesen` (alle 36
  Absender, Umleiten an einen nur per DN auflösbaren Empfänger und `KOPIEREN` mit PR_SMTP-Absender: bereit, ausgeführt,
  Nachprüfung „erledigt (geprüft)“, zweiter Lauf „schon erledigt“, DN-Weg im Protokoll), `ziel_dn` (vorhandener
  DN-Eintrag zählt als vorhanden, kein Doppel) und `ueberspringen` (Meldung mit Typ/Adresse nur für „Microsoft
  Outlook“, Spalte L bei UMLEITEN blockiert, Spalte L mit nicht treffendem Eintrag, eigene Rückfrage verneint/bejaht,
  Ergebnis, Protokoll, E - KWAD ohne leere Absender-Ausnahme, zweiter Lauf). Gegenprobe: dieselben drei Szenarien mit
  den VBA-Modulen von Plan 2.1 schlagen fehl (die Vorschau meldet dort genau die zehn Namen aus dem echten Outlook).
  Zum Befund aus echtem Outlook mit Plan 2.2 (Zeile 3 brach mit „Mindestens eine Regel kann aufgrund von ungültigen
  Aktionen oder Bedingungen nicht gespeichert werden.“ ab): Die Attrappe prüft wie Outlook schon beim Einschalten einer
  Regel (`clsAtRegel.Enabled = True`) und bei `Rules.Save`, ob eine eingeschaltete Verschieben-/Kopieren-Aktion ohne
  Ordner ist, und wirft dann genau diese Meldung; Schalter `einschaltfehler` (Regelname) lässt das Einschalten einer
  Regel aus einem anderen Grund scheitern. Szenario `einschalten` (Zeilen 1–4, Ordner fehlt vorher): erledigt, neue
  Regel gespeichert aktiv mit Ziel `Archiv\Automatische Antworten`, `Rule.Enabled = Ja` genau einmal nach
  `Folders.Add` und vor `Rules.Save`, Nachprüfung ohne Abweichung; spätes Einschalten scheitert → Fehler bei Zeile 3,
  kein Save; Zuweisen scheitert → Fehler bei der vormerkenden Zeile 1. Gegenprobe: mit den VBA-Modulen von Plan 2.2
  scheitert das Szenario (und `voll`) mit genau der Meldung aus dem echten Outlook („Fehler: Mindestens eine Regel …“,
  „Es wurden keine Ordner angelegt“).
  Ordner-Umstellung (Plan 3.0): Die Attrappe kennt jetzt Ordner mit Elternordner (FolderPath ergibt sich daraus, nach
  einem Verschieben also der neue Pfad), feste EntryID, `Folder.MoveTo`, `Folder.Name` setzen und `Folders.Add` (zählen
  als Schreibzugriff, schon vergebener Name im Zielordner wirft wie Outlook), Regeln halten den Ordner selbst (wie die
  EntryID). Variante `ordner` von `AtStart` baut den Ordnerbaum beider Postfächer wie in den Screenshots (Bestand im Stand
  nach Plan 2.3). Schalter `verschiebefehler`/`umbenennfehler` (Ordnername), `eidwechsel` (MoveTo vergibt neue
  EntryIDs, die Regeln verlieren den Ordner). Szenarien: `ordner_vorschau` (47 Zeilen bereit, nichts geschrieben,
  Regeln je Zeile aus dem Export, Regel aus dem anderen Postfach, Ziele in Unterordnern, Hinweis statt Alarm für die
  ausgeschaltete Makler-Regel ohne Ordner), `ordner_voll` (erst Regelplan 1–11 wie beim Nutzer, dann alle 47 Zeilen:
  24 MoveTo, 24 Umbenennungen, 12 Ordner, kein Rules.Save; Ordnerbäume = Plan, Regeln beider Postfächer sonst
  unverändert und mit neuen Pfaden, Ordner-Sicherung, Rückfrage; zweiter Lauf „schon erledigt“/„Nichts zu tun“;
  Regelplan danach Zeilen 1–11 „schon erledigt“ mit Umzugs-Hinweis; „Regeln prüfen“), `ordner_name` (abweichender Name
  blockiert mit ähnlichem Namen, gleichnamiger Ordner an anderer Stelle, unbekanntes Postfach), `ordner_konflikt`
  (Namenskonflikt, Zwischenschritt, falsche Aktion, Standardordner, fremdes Postfach), `ordner_fehler` (Verschieben bzw.
  Umbenennen scheitert mitten im Lauf: Stopp, Meldung was umgezogen ist, Regeln geprüft, „Ordner zurück“ stellt alles
  her), `ordner_zurueck` (Rückfrage verneint, inzwischen veränderter Ordner blockiert vorab, dann voller Rückweg: Bäume und
  Regeln wie vorher, Gruppenordner bleiben leer stehen), `ordner_eid` (neue EntryID: Stopp nach dem ersten Umzug, die
  Regeln ohne Ordner deutlich gemeldet, „Ordner zurück“ über die nachgetragene EntryID) und `ordner_ablauf` (ohne
  Vorschau, Plan bzw. Outlook nach der Vorschau geändert, Blatt umgebaut). Gegenprobe: ohne den Aufruf von
  `UmzugPfad` in `modPlan` scheitert `ordner_voll` – der Regelplan will nach der Umstellung `Archiv\Automatische
  Antworten` neu anlegen.
  Stand: 49 Szenarien, 361 Prüfungen. LibreOffice gibt beim Schließen einer Mappe mit VBA-Projekt nicht allen
  Speicher frei (etwa 160 MB je Laden; nach rund 70 Ladevorgängen beendet der Speicherwächter `soffice.bin`), darum
  startet `test_umbau.py` LibreOffice nach je 20 Ladevorgängen neu (`LADUNGEN_JE_START`).

### Nicht testbar ohne echtes Outlook

- Ob `Rules.Save` Bedingungen, die das Objektmodell nicht liefert (z. B. in Outlook im Web angelegt), unverändert
  lässt – deshalb Export, Sperre bzw. Bestätigung.
- Ob das Setzen von `ExecutionOrder` einfügt oder tauscht (beides nachgebildet; das Makro setzt die Reihenfolge
  ausdrücklich und prüft sie).
- Ob `.Folder` spät gebunden per Set oder per Let angenommen wird (beides eingebaut und gegen die Attrappe getestet).
- Welche Zugriffe außer `Rule.Enabled = True` und `Rules.Save` Outlook eine Regel prüfen lassen (etwa das Setzen von
  `ExecutionOrder` oder von `MoveToFolder.Enabled` ohne Ordner). Microsofts Beispiel zu `Rules.Create` schaltet die
  Aktion vor dem Zuweisen des Ordners ein, das ist also zulässig; das Makro hält trotzdem bei fehlendem Zielordner
  Aktion und Regel bis nach dem Zuweisen aus, so dass auch `ExecutionOrder` (Platz der neuen Regel,
  `ReihenfolgeAngleichen`) nur eine ausgeschaltete Regel ohne eingeschaltete Ordner-Aktion ohne Ordner berührt.
- Welche Kandidaten Outlook für die zehn Absender aus dem Befund tatsächlich liefert (PR_SMTP_ADDRESS bei dynamischen
  Verteilern, Exchange-DN bei „KBI VH Muenchen - Gruppenpostfach“) und ob `Session.CreateRecipient(<DN>).Resolve`
  einen Exchange-DN auflöst – die Attrappe bildet beides nach, belegt ist es nur im echten Outlook. „Microsoft Outlook“
  (Systemabsender, oft im Adressbuch ausgeblendet) bleibt womöglich unauflösbar: Die Vorschau nennt dann Adresstyp und
  Adresse; entweder in Spalte L überspringen (Ausnahme für diesen Absender von Hand setzen) oder Zeile auf Nein.
- `AddressEntry.PropertyAccessor` und `Address` können die Sicherheitsabfrage von Outlook (Object Model Guard) auslösen.
- `RuleActions.Stop`: LibreOffice erlaubt keinen Klassenmember „Stop“; die Testvariante ersetzt den Einzeiler
  `modOlZugang.AktionStop`. Ebenso ersetzt sie `OutlookHolen` und die MsgBox-Rückfragen.
- Sicherheitsabfragen von Outlook (Object Model Guard) beim Lesen von Empfängeradressen und Rückfragen beim Speichern.
- Darstellung in Excel (gerendert wurde mit LibreOffice; Aptos fehlt dort und wird ersetzt).
- Ordner-Umstellung, nur gegen die Attrappe geprüft: ob `Folder.MoveTo` im Gruppenpostfach (Exchange, freigegebenes
  Postfach) die EntryID behält und die Regeln danach wirklich auf den neuen Pfad zeigen (Microsoft-Doku: Regeln speichern
  den Ordner per EntryID; das Makro prüft es nach jedem Schritt und nach dem Lauf und stoppt bei einer neuen EntryID);
  ob die Berechtigungen im Gruppenpostfach Verschieben, Umbenennen und Anlegen erlauben (sonst Fehler → Stopp mit
  Meldung); wie Outlook einen schon vergebenen Namen beim Verschieben behandelt (die Vorschau verhindert den Fall);
  wie lange `MoveTo` großer Ordner dauert; ob ein Bot einen der Ordner über den Pfad anspricht (darum bleiben die
  genannten Ordner unberührt); ob ein stehen gebliebener Gruppenordner wirklich leer ist (das Makro zählt bei „Ordner
  zurück“ nur Unterordner, keine Mails).
