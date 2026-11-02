# -*- coding: utf-8 -*-
"""BÜ-Reporting – Fachkonzept (aktualisiert, Stand 29.06.2026).
Rekonstruiert aus Eikes Zusammenfassungs-Mail vom 24.06. (Fachkonzept-Struktur)
und mit den nun bestätigten GeVo-/ID-Schlüsseln aktualisiert.
Schlüssel-Quellen (Thread 'Abgrenzung Verbund OPAG und OA'):
  Komposit/Leben: GeVo 469 + 108  (Koeberer 25.06., Amend 24./25.06.; 'SV 496' = Zahlendreher -> 469)
  KV/Gesundheit:  ID 02015 Maklervollmacht + 06065 Betreuung/Anfrage Betreuung
                  (Betrieb Gesundheit: Andermann 29.06., Böttger 27.06.)
"""
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

GREEN   = RGBColor(0x04, 0x6A, 0x38)   # ERGO/Deloitte Grün
DG2     = RGBColor(0x26, 0x89, 0x0D)
DARK    = RGBColor(0x1A, 0x1A, 0x1A)
GREY    = RGBColor(0x53, 0x56, 0x5A)
WHITE   = RGBColor(0xFF, 0xFF, 0xFF)
LGREEN  = "E4F0E0"
HEADGR  = "046A38"
ZEBRA   = "F4F7F4"
FONT    = "Calibri"

doc = Document()
# Seitenränder schmal
for s in doc.sections:
    s.top_margin = Cm(1.6); s.bottom_margin = Cm(1.6)
    s.left_margin = Cm(2.0); s.right_margin = Cm(2.0)

# Standard-Schrift
st = doc.styles['Normal']
st.font.name = FONT; st.font.size = Pt(10.5); st.font.color.rgb = DARK

def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    sh = OxmlElement('w:shd'); sh.set(qn('w:val'), 'clear')
    sh.set(qn('w:color'), 'auto'); sh.set(qn('w:fill'), hexcolor)
    tcPr.append(sh)

def set_cell(cell, text, bold=False, color=DARK, size=9.5, white=False, align=None):
    cell.text = ""
    p = cell.paragraphs[0]
    if align: p.alignment = align
    p.paragraph_format.space_after = Pt(1); p.paragraph_format.space_before = Pt(1)
    run = p.add_run(text)
    run.font.name = FONT; run.font.size = Pt(size); run.font.bold = bold
    run.font.color.rgb = WHITE if white else color

def h(text, size=13, color=GREEN, space_before=10, space_after=3):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text); r.font.bold = True; r.font.size = Pt(size)
    r.font.color.rgb = color; r.font.name = FONT
    return p

def bullet(text, lead=None, color=DARK):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(2)
    if lead:
        r = p.add_run(lead + ": "); r.font.bold = True; r.font.size = Pt(10)
        r.font.color.rgb = DG2; r.font.name = FONT
    r2 = p.add_run(text); r2.font.size = Pt(10); r2.font.color.rgb = color; r2.font.name = FONT
    return p

