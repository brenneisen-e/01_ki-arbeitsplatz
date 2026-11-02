# -*- coding: utf-8 -*-
"""Testkonzept Pruef-Bot: Testdatenbereitstellung, Vorgehen und Testfaelle – Folien im ERGO-Master."""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn

SRC = '20260916_Abstimmung_Budget_2027_Celonis_Vorlage.pptx'; OUT = '../20260923_Testkonzept_Pruef-Bot_Testdaten.pptx'  # Aufruf aus pdd/quellen/
ROT = RGBColor(0xBF, 0x15, 0x28); ROTL = RGBColor(0xF6, 0xD9, 0xDC)
TEAL = RGBColor(0x0F, 0x94, 0xA7); TEAL2 = RGBColor(0x47, 0xBC, 0xC5); TEALL = RGBColor(0xCC, 0xEB, 0xED); TEALT = RGBColor(0xE6, 0xF4, 0xF6)
TEALD = RGBColor(0x0B, 0x6F, 0x7D)
GRAU = RGBColor(0x6B, 0x6B, 0x6B); GRAUL = RGBColor(0xF2, 0xF2, 0xF2); GRAUM = RGBColor(0x9A, 0x9A, 0x9A); GRAUD = RGBColor(0x4A, 0x4A, 0x4A)
SW = RGBColor(0x1A, 0x1A, 0x1A); WEISS = RGBColor(0xFF, 0xFF, 0xFF)
LILA = RGBColor(0xB5, 0x8A, 0xB0); LILAL = RGBColor(0xEA, 0xDD, 0xE6)
F = 'Arial'

prs = Presentation(SRC)
LAY = {l.name: l for l in prs.slide_layouts}
for sh in prs.slide_master.shapes:
    if sh.has_text_frame and 'Zwischenbericht' in sh.text_frame.text:
        sh.width = Inches(7.5)
        for para in sh.text_frame.paragraphs:
            for i, r in enumerate(para.runs):
                r.text = 'ERGO | Makler BÜ meets KI – Testkonzept Prüf-Bot: Testdatenbereitstellung - 23.09.2026' if i == 0 else ''
sldIdLst = prs.slides._sldIdLst
for sldId in list(sldIdLst)[1:]:
    prs.part.drop_rel(sldId.rId); sldIdLst.remove(sldId)
for sh in prs.slides[0].shapes:
    if sh.has_text_frame and sh.text_frame.text.startswith('Makler BÜ meets KI'):
        r = sh.text_frame.paragraphs[0].runs[0]; r.text = 'Makler BÜ meets KI | Testkonzept Prüf-Bot'
        for x in sh.text_frame.paragraphs[0].runs[1:]: x.text = ''
    if sh.has_text_frame and sh.text_frame.text.strip() == 'Budgetplanung 26/27':
        r = sh.text_frame.paragraphs[0].runs[0]; r.text = 'Testdatenbereitstellung, Vorgehen und Testfälle'
        for x in sh.text_frame.paragraphs[0].runs[1:]: x.text = ''
    if sh.has_text_frame and sh.text_frame.text.strip().startswith('17. September'):
        r = sh.text_frame.paragraphs[0].runs[0]; r.text = '23. September 2026'
        for x in sh.text_frame.paragraphs[0].runs[1:]: x.text = ''

# ------------------------------------------------------------------ Helfer
def rect(slide, x, y, w, h, fill, line=None, shape=MSO_SHAPE.RECTANGLE, lw=1.0, dash=False):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None: s.fill.background()
    else: s.fill.solid(); s.fill.fore_color.rgb = fill
    if line is None: s.line.fill.background()
    else:
        s.line.color.rgb = line; s.line.width = Pt(lw)
        if dash: s.line.dash_style = 4  # MSO_LINE.DASH
    s.shadow.inherit = False
    s.text_frame.text = ''
    return s

