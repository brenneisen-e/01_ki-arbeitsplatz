# -*- coding: utf-8 -*-
"""BÜ-Prüf-Bot als DOCX: Seite 1 = Prozessbild (eingebettetes Bild),
Seite 2 = editierbare native Word-Tabelle (Prüfschritte 6-16). Querformat."""
from docx import Document
from docx.shared import Pt, RGBColor, Cm, Emu
from docx.enum.section import WD_ORIENT, WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from PIL import Image

GREEN=RGBColor(0x04,0x6A,0x38); DG2=RGBColor(0x26,0x89,0x0D)
DARK=RGBColor(0x1A,0x1A,0x1A); GREY=RGBColor(0x53,0x56,0x5A); WHITE=RGBColor(0xFF,0xFF,0xFF)
JA=RGBColor(0x1d,0x6b,0x2f); NEIN=RGBColor(0x8a,0x2b,0x1f)
HEADGR="046A38"; ZEBRA="F4F7F4"; FONT="Calibri"

COLS=[('Schritt',3.3),('Was wird geprüft?',6.0),('Quellsystem',3.8),
      ('Ergebnis „Ja" (Merkmal erfüllt)',7.3),('Ergebnis „Nein" (Merkmal nicht erfüllt)',7.3)]
ROWS=[
 ['6 · Vertrag aktiv?','Ist der betroffene Vertrag noch in Bestand (nicht beendet / historisch)?',
  'Scout (Vertragsstatus / Beendigungsdatum) · SV001 (KOM·LEB)',
  'Status „aktiv" und kein Beendigungsdatum: BÜ ist möglich, der Vorgang läuft weiter.',
  'Vertrag beendet oder historisch: Aussteuerung, keine BÜ.'],
 ['7 · Vertrags-Identität','Ist der Unterzeichner der MV der Versicherungsnehmer des Vertrags? (Abgleich Deckblatt-Name und System-VN)',
  'IS100 · Scout',
  'VN aus der MV stimmt mit dem System-VN überein, der Vorgang läuft weiter.',
  'VN und Unterzeichner weichen ab: Klärung, gegebenenfalls Aussteuerung.'],
 ['8 · Vermittler-Status & Bestandstyp','Ist der Vermittler systemseitig Makler / Koop / MFA / AO – oder Sonderbestand (Mitarbeiter / Eigen / Gruppe KV180 / bKV)?',
  'OB726 · OB510 · KV050 (KV) / VA210 (KOM·LEB)',
  'Makler bzw. MFA und kein Sonderbestand, der Vorgang läuft weiter.',
  'Sonderbestand: fallspezifische, manuelle Bearbeitung.'],
 ['9 · Untermakler im VVR (manuell · HITL · v.a. KV-Fall)','Ist der Untermakler im Vermittlerregister als Makler eingetragen? (Robots laut VVR-AGB nicht erlaubt, daher manuell am Ende)',
  'VVR (extern, keine API): manuelle Prüfung durch SB; ggf. Großmakler-Whitelist',
  'Im VVR als Makler geführt oder auf der Whitelist: der Sachbearbeiter bestätigt (klickt OK).',
  'Nicht als Makler eingetragen: Klärung oder Ablehnung.'],
 ['10 · Hinterlegte MV / VA250 (situativ)','Ist bereits eine andere / ältere MV hinterlegt oder ein Vermittler zu bereinigen?',
  'VA250 (LEB) · PDB (KV)',
  'Keine konkurrierende MV und saubere Hinterlegung, der Vorgang läuft weiter.',
  'Ältere oder andere MV bzw. zu löschender Eintrag: manuelle VA250-Bereinigung.'],
 ['11 · Widerruf-Check (situativ)','Liegt ein Kunden- / Makler-Widerruf zur VNR oder ein widersprüchlicher Verbund vor?',
  'Scout · Image/Jadice',
  'Kein Widerruf und kein Widerspruch, der Vorgang läuft weiter.',
  'Widerruf oder Widerspruch vorhanden: BÜ abbrechen, Aussteuerung.'],
 ['12 · Umfang & weitere Verträge / VNRs','Umfang des BÜ-Wunschs: einzelne VNR oder gesamte Kundenverbindung? Weitere VNRs / Verbünde des Kunden (Mehrfach-Verbund)? Alle auf dieselbe Agenturnummer?',
  'Scout (Außendienstübersicht)',
  'Gesamte Kundenverbindung gewünscht oder weitere VNRs vorhanden: der Bot ermittelt alle Verträge / VNRs / Verbünde des Kunden und durchläuft die Prüfung 6–16 je Vertrag (gleiche AGT).',
  'Nur die genannte VNR gewünscht und keine weiteren Verbünde: nur dieser Vorgang.'],
 ['13 · Agenturnummer aktiv?','Ist die genannte AGT aktiv (inkl. „alte" AgNr vor ZAV), Stammdaten korrekt, als Makler / MfA angebunden?',
  'OB726 · OB510 · OB735 (Bot-Sicht)',
  'AGT aktiv und angebunden: Übertrag auf diese AGT.',
  'AGT inaktiv oder Zahlendreher: Übertrag auf unbesetzte AGT bzw. Klärung.'],
 ['14 · Rahmenvertrag / BÜ-Sperre (situativ · KOM·LEB)','Liegt eine BÜ-Sperre via Rahmenvertrag / Sonderkondition (z. B. Rechtsschutz) vor?',
  'Scout (Versicherungsart) · SV001 (Feld „BÜ möglich")',
  'Keine Sperre und „BÜ möglich" ist gesetzt, der Vorgang läuft weiter.',
  'Sperre vorhanden oder unklar: Rücksprache mit der Sparte, gegebenenfalls Ablehnung.'],
 ['15 · Provisionshaftung','Liegt eine offene Provisionshaftung (Vorvermittler) vor, die der BÜ entgegensteht?',
  'KV050 (KV · manuell SB) · BÜ-Bot (LEB)',
  'Keine offene Haftung, der Vorgang läuft weiter.',
  'Offene Haftung: Übertragung nicht möglich, Routing gemäß Richtlinie.'],
 ['16 · Korrespondenzadresse Makler (KOM·LEB)','Korrespondenz- / Mailadresse des Maklers für das Bot-Ausgangsschreiben ermitteln',
  'OB729 (via OB510 / PF20) · DiOrg/SAP (Backup)',
  'Adresse ermittelt, sie wird für die Maklerinformation verwendet.',
  'Keine Adresse in OB729: Backup über DiOrg/SAP (KV: Mail über Kontext).'],
]

