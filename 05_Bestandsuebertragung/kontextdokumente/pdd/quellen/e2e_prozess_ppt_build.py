# -*- coding: utf-8 -*-
"""E2E-Prozess und Loesungsarchitektur Makler BUE meets KI – Folien im ERGO-Master."""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn

SRC = '20260916_Abstimmung_Budget_2027_Celonis_Vorlage.pptx'; OUT = '../20260918_E2E_Prozess_Architektur_Makler_BUE_KI.pptx'  # Aufruf aus pdd/quellen/
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
                r.text = 'ERGO | Makler BÜ meets KI – End-to-End-Prozess und Lösungsarchitektur (Vorschlag) - 18.09.2026' if i == 0 else ''
sldIdLst = prs.slides._sldIdLst
for sldId in list(sldIdLst)[1:]:
    prs.part.drop_rel(sldId.rId); sldIdLst.remove(sldId)
for sh in prs.slides[0].shapes:
    if sh.has_text_frame and sh.text_frame.text.startswith('Makler BÜ meets KI'):
        r = sh.text_frame.paragraphs[0].runs[0]; r.text = 'Makler BÜ meets KI | End-to-End-Prozess und Lösungsarchitektur (Vorschlag)'
        for x in sh.text_frame.paragraphs[0].runs[1:]: x.text = ''
    if sh.has_text_frame and sh.text_frame.text.strip() == 'Budgetplanung 26/27':
        r = sh.text_frame.paragraphs[0].runs[0]; r.text = 'Zielprozess und Architektur'
        for x in sh.text_frame.paragraphs[0].runs[1:]: x.text = ''
    if sh.has_text_frame and sh.text_frame.text.strip().startswith('17. September'):
        r = sh.text_frame.paragraphs[0].runs[0]; r.text = '18. September 2026'
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

# ================================================================== Folie 2: E2E-Prozess (Swimlanes)
s = neue_folie('Only Title', 'Zielprozess: Celonis strukturiert jede Makler-Mail und eröffnet je VNR über EMWS einen Postkorbvorgang, der den Prüf-Bot der Sparte triggert; alles Übrige geht mit KI-Deckblatt an KWAD', 'END-TO-END-PROZESS | ZIELBILD', tsize=16)
X0, X1 = 0.56, 12.77; LW = 1.5
ph = [(2.11, 3.65, 'Eingang'), (3.72, 7.0, 'KI-Strukturierung'), (7.07, 8.75, 'Einsteuerung'), (8.82, 10.85, 'Prüfung'), (10.92, 12.77, 'Folgebearbeitung')]
for i, (a, b, t) in enumerate(ph):
    chevron(s, a, 1.42, b - a, 0.3, i + 1, t, ROTL if i == 0 else TEALL, first=(i == 0))
lanes = [('Makler-Eingang', 'Gruppenpostfächer'), ('Celonis', 'KI-Strukturierung'), ('Eingangs-\nmanagement', 'KWAD / Sparte'), ('Postkorb', 'Eröffnung über EMWS-Schnittstelle'), ('Robotics', 'Prüf-Bots (Blue Prism): VA230, IS100, OB726, GH040, EOS'), ('Folgebearbeitung', 'BÜ-Bots / Nachbearbeitung')]
LY0, LH = 1.85, 0.8
for i, (t, u) in enumerate(lanes):
    y = LY0 + i * LH
    rect(s, X0, y, X1 - X0, LH - 0.04, GRAUL if i % 2 == 0 else WEISS, None)
    lb = rect(s, X0, y, LW, LH - 0.04, TEALD if i != 2 else GRAUD)
    tf = lb.text_frame; tf.margin_left = Inches(0.1)
    runs_in(tf, [[(t, 9, True, WEISS, False)], [(u, 7, False, TEALL if i != 2 else GRAUL, False)]], anchor=MSO_ANCHOR.MIDDLE, space_after=1)