def para(text, size=10.5, color=DARK, bold=False, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    r = p.add_run(text); r.font.size = Pt(size); r.font.color.rgb = color
    r.font.bold = bold; r.font.name = FONT
    return p

# ---------- Titel ----------
t = doc.add_paragraph(); t.paragraph_format.space_after = Pt(0)
r = t.add_run("BÜ-Reporting – Fachkonzept"); r.font.bold = True
r.font.size = Pt(20); r.font.color.rgb = GREEN; r.font.name = FONT
sub = doc.add_paragraph(); sub.paragraph_format.space_after = Pt(2)
r = sub.add_run("Einheitliches, segmentübergreifendes Reporting der Makler-Bestandsübertragung")
r.font.size = Pt(11); r.font.color.rgb = GREY; r.font.italic = True; r.font.name = FONT
meta = doc.add_paragraph(); meta.paragraph_format.space_after = Pt(2)
r = meta.add_run("Stand: 29.06.2026  ·  Aktualisierung: GeVo-/ID-Schlüssel final bestätigt (Komposit/Leben und KV/Gesundheit)")
r.font.size = Pt(9.5); r.font.color.rgb = DG2; r.font.bold = True; r.font.name = FONT

# dünne Trennlinie
pborder = doc.add_paragraph(); pborder.paragraph_format.space_after = Pt(4)
pPr = pborder._p.get_or_add_pPr()
pbdr = OxmlElement('w:pBdr'); bottom = OxmlElement('w:bottom')
bottom.set(qn('w:val'),'single'); bottom.set(qn('w:sz'),'12')
bottom.set(qn('w:space'),'1'); bottom.set(qn('w:color'), HEADGR)
pbdr.append(bottom); pPr.append(pbdr)

# ---------- 1. Zielbild ----------
h("1. Zielbild")
para("Ein gemeinsames, segmentübergreifendes BÜ-Reporting mit einheitlicher Zähllogik über Komposit, "
     "Leben und KV. Die technische Umsetzung erfolgt über einen neuen MIS-O-Bericht oder alternativ über "
     "SAS Viya; die Variante wird im gemeinsamen Termin entschieden.")

# ---------- 2. Bestätigte BÜ-Schlüssel ----------
h("2. BÜ-Schlüssel je Segment (final bestätigt)")
para("Gezählt werden ausschließlich Vorgänge mit „Bestandsübertragung\"-Schlüssel. Die folgenden Schlüssel "
     "sind nun fachlich bestätigt:", space_after=4)

tbl = doc.add_table(rows=1, cols=4)
tbl.alignment = WD_TABLE_ALIGNMENT.LEFT
tbl.style = 'Table Grid'
tbl.autofit = True
hdr = tbl.rows[0].cells
for c, txt in zip(hdr, ["Segment", "Schlüssel", "Bezeichnung", "Quelle / Bestätigung"]):
    set_cell(c, txt, bold=True, white=True, size=9.5); shade(c, HEADGR)

rows = [
    ("Komposit / Leben", "GeVo 469", "Bestandsübertragung",
     "MIS-O (HS); bestätigt S. Koeberer / D. Amend, 25.06."),
    ("Komposit / Leben", "GeVo 108", "Bestandsübertragung (2. Schlüssel)",
     "MIS-O (HS); bestätigt S. Koeberer / D. Amend, 25.06."),
    ("KV / Gesundheit", "ID 02015", "Maklervollmacht",
     "Betrieb Gesundheit – H. Andermann / M. Böttger, 27./29.06."),
    ("KV / Gesundheit", "ID 06065", "Betreuung / Anfrage Betreuung",
     "Betrieb Gesundheit – H. Andermann / M. Böttger, 27./29.06."),
]
for i, (seg, key, bez, src) in enumerate(rows):
    cells = tbl.add_row().cells
    set_cell(cells[0], seg, bold=True, color=DARK, size=9.5)
    set_cell(cells[1], key, bold=True, color=GREEN, size=9.5)
    set_cell(cells[2], bez, size=9.5)
    set_cell(cells[3], src, size=9, color=GREY)
    if i % 2 == 1:
        for cc in cells: shade(cc, ZEBRA)

note = doc.add_paragraph(); note.paragraph_format.space_before = Pt(3); note.paragraph_format.space_after = Pt(2)
r = note.add_run("Korrektur gegenüber Erstfassung: ")
r.font.bold = True; r.font.size = Pt(9.5); r.font.color.rgb = DG2; r.font.name = FONT
r = note.add_run("Der ursprünglich genannte Schlüssel „SV 496\" war ein Zahlendreher; korrekt ist GeVo 469. "
                 "Der zweite Komposit/Leben-Schlüssel (108) sowie die KV-Schlüssel sind damit bestätigt – "
                 "alle in der Erstfassung offenen Schlüssel-Punkte sind geklärt.")
r.font.size = Pt(9.5); r.font.color.rgb = DARK; r.font.name = FONT

# ---------- 3. Zwei Berichte ----------
h("3. Zwei Berichte (identische Filter- und Drill-down-Logik)")
bullet("neu eingegangene BÜ-OPAGs der aktuellen Kalenderwoche.", lead="Bericht 1 – Wocheneingang")
bullet("VNR mit mindestens einem offenen BÜ-OPAG.", lead="Bericht 2 – Rückstand")

# ---------- 4. Zähllogik ----------
h("4. Zähllogik")
bullet("Gezählt wird auf OPAG-Ebene, jedoch nur OPAGs mit „Bestandsübertragung\"-Schlüssel (BÜ-OPAGs) "
       "gemäß der Schlüsseltabelle in Abschnitt 2.")
bullet("Rückstand = VNR mit mindestens einem offenen BÜ-OPAG (ein „Rückstand von 3\" = 3 VNR mit aktuell "
       "offenem BÜ-Schriftwechsel).")
bullet("Zähllebene „Verbund\": Ein Verbund besteht aus Verwaltungssystemschlüssel + Ordnungsbegriff "
       "(Leben/Komposit – VDB-Volumenstatistik) bzw. zusätzlich der Verbundlaufenden Nr. (Gesundheit – "
       "DMS-Statistik). GeVo = OPAG.")

# ---------- 5. Filter / Drill-down ----------
h("5. Filter / Drill-down (für beide Berichte gleich)")
bullet("Komposit / Leben / KV.", lead="Segment")
bullet("Makler-Makler / Makler-AO – über die Postkörbe (in MIS-O nur der aktuell am Vertrag gespeicherte "
       "Vertriebsweg).", lead="Vertriebsweg")
bullet("einzeln und kumuliert; persönliche Postkörbe ausschließlich kumuliert ohne Personenbezug "
       "(falls möglich).", lead="Postkorb")

# ---------- 6. Beteiligte Postkörbe ----------
h("6. Beteiligte Postkörbe")
bullet("Dienststellen-/Themenpostkörbe aus ODPD inkl. KBIG/MSUE (M. Koch, H. Klindworth) sowie die "
       "Mitarbeiter-Postkörbe (nur kumuliert).", lead="Makler-Makler")
bullet("Postkörbe aus HSB4 K (D. Amend) inkl. kumuliertem Mitarbeiterwert der Dienststelle 23724.", lead="HS")

# ---------- 7. Offene Punkte für den Termin ----------
h("7. Offene Punkte (für den gemeinsamen Termin)")
bullet("Report-Variante: neuer MIS-O-Bericht oder SAS Viya.")
bullet("Zähl-/Reportinglogik im Detail: Verbund vs. Verbundkette bzw. mehrere VNR je Verbund.")
bullet("Prüfen, ob neben den BÜ-Schlüsseln weitere GeVo (z. B. Vertragsänderungen) aufzunehmen sind, "
       "damit nicht sauber als BÜ klassifizierte Postkorb-Vorgänge nicht fehlen (Hinweis H. Klindworth) – "
       "aktuelle Sicht D. Amend: in MIS-O liegen für Komposit/Leben nur 469/108 mit der Bezeichnung "
       "Bestandsübertragung vor.")

doc.save("BUE_Reporting_Fachkonzept_v2.docx")
print("BUE_Reporting_Fachkonzept_v2.docx geschrieben")
