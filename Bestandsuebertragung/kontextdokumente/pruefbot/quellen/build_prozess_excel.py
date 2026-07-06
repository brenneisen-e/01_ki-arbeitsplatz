# -*- coding: utf-8 -*-
"""BÜ-Prüf-Bot — alle Prozessschritte als Excel (mehrere Tabellenblätter).
Blatt 1  'Prüfschritte'            = alle 18 Schritte (Nr · Schritt · Beschreibung · System · Ergebnis Ja/Nein · Durchführung · Automatisierung · Kriterien-Typ · Phase)
Blatt 2  'Prozessphasen'           = die 6 Phasen (Ziel · Kernpunkte · Systeme)
Blatt 3  'Celonis-Übergabedatensatz' = extrahierte + interpretierte Werte des KI-Deckblatts
Erzeugt BUE_Pruefbot_Prozessschritte.xlsx."""
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# --- ERGO-Farben ---
GREEN   = "046A38"
GREEN2  = "26890D"
ZEBRA   = "F4F7F4"
HEADTXT = "FFFFFF"
DARK    = "1A1A1A"
GREY    = "53565A"
JA      = "1D6B2F"
NEIN    = "8A2B1F"
CEL     = "0B6BA8"   # Celonis-Schritte blau markieren
HAIR    = "C9CDD1"

thin = Side(style="thin", color=HAIR)
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)
TOP_WRAP  = Alignment(horizontal="left", vertical="top", wrap_text=True)
CTR_WRAP  = Alignment(horizontal="center", vertical="top", wrap_text=True)
FONT_NAME = "Calibri"

def style_header(ws, ncols, row):
    for c in range(1, ncols + 1):
        cell = ws.cell(row=row, column=c)
        cell.fill = PatternFill("solid", fgColor=GREEN)
        cell.font = Font(name=FONT_NAME, bold=True, color=HEADTXT, size=11)
        cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
        cell.border = BORDER

def put(ws, r, c, value, color=DARK, bold=False, align=TOP_WRAP, size=10, zebra=False):
    cell = ws.cell(row=r, column=c, value=value)
    cell.font = Font(name=FONT_NAME, bold=bold, color=color, size=size)
    cell.alignment = align
    cell.border = BORDER
    if zebra:
        cell.fill = PatternFill("solid", fgColor=ZEBRA)
    return cell

# ======================================================================
# Datengrundlage: alle 18 Prüf-/Prozessschritte
# Felder: nr, schritt, beschreibung, system, ja, nein, durchfuehrung, automatisierung, krit, phase
# ======================================================================
BOT = "Blue-Prism-Prüf-Bot"
CELON = "Celonis (KI-Deckblatt)"
SB = "Sachbearbeiter (manuell)"
BUEBOT = "Bestehender BÜ-Bot"

