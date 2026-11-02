# BÜ-Prüf-Bot — Prozess-Sollbild, FRQ & Mail (Stand 06.07.2026)

Arbeitsstand für die Anmeldung des Blue-Prism-Prüf-Bots beim Robotics Competence Center (Tanja Juraschek / Fabian Stoll).

## Inhalt

| Datei | Zweck |
|---|---|
| `BUE_Pruefbot_Prozess.docx` | Word: Prozessbild (eingebettet) + editierbare Prüfschritt-Tabelle (6–16) + Phasenbeschreibung 1–6 + Celonis-Werteliste |
| `BUE_Pruefbot_Prozess.pdf` | 2-seitige PDF: Prozess-Sollbild + Detailtabelle |
| `BUE_Pruefbot_Prozessschritte.xlsx` | Excel: alle Prozessschritte 1–18 (Nr · Schritt · Beschreibung · System · Ergebnis Ja/Nein · Durchführung · Automatisierung · Kriterien-Typ · Phase) + Blatt „Prozessphasen" (1–6) + Blatt „Celonis-Übergabedatensatz" |
| `BUE_Pruefbot_Prozessbild.png/.svg` | Prozessbild als Bild bzw. editierbarer Vektor |
| `BUE_Pruefbot_Detailtabelle.svg` | Detailtabelle der Prüfschritte 6–16 als Vektor |
| `1. FRQ-2026_BUE-Pruefbot.docx` | Befüllter Prozessfragebogen (nur Blue-Prism-Prüfteil; Basis: `../1. FRQ-2026.docx`) |
| `Mail_Robotics_CC_BUE_Pruefbot.txt/.eml` | Mail-Entwurf an das RCC (EML öffnet in Outlook als Entwurf, Anhänge eingebettet) |
| `BUE_Pruefbot_Zielprozess_Schritt_fuer_Schritt.txt` / `.eml` | Schritt-für-Schritt-Erklärung des Zielprozesses (fachlich + technisch); TXT zum Kopieren, EML als fertige Team-Mail (Aptos, echte Bullets, Prozessbild inline) |
| `quellen/` | Python-Quellskripte zum Regenerieren |

## Kernaussagen des Sollbilds

- Eingang (Zielprozess): Die BÜ-Mail geht wie bisher ein, wird aber an das neue Gruppenpostfach `bustrukturierung@ergo.de` umgeleitet. Dort strukturiert ein Celonis Action Workflow die Mail, erzeugt KI-Deckblatt (je Vorgang) + Excel (über alle Vorgänge) und übergibt die Daten zum Prüfen an Robotics. Das ersetzt die heutige manuelle, unstrukturierte Indizierung.
- Celonis (KI-Deckblatt) deckt Prüfschritte 1–5 ab; der Bot macht nur die System-Prüfungen 6–16. Schritt 9 (VVR) bleibt manuell (HITL).
- Am Ende erstellt der Bot ein digitales Prüfdeckblatt (Ergebnis aller Prüfungen je Vertrag).
- Kriterien-Matrix (definiert das Fach): hart verletzt = automatische Absage mit Begründung; weich verletzt = manuelle Prüfung (Idee: Robotics Cockpit — Machbarkeit durch RCC zu prüfen); optional = nur Vollständigkeit.
- Postkorb über EMWS mit zwei Weichen: abgelehnt → Direktablagekennzeichen → direkt archiviert; positiv → Postkorbvorgang mit allen Prüfinformationen + Notiz (belädt den bestehenden BÜ-Bot).
- Übergabe an den BÜ-Bot in zwei Stufen: Phase 1 (heute) = Notiz als Entwurf für den Sachbearbeiter, Freigabe durch Mensch (HITL); Zielbild = richtig geprüfte Vorgänge direkt an den Roboter über einen IKS-Prozess.
- Offene Punkte: Übergabepunkt (ERGO Datapool, SharePoint oder anderes — Ansprechpartner Celonis: Stefan Schwarz), Hostsystem-Zugriffsart, Zielsystem der Notiz, Versandweg der harten Absage, Erst-Segment (Pilot). Go-Live-Ziel: Jahresende 2026.

## Regenerieren

```bash
cd quellen
python3 svg_bpmn.py                     # erzeugt bue_pruefbot.svg (Prozessbild)
python3 svg_table.py                    # erzeugt table.svg (Detailtabelle)
python3 build_bpmn_docx.py              # erzeugt BUE_Pruefbot_Prozess.docx (braucht bue_pruefbot_hi.png)
python3 build_zielprozess.py           # erzeugt Zielprozess-TXT + EML (braucht BUE_Pruefbot_Prozessbild.png)
python3 build_prozess_excel.py         # erzeugt BUE_Pruefbot_Prozessschritte.xlsx (alle Schritte + Phasen + Celonis-Datensatz)
python3 fill_frq.py && python3 sipoc_fill.py   # befüllt den FRQ (braucht FRQ-2026_original.docx)
```

PNG/PDF aus SVG: `cairosvg` (`svg2png` / `svg2pdf`), Seiten mit `pypdf` mergen.