top = lambda i: LY0 + i * LH + 0.09
BH = 0.58
cy = lambda i: top(i) + BH / 2
# L1 Eingang
A = box(s, 2.2, top(0), 1.45, BH, 'Makler-E-Mail mit Anhängen', 'maklerauftraege@ergo.de\nbestandsuebertragungen@ergo.de', fill=WEISS, tcol=SW, scol=GRAU, line=ROT, tsize=8, ssize=5.8)
# L2 Celonis
A2 = box(s, 2.2, top(1), 1.45, BH, 'Umleitung per Outlook-Regel', 'bustrukturierung@ergo.de', fill=WEISS, tcol=SW, scol=GRAU, line=TEAL, tsize=8, ssize=6.3)
B = box(s, 3.85, top(1), 1.3, BH, 'Action Flow: Klassifikation, Extraktion', 'Agent je GeVo · OCR', tsize=8, ssize=6.3)
V = box(s, 5.27, top(1), 1.1, BH, 'VNR-Abruf über die VDB', 'alle zu übertragenden VNR des Kunden', tsize=8, ssize=6.3)
C = box(s, 6.49, top(1), 1.0, BH, 'KI-Deckblatt je VNR', 'immer Einzel-BÜ', tsize=8, ssize=6.3)
D = raute(s, 8.05, cy(1), 1.0, 0.62, 'GeVo-\nWeiche')
# L3 KWAD
K1 = box(s, 8.45, top(2), 1.05, BH, 'KWAD liest Deckblatt', 'AIDA-OCR, Betreff-Kennzeichen', fill=GRAUD, tsize=8, ssize=6.3)
K2 = box(s, 9.65, top(2), 1.35, BH, 'Indizierung in die Sparte', 'kein GeVo Bestandsübertragung', fill=GRAUD, tsize=8, ssize=6.3)
K3 = box(s, 11.15, top(2), 1.62, BH, 'Fachbearbeitung Sparte', 'z. B. VN-Wechsel; BÜ-Wunsch ggf. im Nachgang', fill=WEISS, tcol=SW, scol=GRAU, line=GRAUD, tsize=8, ssize=6.3)
# L4 EMWS
E = box(s, 7.2, top(3), 1.7, BH, 'Postkorbvorgang eröffnet (Trigger)', 'EMWS-SST · MV 23724 BÜ Prüf BOT · ein Vorgang je VNR', tsize=8, ssize=6.3)
Fd = raute(s, 9.45, cy(3), 0.85, 0.58, 'Sparte')
# L5 Prüf-Bot
G = box(s, 9.0, top(4), 2.0, BH, '', fill=TEAL)
line(s, 10.0, top(4) + 0.05, 10.0, top(4) + BH - 0.05, WEISS, 1.0)
text(s, 9.06, top(4) + 0.05, 0.9, 0.48, [[('Prüf-Bot KV', True)], [('Notiz BOT2011', False)]], size=7.5, color=WEISS, anchor=MSO_ANCHOR.MIDDLE)
text(s, 10.06, top(4) + 0.05, 0.9, 0.48, [[('Prüf-Bot Komposit/Leben', True)], [('Notiz BOT1515', False)]], size=7.5, color=WEISS, anchor=MSO_ANCHOR.MIDDLE)
H = raute(s, 11.5, cy(4), 0.85, 0.58, 'Ergebnis', size=7)
# L6 Folge
I1 = box(s, 8.95, top(5), 2.05, BH, 'BE oder Fehler: Nachbearbeitung', 'KV: Themenpostkorb HSB4K MV · K/L: abgebender Makler → ODPB, AO → HSB4K MV', fill=WEISS, tcol=ROT, scol=GRAU, line=ROT, tsize=8, ssize=6.3)
I2 = box(s, 11.1, top(5), 1.67, BH, 'Frei: 72-Std.-BOT / BÜ-Bot', 'KV: alle über 72-Std.-BOT · K/L: nur AO-Bestand, sonst direkt BOT1515', fill=TEALD, tsize=8, ssize=6.3)
# Pfeile
pfad(s, [(2.925, top(0) + BH), (2.925, top(1))])
pfad(s, [(3.65, cy(1)), (3.85, cy(1))]); pfad(s, [(5.15, cy(1)), (5.27, cy(1))]); pfad(s, [(6.37, cy(1)), (6.49, cy(1))]); pfad(s, [(7.49, cy(1)), (7.55, cy(1))])
pfad(s, [(8.05, cy(1) + 0.31), (8.05, top(3))])                                   # Weiche -> EMWS
pfad(s, [(8.55, cy(1)), (8.97, cy(1)), (8.97, top(2))])                           # Weiche -> KWAD
etikett(s, 6.55, top(2) + 0.02, 1.4, 'BÜ-Vorgang: Makler, MFA,\nKündigung Maklervollmacht', align=PP_ALIGN.RIGHT)
etikett(s, 9.02, cy(1) - 0.2, 1.2, 'übrige Anliegen')
pfad(s, [(9.5, cy(2)), (9.65, cy(2))]); pfad(s, [(11.0, cy(2)), (11.15, cy(2))])
pfad(s, [(8.9, cy(3)), (9.025, cy(3))])
pfad(s, [(9.45, cy(3) + 0.29), (9.45, top(4))]); etikett(s, 9.49, cy(3) + 0.3, 0.4, 'KV')
pfad(s, [(9.875, cy(3)), (10.5, cy(3)), (10.5, top(4))]); etikett(s, 10.54, cy(3) + 0.05, 0.9, 'Komposit / Leben')
pfad(s, [(11.0, cy(4)), (11.075, cy(4))])
yg = top(5) - 0.09
line(s, 11.5, cy(4) + 0.29, 11.5, yg); line(s, 11.5, yg, 9.975, yg)
pfad(s, [(9.975, yg), (9.975, top(5))]); pfad(s, [(11.5, yg), (11.5, top(5))])
lb = rect(s, 10.55, yg - 0.075, 0.36, 0.15, WEISS); tf = lb.text_frame; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
runs_in(tf, [[('BE', 6.5, True, ROT, False)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
etikett(s, 11.55, yg - 0.05, 0.5, 'frei', bold=True, color=TEALD)
# Legende
ly = 6.72
rect(s, 2.11, ly + 0.03, 0.22, 0.14, TEAL); text(s, 2.38, ly, 1.3, 0.2, 'automatisiert', size=7, color=GRAU)
rect(s, 3.35, ly + 0.03, 0.22, 0.14, GRAUD); text(s, 3.62, ly, 1.6, 0.2, 'Eingangsmanagement / manuell', size=7, color=GRAU)
rect(s, 5.3, ly + 0.03, 0.22, 0.14, WEISS, TEALD, MSO_SHAPE.DIAMOND); text(s, 5.57, ly, 1.0, 0.2, 'Weiche', size=7, color=GRAU)
text(s, 6.6, ly, 6.17, 0.2, 'Weiche-Zuordnung der Anliegen (GeVo-Logik) siehe Folie 3; Prüfung und Nachbearbeitung je Sparte siehe Folie 4.', size=7, color=GRAU, italic=True)

# ================================================================== Folie 3: Weiche (Entscheidungstabelle)
s = neue_folie('Only Title', 'Die Weiche nach der KI-Strukturierung: nur Bestandsübertragungen werden über die EMWS-Schnittstelle als Postkorbvorgang eröffnet, alle übrigen Anliegen gehen mit Deckblatt an KWAD', 'END-TO-END-PROZESS | GEVO-LOGIK DER WEICHE', tsize=17)
abschnitt(s, 0.56, 1.5, 7.0, 'Zuordnung der Anliegen nach der Klassifikation')
Hd = lambda t: (t, {})
rows = [
    [Hd('Anliegen (Klassifikation im KI-Deckblatt)'), Hd('Erkennungsmerkmal'), Hd('Kanal'), Hd('Empfänger und Vorgang'), Hd('Weiterverarbeitung')],
    [('1  Bestandsübertragung Makler', {'bold': True}), 'BUE_KLASSIFIKATION = BÜ-Vorgang, BÜ-Wunsch vorhanden, Vermittlertyp Makler', ('Postkorb (EMWS)', {'bold': True, 'color': TEALD}), 'Postkorbvorgang „MV 23724 BÜ Prüf BOT“, eröffnet über die EMWS-Schnittstelle, ein Vorgang je Versicherungsnummer (immer Einzel-BÜ: Celonis ruft vorab über die VDB alle zu übertragenden VNR ab), BUE_*-Felder im Datenpool', 'Postkorbvorgang triggert je Sparte einen Prüf-Bot-Lauf (KV bzw. Komposit/Leben); Makler-Zweig mit Vollmachtskriterien'],
    [('2  Betreuungswechsel Mehrfachagent (MFA)', {'bold': True}), 'Agenturnummer per EMMA-Abgleich als Mehrfachagent erkannt; keine Maklervollmacht erforderlich (MV-Felder N/A)', ('Postkorb (EMWS)', {'bold': True, 'color': TEALD}), 'wie 1', 'Prüf-Bot, MFA-Zweig mit Betreuungswunsch-Kriterien'],
    [('3  Kündigung Maklervollmacht', {'bold': True}), 'Kündigung der Vollmacht durch Makler oder Kunde; nicht belegbare Deckblattfelder mit N/A', ('Postkorb (EMWS)', {'bold': True, 'color': TEALD}), 'wie 1', 'Prüf-Bot, läuft im BÜ-Prozess (Einordnung M. Koch)'],
    [('4  Übrige Anliegen', {'bold': True}), 'VN-Wechsel, WEG-Wechsel, Kündigung Versicherungsvertrag, Verkürzung Kündigungsfrist, Sonstige Fachthemen; Anfrage/Rücksprache, Antrag/Änderung, Schadenmeldung, Kein-Makler-Vorgang', ('KWAD', {'bold': True, 'color': GRAUD}), 'kwad@ergo.de mit KI-Deckblatt und eigener Betreffkennzeichnung; Eingangsmanagement liest das Deckblatt per AIDA-OCR und indiziert in die zuständige Sparte', 'Fachbearbeitung in der Sparte, kein GeVo Bestandsübertragung; ein BÜ-Wunsch folgt ggf. als eigener Vorgang'],
    [('Sonderfälle: Reminder, Spam', {'bold': True, 'color': GRAU}), 'BUE_REMINDER = ja bzw. kein Vorgang', ('zu klären', {'bold': True, 'color': ROT}), 'Reminder heute als Postkorbvorgang in den Prüf-Bot, dort Business Exception; Spam ohne Weiterleitung', 'Vorschlag: Reminder bereits in Celonis dem Erstvorgang zuordnen und nicht neu eröffnen'],
]
table(s, 0.56, 2.0, [2.3, 3.2, 0.8, 3.1, 2.8], rows, rowh=0.5, size=8)
text(s, 0.56, 5.75, 6.0, 1.0, [[('Warum die Weiche vor dem Postkorb liegt', True)],
     'Ein VN-Wechsel mit anschließendem BÜ-Wunsch muss zuerst als VN-Wechsel in die Sparte; als Bestandsübertragung eröffnet liefe er in die falsche Bearbeitung. Eine Maklervollmacht mit bloßer Adressänderung ist keine Bestandsübertragung. Die Klassifikation steht im Klartext im Deckblatt, nicht als GeVo-Nummer, und bleibt damit unabhängig von der GeVo-Zählweise.'], size=9)
text(s, 6.9, 5.75, 5.87, 1.0, [[('Voraussetzungen beim Eingangsmanagement', True)],
     'AIDA-OCR zur maschinellen Auslesung des Deckblatts (6 PT, gestafft), eindeutige Betreffkennzeichnung der KWAD-Mails, Verarbeitung nach Klassifikation oder eigene Indizierung. Die Zuordnung der vier Vorgangsarten zur GeVo-Logik ist mit Celonis (Ausbaustufe 2: Agent je GeVo) und dem Fachbereich zu bestätigen.'], size=9)

# ================================================================== Folie 4: Prüfung und Folgebearbeitung je Sparte
s = neue_folie('Only Title', 'Der Postkorbvorgang triggert den Prüf-Bot der Sparte: beide prüfen gleich, Nachbearbeitung und Übergabe an den 72-Stunden-BOT unterscheiden sich', 'END-TO-END-PROZESS | PRÜFUNG UND FOLGEBEARBEITUNG', tsize=17)
abschnitt(s, 0.56, 1.5, 4.0, 'Prüf-Bot Gesundheit / KV')
abschnitt(s, 6.9, 1.5, 4.0, 'Prüf-Bot Komposit / Leben')
def stufe(x, y, w, nr, titel, txt, fill=TEALT, tcol=TEALD):
    rect(s, x, y, w, 0.72, fill)
    b = rect(s, x + 0.12, y + 0.18, 0.36, 0.36, tcol, None, MSO_SHAPE.OVAL)
    runs_in(b.text_frame, [[(str(nr), 10, True, WEISS, False)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, x + 0.6, y + 0.08, w - 0.7, 0.22, titel, size=9.5, bold=True)
    text(s, x + 0.6, y + 0.3, w - 0.7, 0.42, txt, size=8, color=GRAUD)
kv = [('Vorprüfung – sechs Ausschlusskriterien', 'Klassifikation = BÜ-Vorgang, BÜ-Wunsch, kein Reminder, Unterlagen vollständig, Maklervollmacht vorhanden, Vollmachtgeber = Versicherungsnehmer. Erst dann Hostzugriffe.'),
      ('I. Versicherungsnehmer – VNR und Stammdaten', 'Genau eine VNR je Vorgang (Einzel-BÜ, VNR-Abruf durch Celonis über die VDB). VA230: Vertrag und Status. IS100 / Scout-Service: Name, Geburtsdatum, Adresse; Vorschlag T. Juraschek: Partnersuche in IS011 statt Feldvergleich.'),
      ('II. Übernehmender Makler', 'OB726 über Agenturnummer oder PNR, Anbindungsstatus in GH040, Stammagentur über EOS, Agentur-Nr. und Anbindung des bisherigen Bestandsinhabers.'),
      ('BE-Handling', 'Gesammelte Prüfnotizen bewerten. Bei Business Exception oder Fehler in der Prüfung geht der Vorgang mit Bearbeitungshinweis in den Themenpostkorb HSB4K MV.'),
      ('Weiterleitung', 'Läuft die Prüfung sauber durch, triggert der Bot mit Notiz BOT2011 den 72-Stunden-BOT. Er erkennt AO-Bestandsinhaber selbst, wahrt die Frist und leitet alle übrigen direkt an den BÜ-BOT.')]
kl = [('Vorprüfung – sechs Ausschlusskriterien', 'Wie KV; Kriterien für Komposit/Leben fachlich noch zu bestätigen (PDD ab 22.09.).'),
      ('I. Versicherungsnehmer – VNR und Stammdaten', 'Wie KV; genau eine VNR je Vorgang. Sparten: SU, KFZ, Haftpflicht, Unfall, Rechtsschutz, Sach, Leben/BU.'),
      ('II. Übernehmender Makler', 'Wie KV, zusätzlich Ermittlung des Vertriebskanals des Bestandsinhabers (Makler oder AO).'),
      ('BE-Handling nach abgebendem Bestandsinhaber', 'Bei Business Exception oder Fehler entscheidet der abgebende Bestandsinhaber: Makler → Nachbearbeitung in ODPB; AO → Themenpostkorb HSB4K MV.'),
      ('Weiterleitung', 'Sauber geprüft: AO-Bestandsinhaber über den 72-Stunden-BOT (Vorabinformation, Frist); Makler-Bestandsinhaber direkt an den BÜ-Bot BOT1515 mit vollständig bestückter Notiz.')]
for i, ((t1, x1), (t2, x2)) in enumerate(zip(kv, kl)):
    y = 1.95 + i * 0.82
    stufe(0.56, y, 5.9, i + 1, t1, x1)
    same = x2.startswith('Wie KV')
    stufe(6.9, y, 5.87, i + 1, t2, x2, fill=GRAUL if same else TEALT, tcol=GRAUM if same else TEALD)
text(s, 0.56, 6.1, 12.2, 0.4, [[('Gemeinsam für beide Sparten: ', True), ('Jeder Postkorbvorgang ist eine Einzel-BÜ, weil Celonis vorab über die VDB alle zu übertragenden VNR abruft und je VNR einen Vorgang eröffnet. Der Bot sammelt alle Prüfergebnisse und entscheidet erst danach; nur ein sauber geprüfter Vorgang triggert den 72-Stunden-BOT bzw. den BÜ-Bot. Grau hinterlegte Stufen bei Komposit/Leben übernehmen die KV-Logik und werden im PDD ab 22.09. konkretisiert.', False)]], size=8.5, color=GRAUD)

# ================================================================== Folie 5: Loesungsarchitektur
s = neue_folie('Only Title', 'Lösungsarchitektur: Celonis strukturiert, der Postkorbvorgang mit Datenpool trägt den Fall, Blue Prism prüft gegen die Hostsysteme, KWAD übernimmt alles Übrige', 'END-TO-END-PROZESS | LÖSUNGSARCHITEKTUR', tsize=17)
def sysbox(x, y, w, h, titel, zeilen, fill=TEAL, tcol=WEISS, line_=None, dash=False):
    r = rect(s, x, y, w, h, fill, line_, dash=dash)
    tf = r.text_frame; tf.margin_left = tf.margin_right = Inches(0.1); tf.margin_top = Inches(0.06)
    paras = [[(titel, 10, True, tcol, False)]] + [[(z, 7.5, False, tcol, False)] for z in zeilen]
    runs_in(tf, paras, anchor=MSO_ANCHOR.TOP, space_after=2)
    return r
# Spalte 1: Eingang
sysbox(0.56, 1.6, 2.2, 1.35, 'Outlook / Gruppenpostfächer', ['maklerauftraege@ergo.de', 'bestandsuebertragungen@ergo.de', 'Outlook-Regel → bustrukturierung@ergo.de'], fill=WEISS, tcol=SW, line_=ROT)
# Spalte 2: Celonis
sysbox(3.2, 1.6, 2.6, 1.35, 'Celonis Action Flow', ['Vorklassifizierung (Agent je GeVo, Spam, Reminder)', 'OCR Image/Jadice, EMMA-Abgleich (Makler/MFA)', 'VDB-Abruf aller zu übertragenden VNR', 'KI-Deckblatt je VNR, Datenpoolfelder BUE_*'])
# Spalte 3: zwei Kanaele
sysbox(6.25, 1.6, 2.6, 1.35, 'Postkorb (Eröffnung über EMWS-SST)', ['EMWS ist nur die Schnittstelle zur Eröffnung', 'Postkorb „MV 23724 BÜ Prüf BOT“, ein Vorgang je VNR (Einzel-BÜ), triggert je Sparte den Prüf-Bot', 'Datenpool: 35 Felder BUE_*, GeVo 108 (K/L), Dokumenttyp 02015 (KV)'])
sysbox(6.25, 3.2, 2.6, 1.3, 'KWAD (Eingangsmanagement)', ['kwad@ergo.de, Betreffkennzeichen', 'AIDA-OCR liest das KI-Deckblatt', 'Indizierung in die Sparte, kein GeVo BÜ'], fill=GRAUD)
# Spalte 4: Robotics
sysbox(9.3, 1.6, 3.47, 1.35, 'Blue Prism – Prüf-Bots KV und Komposit/Leben', ['lesend: VA230, IS100 + Scout-Service (Vorschlag IS011), OB726, GH040, EOS', 'schreibend: Notiz BOT2011 / BOT1515, Bearbeitungshinweis', 'Wiederanlauf vollständig von vorne, keine Zwischenstände'])
sysbox(9.3, 3.2, 1.65, 1.3, 'Nachbearbeitung bei BE / Fehler', ['KV: HSB4K MV', 'K/L: Makler → ODPB', 'K/L: AO → HSB4K MV'], fill=WEISS, tcol=ROT, line_=ROT)
sysbox(11.12, 3.2, 1.65, 1.3, '72-Std.-BOT → BÜ-Bots', ['BOT2011 (KV)', 'BOT1515 (Komposit/Leben)', 'AO-Frist, Maklerinfo'], fill=TEALD)
# Sparte / Sachbearbeitung
sysbox(3.2, 3.2, 2.6, 1.3, 'Sachbearbeitung Sparte', ['VN-Wechsel, WEG-Wechsel, Kündigung VV, Fristverkürzung, Sonstige', 'BÜ-Wunsch ggf. als Folgevorgang'], fill=WEISS, tcol=SW, line_=GRAUD)
# Reporting
sysbox(0.56, 4.85, 12.21, 0.62, 'Reporting (MIS-O, Fachkonzept v2)', ['Status und Rückstand je Vorgang über GeVo 469/108 (Komposit/Leben) und Dokumenttyp 02015/06065 (KV); Bot-Reports mit Ordnungsbegriff, Status und Tags (C2). Automatisierung des Rückstands-Reportings als Zielbild.'], fill=TEALL, tcol=SW)
# Pfeile
pfad(s, [(2.76, 2.27), (3.2, 2.27)])
pfad(s, [(5.8, 2.1), (6.25, 2.1)]); etikett(s, 5.82, 1.9, 0.45, 'BÜ')
pfad(s, [(5.8, 2.6), (6.0, 2.6), (6.0, 3.77), (6.25, 3.77)]); etikett(s, 6.05, 2.98, 0.9, 'übrige Anliegen')
pfad(s, [(8.85, 2.27), (9.3, 2.27)]); etikett(s, 8.87, 2.05, 0.45, 'Trigger')
pfad(s, [(6.25, 4.05), (5.8, 4.05)])
pfad(s, [(10.12, 2.95), (10.12, 3.2)]); pfad(s, [(11.94, 2.95), (11.94, 3.2)])
etikett(s, 10.17, 2.98, 0.6, 'BE', bold=True, color=ROT); etikett(s, 11.99, 2.98, 0.6, 'frei', bold=True, color=TEALD)
text(s, 0.56, 5.7, 12.2, 1.1, [[('Grundsätze: ', True), ('EMWS ist kein System im Prozess, sondern die Schnittstelle, über die Celonis den Postkorbvorgang eröffnet. Der Datenpool ist die Feldablage dieses Vorgangs; Celonis beschreibt ihn, der Prüf-Bot liest ihn. Der Postkorbvorgang ist der Trigger für den Prüf-Bot der Sparte; ein sauber geprüfter Vorgang triggert den 72-Stunden-BOT bzw. die Nachbearbeitung. Alle Hostzugriffe des Bots sind lesend, schreibend ist nur die Notiz. Nicht-BÜ-Anliegen werden nie als Postkorbvorgang eröffnet, sondern gehen mit demselben KI-Deckblatt an KWAD.', False)],
     [('Ausbaustufe 2 (Infomotion, 32 PT, zehn Wochen): ', True), ('Mehrfachagenten, VNR-Logik mit Vorgang je VNR, Anforderung weiterer Unterlagen, KI-Deckblatt und EMWS-Anbindung, Lasttest 2.500 Vorgänge je Woche.', False)]], size=8.5, color=GRAUD)

# ================================================================== Folie 6: Annahmen und offene Punkte
s = neue_folie('Only Title', 'Annahmen im Zielbild und Punkte, die vor der Finalisierung der PDD Komposit/Leben ab 22.09. zu bestätigen sind', 'END-TO-END-PROZESS | ANNAHMEN UND OFFENE PUNKTE', tsize=17)
abschnitt(s, 0.56, 1.5, 4.5, 'Annahmen (aus Abstimmungen abgeleitet)')
text(s, 0.56, 2.0, 5.9, 4.5, ['Nur „BÜ-Vorgang“ mit BÜ-Wunsch wird über die EMWS-Schnittstelle als Postkorbvorgang eröffnet; Mehrfachagenten und Kündigung Maklervollmacht gehören dazu (Einordnung M. Koch, 11.09.).',
     'Alle übrigen Anliegen gehen mit KI-Deckblatt und Betreffkennzeichen an kwad@ergo.de; das Eingangsmanagement indiziert per AIDA-OCR in die Sparte (Mail an H. Schumann, 11.09.).',
     'Celonis ruft vor der Eröffnung über die VDB alle zu übertragenden VNR des Kunden ab und eröffnet je VNR einen Postkorbvorgang; jeder Prüf-Bot-Lauf ist damit eine Einzel-BÜ (Test 15.09.: Doppelbuchung bei „Gesamt“ vermieden).',
     'BE oder Fehler in der Prüfung: KV in den Themenpostkorb HSB4K MV; Komposit/Leben nach abgebendem Bestandsinhaber, Makler → Nachbearbeitung in ODPB, AO → HSB4K MV.',
     'KV: alle freigegebenen Vorgänge über den 72-Stunden-BOT. Komposit/Leben: 72-Stunden-BOT nur bei AO-Bestandsinhaber, sonst direkt BOT1515.',
     'Datenpool-Schlüssel ab V1.7: GeVo 108 (Komposit/Leben) und Dokumenttyp 02015 (KV); Reporting behält 469 und 06065.',
     'Die EMWS-Anbindung wird in Ausbaustufe 2 vorgezogen, damit der Prüf-Bot ab Anfang Oktober aufgebaut werden kann.'], size=9.5, bullets=True, space_after=6)
abschnitt(s, 6.9, 1.5, 4.5, 'Zu bestätigen')
pts = [('Celonis / Infomotion', 'Zuordnung der vier Vorgangsarten zur GeVo-Logik der Vorklassifizierung; Umgang mit Reminder und Spam (Zuordnung zum Erstvorgang statt Neueröffnung).'),
       ('Eingangsmanagement', 'Wortlaut und Platzierung der Betreffkennzeichnung, Auslesen der Klassifikation per AIDA-OCR, Zeitpunkt der Umsetzung (6 PT gestafft).'),
       ('Fachbereich / Robotics', 'Partnerprüfung über IS011 statt Feldvergleich in IS100 (Vorschlag T. Juraschek, Entscheidung Montag); Postkorb-Nummern HSB4K MV und ODPB; Notizform; Umgang mit „Gesamt“ im PDD, wenn der VDB-Abruf den Umfang bereits auflöst.'),
       ('Komposit / Leben', 'Verwaltungssystemschlüssel für Komposit im Datenpool (Leben: LF), Ausschlusskriterien und Vertriebskanal-Ermittlung im PDD ab 22.09.'),
       ('Reporting', 'Bestätigung, dass Reporting- und Datenpool-Schlüssel dieselben Geschäftsvorfälle abbilden; Automatisierung des Rückstands-Reportings.')]
for i, (w, t) in enumerate(pts):
    y = 2.0 + i * 0.86
    rect(s, 6.9, y, 5.87, 0.76, TEALT)
    text(s, 7.05, y + 0.08, 1.7, 0.6, w, size=9, bold=True, color=TEALD)
    text(s, 8.75, y + 0.08, 3.95, 0.66, t, size=8.5, color=GRAUD)

prs.save(OUT); print('ok', OUT)