doc=Document()
sec=doc.sections[0]
sec.orientation=WD_ORIENT.LANDSCAPE
sec.page_width, sec.page_height = Cm(29.7), Cm(21.0)
sec.left_margin=Cm(1.0); sec.right_margin=Cm(1.0); sec.top_margin=Cm(1.0); sec.bottom_margin=Cm(1.0)
CONTENT_W=29.7-2.0  # cm

st=doc.styles['Normal']; st.font.name=FONT; st.font.size=Pt(10); st.font.color.rgb=DARK

def shade(cell,hexc):
    tcPr=cell._tc.get_or_add_tcPr(); sh=OxmlElement('w:shd')
    sh.set(qn('w:val'),'clear'); sh.set(qn('w:color'),'auto'); sh.set(qn('w:fill'),hexc); tcPr.append(sh)
def set_width(cell,cm):
    cell.width=Cm(cm)
    tcPr=cell._tc.get_or_add_tcPr(); tcW=OxmlElement('w:tcW')
    tcW.set(qn('w:w'),str(int(cm*567))); tcW.set(qn('w:type'),'dxa'); tcPr.append(tcW)
def cell_text(cell, text, bold=False, color=DARK, size=8.5, white=False):
    cell.text=""; cell.vertical_alignment=WD_ALIGN_VERTICAL.TOP
    first=True
    for i,line in enumerate(text.split('\n')):
        p=cell.paragraphs[0] if first else cell.add_paragraph()
        first=False
        p.paragraph_format.space_after=Pt(0); p.paragraph_format.space_before=Pt(0)
        p.paragraph_format.line_spacing=1.0
        r=p.add_run(line); r.font.name=FONT; r.font.size=Pt(size); r.font.bold=bold
        r.font.color.rgb=WHITE if white else color