def runs_in(tf, paras, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, space_after=0):
    tf.word_wrap = True; tf.vertical_anchor = anchor
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(space_after)
        for t, size, bold, color, italic in para:
            r = p.add_run(); r.text = t; r.font.size = Pt(size); r.font.bold = bold; r.font.name = F; r.font.color.rgb = color; r.font.italic = italic

def text(slide, x, y, w, h, content, size=10, bold=False, color=SW, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, bullets=False, space_after=3, italic=False):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    paras = content if isinstance(content, list) else [content]
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(space_after)
        runs = para if isinstance(para, list) else [(para, bold)]
        if bullets:
            pPr = p._p.get_or_add_pPr(); pPr.set('marL', str(Inches(0.18))); pPr.set('indent', str(-Inches(0.18)))
            bu = pPr.makeelement(qn('a:buChar'), {'char': '•'}); pPr.append(bu)
        for t, b in runs:
            r = p.add_run(); r.text = t; r.font.size = Pt(size); r.font.bold = b; r.font.name = F; r.font.color.rgb = color; r.font.italic = italic
    return tb

def box(slide, x, y, w, h, titel, sub=None, fill=TEAL, tcol=WEISS, scol=None, tsize=8.5, ssize=7, line=None, shape=MSO_SHAPE.RECTANGLE, align=PP_ALIGN.LEFT, dash=False):
    s = rect(slide, x, y, w, h, fill, line, shape, dash=dash)
    tf = s.text_frame; tf.margin_left = tf.margin_right = Inches(0.07); tf.margin_top = tf.margin_bottom = Inches(0.03)
    paras = [[(titel, tsize, True, tcol, False)]]
    if sub: paras.append([(sub, ssize, False, scol or tcol, False)])
    runs_in(tf, paras, align=align, anchor=MSO_ANCHOR.MIDDLE, space_after=1)
    return s

def line(slide, x1, y1, x2, y2, color=GRAUD, width=1.0, dash=False, arrow=False):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = color; c.line.width = Pt(width)
    ln = c.line._get_or_add_ln()
    if dash: ln.append(ln.makeelement(qn('a:prstDash'), {'val': 'dash'}))
    if arrow: ln.append(ln.makeelement(qn('a:tailEnd'), {'type': 'triangle', 'w': 'med', 'len': 'med'}))
    return c

def pfad(slide, pts, color=GRAUD, width=1.0, dash=False):
    """Orthogonaler Pfeil ueber Punktliste, Pfeilspitze am Ende."""
    for i in range(len(pts) - 1):
        (x1, y1), (x2, y2) = pts[i], pts[i + 1]
        line(slide, x1, y1, x2, y2, color, width, dash, arrow=(i == len(pts) - 2))

