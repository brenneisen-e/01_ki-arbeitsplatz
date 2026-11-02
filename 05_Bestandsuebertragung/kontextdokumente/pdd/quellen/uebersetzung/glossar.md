# Übersetzungsregeln PDD Prüf-Bot Bestandsübertragung (DE → EN)

Zweck: Das englische PDD ist die Arbeitsgrundlage für nicht-deutschsprachige Entwickler. Alles, was der Roboter liest
oder schreibt, bleibt exakt wie im Original (deutsche Systeme, Masken, Feldbezeichnungen, Werte). Übersetzt wird nur
die beschreibende Prosa.

## Unverändert lassen (Zeichen für Zeichen)
- Variablen in spitzen Klammern: `<BUE_VNR>`, `<Vorgang-VNR>`, `<IS011-KNR-VN>`, `<BE-Klassifikation>`, `<Fehlerliste>` …
  Anzahl und Schreibweise müssen exakt erhalten bleiben (auch `<BUE_…>` und `<…>` in der Notation).
- Feldnamen ohne Klammern: `BUE_VNR`, `BUE_KLASSIFIKATION`, `Vorgang-Lfd-Nr`, `Feld_Format CH` usw.
- Systemnamen, Masken und Programme: OB726, OB729, GH040, VA230, IS011, IS011/VAF017, IS011/VAF121, EOS, Scout-Service,
  Celonis, EMWS, EMMA, KWAD, VDB, ErgoNotiz, ITERGO, Blue Prism, Load2Queue, Dopix, Outlook.
- Eigennamen von Bots, Postkörben, Vorlagen, Listen: Prüf-Bot, 72-Stunden-BOT, BÜ-BOT, HSB4K MV, HSB4K KO, HSB4K GR, ODPB,
  „HSB4 K BÜ Prüf BOT“, Vorlage BOT2011, Vorlage 1515 „Bestandsübertragung Robotics PB“, Sonderliste TOP-Makler,
  Themenpostkorb-Namen, Postkorb-Nr., Dokumenttyp 02015/06065, GeVo 108/469.
- ALLES innerhalb von „…“ (deutsche Anführungszeichen) bleibt unverändert: Werte („ja“, „nein“, „MFA“, „aktuell“),
  Maskennamen („Anzeigen Stammdaten“), Feldbezeichnungen („Status der Beschäftigung“, „Name 1“, „Bearbeitung nach“),
  Notizwerte („angegebene VNR beachten“), Business-Exception-Texte („Keine Zusammenarbeit“), Prüfnotizen, Kapitelnamen
  in Querverweisen („VII. Abschluss mit Befund“ – wird nachträglich maschinell ersetzt). Die Anführungszeichen „…“ selbst bleiben.
- Personennamen, Datumsangaben (tt.mm.jjjj bleibt tt.mm.jjjj), Zahlen, E-Mail-Adressen, Postkorbnummern.
- Steuerwörter WENN / DANN / SONST / SONST WENN / Ende WENN / UND / ODER am Zeilenanfang: WENN→IF, DANN→THEN, SONST→ELSE,
  SONST WENN→ELSE IF, Ende WENN→END IF, UND→AND, ODER→OR. Diese Zeilen sind meist schon vorab ersetzt; wo sie im Text
  vorkommen, genauso übersetzen. „Schleife über“→„LOOP over“, „Ende Schleife“→„END LOOP“.

## Feste Formeln
- „Lese … und speichere als <X>“ → „Read … and store as <X>“
- „Merke Prüfnotiz „…“ in <Fehlerliste>“ → „Record check note „…“ in <Fehlerliste>“ (Prüfnotiz-Text bleibt deutsch)
- „<BE-Klassifikation> = „…““ → unverändert (Wert bleibt deutsch)
- „Weiter zum Kapitel „X““ → „Continue with chapter „X““ (Kapitelname bleibt vorerst deutsch)
- „Weiter mit „X“ (unten in diesem Schritt)“ → „Continue with „X“ (below in this step)“
- „Hinweis:“ → „Note:“; „Format:“ → „Format:“; „= leer“ → „= empty“; „<> leer“ → „<> empty“; „enthält“ → „contains“
- „Öffne X mit <Y>.“ → „Open X with <Y>.“; „X starten“ → „Start X“; „Enter“ → „Enter“

## Glossar (Prosa)
Bestandsübertragung (BÜ) → portfolio transfer (BÜ) · Prüf-Bot → Prüf-Bot (Name bleibt) · Themenpostkorb → topic mailbox ·
Postkorbvorgang → mailbox case · Vorgang → case · Datenpool → data pool (als Systemname „Datenpool“ auch so belassen möglich) ·
KI-Deckblatt → AI cover sheet · Maklervollmacht → broker power of attorney (MV) · Untervollmacht → sub-power of attorney ·
Mehrfachagent (MFA) → multiple agent (MFA) · Makler → broker · Vermittler → intermediary · übernehmender Vermittler/Makler →
acquiring intermediary/broker · abgebender Bestandsinhaber → transferring portfolio holder · Versicherungsnehmer (VN) →
policyholder (VN) · Versicherungsnummer (VNR) → policy number (VNR) · Kundennummer (KNR) → customer number (KNR) ·
Agenturnummer → agency number · Vermittler-Nr. (PNR) → intermediary number (PNR) · Stammagentur → main agency ·
Anbindung / Anbindungsstatus → affiliation / affiliation status · Sparte → line of business · Business Exception (BE) → business exception (BE) ·
harte BE → hard BE · Prüfnotiz → check note · Fehlerliste (Prosa) → error list · Bearbeitungshinweis → processing note ·
Telefonnotiz / Notiz → telephone note / note · Notizmaske → note mask · Notizvorlage → note template · Ausfüllhinweis → completion guidance ·
Sachbearbeitung → case handling · Nachbearbeitung → follow-up processing · manuelle Bearbeitung → manual processing ·
Betreuungswunsch → support request (Betreuungswunsch) · BÜ-Wunsch → transfer request · Einzel-BÜ / Gesamt-BÜ → individual / entire portfolio transfer ·
gesamte Kundenverbindung → entire customer relationship · Matchcodesuche → match code search · Trefferliste → hit list ·
Einzeltreffer → single hit · Mantelvertrag (Flotte) → umbrella contract (fleet) · Rahmenvertrag → framework contract ·
Ausschlusskriterium → exclusion criterion · Vorprüfung → preliminary check · Wiederanlauf → restart · Eröffnungsdatum → opening date ·
Eingangsdatum → receipt date · Ordnungsbegriff → order key · Weiterleitung → forwarding · Aussteuerung → routing out ·
Ablehnung → rejection · Freibestand → free portfolio · Ausschließlichkeitsorganisation (AO) → tied agent organisation (AO) ·
Eingangsmanagement → inbound management · Fachbereich → business department · Robotics → Robotics · Betrieb → operations ·
Datensicherheit → data protection · Versicherungsschein → policy · Vertrag → contract · Vertragsstatus → contract status ·
Maske → screen/mask · Kopfzeile → header line · gelb markiert → highlighted in yellow · Screenshot → screenshot ·
Pflichtfeld → mandatory field · optional → optional · Werteliste → list of values · Ausprägung → value ·
Kapitel → chapter · fachlicher Kontext → business context · Schritt → step.

## Stil
Klar, technisch, kurz. Keine Erklärungen ergänzen, nichts weglassen. Deutsche Tabellenüberschriften wie „Anmerkung / remark“
(bereits zweisprachig) → nur den englischen Teil behalten („remark“), analog „Frage / Antwort / answer“ → „Question / Answer“.