# ---------- Seite 1: Prozessbild ----------
h=doc.add_paragraph(); h.paragraph_format.space_after=Pt(2)
r=h.add_run("BÜ-Prüf-Bot — Prozessübersicht (alle Prüfschritte)")
r.font.bold=True; r.font.size=Pt(18); r.font.color.rgb=GREEN; r.font.name=FONT
s=doc.add_paragraph(); s.paragraph_format.space_after=Pt(6)
r=s.add_run("Eingang & Strukturierung (Celonis · KI-Deckblatt, Prüfschritte 1–5) · System-Prüfung 6–16 (Blue Prism) · "
            "Sachbearbeitung (HITL) · Ausführung (72h-/BÜ-Bot · BeMaS) · Hostsysteme je Prüfschritt")
r.font.size=Pt(10); r.font.color.rgb=GREY; r.font.italic=True; r.font.name=FONT

img='bue_pruefbot_hi.png'
iw,ih=Image.open(img).size
disp_w=CONTENT_W
disp_h=disp_w*ih/iw
pic=doc.add_picture(img, width=Cm(disp_w))
doc.paragraphs[-1].alignment=WD_ALIGN_PARAGRAPH.CENTER
cap=doc.add_paragraph(); cap.paragraph_format.space_before=Pt(6)
r=cap.add_run("Hinweis: Für die Detailansicht des Prozessbildes die beigefügte PDF (Seite 1) bzw. PNG nutzen – "
              "das eingebettete Bild ist hochauflösend und in Word zoombar.")
r.font.size=Pt(9); r.font.color.rgb=GREY; r.font.name=FONT

# ---------- Seitenumbruch ----------
doc.add_page_break()

# ---------- Seite 2: editierbare Tabelle ----------
h=doc.add_paragraph(); h.paragraph_format.space_after=Pt(2)
r=h.add_run("Prüfschritte 6–16 — Detailbeschreibung (Blue-Prism-System-Prüfung; Schritt 9 VVR manuell)")
r.font.bold=True; r.font.size=Pt(16); r.font.color.rgb=GREEN; r.font.name=FONT
s=doc.add_paragraph(); s.paragraph_format.space_after=Pt(6)
r=s.add_run("Prüfschritte 1–5 (BÜ-Wunsch · MV formal & inhaltlich · Pool/Untervollmacht · Unterschriften) liegen bereits "
            "im KI-Deckblatt vor. Schritt 9 (VVR) erfolgt am Ende als manuelle Bestätigung (HITL), da Robots im "
            "Vermittlerregister nicht zulässig sind.")
r.font.size=Pt(9.5); r.font.color.rgb=GREY; r.font.name=FONT

tbl=doc.add_table(rows=1, cols=len(COLS))
tbl.style='Table Grid'; tbl.alignment=WD_TABLE_ALIGNMENT.LEFT; tbl.autofit=False
# verhindern, dass Word automatisch umverteilt
tblPr=tbl._tbl.tblPr
layout=OxmlElement('w:tblLayout'); layout.set(qn('w:type'),'fixed'); tblPr.append(layout)
hdr=tbl.rows[0].cells
for c,(name,wcm) in zip(hdr,COLS):
    set_width(c,wcm); cell_text(c,name,bold=True,white=True,size=9); shade(c,HEADGR)
for ri,row in enumerate(ROWS):
    cells=tbl.add_row().cells
    for ci,(name,wcm) in enumerate(COLS):
        set_width(cells[ci],wcm)
        if ci==0: cell_text(cells[ci],row[ci],bold=True,color=GREEN,size=9)
        elif ci==3: cell_text(cells[ci],row[ci],color=JA,size=8.5)
        elif ci==4: cell_text(cells[ci],row[ci],color=NEIN,size=8.5)
        else: cell_text(cells[ci],row[ci],color=DARK,size=8.5)
    if ri%2==1:
        for cc in cells: shade(cc,ZEBRA)