SCHRITTE = [
 # 1-5  Celonis / KI-Deckblatt  (Phase 2)
 (1, "BÜ-Wunsch vorhanden?",
  "Ist in der eingegangenen Mail überhaupt ein Bestandsübertragungs-Wunsch erkennbar?",
  "Celonis (KI-Deckblatt) · Image/Jadice (OCR)",
  "BÜ-Wunsch erkannt: Vorgang wird als BÜ klassifiziert und weitergeleitet.",
  "Kein BÜ-Wunsch: Vorgang wird ans Eingangsmanagement umgeroutet (Umindizierung). Ende.",
  CELON, "automatisch", "hart (Einstieg)", "2"),
 (2, "Maklervollmacht (MV) — formal",
  "Liegt eine Maklervollmacht vor und ist sie formal gültig (auf den Makler ausgestellt, vorhanden)?",
  "Celonis (KI-Deckblatt) · Image/Jadice (OCR)",
  "MV vorhanden und formal gültig: weiter.",
  "MV fehlt oder formal unvollständig: Klärung bzw. Absage an den Makler.",
  CELON, "automatisch", "durch Fach zu definieren", "2"),
 (3, "Maklervollmacht (MV) — inhaltlich",
  "Ist die MV inhaltlich vollumfänglich (keine Einschränkungen, die der BÜ entgegenstehen)?",
  "Celonis (KI-Deckblatt)",
  "MV vollumfänglich: weiter.",
  "MV eingeschränkt / nur teilweise: manuelle Klärung.",
  CELON, "automatisch", "durch Fach zu definieren", "2"),
 (4, "Pool / Untervollmacht",
  "Bei Pool- oder Untervermittler-Konstellation: liegt eine gültige Untervollmacht vor?",
  "Celonis (KI-Deckblatt)",
  "Untervollmacht vorhanden oder nicht erforderlich: weiter.",
  "Untervollmacht fehlt: Klärung.",
  CELON, "automatisch", "durch Fach zu definieren", "2"),
 (5, "Unterschriften",
  "Sind die erforderlichen Unterschriften (Kunde und/oder Makler) auf der MV vorhanden?",
  "Celonis (KI-Deckblatt) · Image/Jadice (OCR)",
  "Erforderliche Unterschriften vorhanden: weiter.",
  "Unterschrift fehlt: Klärung bzw. Absage.",
  CELON, "automatisch", "durch Fach zu definieren", "2"),
 # 6-16  Blue Prism  (Phase 3)
 (6, "Vertrag aktiv?",
  "Ist der betroffene Vertrag noch in Bestand (nicht beendet / historisch)?",
  "Scout (Vertragsstatus / Beendigungsdatum) · SV001 (KOM·LEB)",
  "Status „aktiv“ und kein Beendigungsdatum: BÜ ist möglich, der Vorgang läuft weiter.",
  "Vertrag beendet oder historisch: Aussteuerung, keine BÜ.",
  BOT, "automatisch", "durch Fach zu definieren", "3"),
 (7, "Vertrags-Identität",
  "Ist der Unterzeichner der MV der Versicherungsnehmer des Vertrags? (Abgleich Deckblatt-Name und System-VN)",
  "IS100 · Scout",
  "VN aus der MV stimmt mit dem System-VN überein, der Vorgang läuft weiter.",
  "VN und Unterzeichner weichen ab: Klärung, gegebenenfalls Aussteuerung.",
  BOT, "automatisch", "durch Fach zu definieren", "3"),
 (8, "Vermittler-Status & Bestandstyp",
  "Ist der Vermittler systemseitig Makler / Koop / MFA / AO – oder Sonderbestand (Mitarbeiter / Eigen / Gruppe KV180 / bKV)?",
  "OB726 · OB510 · KV050 (KV) / VA210 (KOM·LEB)",
  "Makler bzw. MFA und kein Sonderbestand, der Vorgang läuft weiter.",
  "Sonderbestand: fallspezifische, manuelle Bearbeitung.",
  BOT, "automatisch", "durch Fach zu definieren", "3"),
 (9, "Untermakler im VVR (Vermittlerregister)",
  "Ist der Untermakler im Vermittlerregister als Makler eingetragen? (Robots laut VVR-AGB nicht erlaubt, daher manuell am Ende)",
  "VVR (extern, keine API) · ggf. Großmakler-Whitelist",
  "Im VVR als Makler geführt oder auf der Whitelist: der Sachbearbeiter bestätigt (klickt OK).",
  "Nicht als Makler eingetragen: Klärung oder Ablehnung.",
  SB, "manuell (HITL)", "durch Fach zu definieren", "3"),
 (10, "Hinterlegte MV / VA250 (situativ)",
  "Ist bereits eine andere / ältere MV hinterlegt oder ein Vermittler zu bereinigen?",
  "VA250 (LEB) · PDB (KV)",
  "Keine konkurrierende MV und saubere Hinterlegung, der Vorgang läuft weiter.",
  "Ältere oder andere MV bzw. zu löschender Eintrag: manuelle VA250-Bereinigung.",
  BOT, "automatisch", "durch Fach zu definieren", "3"),
 (11, "Widerruf-Check (situativ)",
  "Liegt ein Kunden- / Makler-Widerruf zur VNR oder ein widersprüchlicher Verbund vor?",
  "Scout · Image/Jadice",
  "Kein Widerruf und kein Widerspruch, der Vorgang läuft weiter.",
  "Widerruf oder Widerspruch vorhanden: BÜ abbrechen, Aussteuerung.",
  BOT, "automatisch", "durch Fach zu definieren", "3"),
 (12, "Umfang & weitere Verträge / VNRs",
  "Umfang des BÜ-Wunschs: einzelne VNR oder gesamte Kundenverbindung? Weitere VNRs / Verbünde des Kunden (Mehrfach-Verbund)? Alle auf dieselbe Agenturnummer?",
  "Scout (Außendienstübersicht)",
  "Gesamte Kundenverbindung gewünscht oder weitere VNRs vorhanden: der Bot ermittelt alle Verträge / VNRs / Verbünde des Kunden und durchläuft die Prüfung 6–16 je Vertrag (gleiche AGT).",
  "Nur die genannte VNR gewünscht und keine weiteren Verbünde: nur dieser Vorgang.",
  BOT, "automatisch", "durch Fach zu definieren", "3"),
 (13, "Agenturnummer aktiv?",
  "Ist die genannte AGT aktiv (inkl. „alte“ AgNr vor ZAV), Stammdaten korrekt, als Makler / MfA angebunden?",
  "OB726 · OB510 · OB735 (Bot-Sicht)",
  "AGT aktiv und angebunden: Übertrag auf diese AGT.",
  "AGT inaktiv oder Zahlendreher: Übertrag auf unbesetzte AGT bzw. Klärung.",
  BOT, "automatisch", "durch Fach zu definieren", "3"),
 (14, "Rahmenvertrag / BÜ-Sperre (situativ · KOM·LEB)",
  "Liegt eine BÜ-Sperre via Rahmenvertrag / Sonderkondition (z. B. Rechtsschutz) vor?",
  "Scout (Versicherungsart) · SV001 (Feld „BÜ möglich“)",
  "Keine Sperre und „BÜ möglich“ ist gesetzt, der Vorgang läuft weiter.",
  "Sperre vorhanden oder unklar: Rücksprache mit der Sparte, gegebenenfalls Ablehnung.",
  BOT, "automatisch", "durch Fach zu definieren", "3"),
 (15, "Provisionshaftung",
  "Liegt eine offene Provisionshaftung (Vorvermittler) vor, die der BÜ entgegensteht?",
  "KV050 (KV · manuell SB) · BÜ-Bot (LEB)",
  "Keine offene Haftung, der Vorgang läuft weiter.",
  "Offene Haftung: Übertragung nicht möglich, Routing gemäß Richtlinie.",
  BOT + " / SB (KV)", "teils automatisch / teils manuell", "durch Fach zu definieren", "3"),
 (16, "Korrespondenzadresse Makler (KOM·LEB)",
  "Korrespondenz- / Mailadresse des Maklers für das Bot-Ausgangsschreiben ermitteln.",
  "OB729 (via OB510 / PF20) · DiOrg/SAP (Backup)",
  "Adresse ermittelt, sie wird für die Maklerinformation verwendet.",
  "Keine Adresse in OB729: Backup über DiOrg/SAP (KV: Mail über Kontext).",
  BOT, "automatisch", "optional (Vollständigkeit)", "3"),
 # 17-18  Ausführung  (Phase 6)
 (17, "Übertragung ausführen (bestehender BÜ-Bot)",
  "Der positive, geprüfte Vorgang wird an den bestehenden BÜ-Bot übergeben und die Bestandsübertragung ausgeführt; bei AO-Bestand mit 72h-Vorabinformation.",
  "BÜ-Bot · 1515 (KOM·LEB) / BeMaS 2011 (KV)",
  "Übertragung technisch ausgeführt.",
  "Fehler bei der Ausführung: manuelle Nachbearbeitung.",
  BUEBOT, "automatisch (Phase 1 nach SB-Freigabe; Zielbild direkt via IKS)", "—", "6"),
 (18, "Bot-Ergebnis-QS & Maklerinformation",
  "Qualitätssicherung des Bot-Ergebnisses und Information des Maklers über den Abschluss.",
  "Bot-QS · Contex (Maklerinformation)",
  "Ergebnis in Ordnung, Makler informiert, Vorgang abgeschlossen.",
  "Abweichung festgestellt: manuelle Nachbearbeitung.",
  BUEBOT, "automatisch", "—", "6"),
]

