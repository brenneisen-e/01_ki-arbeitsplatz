# -*- coding: utf-8 -*-
"""Baut die Budgetfolien direkt in die ERGO-Vorlage (Folienmaster) ein."""
import copy
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.dml import MSO_PATTERN
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

SRC = '20260916_Abstimmung_Budget_2027_Celonis_Vorlage.pptx'; OUT = '../20261013_Budget_Celonis_2026.pptx'  # Stand 13.10.: Finanzierung 2026 (MBS, HS, Celonis), +3 PT Eingangsmanagement  # Aufruf aus pdd/quellen/
ROT = RGBColor(0xBF, 0x15, 0x28); TEAL = RGBColor(0x0F, 0x94, 0xA7); TEAL2 = RGBColor(0x47, 0xBC, 0xC5); TEALL = RGBColor(0xCC, 0xEB, 0xED)
GRAU = RGBColor(0x6B, 0x6B, 0x6B); GRAUL = RGBColor(0xED, 0xED, 0xED); GRAUM = RGBColor(0x80, 0x80, 0x80); SW = RGBColor(0x1A, 0x1A, 0x1A); WEISS = RGBColor(0xFF, 0xFF, 0xFF)
ORANGE = RGBColor(0xE8, 0x78, 0x1A); LILA = RGBColor(0xB5, 0x8A, 0xB0); LILAL = RGBColor(0xEA, 0xDD, 0xE6); LILAM = RGBColor(0xD6, 0xBF, 0xD0); TEALT = RGBColor(0xDD, 0xEF, 0xF2)
F = 'Arial'

prs = Presentation(SRC)
LAY = {l.name: l for l in prs.slide_layouts}
# Fusszeile des Folienmasters auf diese Praesentation umstellen
for sh in prs.slide_master.shapes:
    if sh.has_text_frame and 'Zwischenbericht' in sh.text_frame.text:
        sh.width = Inches(7.5)
        for para in sh.text_frame.paragraphs:
            for i, r in enumerate(para.runs):
                r.text = 'ERGO | Makler BÜ meets KI – Budget Celonis 2026 - Stand 13.10.2026' if i == 0 else ''

# alte Folien 2 und 3 entfernen
sldIdLst = prs.slides._sldIdLst
for sldId in list(sldIdLst)[1:]:
    prs.part.drop_rel(sldId.rId); sldIdLst.remove(sldId)

# Titelfolie: Untertitel anpassen
for sh in prs.slides[0].shapes:
    if sh.has_text_frame and sh.text_frame.text.startswith('Makler BÜ meets KI'):
        r = sh.text_frame.paragraphs[0].runs[0]; r.text = 'Makler BÜ meets KI | Celonis-Ausbaustufe 2 und Finanzierung 2026'
        for x in sh.text_frame.paragraphs[0].runs[1:]: x.text = ''
    if sh.has_text_frame and sh.text_frame.text.strip() == '17. September 2026':     # Datum der Vorlage -> Stand
        runs = sh.text_frame.paragraphs[0].runs; runs[0].text = '13. Oktober 2026'
        for x in runs[1:]: x.text = ''


def rect(slide, x, y, w, h, fill, line=None, shape=MSO_SHAPE.RECTANGLE):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    s.fill.solid(); s.fill.fore_color.rgb = fill
    if line is None: s.line.fill.background()
    else: s.line.color.rgb = line; s.line.width = Pt(1.5)
    s.shadow.inherit = False
    s.text_frame.text = ''
    return s

def text(slide, x, y, w, h, content, size=11, bold=False, color=SW, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, bullets=False, space_after=4, italic=False):
    """content: str oder Liste von Absaetzen; Absatz = str oder Liste von (text, bold) Runs."""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    paras = content if isinstance(content, list) else [content]
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(space_after)
        runs = para if isinstance(para, list) else [(para, bold)]
        if bullets:
            pPr = p._p.get_or_add_pPr(); pPr.set('marL', str(Inches(0.2))); pPr.set('indent', str(-Inches(0.2)))
            bu = pPr.makeelement('{http://schemas.openxmlformats.org/drawingml/2006/main}buChar', {'char': '•'}); pPr.append(bu)
        for t, b in runs:
            r = p.add_run(); r.text = t or '\u00a0'; r.font.size = Pt(size); r.font.bold = b; r.font.name = F; r.font.color.rgb = color; r.font.italic = italic
    return tb