# ---------- Seite 3+: Phasen & Schritte (Hochformat) ----------
nsec=doc.add_section(WD_SECTION.NEW_PAGE)
nsec.orientation=WD_ORIENT.PORTRAIT
nsec.page_width, nsec.page_height = Cm(21.0), Cm(29.7)
nsec.left_margin=Cm(2.0); nsec.right_margin=Cm(2.0); nsec.top_margin=Cm(1.6); nsec.bottom_margin=Cm(1.6)

def H(text,size=14,color=GREEN,sb=12,sa=3):
    p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(sb); p.paragraph_format.space_after=Pt(sa)
    p.paragraph_format.keep_with_next=True
    r=p.add_run(text); r.font.bold=True; r.font.size=Pt(size); r.font.color.rgb=color; r.font.name=FONT
    return p
def PA(text,size=10.5,color=DARK,sa=4):
    p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(sa)
    r=p.add_run(text); r.font.size=Pt(size); r.font.color.rgb=color; r.font.name=FONT
    return p
def B(text,color=DARK):
    p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.space_after=Pt(2)
    r=p.add_run(text); r.font.size=Pt(10); r.font.color.rgb=color; r.font.name=FONT
    return p

t=doc.add_paragraph(); t.paragraph_format.space_after=Pt(0)
r=t.add_run("BÜ-Prüf-Bot — Phasen & Schritte"); r.font.bold=True; r.font.size=Pt(20); r.font.color.rgb=GREEN; r.font.name=FONT
PA("Ablauf von der eingehenden E-Mail bis zur freigegebenen Roboter-Notiz in sechs aufeinanderfolgenden Phasen. "
   "Die Bausteine Robotics Cockpit und Roboter-Notiz als Entwurf sind als Idee zu verstehen: Ob sie technisch so "
   "umsetzbar sind, muss das Robotics Competence Center noch bewerten und validieren.", size=10, color=GREY)