COLS = [
 ("Nr.", 5),
 ("Prozessschritt", 26),
 ("Beschreibung / Was wird geprüft?", 50),
 ("Quellsystem(e)", 30),
 ("Ergebnis „Ja“ (Merkmal erfüllt)", 42),
 ("Ergebnis „Nein“ (Merkmal nicht erfüllt)", 42),
 ("Durchführung", 20),
 ("Automatisierung", 20),
 ("Kriterien-Typ (Matrix)", 22),
 ("Phase", 7),
]

wb = Workbook()

# ---------------------------------------------------------------- Blatt 1
ws = wb.active
ws.title = "Prüfschritte"
ws.sheet_view.showGridLines = False

# Titelzeile
ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(COLS))
t = ws.cell(row=1, column=1, value="BÜ-Prüf-Bot — alle Prozessschritte (1–18)")
t.font = Font(name=FONT_NAME, bold=True, size=15, color=GREEN)
t.alignment = Alignment(horizontal="left", vertical="center")
ws.row_dimensions[1].height = 24

ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=len(COLS))
s = ws.cell(row=2, column=2 - 1, value=(
    "Schritte 1–5: Celonis (KI-Deckblatt). Schritte 6–16: Blue-Prism-Prüf-Bot (Schritt 9 manuell, HITL). "
    "Schritte 17–18: bestehender BÜ-Bot. Die Spalte „Kriterien-Typ (Matrix)“ wird fachlich durch HS / KBI / ODPB "
    "(hart / weich / optional) definiert."))