def line(slide, x1, y1, x2, y2, color=GRAU, width=0.75, dash=False):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = color; c.line.width = Pt(width)
    if dash:
        ln = c.line._get_or_add_ln(); pd = ln.makeelement('{http://schemas.openxmlformats.org/drawingml/2006/main}prstDash', {'val': 'dash'}); ln.append(pd)
    return c

def abschnitt(slide, x, y, w, t):
    rect(slide, x, y + 0.03, 0.31, 0.31, TEALL)
    text(slide, x + 0.28, y, w, 0.32, t, size=16, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    line(slide, x + 0.08, y + 0.3, x + w, y + 0.3, TEAL, 1)

def table(slide, x, y, colw, rows, rowh=0.3, size=9):
    """rows: Liste von Zeilen; Zelle = (text, {'fill':RGB,'color':RGB,'bold':bool,'align':'r'})"""
    shp = slide.shapes.add_table(len(rows), len(colw), Inches(x), Inches(y), Inches(sum(colw)), Inches(rowh * len(rows)))
    tbl = shp.table
    tbl.first_row = False; tbl.horz_banding = False
    for j, w in enumerate(colw): tbl.columns[j].width = Inches(w)
    for i, row in enumerate(rows):
        tbl.rows[i].height = Inches(rowh)
        for j, cell in enumerate(row):
            t, o = (cell if isinstance(cell, tuple) else (cell, {}))
            c = tbl.cell(i, j); c.margin_left = c.margin_right = Inches(0.06); c.margin_top = c.margin_bottom = Inches(0.02)
            c.vertical_anchor = MSO_ANCHOR.MIDDLE
            c.fill.solid(); c.fill.fore_color.rgb = o.get('fill', WEISS)
            p = c.text_frame.paragraphs[0]; p.alignment = PP_ALIGN.RIGHT if o.get('align') == 'r' else PP_ALIGN.LEFT
            r = p.add_run(); r.text = t or '\u00a0'; r.font.size = Pt(size); r.font.name = F; r.font.bold = o.get('bold', False); r.font.color.rgb = o.get('color', SW)
            epr = p._p.makeelement('{http://schemas.openxmlformats.org/drawingml/2006/main}endParaRPr', {'sz': str(int(size * 100))}); p._p.append(epr)  # leere Zellen klein halten
    return shp

def neue_folie(layout, titel, kicker='BUDGETPLANUNG 2026', tsize=20, tw=None):
    s = prs.slides.add_slide(LAY[layout])
    for ph in s.placeholders:
        if ph.placeholder_format.idx == 0:
            if tw: ph.left = Inches(0.56); ph.top = Inches(0.52); ph.width = Inches(tw); ph.height = Inches(0.79)
            ph.text_frame.text = titel
            for p in ph.text_frame.paragraphs:
                for r in p.runs: r.font.size = Pt(tsize)
        elif ph.placeholder_format.idx == 12:
            ph.text_frame.text = kicker
    return s

def bar_chart(slide, gx, gy0, H, MAX, bw, gap, bars, conn, lsize=8):
    ys = lambda v: gy0 - v / MAX * H
    for i, b in enumerate(bars):
        x = gx + i * (bw + gap)
        for lo, hi, col, txt, dark in b['segs']:
            if col == 'HATCH':
                r = rect(slide, x, ys(hi), bw, ys(lo) - ys(hi), WEISS, SW); r.line.width = Pt(0.75)
                r.fill.patterned(); r.fill.pattern = MSO_PATTERN.WIDE_UPWARD_DIAGONAL; r.fill.fore_color.rgb = SW; r.fill.back_color.rgb = WEISS
            else:
                r = rect(slide, x, ys(hi), bw, ys(lo) - ys(hi), col)
            if txt:
                tf = r.text_frame; tf.margin_left = tf.margin_right = 0; p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
                run = p.add_run(); run.text = txt; run.font.size = Pt(9); run.font.bold = True; run.font.name = F; run.font.color.rgb = SW if dark else WEISS
                tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        if b.get('top'):
            text(slide, x - 0.15, ys(max(q[1] for q in b['segs'])) - 0.3, bw + 0.3, 0.28, b['top'], size=11, bold=True, align=PP_ALIGN.CENTER)
        text(slide, x - 0.15, gy0 + 0.05, bw + 0.3, 0.45, b['lab'], size=lsize, align=PP_ALIGN.CENTER)
    for i, v in conn:
        line(slide, gx + i * (bw + gap) + bw, ys(v), gx + (i + 1) * (bw + gap), ys(v), GRAU, 0.75, dash=True)
    line(slide, gx, gy0, gx + len(bars) * bw + (len(bars) - 1) * gap, gy0, SW, 1)

# ============================================================ Folie 2: Kernbotschaft
# Entscheidung (Stand 13.10.2026): alles in 2026 – MBS-Budget 75.000, Beitrag HS 25.000 in 2026, den Restbetrag der Ausbaustufe 2
# (13.592) uebernimmt Celonis; fuer 2027 gibt es kein Budget. Neu und nicht gedeckt: 3 PT Eingangsmanagement (ITERGO, M. Schumann).
s = neue_folie('Only Title', 'Ausbaustufe 2 ist 2026 finanziert: MBS-Budget, Beitrag HS und Celonis tragen 113.592 EUR – offen sind 1.848 EUR für drei zusätzliche Tage Eingangsmanagement', tsize=17)
kach = [('IT-Kosten 2026 heute', '115.440 EUR', 'gegenüber 66.900 EUR im Zwischenbericht vom 10.06.2026 (+48.540 EUR)', SW),
        ('Finanziert 2026', '113.592 EUR', 'MBS-Budget 75.000 EUR, Beitrag HS 25.000 EUR, Übernahme Celonis 13.592 EUR', TEAL),
        ('Nicht gedeckt', '1.848 EUR', '3 PT Eingangsmanagement (ITERGO, M. Schumann, 13.10. bis 30.11.2026) zu 616 EUR', ROT),
        ('Budget 2027', 'keines', 'Bot-Wartung (MTB) 10.000 EUR je Jahr und AI-Lizenz 2027 sind nicht finanziert', GRAUM)]
for i, (t, z, u, c) in enumerate(kach):
    x = 0.56 + i * 3.1
    rect(s, x, 1.65, 2.9, 1.7, GRAUL)
    text(s, x + 0.2, 1.76, 2.5, 0.3, t, size=10, color=GRAU)
    text(s, x + 0.2, 2.04, 2.5, 0.55, z, size=24, bold=True, color=c)
    text(s, x + 0.2, 2.62, 2.5, 0.7, u, size=9)
rect(s, 0.56, 3.65, 12.2, 1.55, TEAL)
text(s, 0.8, 3.75, 3, 0.3, 'Entscheidung', size=11, bold=True, color=WEISS)
text(s, 0.8, 4.05, 11.7, 1.1, [[('Ausbaustufe 2 wird 2026 umgesetzt und vollständig 2026 finanziert. ', True),
      ('Das MBS-Budget trägt 75.000 EUR, HS zahlt 25.000 EUR in diesem Jahr, den Restbetrag von 13.592 EUR übernimmt Celonis. Eine Abrechnung in 2027 entfällt; für 2027 steht kein Budget zur Verfügung.', False)]], size=13, color=WEISS)
abschnitt(s, 0.56, 5.45, 3.5, 'Entscheidungsbedarf')
text(s, 0.56, 5.95, 12.2, 1.0, ['Finanzierung der 3 zusätzlichen PT Eingangsmanagement: 1.848 EUR (ITERGO Input Management, M. Schumann, 13.10. bis 30.11.2026)',
      'Ab 2027 ohne Budget: Bot-Wartung (MTB) 10.000 EUR je Jahr und AI-Lizenz 2027'], size=12, bullets=True)

# ============================================================ Folie 3: Budgetentwicklung (Grey_2/3)
s = neue_folie('Grey_2/3', 'IT-Aufwände 2026 steigen um 48.540 EUR auf 115.440 EUR – bis auf 1.848 EUR finanziert', tsize=18, tw=5.9)
abschnitt(s, 0.56, 1.55, 3.6, 'Budgetentwicklung 2026 (EUR)')
leg = [(LILA, 'Sonstiges (EM, Prüf-Bot)'), (TEALL, 'Celonis Ausbaustufe 1'), (TEAL, 'Celonis Ausbaustufe 2'), (ORANGE, 'Mehraufwand Eingangsmgmt.'),
       (SW, 'MBS-Budget 2026'), (GRAU, 'Beitrag HS 2026'), (TEAL2, 'Übernahme Celonis'), (ROT, 'Nicht gedeckt')]
for i, (c, t) in enumerate(leg):
    x = 0.56 + (i % 3) * 2.0; y = 2.0 + (i // 3) * 0.24
    rect(s, x, y + 0.03, 0.16, 0.16, c); text(s, x + 0.22, y, 1.8, 0.22, t, size=8)
bars = [
    {'lab': 'Gesamtkosten\n10.06.2026', 'segs': [(0, 28100, LILA, '28.100', True), (28100, 66900, TEALL, '38.800', True)], 'top': '66.900'},
    {'lab': 'Ausbaustufe 1\nMinderaufwand', 'segs': [(57556, 66900, TEAL2, '-9.344', True)]},
    {'lab': 'Eingangsmgmt.\nMehraufwand', 'segs': [(57556, 68028, ORANGE, '+10.472', False)]},
    {'lab': 'Celonis\nAusbaustufe 2', 'segs': [(68028, 115440, TEAL, '+47.412', False)]},
    {'lab': 'Gesamtkosten\n13.10.2026', 'segs': [(0, 115440, GRAUM, '', False)], 'top': '115.440'},
    {'lab': 'Finanzierung\n2026', 'segs': [(0, 75000, SW, '75.000', False), (75000, 100000, GRAU, '25.000', False), (100000, 113592, TEAL2, '13.592', False)], 'top': '113.592'},
    {'lab': 'Nicht\ngedeckt', 'segs': [(113592, 115440, ROT, '', False)], 'top': '1.848'},
]
bar_chart(s, 0.6, 6.35, 3.3, 120000, 0.62, 0.2, bars, [(0, 66900), (1, 57556), (2, 68028), (3, 115440), (5, 113592)])
abschnitt(s, 6.85, 1.55, 6.0, 'Aufschlüsselung und Finanzierung (EUR netto)')
H = lambda t: (t, {'fill': ROT, 'color': WEISS, 'bold': True})
C = lambda t, f=TEALT, **o: (t, dict(fill=f, **o))
Sm = lambda t, **o: (t, dict(fill=TEAL, color=WEISS, bold=True, **o))
Sl = lambda t, **o: (t, dict(fill=LILAM, bold=True, **o))
B = lambda t, **o: (t, dict(fill=SW, color=WEISS, bold=True, **o))
Wt = lambda t, **o: (t, dict(fill=WEISS, **o))
rows = [
    [H('Position'), H('2026 Stand 10.06.'), H('2026 Stand 13.10.'), H('Delta')],
    [C('Ausbaustufe 1 + Reporting (18 PT)'), C('23.800', align='r'), C('14.456', align='r'), C('-9.344', align='r')],
    [C('AI-Lizenz'), C('15.000', align='r'), C('15.000', align='r'), C('–', align='r')],
    [C('Ausbaustufe 2 (Infomotion)'), C('–', align='r'), C('47.412', align='r'), C('+47.412', align='r', bold=True, color=ROT)],
    [Sm('Summe Celonis'), Sm('38.800', align='r'), Sm('76.868', align='r'), Sm('+38.068', align='r')],
    [C('Eingangsmanagement (5 → 22 PT)', LILAL), C('3.100', LILAL, align='r'), C('13.572', LILAL, align='r'), C('+10.472', LILAL, align='r', bold=True, color=ROT)],
    [C('Prüf-Bot Robotics (40 PT)', LILAL), C('25.000', LILAL, align='r'), C('25.000', LILAL, align='r'), C('–', LILAL, align='r')],
    [Sl('Summe Sonstiges'), Sl('28.100', align='r'), Sl('38.572', align='r'), Sl('+10.472', align='r')],
    [B('Summe IT-Aufwände 2026'), B('66.900', align='r'), B('115.440', align='r'), B('+48.540', align='r')],
    [Wt('IT-Budget MBS 2026'), Wt(''), Wt('-75.000', align='r', bold=True), Wt('')],
    [Wt('Beitrag HS (2026)', color=TEAL), Wt(''), Wt('-25.000', align='r', bold=True, color=TEAL), Wt('')],
    [Wt('Übernahme Celonis (Restbetrag Ausbaustufe 2)', color=TEAL), Wt(''), Wt('-13.592', align='r', bold=True, color=TEAL), Wt('')],
    [Wt('Nicht gedeckt: 3 PT Eingangsmanagement', bold=True, color=ROT), Wt(''), Wt('1.848', align='r', bold=True, color=ROT), Wt('')],
]
table(s, 6.85, 2.05, [3.2, 0.95, 0.95, 0.85], rows, rowh=0.26, size=8.5)
text(s, 6.85, 5.65, 6.2, 1.1, 'Finanzierung vollständig 2026: MBS-Budget 75.000 EUR, Beitrag HS 25.000 EUR in diesem Jahr, den Restbetrag der Ausbaustufe 2 von 13.592 EUR übernimmt Celonis. Für 2027 gibt es kein Budget; Bot-Wartung (MTB) 10.000 EUR je Jahr und AI-Lizenz 2027 sind offen. Eingangsmanagement seit 13.10. inkl. 3 PT ITERGO Input Management (M. Schumann, bis 30.11.2026), nicht gedeckt. Tagessätze: Infomotion 1.323 EUR, Eingangsmanagement 616 EUR, Robotics 616,20 EUR.', size=8, color=GRAU)

# ============================================================ Folie 4: Ausbaustufe 2
s = neue_folie('Only Title', 'Ausbaustufe 2 vervollständigt die KI-Strukturierung: vier Leistungspakete, Test und Betrieb in zehn Wochen')
abschnitt(s, 0.56, 1.55, 3.5, 'Was Ausbaustufe 2 leistet')
items = [('Mehrfachagenten', 'Unterscheidung Makler und Mehrfachagent; Agentur- und Personalnummer im normierten Format; Kündigung Maklervertrag'),
         ('Anpassung VNR-Logik', 'Spartenzugehörigkeit, Aufsplittung der VNR-Ebenen, Output je VNR; BUE_UMFANG mit Einzel/Gesamt inklusive VNR-Ermittlung'),
         ('Anforderung weiterer Unterlagen', 'Zusätzliche Prüfung auf weitere Unterlagen; GeVo-abhängige Zuordnung und Bearbeitung aller eingehenden Mails'),
         ('Anpassung KI-Deckblatt und EMWS-Anbindung', 'Deckblatt für Punkte 1 bis 3 und Updates aus RPA; Datenpool V1.6; EMWS-Anbindung (2 PT ERGO-IT)'),
         ('Testing und Betrieb', 'E2E-Lasttest mit 2.500 Vorgängen je Woche, Betriebs- und Governance-Dokumentation, Fehler-Handling-Dashboards')]
for i, (h, t) in enumerate(items):
    y = 2.05 + i * 0.9
    o = rect(s, 0.56, y + 0.04, 0.4, 0.4, TEAL, shape=MSO_SHAPE.OVAL)
    tf = o.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE; tf.margin_left = tf.margin_right = 0; p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    run = p.add_run(); run.text = str(i + 1); run.font.size = Pt(12); run.font.bold = True; run.font.name = F; run.font.color.rgb = WEISS
    text(s, 1.15, y, 5.4, 0.3, h, size=12, bold=True)
    text(s, 1.15, y + 0.3, 5.4, 0.55, t, size=10)
abschnitt(s, 7.1, 1.55, 3.5, 'Warum die Kosten steigen')
text(s, 7.1, 2.05, 5.7, 2.2, ['Ausbaustufe 1 (18 PT) war mit dem Basisumfang der Mailerkennung kalkuliert und liegt 9.344 EUR unter der Planung.',
      'Die fachlichen Erweiterungen aus den Tests seit August (MFA, Unterlagen, mehrere VNR) und die EMWS-Schnittstelle bilden einen eigenen Auftrag: laut Angebot Infomotion 32 PT bei zehn Wochen Umsetzungszeitraum.',
      'Grundlage ist das neue Konzept mit Vorklassifizierung und spezialisierten Agenten je Geschäftsvorfall (siehe Backup). Ohne Ausbaustufe 2 bleibt die Automatisierung auf Makler-Standardfälle beschränkt.',
      [('Zeitplan: Umsetzung 2026 in zehn Wochen ab Beauftragung. Die EMWS-Anbindung wird vorgezogen, damit der Prüf-Bot wie geplant ab Anfang Oktober aufgebaut werden kann.', True)]], size=10, bullets=True, space_after=4)
Ht = lambda t: (t, {'fill': TEAL, 'color': WEISS, 'bold': True})
Gb = lambda t, **o: (t, dict(fill=GRAUL, bold=True, **o))
rows = [[Ht('Celonis-Budget'), Ht('Kosten')],
        [Wt('Ausbaustufe 1 & Reporting (Infomotion, 18 PT)'), Wt('14.456 EUR', align='r')],
        [Wt('AI-Lizenz 2026'), Wt('15.000 EUR', align='r')],
        [Gb('Summe Ausbaustufe 1'), Gb('29.456 EUR', align='r')],
        [Wt('Ausbaustufe 2 (Infomotion und ERGO-IT, 32 PT)'), Wt('47.412 EUR', align='r')],
        [Gb('Gesamtkosten Celonis (Stufe 1 + 2)'), Gb('76.868 EUR', align='r')],
        [Wt('davon übernimmt Celonis (Restbetrag Ausbaustufe 2)', color=TEAL, bold=True), Wt('13.592 EUR', align='r', color=TEAL, bold=True)]]
table(s, 7.1, 4.4, [4.3, 1.4], rows, rowh=0.27, size=9)

# ============================================================ Folie 5: Entscheidung und offene Punkte
s = neue_folie('Only Title', 'Finanzierung 2026 entschieden – offen sind 1.848 EUR für Eingangsmanagement und das fehlende Budget 2027')
def kasten(x, titel, badge, bcol, zeilen, hell):
    rect(s, x, 1.6, 4.05, 3.6, GRAUL if hell else WEISS, None if hell else TEAL)
    text(s, x + 0.25, 1.72, 3.6, 0.5, titel, size=13, bold=True)
    b = rect(s, x + 0.25, 2.3, 1.9, 0.28, bcol)
    tf = b.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE; tf.margin_left = tf.margin_right = 0; p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    run = p.add_run(); run.text = badge; run.font.size = Pt(9); run.font.bold = True; run.font.name = F; run.font.color.rgb = WEISS
    text(s, x + 0.25, 2.72, 3.6, 2.4, zeilen, size=10, bullets=True, space_after=3)
kasten(0.56, 'Finanzierung 2026', 'ENTSCHIEDEN', TEAL,
       ['Umsetzung Ausbaustufe 2 in 2026', 'MBS-Budget 2026: 75.000 EUR', 'Beitrag HS: 25.000 EUR, Zahlung in 2026',
        'Restbetrag Ausbaustufe 2: 13.592 EUR übernimmt Celonis', 'Keine Abrechnung in 2027'], False)
kasten(4.81, 'Offene Punkte', 'ZU KLÄREN', ROT,
       ['3 zusätzliche PT Eingangsmanagement (ITERGO, M. Schumann, 13.10. bis 30.11.2026): 1.848 EUR ohne Deckung',
        'Für 2027 gibt es kein Budget: Bot-Wartung (MTB) 10.000 EUR je Jahr und AI-Lizenz 2027 sind nicht finanziert'], True)
abschnitt(s, 9.25, 1.55, 3.5, 'Finanzierung 2026 (EUR)')
bars = [{'lab': 'Kosten 2026', 'segs': [(0, 115440, GRAUM, '115.440', False)]},
        {'lab': 'Finanziert', 'segs': [(0, 75000, SW, '75.000', False), (75000, 100000, GRAU, '25.000', False), (100000, 113592, TEAL2, '13.592', False)], 'top': '113.592'},
        {'lab': 'Nicht\ngedeckt', 'segs': [(113592, 115440, ROT, '', False)], 'top': '1.848'}]
bar_chart(s, 9.4, 4.85, 2.6, 125000, 0.85, 0.3, bars, [(0, 115440), (1, 113592)], lsize=8)
for i, (c, t) in enumerate([(SW, 'MBS'), (GRAU, 'HS'), (TEAL2, 'Celonis')]):
    rect(s, 9.4 + i * 1.0, 5.3, 0.14, 0.14, c); text(s, 9.58 + i * 1.0, 5.25, 0.8, 0.22, t, size=8)

# ============================================================ Folie 6: Backup neues Konzept
s = neue_folie('Only Title', 'Hintergrund: Ausbaustufe 2 ersetzt den monolithischen Prompt durch eine Vorklassifizierung mit spezialisierten Agenten', kicker='BACKUP')
abschnitt(s, 0.56, 1.55, 4.0, 'Bisheriges Konzept und Probleme')
text(s, 0.56, 2.05, 5.7, 2.8, ['Ein großer Prompt mit der Annahme „alles ist Bestandsübertragung“; alle Prüfungen laufen für jeden Vorgang.',
      'Nicht alle E-Mails werden verarbeitet; Fälle außerhalb des Konzepts (Mehrfachagenten, Reminder, Spam, Sonderfälle) sind nicht vorgesehen.',
      'Ausfälle und Störungen lassen sich nicht gezielt behandeln; geringe Robustheit bei unerwarteten Eingaben.',
      [('Kernbefund: Der monolithische Ansatz skaliert weder fachlich (neue Vorgangstypen) noch operativ (Störungen, Sonderfälle).', True)]], size=11, bullets=True, space_after=6)
abschnitt(s, 6.9, 1.55, 4.0, 'Neues Konzept (Ausbaustufe 2)')
kette = [('Mail-Eingang', 'inkl. Anhänge', TEALL, SW), ('Vorklassifizierung', 'Agent 0: GeVo, Spam, Reminder', TEAL, WEISS), ('Agenten je GeVo', 'vorgangsspezifische Prompts und Prüfungen', TEAL, WEISS), ('KI-Deckblatt', 'einheitlich für alle Strecken', SW, WEISS)]
for i, (h, t, col, tc) in enumerate(kette):
    x = 6.9 + i * 1.5
    rect(s, x, 2.05, 1.3, 1.15, col)
    text(s, x + 0.08, 2.1, 1.14, 0.45, h, size=9, bold=True, color=tc, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, x + 0.08, 2.55, 1.14, 0.6, t, size=8, color=tc, align=PP_ALIGN.CENTER)
    if i < 3: text(s, x + 1.3, 2.35, 0.2, 0.5, '›', size=22, bold=True, color=TEAL, align=PP_ALIGN.CENTER)
text(s, 6.9, 3.4, 5.9, 1.8, ['Granulare Prompts: modulare, vorgangsabhängige Bausteine statt eines statischen Prompts.',
      'Gesteuerte Prüfungen: je Vorgangstyp nur die notwendigen Prüfungen (Phrasen-, Templatechecks).',
      'Sicherheitsarchitektur: operative Funktionsfähigkeit auch bei Ausfällen und Störungen; unerwartete Eingaben werden gezielt ausgesteuert.',
      'Erweiterbarkeit: neue Geschäftsvorfälle als eigenständige Agenten mit eigener Qualitätssicherung.'], size=10, bullets=True, space_after=3)
rows = [[Ht('Aspekt'), Ht('Bisher'), Ht('Neu')],
        [Wt('Klassifikation', bold=True), Wt('Annahme: alles ist Bestandsübertragung'), Wt('Vorklassifizierung des Anliegens (GeVo, Spam, Reminder)')],
        [Wt('Prüfungen', bold=True), Wt('Immer alle'), Wt('Je Vorgangstyp gesteuert')],
        [Wt('Störungsfälle', bold=True), Wt('Nicht gezielt behandelbar'), Wt('Operative Sicherheitsarchitektur')],
        [Wt('Ergebnis', bold=True), Wt('KI-Deckblatt'), Wt('Einheitliches KI-Deckblatt für alle Strecken')]]
table(s, 0.56, 5.35, [2.0, 4.7, 5.5], rows, rowh=0.28, size=10)
text(s, 0.56, 6.85, 12, 0.22, 'Quelle: Infomotion, „MaklerBÜ meets Celonis – Ausbaustufe 2“ (Backup-Folien Ausgangslage, Neues Konzept, Gegenüberstellung).', size=8, color=GRAU)

prs.save(OUT); print('ok', OUT)