PHASEN=[
 ("1 · E-Mail-Eingang bei ERGO",
  "Bestandsübertragungs-Anfragen treffen weiterhin unstrukturiert als E-Mail über die Makler-Gruppenpostfächer ein. "
  "Anhänge (Maklervollmacht, Anschreiben, Vertragslisten) liegen in unterschiedlichen Formaten vor. In dieser Phase "
  "findet noch keine fachliche Prüfung statt.",
  ["Eingang über die bestehenden Gruppenpostfächer — kein geänderter Zugangskanal für Makler",
   "Heterogene Anhänge: Vollmacht, Anschreiben, Vertragsliste — ggf. mehrere je Mail",
   "Umwandlung in einen Postkorbvorgang (EDM/KWAD), Verbund- und VNR-Zuordnung"]),
 ("2 · Strukturierung durch Celonis · BÜ-Relevanz",
  "Celonis liest die Dokumente per Image/Jadice (OCR), reichert Partnerdaten/PNR aus EMMA an und erzeugt je Vorgang "
  "das KI-Deckblatt (Prüfschritte 1–5). Dabei werden alle Rohwerte extrahiert und die fachlichen Eckdaten interpretiert. "
  "Wird kein BÜ-Wunsch erkannt, endet die Kette hier: Der Vorgang wird NICHT an den Prüf-Bot übergeben, sondern ans "
  "Eingangsmanagement umgeroutet. Nur als BÜ klassifizierte Vorgänge werden mit dem vollständigen Übergabe-Datensatz "
  "an den Prüf-Bot weitergereicht.",
  ["KI-Deckblatt deckt die Prüfschritte 1–5 ab (BÜ-Wunsch, MV formal & inhaltlich, Pool/Untervollmacht, Unterschriften)",
   "Übergabe-Datensatz = alle extrahierten + alle interpretierten Werte (vollständige Liste siehe Tabelle unten)",
   "Kein BÜ-Wunsch: Umrouting ans Eingangsmanagement, keine automatisierte Prüfung",
   "Ablage des Datensatzes in SharePoint-Liste oder ERGO Datapool (Eingangskanal noch offen)"]),
 ("3 · Prüf-Bot · Einzelprüfung je Vorgang und digitales Prüfdeckblatt",
  "Der Prüf-Bot prüft jeden BÜ-Vorgang einzeln und durchläuft je Mail alle System-Prüfungen 6–16 (Schritt 9/VVR erfolgt "
  "manuell am Ende, da Robots im Vermittlerregister nicht zulässig sind). Bei Wunsch „gesamte Kundenverbindung“ werden "
  "alle Verträge/VNRs des Kunden einbezogen. Am Ende der Prüfkette erstellt der Bot ein digitales Prüfdeckblatt, auf dem "
  "die Ergebnisse ALLER Prüfungen (1–16) je Vertrag zusammengefasst sind. Jedes Kriterium wird gegen eine später fachlich "
  "zu definierende Matrix bewertet (hart / weich / optional).",
  ["Hartes Kriterium verletzt: automatische Absage und Antwort-Mail an den Makler mit Nennung der Gründe",
   "Weiches Kriterium verletzt: Vorgang wird geflaggt und manuell durch einen Menschen geprüft",
   "Optionales Kriterium verletzt: unkritisch — dient nur der Vollständigkeit, führt nicht zur Absage",
   "Digitales Prüfdeckblatt: bündelt je Vorgang das Ergebnis jeder Einzelprüfung als Entscheidungsgrundlage"]),
 ("4 · Robotics Cockpit / Human-in-the-Loop (Idee — durch Robotics zu validieren)",
  "Für Vorgänge mit verletzten weichen Kriterien (Business Exceptions) ist eine manuelle Prüfung durch einen Menschen "
  "vorgesehen — als Idee über ein Robotics Cockpit, in dem Mitarbeiter VOR der Weiterleitung in den Postkorb entscheiden, "
  "wie mit dem Fall umzugehen ist. Ob ein solches Cockpit technisch gebaut werden kann, ist eine Idee, die das Robotics "
  "Competence Center noch bewerten und validieren muss; die manuelle Prüfung selbst ist fester Bestandteil.",
  ["Greift ausschließlich bei verletzten weichen Kriterien (geflaggte Fälle aus Phase 3)",
   "Mitarbeiter entscheidet je Vorgang: freigeben (weiter in den Postkorb) oder ablehnen (Absage an Makler)",
   "Entscheidung erfolgt VOR dem Postkorb",
   "Robotics Cockpit als Werkzeug-Idee — technische Machbarkeit durch das Robotics Competence Center zu prüfen"]),
 ("5 · Postkorb · Archivierung und Roboter-Notiz als Entwurf",
  "In den Postkorb gelangt ein Vorgang, wenn er alle Kriterien erfüllt, wenn nur optionale Kriterien verletzt sind oder "
  "wenn er über das Cockpit freigegeben wurde. Im Postkorb laufen zwei Schritte parallel: die Archivierung der Vorgänge "
  "(inkl. Prüfdeckblatt) und das Einstellen einer vom Roboter vorbefüllten Roboter-Notiz als Entwurf. Ob sich eine "
  "Roboter-Notiz technisch als Entwurf einstellen lässt, ist eine Idee, die das Robotics Competence Center noch bewerten "
  "und validieren muss.",
  ["Eingangsbedingung: alles erfüllt ODER nur optionale Kriterien verletzt ODER per Cockpit freigegeben",
   "(1) Archivierung der Vorgänge inkl. Prüfdeckblatt als Nachweis der durchlaufenen Prüfungen",
   "(2) Roboter-Notiz wird vom Roboter vorbefüllt und als Entwurf eingestellt — Idee, technische Machbarkeit durch das Robotics Competence Center zu prüfen",
   "Notiz-Schlüssel: 2011 (KV) / 1515 (KOM·LEB)"]),
 ("6 · Freigabe oder Änderung der Roboter-Notiz",
  "Im Zielbild wird die heutige Roboter-Notiz vollständig vom Roboter vorbefüllt, sodass der Mitarbeiter sie nur noch "
  "bestätigen oder bei Bedarf anpassen muss. Die fachliche Letztverantwortung bleibt beim Menschen, während die Erstellung "
  "weitgehend automatisiert ist. Anschließend läuft die bestehende Ausführung.",
  ["Mensch prüft die vorbefüllte Roboter-Notiz und gibt sie frei; bei Abweichungen wird sie vor der Freigabe geändert",
   "Ziel: Aufwand reduziert auf Bestätigen statt manuelles Erstellen der Notiz",
   "Danach: Ausführung der BÜ (72h-Routing bei AO-Bestand, BÜ-Bot 1515 / BeMaS 2011), Maklerinformation und QS"]),
]
for nr,(titel) in enumerate(PHASEN):
    title,text,bullets=PHASEN[nr]
    H(title, size=13)
    PA(text)
    for b in bullets: B(b)