s.font = Font(name=FONT_NAME, italic=True, size=9.5, color=GREY)
s.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
ws.row_dimensions[2].height = 28

# Kopfzeile
HROW = 3
for i, (name, _) in enumerate(COLS, start=1):
    ws.cell(row=HROW, column=i, value=name)
style_header(ws, len(COLS), HROW)
ws.row_dimensions[HROW].height = 30

# Datenzeilen
for ri, row in enumerate(SCHRITTE):
    r = HROW + 1 + ri
    zeb = (ri % 2 == 1)
    nr, schritt, besch, system, ja, nein, durch, auto, krit, phase = row
    step_color = CEL if durch == CELON else (GREEN if durch.startswith(BOT) else DARK)
    put(ws, r, 1, nr, color=GREEN, bold=True, align=CTR_WRAP, zebra=zeb)
    put(ws, r, 2, schritt, color=step_color, bold=True, zebra=zeb)
    put(ws, r, 3, besch, zebra=zeb)
    put(ws, r, 4, system, color=GREY, zebra=zeb)
    put(ws, r, 5, ja, color=JA, zebra=zeb)
    put(ws, r, 6, nein, color=NEIN, zebra=zeb)
    put(ws, r, 7, durch, zebra=zeb)
    put(ws, r, 8, auto, zebra=zeb)
    put(ws, r, 9, krit, color=GREY, zebra=zeb)
    put(ws, r, 10, phase, align=CTR_WRAP, zebra=zeb)

for i, (_, w) in enumerate(COLS, start=1):
    ws.column_dimensions[get_column_letter(i)].width = w
ws.freeze_panes = "A4"
ws.auto_filter.ref = f"A{HROW}:{get_column_letter(len(COLS))}{HROW + len(SCHRITTE)}"