def raute(slide, cx, cy, w, h, t, size=7.5):
    s = rect(slide, cx - w / 2, cy - h / 2, w, h, WEISS, TEALD, MSO_SHAPE.DIAMOND, lw=1.25)
    tf = s.text_frame; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    runs_in(tf, [[(t, size, True, TEALD, False)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    return s

def etikett(slide, x, y, w, t, size=7, color=GRAUD, align=PP_ALIGN.LEFT, bold=False):
    return text(slide, x, y, w, 0.2, t, size=size, color=color, align=align, italic=not bold, bold=bold)

def abschnitt(slide, x, y, w, t):
    rect(slide, x, y + 0.03, 0.31, 0.31, TEALL)
    text(slide, x + 0.28, y, w, 0.32, t, size=16, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    line(slide, x + 0.08, y + 0.3, x + w, y + 0.3, TEAL, 1)

def chevron(slide, x, y, w, h, nr, t, fill, tcol=SW, first=False):
    s = rect(slide, x, y, w, h, fill, None, MSO_SHAPE.PENTAGON if first else MSO_SHAPE.CHEVRON)
    tf = s.text_frame; tf.margin_left = Inches(0.2 if first else 0.24); tf.margin_right = Inches(0.05); tf.word_wrap = False
    runs_in(tf, [[(f'{nr}  ', 9, True, tcol, False), (t, 9, True, tcol, False)]], anchor=MSO_ANCHOR.MIDDLE)
    return s

def table(slide, x, y, colw, rows, rowh=0.3, size=9, header_fill=ROT):
    shp = slide.shapes.add_table(len(rows), len(colw), Inches(x), Inches(y), Inches(sum(colw)), Inches(rowh * len(rows)))
    tbl = shp.table; tbl.first_row = False; tbl.horz_banding = False
    for j, w in enumerate(colw): tbl.columns[j].width = Inches(w)
    for i, row in enumerate(rows):
        tbl.rows[i].height = Inches(rowh)
        for j, cell in enumerate(row):
            t, o = (cell if isinstance(cell, tuple) else (cell, {}))
            c = tbl.cell(i, j); c.margin_left = c.margin_right = Inches(0.06); c.margin_top = c.margin_bottom = Inches(0.03)
            c.vertical_anchor = MSO_ANCHOR.MIDDLE if i == 0 else MSO_ANCHOR.TOP
            c.fill.solid(); c.fill.fore_color.rgb = o.get('fill', header_fill if i == 0 else WEISS)
            p = c.text_frame.paragraphs[0]; p.alignment = PP_ALIGN.LEFT
            r = p.add_run(); r.text = t or ' '; r.font.size = Pt(size); r.font.name = F
            r.font.bold = o.get('bold', i == 0); r.font.color.rgb = o.get('color', WEISS if i == 0 else SW)
            p._p.append(p._p.makeelement(qn('a:endParaRPr'), {'sz': str(int(size * 100))}))
            c.text_frame.word_wrap = True
    return shp


def neue_folie(layout, titel, kicker, tsize=20):
    s = prs.slides.add_slide(LAY[layout])
    for ph in s.placeholders:
        if ph.placeholder_format.idx == 0:
            ph.text_frame.text = titel
            for p in ph.text_frame.paragraphs:
                for r in p.runs: r.font.size = Pt(tsize)
        elif ph.placeholder_format.idx == 12:
            ph.text_frame.text = kicker
    return s


def zylinder(slide, x, y, w, h, t, fill=TEALL, tcol=TEALD, size=7):
    s = rect(slide, x, y, w, h, fill, TEALD, MSO_SHAPE.CAN, lw=0.75)
    tf = s.text_frame; tf.margin_left = tf.margin_right = Inches(0.02); tf.margin_top = Inches(0.1); tf.margin_bottom = Inches(0.02)
    runs_in(tf, [[(t, size, True, tcol, False)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    return s

def umgebung(slide, x, y, w, h, t, u, fill):
    r = rect(slide, x, y, w, h, fill, None)
    r.line.color.rgb = GRAUM; r.line.width = Pt(0.75); r.line.dash_style = 4
    text(slide, x + 0.1, y + 0.06, w - 0.2, 0.22, [[(t, True), ('  ' + u, False)]], size=8.5, color=GRAUD)

def nummer(slide, x, y, n, fill=ROT):
    s = rect(slide, x, y, 0.28, 0.28, fill, None, MSO_SHAPE.OVAL)
    tf = s.text_frame; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    runs_in(tf, [[(str(n), 9, True, WEISS, False)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# ================================================================== Folie 2: Umgebungen und Datenfluss
s = neue_folie('Only Title', 'Testdaten kommen per PTU aus der Produktion nach IMSI; Kunden-, Makler- und Vermittlerdaten müssen vor dem Start in Celonis auf den IMSI-Stand gebracht werden', 'TESTKONZEPT | TESTDATENBEREITSTELLUNG', tsize=16)
# Umgebungen
umgebung(s, 0.56, 1.45, 3.3, 2.9, 'Abnahme Celonis', 'cloud.abn.ergo.com', TEALT)
umgebung(s, 4.05, 1.45, 2.5, 2.9, 'Abnahme Prüf-Bot', 'ergodev', TEALT)
umgebung(s, 7.95, 1.45, 4.82, 2.9, 'Abnahme Host', 'IMSI', TEALT)
umgebung(s, 0.56, 4.8, 3.9, 2.1, 'Produktion', 'ergo / IMS', GRAUL)
# Abnahme Celonis
M = box(s, 0.75, 1.9, 1.35, 0.62, 'Makler-E-Mail', 'mit Maklervollmacht, an das Abnahme-Postfach', fill=WEISS, tcol=SW, scol=GRAU, line=ROT, tsize=8, ssize=6.3)
C = box(s, 0.75, 2.85, 1.35, 0.62, 'Celonis Extraction', 'Klassifikation, Extraktion, KI-Deckblatt', tsize=8, ssize=6.3)
E = zylinder(s, 2.55, 2.75, 0.85, 0.85, 'EMMA-Abzug\n(Excel)')
pfad(s, [(1.42, 2.52), (1.42, 2.85)])
pfad(s, [(2.1, 3.16), (2.55, 3.16)])
text(s, 2.3, 3.65, 1.5, 0.75, 'kein System, sondern ein Excel-Abzug für den Abgleich der Agenturnummer (Vermittlertyp, PNR) – die Werte müssen zu IMSI passen', size=6.3, color=GRAU, italic=True)
# Abnahme Pruef-Bot
S = box(s, 4.25, 1.9, 1.5, 0.62, 'Strukturierte Daten', 'KI-Deckblatt: Felder BUE_* je VNR', tsize=8, ssize=6.3)
P = box(s, 4.25, 2.85, 1.5, 0.62, 'Prüf-Bot Vorprüfung BÜ', 'Blue Prism, PDD v10', fill=TEALD, tsize=8, ssize=6.3)
pfad(s, [(2.1, 3.16), (2.3, 3.16), (2.3, 2.21), (4.25, 2.21)], TEAL, 1.25)
pfad(s, [(5.75, 2.21), (6.7, 2.21)], TEAL, 1.25)
text(s, 5.78, 1.98, 0.95, 0.22, 'Übergabe an EMWS', size=6.5, color=TEALD, bold=True)
# Pruef-Bot liest den Datenpool in IMSI
pfad(s, [(5.0, 3.47), (5.0, 3.9), (8.05, 3.9)], TEALD, 1.0, dash=True)
text(s, 5.1, 3.7, 2.4, 0.2, 'liest die Felder BUE_* aus dem Datenpool', size=6.5, color=TEALD, italic=True)
# IMSI
# EMWS: Dienst zwischen den Umgebungen – schreibt Themenpostkorb, Vorgangs-DB und Datenpool in IMSI
W = box(s, 6.7, 1.9, 1.1, 0.62, 'EMWS', 'eröffnet je VNR den Postkorbvorgang, füllt den Datenpool', tsize=8, ssize=6.0)
PK = box(s, 8.1, 1.9, 1.3, 0.62, 'Themenpostkorb', 'MV 23724 BÜ Prüf BOT', fill=WEISS, tcol=SW, scol=GRAU, line=TEAL, tsize=8, ssize=6.3)
H = box(s, 9.6, 1.9, 3.0, 0.62, 'Host-Transaktionen', 'IS011 · VA230 · OB726 · OB729 · GH040 · Scout-Service', tsize=8, ssize=6.3)
pfad(s, [(7.8, 2.21), (8.1, 2.21)], TEAL, 1.25)
pfad(s, [(5.0, 2.85), (5.0, 2.7), (11.1, 2.7), (11.1, 2.52)], TEALD, 1.0, dash=True)
pfad(s, [(8.75, 2.7), (8.75, 2.52)], TEALD, 1.0, dash=True)
text(s, 9.45, 2.74, 3.2, 0.4, 'Prüf-Bot holt den Vorgang aus dem Themenpostkorb und liest die Host-Transaktionen – nur lesend', size=6.5, color=TEALD, italic=True)
# EMWS schreibt Datenpool; Themenpostkorb-Vorgang liegt in der Vorgangs-DB
pfad(s, [(7.25, 2.52), (7.25, 3.55), (8.05, 3.55)], TEAL, 1.25)
pfad(s, [(9.3, 2.52), (9.3, 3.3)], TEAL, 1.0, dash=True)
for i, t in enumerate(['Datenpool', 'Vorgangs-DB', 'Vertragsdaten', 'Vermittlerdaten', 'Kundendaten']):
    zylinder(s, 8.05 + i * 0.93, 3.3, 0.85, 0.85, t)
text(s, 8.1, 4.12, 4.6, 0.2, 'IMSI-Datenbestand: Ziel des PTU-Abzugs · EMWS schreibt, der Prüf-Bot liest', size=7, color=GRAUD, bold=True)
# Produktion
for i, t in enumerate(['Daten-\npool', 'Vorgangs-\nDB', 'Vertrags-\ndaten', 'Vermittler-\ndaten', 'Kunden-\ndaten']):
    zylinder(s, 0.72 + i * 0.72, 5.15, 0.64, 0.8, t, fill=WEISS, tcol=GRAUD, size=6)
V = box(s, 0.72, 6.15, 3.55, 0.6, 'Produktive Maklervollmachten als Vorlage', 'kopiert nach ergodev, VNR und Agentur-Nr. angepasst', fill=WEISS, tcol=SW, scol=GRAU, line=GRAUM, tsize=7.5, ssize=6.3)
pfad(s, [(0.72, 6.45), (0.64, 6.45), (0.64, 2.21), (0.75, 2.21)], GRAUD, 1.0, dash=True)
# PTU-Pfeil im Zwischenraum
pfad(s, [(2.5, 4.8), (2.5, 4.58), (9.2, 4.58), (9.2, 4.35)], ROT, 2.0)
rect(s, 5.3, 4.45, 1.9, 0.26, ROT, None)
text(s, 5.3, 4.45, 1.9, 0.26, 'PTU-Abzug IMS → IMSI', size=8, bold=True, color=WEISS, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
# Hinweise rechts unten
rect(s, 9.15, 4.8, 3.62, 2.1, TEALT)
text(s, 9.3, 4.88, 3.35, 0.25, 'Was der PTU-Abzug liefert', size=9, bold=True, color=TEALD)
text(s, 9.3, 5.15, 3.35, 1.7, ['Vertragsdaten mit Vorgangs-DB, Postkorbvorgängen und Datenpool nahezu identisch zur Produktion',
    'Kundendaten werden anonymisiert – Name, Adresse und Geburtsdatum im Auftrag müssen danach neu ermittelt werden',
    'VNR werden bestehenden Nummern zugeschoben; die OE-Nr. wird beim Abzug angegeben und muss in IMSI existieren',
    'Nennt der Auftrag mehrere VNR, müssen alle abgezogen werden'], size=7.5, bullets=True, space_after=3, color=GRAUD)
# Anpassungs-Kasten links unten? -> rechts oben unter IMSI ist voll; unter Celonis
rect(s, 4.65, 4.8, 4.3, 2.1, ROTL)
text(s, 4.8, 4.88, 4.1, 0.25, 'Vor dem Start anpassen: Auftragsdaten auf IMSI-Stand', size=9, bold=True, color=ROT)
felder = [('Makler-E-Mail', 'Absenderadresse; Sonderliste TOP-Makler und @ergo-Fall testen'), ('Agentur-Nr.', 'muss in OB726 der Abnahme und im EMMA-Abzug existieren'),
          ('Vermittler-PNR', 'der EMMA-Abzug liefert PNR und Vermittlertyp zur Agenturnummer'), ('Kunde', 'Name, Adresse, Geburtsdatum der anonymisierten IMSI-Person'),
          ('VNR', 'alle im Auftrag genannten Nummern in IMSI vorhanden')]
for i, (k, v) in enumerate(felder):
    y = 5.17 + i * 0.34
    text(s, 4.8, y, 1.1, 0.3, k, size=7.5, bold=True, color=SW)
    text(s, 5.9, y, 2.95, 0.3, v, size=7.2, color=GRAUD)

# ================================================================== Folie 3: Vorbereitung und Wege
s = neue_folie('Only Title', 'Zwei Wege bringen Testdaten in den Datenpool: Start mit der Datenmanipulation (B), der End-to-End-Weg (A) ist vor dem Go-Live Pflicht', 'TESTKONZEPT | VORGEHEN', tsize=16)
abschnitt(s, 0.56, 1.45, 3.6, 'Vorbereitung')
vorb = [('Testfälle formulieren', 'Anforderungen an Makler, abgebenden Vermittler und Verträge, abgeleitet aus den BE und Prüfnotizen der PDD'),
        ('OE-Nr. und VNR finden', 'passende Verträge in der Produktion: aktiv und nicht aktiv, mit und ohne Geburtsdatum, Makler aktiv und inaktiv'),
        ('Verträge per PTU nach IMSI abziehen', 'OE-Nr. angeben, alle im Auftrag genannten VNR mitnehmen'),
        ('Kundendaten in IMSI ermitteln', 'anonymisierte Namen, Adressen und Geburtsdaten für die Maklervollmacht'),
        ('Makler und Vermittler prüfen', 'Agentur-Nr. in OB726, PNR und Typ in EMMA, E-Mail in OB729, Sonderliste TOP-Makler')]
for i, (k, v) in enumerate(vorb):
    y = 1.95 + i * 0.92
    nummer(s, 0.56, y + 0.02, i + 1, TEALD)
    text(s, 0.95, y, 3.2, 0.25, k, size=9, bold=True, color=SW)
    text(s, 0.95, y + 0.25, 3.2, 0.62, v, size=7.5, color=GRAUD)
# Weg A
abschnitt(s, 4.5, 1.45, 3.9, 'Weg A: End-to-End')
schritteA = [('Vorlagen kopieren', 'schöne produktive Maklervollmachten nach ergodev; VNR ersetzen oder per PTU abziehen; Agentur-Nr. ändern'),
             ('Daten angleichen', 'Kundendaten auf IMSI-Stand, EMMA-Daten mit passender PNR'),
             ('Mail einsteuern', 'an das Postfach in der Abnahme'),
             ('Celonis-Prozess starten', 'Extraktion, KI-Deckblatt, Übergabe an EMWS, Postkorbvorgang je VNR')]
for i, (k, v) in enumerate(schritteA):
    y = 1.95 + i * 0.92
    chevron(s, 4.5, y, 1.2, 0.36, i + 1, ['Vorlagen', 'Angleichen', 'Einsteuern', 'Celonis'][i], TEALL, first=(i == 0))
    text(s, 5.8, y, 2.6, 0.25, k, size=9, bold=True, color=SW)
    text(s, 5.8, y + 0.25, 2.6, 0.62, v, size=7.5, color=GRAUD)
rect(s, 4.5, 5.7, 3.9, 1.2, TEALT)
text(s, 4.62, 5.76, 3.7, 0.25, 'Prüft die ganze Kette', size=8.5, bold=True, color=TEALD)
text(s, 4.62, 6.02, 3.7, 0.85, ['Celonis-Extraktion, KI-Deckblatt und EMWS-Eröffnung werden mitgetestet', 'Aufwändiger: EMMA- und Kundendaten müssen vorab stimmen', 'Vor dem Go-Live verpflichtend'], size=7.5, bullets=True, space_after=2, color=GRAUD)
# Weg B
abschnitt(s, 8.75, 1.45, 4.0, 'Weg B: Datenmanipulation')
schritteB = [('Vorlagen kopieren', 'schöne produktive Maklervollmachten nach ergodev'),
             ('Celonis ohne EMWS', 'Mail an das Postfach in der Abnahme, Celonis-Prozess starten, Übergabe an EMWS gestoppt'),
             ('Datensatz anpassen', 'strukturierte Daten vor der Weitergabe an EMWS auf IMSI-Stand ändern: Kunde, Agentur-Nr., PNR, VNR, E-Mail'),
             ('EMWS starten', 'Postkorbvorgang eröffnen, Prüf-Bot läuft')]
for i, (k, v) in enumerate(schritteB):
    y = 1.95 + i * 0.92
    chevron(s, 8.75, y, 1.2, 0.36, i + 1, ['Vorlagen', 'Celonis', 'Anpassen', 'EMWS'][i], ROTL, first=(i == 0))
    text(s, 10.05, y, 2.7, 0.25, k, size=9, bold=True, color=SW)
    text(s, 10.05, y + 0.25, 2.7, 0.62, v, size=7.5, color=GRAUD)
rect(s, 8.75, 5.7, 4.0, 1.2, ROTL)
text(s, 8.87, 5.76, 3.8, 0.25, 'Empfehlung für den Start', size=8.5, bold=True, color=ROT)
text(s, 8.87, 6.02, 3.8, 0.85, ['Schnell, weil nur der Datensatz angepasst wird – Prüf-Bot und Host-Transaktionen sind sofort testbar', 'Jeder Testfall ist gezielt herstellbar (BE, Prüfnotiz, Sonderfälle)', 'Danach Weg A als End-to-End-Test einplanen'], size=7.5, bullets=True, space_after=2, color=GRAUD)

# ================================================================== Folie 4: Testfaelle aus der PDD (Karten)
s = neue_folie('Only Title', 'Zwölf Testfälle decken jede Business Exception und jede Prüfnotiz der PDD ab – die Daten kommen aus dem IMSI-Abzug oder aus dem angepassten Datensatz', 'TESTKONZEPT | TESTFÄLLE', tsize=16)
ART = {'BE': (ROT, ROTL), 'Prüfnotiz': (LILA, LILAL), 'Glattfall': (TEALD, TEALL)}
faelle = sorted([
 ('Agenturnummer leer / unbekannt', 'BE', 'Agenturnummer nicht vorhanden bzw. in OB726 unbekannt', 'Datensatz ohne Agentur-Nr.; Agentur-Nr., die OB726 nicht kennt', 'Datensatz', 'Vorprüfung, III'),
 ('E-Mail-Adresse des Vermittlers', 'Prüfnotiz', 'Sonderliste, OB729 oder Absender; Prüfnotiz bei @ergo oder leer', 'Agentur-Nr. aus der Sonderliste; Agentur ohne OB729-Adresse; Absender @ergo', 'Datensatz', 'III'),
 ('Geburtsdatum abweichend', 'Prüfnotiz', 'Suche einmal ohne Geburtsdatum, dann Prüfnotiz', 'Auftrag mit falschem Geburtsdatum; Kunde ohne Geburtsdatum', 'Datensatz', 'I'),
 ('Glattfall Makler', 'Glattfall', 'Notiz bestückt, Übergabe an HSB4K 72', 'aktiver Vertrag, aktiver Makler in OB726 und GH040, Vollmacht mit Unterschrift', 'IMSI + Datensatz', 'alle'),
 ('Glattfall Mehrfachagent', 'Glattfall', 'Notiz bestückt, kein Vollmachtsbezug', 'BÜ-Wunsch = ja, Betreuungswunsch auf MFA, EMMA-Typ MFA', 'Datensatz', 'Vorprüfung'),
 ('Komposit / Leben', 'Glattfall', 'Notiz 1515 mit Anforderung Unterlagen; KR-Mantelvertrag als BE; Routing HSB4K KO / ODPB', 'KR-Flottenvertrag; Bestandsinhaber AO und Makler', 'IMSI', 'IV, VI, VII'),
 ('Kunde nicht gefunden / nicht VN', 'BE', 'Trefferliste leer, andere Rolle am Vertrag, fremder Vertrag', 'Name und Adresse abweichend; Partner mit anderer Rolle am Vertrag', 'IMSI', 'I'),
 ('Makler inaktiv', 'BE', 'Keine Zusammenarbeit', 'OB726-Name mit INAKTIV oder GH040-Status ungleich aktiv', 'IMSI', 'III'),
 ('Mehrere VNR im Auftrag', 'Glattfall', 'ein Vorgang je VNR, weitere VNR im Bearbeitungshinweis', 'Kunde mit mehreren Verträgen, alle per PTU abgezogen', 'IMSI', 'Start, VII'),
 ('Unterlagen unvollständig', 'Prüfnotiz', 'Prüfnotiz mit Feldwert, dann Nachprüfung erforderlich', 'BUE_PRUEFUNG_UNTERLAGEN = MV fehlt; leer; Reminder', 'Datensatz', 'Vorprüfung, V'),
 ('Unterschrift VN fehlt', 'BE', 'Unterschrift VN fehlt', 'Vollmacht ohne Unterschrift des Versicherungsnehmers', 'Datensatz', 'Vorprüfung'),
 ('Vertrag nicht aktuell', 'BE', 'Vertrag nicht aktuell mit VA230-Status', 'stornierter oder beitragsfreier Vertrag', 'IMSI', 'IV'),
], key=lambda f: f[0].lower())
KX = [0.56, 4.7, 8.84]; KW = 3.93; KH = 1.22; KY0 = 1.45; KDY = 1.3
for n, (titel, art, erg, daten, quelle, kap) in enumerate(faelle):
    x = KX[n % 3]; y = KY0 + (n // 3) * KDY
    farbe, hell = ART[art]
    rect(s, x, y, KW, KH, WEISS, GRAUM, lw=0.75)
    rect(s, x, y, KW, 0.3, hell, None)
    b = rect(s, x + 0.08, y + 0.05, 0.5, 0.2, farbe, None, MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = b.text_frame; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    runs_in(tf, [[('TF-%02d' % (n + 1), 7.5, True, WEISS, False)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, x + 0.66, y + 0.03, 2.4, 0.25, titel, size=9, bold=True, color=SW, anchor=MSO_ANCHOR.MIDDLE)
    text(s, x + 3.0, y + 0.03, 0.85, 0.25, art, size=7, bold=True, color=farbe, align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE)
    text(s, x + 0.1, y + 0.36, KW - 0.2, 0.3, [[('Erwartet  ', True), (erg, False)]], size=7.2, color=GRAUD, space_after=0)
    text(s, x + 0.1, y + 0.62, KW - 0.2, 0.3, [[('Daten  ', True), (daten, False)]], size=7.2, color=GRAUD, space_after=0)
    q = rect(s, x + 0.08, y + KH - 0.24, 1.15, 0.17, TEALT if quelle.startswith('IMSI') else GRAUL, None, MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = q.text_frame; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    runs_in(tf, [[('Quelle: ' + quelle, 6.5, True, TEALD if quelle.startswith('IMSI') else GRAUD, False)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, x + 1.35, y + KH - 0.25, KW - 1.45, 0.2, 'PDD-Kapitel ' + kap, size=6.5, color=GRAU, align=PP_ALIGN.RIGHT, italic=True)
# Legende
ly = KY0 + 4 * KDY + 0.02
for i, (k, (farbe, hell)) in enumerate(ART.items()):
    rect(s, 0.56 + i * 1.35, ly + 0.04, 0.16, 0.16, farbe, None)
    text(s, 0.78 + i * 1.35, ly, 1.1, 0.25, k, size=7.5, color=GRAUD, anchor=MSO_ANCHOR.MIDDLE)
text(s, 4.7, ly, 8.07, 0.25, 'Quelle IMSI: Vertrags- und Partnerdaten aus dem PTU-Abzug. Quelle Datensatz: Felder BUE_* vor der Übergabe an EMWS (Weg B) bzw. in der Maklervollmacht (Weg A). Sortierung alphabetisch, ID TF-nn.', size=7, color=GRAU, italic=True, anchor=MSO_ANCHOR.MIDDLE)

prs.save(OUT); print('ok', OUT)