# ---------- Celonis Übergabe-Datensatz: Werteliste ----------
H("Celonis — Übergabe-Datensatz an den Prüf-Bot (vollständige Werteliste)", size=13)
PA("Je Vorgang übergibt Celonis das KI-Deckblatt mit allen extrahierten Rohwerten (per OCR aus dem Dokument) und allen "
   "interpretierten Werten (KI-Klassifikation / -Ableitung).", size=10, color=GREY)
EXTRAHIERT=["Kunde (Name VN)","Geburtsdatum VN","Kunden-Adresse","Versicherungsnummer(n) / VNR","Sparte",
 "Kunden-/Partnernummer (KDNR/PNR aus EMMA)","VN laut MV (Name aus Maklervollmacht)","Pool (Maklerpool)",
 "Vermittler / Untervermittler","Agentur-/Personalnummer","Makler-Adresse","Auftrag-Datum (Anschreiben)",
 "MV enthalten","MV-Einschränkungen (Klartext)","Unterschrift Kunde","Unterschrift Makler"]
INTERPRETIERT=["Vorgangstyp","Klassifikation","BÜ-Wunsch vorhanden (ja/nein)","Prüfung Unterlagen (Vollständigkeit)",
 "Reminder / Wiedervorlage","Reminder-Quelle","MV-Status","MV auf Makler ausgestellt","MV vollumfänglich (ja/teilw./nein)",
 "Untervollmacht erteilt","Mail-Zusammenfassung","Hinweis (Auffälligkeiten)","Badge BÜ-Ampel (Neue BÜ/Reminder/Keine BÜ)",
 "Badge Typ (Makler/MFA)","Badge Maklervollmacht-Status (OK/unvollständig/fehlt)"]
ctab=doc.add_table(rows=1, cols=2); ctab.style='Table Grid'; ctab.alignment=WD_TABLE_ALIGNMENT.LEFT; ctab.autofit=False
clp=ctab._tbl.tblPr; cl=OxmlElement('w:tblLayout'); cl.set(qn('w:type'),'fixed'); clp.append(cl)
ch=ctab.rows[0].cells
for c,name in zip(ch,["Extrahierte Werte (OCR aus Dokument)","Interpretierte Werte (KI)"]):
    set_width(c,8.5); cell_text(c,name,bold=True,white=True,size=10); shade(c,HEADGR)
crow=ctab.add_row().cells
set_width(crow[0],8.5); set_width(crow[1],8.5)
cell_text(crow[0],"\n".join("• "+x for x in EXTRAHIERT),color=DARK,size=9.5)
cell_text(crow[1],"\n".join("• "+x for x in INTERPRETIERT),color=DARK,size=9.5)

doc.save("BUE_Pruefbot_Prozess.docx")
print("BUE_Pruefbot_Prozess.docx geschrieben · Bild %dx%d -> %.1fx%.1f cm · Tabelle %d Zeilen · Phasen %d · Werte %d/%d"%(
    iw,ih,disp_w,disp_h,len(ROWS),len(PHASEN),len(EXTRAHIERT),len(INTERPRETIERT)))