# ---------------------------------------------------------------- Blatt 2
ph = wb.create_sheet("Prozessphasen")
ph.sheet_view.showGridLines = False
PHASEN = [
 ("1", "E-Mail-Eingang bei ERGO / Umleitung an die Strukturierung",
  "Die BÜ-Anfrage kommt herein und wird der automatischen Strukturierung zugeführt.",
  "• BÜ-Anfrage geht wie bisher per Mail ein\n"
  "• Umleitung an das neue Gruppenpostfach bustrukturierung@ergo.de\n"
  "• Dort sitzt der Action Workflow von Celonis (Ablösung der heutigen manuellen, unstrukturierten Indizierung)",
  "Outlook · Gruppenpostfach bustrukturierung@ergo.de · Celonis Action Workflow"),
 ("2", "Strukturierung durch den Celonis Action Workflow",
  "Aus der Mail entsteht ein strukturierter, maschinenlesbarer Vorgang, der an Robotics übergeben wird.",
  "• OCR der Dokumente, Anreicherung Partnerdaten\n"
  "• Zwei Artefakte: KI-Deckblatt (je Vorgang) + Excel (über alle Vorgänge)\n"
  "• Deckblatt deckt Prüfschritte 1–5 ab\n"
  "• Weiche BÜ-Wunsch? Nein → zurück ans Eingangsmanagement; Ja → Übergabe an Robotics\n"
  "• Übergabepunkt offen (ERGO Datapool, SharePoint oder anderes) — Ansprechpartner: Stefan Schwarz",
  "Celonis · Image/Jadice (OCR) · EMMA (PNR / Partnerdaten)"),
 ("3", "Prüf-Bot: Einzelprüfung & digitales Prüfdeckblatt (Blue Prism)",
  "Jeder Vorgang wird vollständig und regelbasiert gegen die Hostsysteme geprüft.",
  "• Bot übernimmt den Vorgang (einzelne VNR oder gesamte Kundenverbindung → alle VNRs)\n"
  "• System-Prüfschritte 6–16 je Vertrag\n"
  "• Schritt 9 (VVR) manuell durch den Sachbearbeiter (HITL)\n"
  "• Bot erstellt das digitale Prüfdeckblatt (Ergebnis aller Prüfungen 1–16 je Vertrag)",
  "Blue Prism · Scout · IS100 · OB726/510/735/729 · KV050 · VA210/250 · PDB · SV001 · DiOrg/SAP"),
 ("4", "Kriterien-Matrix & Cockpit (Human-in-the-Loop)",
  "Automatische Entscheidung, wie mit dem Vorgang zu verfahren ist. Grundlage: fachlich definierte Matrix (hart / weich / optional).",
  "• Hart verletzt → automatische Absage mit Begründung an den Makler\n"
  "• Weich verletzt → geflaggt, manuelle Prüfung (Idee: Robotics Cockpit — Machbarkeit durch RCC zu prüfen)\n"
  "• Alle erfüllt oder nur optionale verletzt → positiver Vorgang",
  "Robotics Cockpit (Idee) · Kriterien-Matrix (HS / KBI / ODPB)"),
 ("5", "Postkorb über EMWS (zwei Weichen)",
  "Für jeden Vorgang wird der Postkorbvorgang eröffnet und ergebnisabhängig behandelt.",
  "• Postkorbvorgang wird über das EMWS eröffnet\n"
  "• Abgelehnt → Direktablagekennzeichen, direkt archiviert (Ende)\n"
  "• Positiv → Postkorbvorgang mit allen Prüfinformationen + Notiz (belädt den bestehenden BÜ-Bot)",
  "EMWS"),
 ("6", "Übergabe an den BÜ-Bot (Phase 1 vs. Zielbild)",
  "Der positive Vorgang wird ausgeführt — heute mit Freigabe, im Zielbild direkt.",
  "• Phase 1 (heute): Notiz als Entwurf für den Sachbearbeiter; Freigabe durch den Menschen (HITL)\n"
  "• Zielbild: richtig geprüfte Vorgänge direkt an den Roboter über einen IKS-Prozess\n"
  "• Ausführung durch den bestehenden BÜ-Bot (1515 KOM·LEB / BeMaS 2011 KV, 72h-Vorabinfo bei AO)\n"
  "• Abschluss: Bot-Ergebnis-QS (Schritt 18) und Maklerinformation über Contex",
  "Bestehender BÜ-Bot · IKS-Prozess (Zielbild) · Contex"),
]
PCOLS = [("Phase", 7), ("Titel", 34), ("Ziel", 40), ("Kernpunkte", 62), ("Systeme", 34)]
ph.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(PCOLS))
pt = ph.cell(row=1, column=1, value="BÜ-Prüf-Bot — Prozessphasen 1–6 (Zielprozess)")
pt.font = Font(name=FONT_NAME, bold=True, size=15, color=GREEN)
pt.alignment = Alignment(horizontal="left", vertical="center")
ph.row_dimensions[1].height = 24
for i, (name, _) in enumerate(PCOLS, start=1):
    ph.cell(row=2, column=i, value=name)
style_header(ph, len(PCOLS), 2)
ph.row_dimensions[2].height = 26
for ri, (nr, titel, ziel, kern, sys) in enumerate(PHASEN):
    r = 3 + ri
    zeb = (ri % 2 == 1)
    put(ph, r, 1, nr, color=GREEN, bold=True, align=CTR_WRAP, zebra=zeb)
    put(ph, r, 2, titel, color=GREEN, bold=True, zebra=zeb)
    put(ph, r, 3, ziel, zebra=zeb)
    put(ph, r, 4, kern, zebra=zeb)
    put(ph, r, 5, sys, color=GREY, zebra=zeb)
for i, (_, w) in enumerate(PCOLS, start=1):
    ph.column_dimensions[get_column_letter(i)].width = w
ph.freeze_panes = "A3"

# ---------------------------------------------------------------- Blatt 3
cd = wb.create_sheet("Celonis-Übergabedatensatz")
cd.sheet_view.showGridLines = False
EXTRAHIERT = ["Kunde (Name VN)","Geburtsdatum VN","Kunden-Adresse","Versicherungsnummer(n) / VNR","Sparte",
 "Kunden-/Partnernummer (KDNR/PNR aus EMMA)","VN laut MV (Name aus Maklervollmacht)","Pool (Maklerpool)",
 "Vermittler / Untervermittler","Agentur-/Personalnummer","Makler-Adresse","Auftrag-Datum (Anschreiben)",
 "MV enthalten","MV-Einschränkungen (Klartext)","Unterschrift Kunde","Unterschrift Makler"]
INTERPRETIERT = ["Vorgangstyp","Klassifikation","BÜ-Wunsch vorhanden (ja/nein)","Prüfung Unterlagen (Vollständigkeit)",
 "Reminder / Wiedervorlage","Reminder-Quelle","MV-Status","MV auf Makler ausgestellt","MV vollumfänglich (ja/teilw./nein)",
 "Untervollmacht erteilt","Mail-Zusammenfassung","Hinweis (Auffälligkeiten)","Badge BÜ-Ampel (Neue BÜ/Reminder/Keine BÜ)",
 "Badge Typ (Makler/MFA)","Badge Maklervollmacht-Status (OK/unvollständig/fehlt)"]
CCOLS = [("Nr.", 5), ("Feld", 52), ("Art", 30)]
cd.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(CCOLS))
ct = cd.cell(row=1, column=1, value="Celonis — Übergabe-Datensatz an den Prüf-Bot (KI-Deckblatt)")
ct.font = Font(name=FONT_NAME, bold=True, size=15, color=GREEN)
ct.alignment = Alignment(horizontal="left", vertical="center")
cd.row_dimensions[1].height = 24
cd.merge_cells(start_row=2, start_column=1, end_row=2, end_column=len(CCOLS))
cs = cd.cell(row=2, column=1, value=("Je Vorgang übergibt Celonis alle extrahierten Rohwerte (per OCR aus dem Dokument) "
    "und alle interpretierten Werte (KI-Klassifikation / -Ableitung)."))
cs.font = Font(name=FONT_NAME, italic=True, size=9.5, color=GREY)
cs.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
cd.row_dimensions[2].height = 22
for i, (name, _) in enumerate(CCOLS, start=1):
    cd.cell(row=3, column=i, value=name)
style_header(cd, len(CCOLS), 3)
cd.row_dimensions[3].height = 22
rr = 4
combined = [(f, "Extrahiert (OCR aus Dokument)", CEL) for f in EXTRAHIERT] + \
           [(f, "Interpretiert (KI)", GREEN2) for f in INTERPRETIERT]
for idx, (feld, art, col) in enumerate(combined):
    zeb = (idx % 2 == 1)
    put(cd, rr, 1, idx + 1, color=GREEN, bold=True, align=CTR_WRAP, zebra=zeb)
    put(cd, rr, 2, feld, zebra=zeb)
    put(cd, rr, 3, art, color=col, bold=True, zebra=zeb)
    rr += 1
for i, (_, w) in enumerate(CCOLS, start=1):
    cd.column_dimensions[get_column_letter(i)].width = w
cd.freeze_panes = "A4"
cd.auto_filter.ref = f"A3:C{3 + len(combined)}"

wb.save("BUE_Pruefbot_Prozessschritte.xlsx")
print("BUE_Pruefbot_Prozessschritte.xlsx geschrieben ·",
      len(SCHRITTE), "Schritte ·", len(PHASEN), "Phasen ·", len(combined), "Celonis-Felder")
