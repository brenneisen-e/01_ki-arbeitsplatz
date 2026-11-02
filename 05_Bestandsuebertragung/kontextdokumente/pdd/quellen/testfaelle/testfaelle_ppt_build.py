# -*- coding: utf-8 -*-
"""Testfallkatalog Pruef-Bot – Folien im ERGO-Master (Aufruf aus pdd/quellen/testfaelle/). Daten aus katalog.py."""
import math
import io
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
import katalog as K
from katalog import PK_72, PK_MV, PK_KO, PK_ODPP

SRC = '../20260916_Abstimmung_Budget_2027_Celonis_Vorlage.pptx'; OUT = '../../20260928_Testfaelle_Pruef-Bot.pptx'
ROT = RGBColor(0xBF, 0x15, 0x28); ROTL = RGBColor(0xF6, 0xD9, 0xDC)
TEAL = RGBColor(0x0F, 0x94, 0xA7); TEAL2 = RGBColor(0x47, 0xBC, 0xC5); TEALL = RGBColor(0xCC, 0xEB, 0xED); TEALT = RGBColor(0xE6, 0xF4, 0xF6)
TEALD = RGBColor(0x0B, 0x6F, 0x7D)
GRAU = RGBColor(0x6B, 0x6B, 0x6B); GRAUL = RGBColor(0xF2, 0xF2, 0xF2); GRAUM = RGBColor(0x9A, 0x9A, 0x9A); GRAUD = RGBColor(0x4A, 0x4A, 0x4A)
SW = RGBColor(0x1A, 0x1A, 0x1A); WEISS = RGBColor(0xFF, 0xFF, 0xFF)
LILA = RGBColor(0xB5, 0x8A, 0xB0); LILAL = RGBColor(0xEA, 0xDD, 0xE6)
F = 'Arial'
ROTT = RGBColor(0xFB, 0xEE, 0xEF); LILAT = RGBColor(0xF4, 0xEE, 0xF3); GRAUT = RGBColor(0xF6, 0xF6, 0xF6)
HELL = {str(ROTL): ROTT, str(LILAL): LILAT, str(GRAUL): GRAUT}

prs = Presentation(SRC)
LAY = {l.name: l for l in prs.slide_layouts}
for sh in prs.slide_master.shapes:
    if sh.has_text_frame and 'Zwischenbericht' in sh.text_frame.text:
        sh.width = Inches(7.5)
        for para in sh.text_frame.paragraphs:
            for i, r in enumerate(para.runs):
                r.text = 'ERGO | Makler BÜ meets KI – Testfallkatalog Prüf-Bot - 28.09.2026' if i == 0 else ''
sldIdLst = prs.slides._sldIdLst
for sldId in list(sldIdLst)[1:]:
    prs.part.drop_rel(sldId.rId); sldIdLst.remove(sldId)
for sh in prs.slides[0].shapes:
    if sh.has_text_frame and sh.text_frame.text.startswith('Makler BÜ meets KI'):
        r = sh.text_frame.paragraphs[0].runs[0]; r.text = 'Makler BÜ meets KI | Testfälle Prüf-Bot'
        for x in sh.text_frame.paragraphs[0].runs[1:]: x.text = ''
    if sh.has_text_frame and sh.text_frame.text.strip() == 'Budgetplanung 26/27':
        r = sh.text_frame.paragraphs[0].runs[0]; r.text = 'Testfallkatalog mit Testdaten-Anforderungen und Akzeptanzkriterien'
        for x in sh.text_frame.paragraphs[0].runs[1:]: x.text = ''
    if sh.has_text_frame and sh.text_frame.text.strip().startswith('17. September'):
        r = sh.text_frame.paragraphs[0].runs[0]; r.text = '28. September 2026'
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

def abschnitt(slide, x, y, w, t, farbe=None):
    text(slide, x, y, w, 0.32, t, size=13, bold=True, color=farbe or TEALD, anchor=MSO_ANCHOR.MIDDLE)

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


# ------------------------------------------------------------------ eigene Helfer
LINIE = RGBColor(0xD9, 0xD9, 0xD9)


def _rand(c, seite, pt, farbe):
    tcPr = c._tc.get_or_add_tcPr()
    tag = {'L': 'a:lnL', 'R': 'a:lnR', 'T': 'a:lnT', 'B': 'a:lnB'}[seite]
    for alt in tcPr.findall(qn(tag)):
        tcPr.remove(alt)
    ln = tcPr.makeelement(qn(tag), {'w': str(int(pt * 12700)), 'cap': 'flat', 'cmpd': 'sng', 'algn': 'ctr'})
    if farbe is None:
        ln.append(ln.makeelement(qn('a:noFill'), {}))
    else:
        sf = ln.makeelement(qn('a:solidFill'), {}); sf.append(sf.makeelement(qn('a:srgbClr'), {'val': str(farbe)})); ln.append(sf)
    # Linien stehen im tcPr vor der Fuellung
    ordnung = ['a:lnL', 'a:lnR', 'a:lnT', 'a:lnB']
    pos = 0
    for o in ordnung[:ordnung.index(tag)]:
        pos += len(tcPr.findall(qn(o)))
    tcPr.insert(pos, ln)


def tabelle(slide, x, y, colw, rows, heights, size=7, head_size=7.5, header_fill=ROT, fills=None, mv=0.03):
    """Tabelle im ruhigen Stil: Kopf ohne Balken mit farbiger Unterlinie, feine waagerechte Trennlinien, keine senkrechten Linien.
    Zelle = str (Zeilen mit \\n) oder Liste von Zeilen oder Liste von (Text, fett)-Laeufen je Zeile."""
    shp = slide.shapes.add_table(len(rows), len(colw), Inches(x), Inches(y), Inches(sum(colw)), Inches(sum(heights)))
    tbl = shp.table; tbl.first_row = False; tbl.horz_banding = False
    tblPr = tbl._tbl.tblPr
    sid = tblPr.find(qn('a:tableStyleId'))
    if sid is None:
        sid = tblPr.makeelement(qn('a:tableStyleId'), {}); tblPr.append(sid)
    sid.text = '{2D5ABB26-0587-4C30-8999-92F81FD0307C}'  # No Style, No Grid
    for j, w in enumerate(colw): tbl.columns[j].width = Inches(w)
    n = len(rows)
    for i, row in enumerate(rows):
        tbl.rows[i].height = Inches(heights[i])
        for j, cell in enumerate(row):
            c = tbl.cell(i, j); c.margin_left = Inches(0.06 if j else 0.04); c.margin_right = Inches(0.06); c.margin_top = c.margin_bottom = Inches(mv)
            c.vertical_anchor = MSO_ANCHOR.BOTTOM if i == 0 else MSO_ANCHOR.TOP
            c.fill.solid(); c.fill.fore_color.rgb = WEISS if i == 0 else (fills[i] if fills and fills[i] else WEISS)
            _rand(c, 'L', 0, None); _rand(c, 'R', 0, None)
            _rand(c, 'T', 0, None) if i > 1 else None
            _rand(c, 'B', 1.5 if i == 0 else 0.5, header_fill if i == 0 else (None if i == n - 1 and False else LINIE))
            zeilen = cell if isinstance(cell, list) else str(cell).split('\n')
            tf = c.text_frame; tf.word_wrap = True
            for k, z in enumerate(zeilen):
                pp = tf.paragraphs[0] if k == 0 else tf.add_paragraph()
                pp.alignment = PP_ALIGN.LEFT; pp.space_before = Pt(0); pp.space_after = Pt(1.5 if k < len(zeilen) - 1 else 0); pp.line_spacing = 1.0
                laeufe = z if isinstance(z, list) else [(z, i == 0 or (j == 0))]
                for lf in laeufe:
                    t, bb = lf[0], lf[1]
                    r = pp.add_run(); r.text = t or ' '; r.font.name = F; r.font.size = Pt(lf[2] if len(lf) > 2 else (head_size if i == 0 else size))
                    r.font.bold = bb; r.font.color.rgb = lf[3] if len(lf) > 3 else (header_fill if i == 0 else SW)
    return shp


def zeilen_von(texte, breiten, size):
    """Geschaetzte Zeilenzahl der hoechsten Zelle (Arial, mittlere Zeichenbreite 0,5 em)."""
    cpi = 72.0 / (size * 0.47)
    n = 1
    for t, b in zip(texte, breiten):
        cpl = max(6, int((b - 0.1) * cpi))
        teile = t if isinstance(t, list) else str(t).split('\n')
        teile = [''.join(x for x, _ in z) if isinstance(z, list) else z for z in teile]
        n = max(n, sum(max(1, math.ceil(len(z) / cpl)) for z in teile))
    return n


def hoehe(texte, breiten, size):
    absaetze = max(len(t) if isinstance(t, list) else len(str(t).split('\n')) for t in texte)
    return zeilen_von(texte, breiten, size) * size * 1.12 / 72 + absaetze * 1.5 / 72 + 0.07


def kurz(s, n):
    return s if len(s) <= n else s[:n - 1].rsplit(' ', 1)[0] + ' …'


NOTIZ_STD = set(K.notiz_ak('KV')) | set(K.notiz_ak('KL'))

def akzeptanz_kern(t):
    ak = t['akzeptanz']
    if any(a.startswith('Bearbeitungshinweis') for a in ak) and len(ak) <= 8:
        kern = [a for a in ak if a.startswith(('Bearbeitungshinweis', 'Abschnitt Fehler', 'Vorgang weitergeleitet', 'Ausstieg', 'Bot-Protokoll', 'Keine BE', 'Zwei'))]
    elif any(a.startswith('Telefonnotiz angelegt') for a in ak):
        kern = [a for a in ak if a.startswith('Telefonnotiz angelegt')] + [a for a in ak if a not in NOTIZ_STD] + [ak[-1]]
    else:
        kern = ak[:4]
    kern = [k.replace('Bearbeitungshinweis am Postkorbvorgang gespeichert, Zeile exakt ', 'Hinweis: ').replace('Vorgang weitergeleitet an ', 'Ziel: ')
             .replace('Telefonnotiz angelegt und gespeichert: ', 'Notiz: ').replace('Abschnitt Fehler: ', 'Fehler: ') for k in kern]
    out = []
    for k in kern:
        if k not in out: out.append(k)
    return ['– ' + k for k in out]


def kachel(slide, x, y, w, h, titel, farbe=TEALD, hell=TEALT):
    rect(slide, x, y, w, h, HELL.get(str(hell), hell), None)
    text(slide, x + 0.12, y + 0.02, w - 0.24, 0.3, titel, size=9.5, bold=True, color=farbe, anchor=MSO_ANCHOR.MIDDLE)


def liste(slide, x, y, w, eintraege, size=7.5, dy=None, color=GRAUD):
    text(slide, x, y, w, 0.3, eintraege, size=size, bullets=True, space_after=2, color=color)


GTITEL = {
 'GL': 'Glattfälle: Der Vorgang läuft ohne Befund durch, die Notiz ist Feld für Feld bestückt und geht an den 72-Stunden-BOT',
 'VP': 'Vorprüfung: Jedes Ausschlusskriterium aus dem KI-Deckblatt steuert den Vorgang vor dem ersten Hostzugriff aus',
 'KU': 'Kunde (VN): Die Versicherungsnummer belegt die Identität, die Matchcodesuche prüft die Person aus dem Auftrag',
 'BI': 'Abgebender Bestandsinhaber: Lücken sind Prüfnotizen; bei Komposit/Leben steuert der Vertriebskanal das Routing',
 'VM': 'Übernehmender Vermittler: unbekannt oder inaktiv ist eine BE, ein abweichender Typ eine Prüfnotiz',
 'EM': 'E-Mail-Adresse: Sonderliste vor OB729 vor Absender; interne oder fehlende Adressen werden zur Prüfnotiz',
 'VT': 'Vertrag: nicht aktuelle Verträge und KR-Flottenverträge sind harte Business Exceptions',
 'BH': 'Bearbeitungshinweis: alle Prüfnotizen in Reihenfolge, auch hinter einer harten BE',
 'NR': 'Mehrere Versicherungsnummern: ein Vorgang je VNR, jede Nummer wird für sich geprüft',
 'TE': 'Technik und Betrieb: Startkriterium, keine Doppelverarbeitung, sauberer Abbruch',
}


# ------------------------------------------------------------------ Fassung 2: Hilfen fuer Textspalten mit Schriftanpassung
def kid(x):
    return x.replace('TF-', '')


def absatz(runs, bullet=False, nummer_=None, space=2, kopf=False, farbe=None):
    """runs: Liste (Text, fett, Farbe oder None, kursiv)."""
    return dict(runs=runs, bullet=bullet, nummer=nummer_, space=space, kopf=kopf, farbe=farbe)


from PIL import ImageFont
_FD = '/usr/share/fonts/truetype/liberation/LiberationSans-'
_FONTS = {(b, i): ImageFont.truetype(_FD + {(0, 0): 'Regular', (1, 0): 'Bold', (0, 1): 'Italic', (1, 1): 'BoldItalic'}[(b, i)] + '.ttf', 100)
          for b in (0, 1) for i in (0, 1)}


def zeilen_absatz(a, w, size):
    """Zeilenzahl ueber die echte Schriftmetrik (Liberation Sans = Arial-Metrik), Zeilenumbruch an Leerzeichen."""
    einzug = 0.16 if (a['bullet'] or a['nummer']) else 0
    s = size + (1 if a['kopf'] else 0)
    breite = (w - einzug) * 72.0 - 1
    woerter = []
    for t, b, _, it in a['runs']:
        for teil in t.replace('\n', ' ').split(' '):
            woerter.append((teil, bool(b), bool(it)))
    n, x = 1, 0.0
    for wort, b, it in woerter:
        f = _FONTS[(int(b), int(it))]
        lw = f.getlength(wort) * s / 100; sp = f.getlength(' ') * s / 100
        if x > 0 and x + sp + lw > breite:
            n += 1; x = lw
        else:
            x = x + (sp if x > 0 else 0) + lw
    return n, s


def hoehe_spalte(absaetze, w, size):
    h = 0
    for a in absaetze:
        n, s = zeilen_absatz(a, w, size)
        h += n * s * 1.17 / 72 + a['space'] / 72
    return h


def spalte(slide, x, y, w, h, absaetze, groessen=(7.5, 7.2, 7, 6.8, 6.5, 6.2, 6, 5.8, 5.5)):
    size = groessen[-1]
    for g in groessen:
        if hoehe_spalte(absaetze, w, g) <= h:
            size = g; break
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, a in enumerate(absaetze):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT; p.space_after = Pt(a['space']); p.space_before = Pt(0); p.line_spacing = 1.0
        s = size + (1 if a['kopf'] else 0)
        if a['bullet'] or a['nummer']:
            pPr = p._p.get_or_add_pPr(); pPr.set('marL', str(Inches(0.16))); pPr.set('indent', str(-Inches(0.16)))
            if a['bullet']:
                pPr.append(pPr.makeelement(qn('a:buChar'), {'char': '•'}))
            else:
                pPr.append(pPr.makeelement(qn('a:buNone'), {}))
        laeufe = list(a['runs'])
        if a['nummer']:
            laeufe = [('%s\t' % a['nummer'], True, a['farbe'] or TEALD, False)] + laeufe
        for t, b, c, it in laeufe:
            r = p.add_run(); r.text = t; r.font.size = Pt(s); r.font.bold = b; r.font.name = F
            r.font.color.rgb = c or a['farbe'] or SW; r.font.italic = it
        if a['nummer']:
            tabs = p._p.get_or_add_pPr().makeelement(qn('a:tabLst'), {})
            tabs.append(tabs.makeelement(qn('a:tab'), {'pos': str(Inches(0.16)), 'algn': 'l'}))
            p._p.get_or_add_pPr().insert(0, tabs)
    return size


def kopfzeile(slide, x, y, w, t, farbe):
    text(slide, x + 0.1, y + 0.02, w - 0.2, 0.27, t, size=9.5, bold=True, color=farbe, anchor=MSO_ANCHOR.MIDDLE)


def chip(slide, x, y, w, k, v, fill, tcol=WEISS):
    s = rect(slide, x, y, w, 0.26, fill, None)
    tf = s.text_frame; tf.margin_left = tf.margin_right = Inches(0.05); tf.margin_top = tf.margin_bottom = 0; tf.word_wrap = False
    runs_in(tf, [[(k + '  ', 6.5, False, tcol, False), (v, 7.5, True, tcol, False)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


def merge_tabelle(slide, x, y, colw, rows, heights, size=6.5, head_size=7.5, header_fill=ROT, merges=(), fills=None):
    shp = tabelle(slide, x, y, colw, rows, heights, size=size, head_size=head_size, header_fill=header_fill, fills=fills)
    for (r1, c1, r2, c2) in merges:
        shp.table.cell(r1, c1).merge(shp.table.cell(r2, c2))
    return shp


B = K.bedarf()
ZAHLWORT = {5: 'Fünf', 6: 'Sechs', 7: 'Sieben', 8: 'Acht'}


def nutzung(bid):
    ids = K.verwendet_in(bid)
    if ids:
        return '%d: ' % len(ids) + ', '.join(kid(i) for i in ids)
    alt = [t['id'] for t in K.TESTFAELLE if bid in (t['weg'] + ' ' + t['weg_b'] + ' ' + t['hinweis'])]
    return ('Alternative für ' + ', '.join(kid(i) for i in alt)) if alt else '–'

TF_N = len(K.TESTFAELLE)
MUSS = [t for t in K.TESTFAELLE if t['prio'] == 'Muss']
PV = [v for v in K.VERTRAEGE if v[1]]; OV = [v for v in K.VERTRAEGE if not v[1]]
PA = [a for a in K.AGENTUREN if a[1]]; OA = [a for a in K.AGENTUREN if not a[1]]
V01A01 = [t['id'] for t in K.TESTFAELLE if 'V-01' in t['vnr'].split('+') and t['agentur'] == 'A-01']

# ================================================================== Einleitung: Aufbau, Testschema, Umgebung, Vorgehen
AGENDA = [('Herleitung', 'PDD-Struktur und Testlogik: Kapitel, harte BE, Prüfnotizen – und warum genau diese Testfälle'),
          ('Aufbau des Tests', 'Testobjekt und Abgrenzung, Teststufen, Ablauf je Testfall, Umgebung und Datenfluss, Wege A und B'),
          ('Testdaten', 'Bedarf, Testagenturen mit Verträgen, Verträge, Agenturen mit EMMA-Eintrag, Mail und Vollmacht'),
          ('Testfälle', 'Überblick und Abdeckung, dann je Testfall ein Onepager'),
          ('Abnahme', 'Abnahmekriterien, Fehlerklassen, Durchführung')]
FOTO = next(sh.image.blob for sh in prs.slides[0].shapes if sh.shape_type == 13 and sh.image.content_type == 'image/jpeg')
SONDER = {}   # slide_id -> (Rang, Unterrang) fuer Folien ohne Kicker
s = prs.slides.add_slide(LAY['Agenda short'])
SONDER[s.slide_id] = (0, 0)
AGENDA_SEITEN = []
_nr, _tx, _sz = [39, 40, 41, 42, 43, 44, 45], [25, 26, 27, 28, 29, 30, 31], [32, 33, 34, 35, 36, 37, 38]
for ph in list(s.placeholders):
    i_ = ph.placeholder_format.idx
    if i_ == 4:
        ph.insert_picture(io.BytesIO(FOTO))
    elif i_ == 0:
        ph.text_frame.text = 'Agenda'
    elif i_ == 5:
        ph.text_frame.text = ' '
    elif i_ in _nr[:len(AGENDA)]:
        ph.text_frame.text = '%02d' % (_nr.index(i_) + 1)
    elif i_ in _tx[:len(AGENDA)]:
        k_, v_ = AGENDA[_tx.index(i_)]
        tf_ = ph.text_frame; tf_.text = k_
        r0 = tf_.paragraphs[0].runs[0]; r0.font.bold = True
        p2 = tf_.add_paragraph(); r2 = p2.add_run(); r2.text = v_; r2.font.size = Pt(9); r2.font.color.rgb = GRAUD
    elif i_ in _sz[:len(AGENDA)]:
        ph.text_frame.text = ' '
        AGENDA_SEITEN.append(ph)
    else:
        ph._element.getparent().remove(ph._element)

s = neue_folie('Only Title', 'Lesehilfe: Kennungen, Testgruppen und Arbeitsdokument – alle Angaben kommen aus einer Datenquelle für Folien und Excel',
               'EINLEITUNG | LESEHILFE', tsize=16)
kachel(s, 0.56, 1.5, 6.0, 5.3, 'Kennungen', TEALD, TEALT)
ids = [('V-01 …', 'Testvertrag (VNR) in IMSI mit Anforderungen an den Host; Kunde K-xx'), ('A-01 …', 'Testagentur (übernehmender Vermittler) in der Testumgebung'),
       ('EMMA', 'Eintrag der Agentur-Nr. im EMMA-Abzug der Abnahme mit Klassifikation'), ('P-01 …', 'Absender-Postfach der Testmails'),
       ('M-01 …', 'Mail-Vorlage mit Text, Anhang und Inhalt von Vollmacht bzw. Betreuungswunsch'),
       ('TF-GL-01 …', 'Testfall: Gruppe und laufende Nummer, je Testfall ein Onepager'), ('Weg A / B', 'Datensatz über Testmail (Celonis) oder direkt gesetzt'),
       ('Muss / Soll / Kann', 'Muss für die Abnahme, Soll zu mindestens 90 %, Kann informativ')]
for i, (k_, v_) in enumerate(ids):
    y = 2.0 + i * 0.58
    text(s, 0.72, y, 1.45, 0.3, k_, size=9, bold=True, color=TEALD)
    text(s, 2.2, y, 4.2, 0.5, v_, size=8.5, color=SW)
kachel(s, 6.75, 1.5, 6.02, 3.35, 'Testgruppen', ROT, ROTL)
for i, (g, n, bes) in enumerate(K.GRUPPEN):
    y = 2.0 + i * 0.36
    anz = len([t for t in K.TESTFAELLE if t['gruppe'] == g])
    text(s, 6.9, y, 0.5, 0.3, g, size=9, bold=True, color=ROT)
    text(s, 7.45, y, 4.6, 0.3, n.split(' (')[0], size=8.5, color=SW)
    text(s, 12.05, y, 0.55, 0.3, str(anz), size=9, bold=True, color=SW, align=PP_ALIGN.RIGHT)
kachel(s, 6.75, 5.0, 6.02, 1.8, 'Arbeitsdokument', GRAUD, GRAUL)
text(s, 6.9, 5.4, 5.75, 1.35, ['Excel-Mappe „20260928_Testfaelle_Pruef-Bot.xlsx“', 'Testfälle mit Durchführungsspalten, Testfallblatt je Testfall zum Ausdrucken',
     'Testdaten mit Spalte „Konkrete Werte“, Kennzahlen aus dem Status'], size=8.5, color=SW, bullets=True, space_after=3)

# ---- Kapiteltrenner
def trenner(nr, titel, sub, inhalt, rang):
    s_ = prs.slides.add_slide(LAY['Titelfolie Designfeld 3 ohne Bild'])
    SONDER[s_.slide_id] = (rang, 0)
    for ph in list(s_.placeholders):
        i_ = ph.placeholder_format.idx
        if i_ == 0:
            ph.text_frame.text = titel
        elif i_ == 2:
            ph.text_frame.text = sub
            for r in ph.text_frame.paragraphs[0].runs: r.font.size = Pt(16)
        elif i_ in (5, 6, 7):
            ph.text_frame.text = ' '   # CI-Farbflaechen
        else:
            ph._element.getparent().remove(ph._element)
    text(s_, 0.45, 5.4, 3.6, 1.6, '%02d' % nr, size=66, bold=True, color=WEISS, anchor=MSO_ANCHOR.MIDDLE)
    text(s_, 4.78, 4.05, 7.8, 2.5, inhalt, size=12, color=SW, bullets=True, space_after=6)
    return s_

trenner(1, 'Herleitung', 'Was die PDD verlangt – und warum genau diese Testfälle',
        ['PDD-Struktur: Kapitel, harte Business Exceptions, Prüfnotizen', 'Warum %d Testfälle' % TF_N, 'Fehlerliste in zwei Sammeltests', 'Glattfälle als Gegenprobe'], 1)
trenner(2, 'Aufbau des Tests', 'Testobjekt, Teststufen, Umgebung und Wege',
        ['Testschema: Testobjekt und Abgrenzung, Teststufen, Ablauf je Testfall', 'Umgebung und Datenfluss', 'Vorbereitung und die Wege A und B'], 2)
trenner(3, 'Testdaten', 'Was vorbereitet werden muss',
        ['Einschätzung des Bedarfs', 'Meine Testagenturen mit Verträgen und Testfällen', 'Verträge und Agenturen mit EMMA-Eintrag', 'Mail und Maklervollmacht'], 3)
trenner(4, 'Testfälle', 'Überblick, Abdeckung und je Testfall ein Onepager',
        ['Überblick und Abdeckung', '%d Onepager: Vorbereitung, Datensatz, erwarteter Ablauf, Akzeptanzkriterien' % TF_N], 4)
trenner(5, 'Abnahme', 'Kriterien, Fehlerklassen, Durchführung', ['Abnahmekriterien (Vorschlag)', 'Fehlerklassen', 'Durchführung'], 6)

# ---- Testschema
s = neue_folie('Only Title', 'Testschema: Getestet wird der Prüf-Bot ab dem Postkorbvorgang je VNR – alle harten BE, die Fehlerliste und der Glattfall; Celonis liefert nur den Datensatz',
               'TESTSCHEMA | TESTOBJEKT, TESTSTUFEN, ABLAUF', tsize=16)
kachel(s, 0.56, 1.45, 3.9, 5.4, 'Testobjekt und Abgrenzung')
spalte(s, 0.68, 1.85, 3.66, 4.9, [
    absatz([('Im Test', True, TEALD, False)], kopf=True, space=1),
    absatz([('Prüf-Bot Vorprüfung BÜ (Blue Prism) nach PDD v11, Gesundheit/KV und Komposit/Leben', False, None, False)], bullet=True, space=0),
    absatz([('Vorprüfung auf dem KI-Deckblatt, Kapitel I bis V, Abschluss mit und ohne Befund', False, None, False)], bullet=True, space=0),
    absatz([('Telefonnotiz BOT2011 bzw. 1515, Bearbeitungshinweis „BE:“, „Fehler:“, „Hinweis:“', False, None, False)], bullet=True, space=0),
    absatz([('Weiterleitung in HSB4 K 72, HSB4 K MV, HSB4 K KO bzw. ODPP1 D; Report', False, None, False)], bullet=True, space=4),
    absatz([('Eingabe jedes Testfalls', True, TEALD, False)], kopf=True, space=1),
    absatz([('ein Postkorbvorgang je VNR im Themenpostkorb MV 23724 mit Datensatz (KI-Deckblatt) im Datenpool', False, None, False)], bullet=True, space=0),
    absatz([('der Datensatz kommt über eine Testmail (Weg A) oder wird direkt gesetzt (Weg B)', False, None, False)], bullet=True, space=4),
    absatz([('Nicht im Test', True, ROT, False)], kopf=True, space=1),
    absatz([('Celonis: Klassifikation, Extraktion, Aufteilung einer Mail auf mehrere VNR, EMMA-Abgleich', False, None, False)], bullet=True, space=0),
    absatz([('EMWS: Eröffnung der Postkorbvorgänge', False, None, False)], bullet=True, space=0),
    absatz([('72-Stunden-BOT und BÜ-BOT (die eigentliche Bestandsübertragung)', False, None, False)], bullet=True, space=0),
    absatz([('Sachbearbeitung der ausgesteuerten Vorgänge, Ablehnungsschreiben', False, None, False)], bullet=True, space=0),
    absatz([('Lasttest und Laufzeit (nur Fehlerklasse 4)', False, None, False)], bullet=True, space=4),
    absatz([('Grundsatz', True, TEALD, False)], kopf=True, space=1),
    absatz([('Der Bot liest den Host nur und schreibt ausschließlich Notiz, Bearbeitungshinweis und Weiterleitung – Testdaten sind deshalb wiederverwendbar.', False, None, False)])],
    groessen=(8, 7.5, 7.2, 7))
kachel(s, 4.6, 1.45, 3.95, 5.4, 'Teststufen')
for i, (k, v) in enumerate(K.DURCHFUEHRUNG):
    y = 1.9 + i * 1.62
    rect(s, 4.72, y, 3.71, 1.4, WEISS, TEALL, lw=0.75)
    nummer(s, 4.82, y + 0.1, i + 1, TEALD)
    text(s, 5.2, y + 0.1, 3.15, 0.3, k, size=8.5, bold=True, color=SW)
    text(s, 5.2, y + 0.42, 3.15, 0.95, v, size=7.5, color=GRAUD)
    if i < len(K.DURCHFUEHRUNG) - 1:
        pfad(s, [(6.58, y + 1.4), (6.58, y + 1.62)], TEALD, 1.25)
kachel(s, 8.7, 1.45, 4.07, 5.4, 'Ablauf je Testfall', ROT, ROTL)
abl = [('Testdaten bereit', 'Vertrag, Agentur mit EMMA-Eintrag, Absender; konkrete Werte in der Excel'),
       ('Vorgang bereitstellen', 'ein Postkorbvorgang je VNR; Datensatz über Testmail (A) oder direkt gesetzt (B)'),
       ('Datensatz prüfen', 'Vorbedingung, kein Testgegenstand: Soll-Werte je Feld; Abweichung → Datensatz korrigieren'),
       ('Bot-Lauf', 'Vorgang-Lfd-Nr notieren, Lauf abwarten bzw. durch Robotics starten'),
       ('Akzeptanz prüfen', 'Kriterien einzeln abhaken, Screenshots von Notiz bzw. Hinweis und Zielpostkorb')]
for i, (k, v) in enumerate(abl):
    y = 1.88 + i * 0.64
    nummer(s, 8.82, y + 0.02, i + 1, ROT)
    text(s, 9.2, y, 3.45, 0.25, k, size=8.5, bold=True, color=SW)
    text(s, 9.2, y + 0.23, 3.45, 0.4, v, size=7.2, color=GRAUD)
text(s, 8.82, 5.15, 3.85, 0.25, 'Status und Nachweis', size=8.5, bold=True, color=ROT)
text(s, 8.82, 5.4, 3.85, 1.4, [[('Status  ', True), ('offen · in Arbeit · bestanden · nicht bestanden · blockiert · entfällt', False)],
     [('Nachweis  ', True), ('Tester, Datum, Vorgang-Lfd-Nr, Ist-Ergebnis, Screenshot', False)],
     [('Fehlerklassen  ', True), ('1 kritisch und 2 hoch blockieren die Abnahme, 3 mit Nachbesserung, 4 ohne Einfluss', False)]], size=7.2, color=SW, space_after=3)

# ---- Umgebung und Datenfluss (aus dem Testkonzept vom 23.09.2026)
s = neue_folie('Only Title', 'Testdaten kommen per PTU aus der Produktion nach IMSI; Kunden-, Makler- und Vermittlerdaten müssen vor dem Start in Celonis auf den IMSI-Stand gebracht werden', 'TESTSCHEMA | UMGEBUNG UND DATENFLUSS', tsize=16)
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
P = box(s, 4.25, 2.85, 1.5, 0.62, 'Prüf-Bot Vorprüfung BÜ', 'Blue Prism, PDD v11', fill=TEALD, tsize=8, ssize=6.3)
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

rect(s, 8.02, 1.8, 1.46, 0.82, None, ROT, lw=1.75, dash=True)
rect(s, 9.55, 1.5, 3.1, 0.3, ROT, None)
text(s, 9.55, 1.5, 3.1, 0.3, 'Start des Robotic-Tests: Vorgang je VNR', size=7.5, bold=True, color=WEISS, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)

# ---- Vorbereitung und Wege (aus dem Testkonzept vom 23.09.2026)
s = neue_folie('Only Title', 'Zwei Wege liefern den Datensatz je VNR: direkt gesetzt (B) oder über eine Testmail mit Celonis (A) – getestet wird in beiden Fällen nur der Prüf-Bot', 'TESTSCHEMA | VORBEREITUNG UND WEGE', tsize=16)
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
abschnitt(s, 4.5, 1.45, 3.9, 'Weg A: Datensatz über Testmail')
schritteA = [('Vorlagen kopieren', 'schöne produktive Maklervollmachten nach ergodev; VNR ersetzen oder per PTU abziehen; Agentur-Nr. ändern'),
             ('Daten angleichen', 'Kundendaten auf IMSI-Stand, EMMA-Daten mit passender PNR'),
             ('Mail einsteuern', 'an das Postfach in der Abnahme'),
             ('Celonis-Prozess starten', 'Extraktion, KI-Deckblatt, Übergabe an EMWS, Postkorbvorgang je VNR')]
for i, (k, v) in enumerate(schritteA):
    y = 1.95 + i * 0.92
    nummer(s, 4.5, y + 0.02, i + 1, TEALD)
    text(s, 4.9, y, 3.5, 0.25, k, size=9, bold=True, color=SW)
    text(s, 4.9, y + 0.25, 3.5, 0.62, v, size=7.5, color=GRAUD)
rect(s, 4.5, 5.7, 3.9, 1.2, TEALT)
text(s, 4.62, 5.76, 3.7, 0.25, 'Realistische Eingabe', size=8.5, bold=True, color=TEALD)
text(s, 4.62, 6.02, 3.7, 0.85, ['Datensatz entsteht aus echter Mail und Vollmacht – nah an der Produktion', 'Aufwändiger: EMMA- und Kundendaten müssen vorab stimmen', 'Celonis selbst ist nicht Testgegenstand'], size=7.5, bullets=True, space_after=2, color=GRAUD)
# Weg B
abschnitt(s, 8.75, 1.45, 4.0, 'Weg B: Datensatz direkt setzen', ROT)
schritteB = [('Vorlagen kopieren', 'schöne produktive Maklervollmachten nach ergodev'),
             ('Celonis ohne EMWS', 'Mail an das Postfach in der Abnahme, Celonis-Prozess starten, Übergabe an EMWS gestoppt'),
             ('Datensatz anpassen', 'strukturierte Daten vor der Weitergabe an EMWS auf IMSI-Stand ändern: Kunde, Agentur-Nr., PNR, VNR, E-Mail'),
             ('EMWS starten', 'Postkorbvorgang eröffnen, Prüf-Bot läuft')]
for i, (k, v) in enumerate(schritteB):
    y = 1.95 + i * 0.92
    nummer(s, 8.75, y + 0.02, i + 1, ROT)
    text(s, 9.15, y, 3.6, 0.25, k, size=9, bold=True, color=SW)
    text(s, 9.15, y + 0.25, 3.6, 0.62, v, size=7.5, color=GRAUD)
rect(s, 8.75, 5.7, 4.0, 1.2, ROTL)
text(s, 8.87, 5.76, 3.8, 0.25, 'Empfehlung für den Start', size=8.5, bold=True, color=ROT)
text(s, 8.87, 6.02, 3.8, 0.85, ['Schnell: nur der Datensatz wird gesetzt, Prüf-Bot und Host-Transaktionen sofort testbar', 'Jeder Testfall gezielt herstellbar', 'Pflicht für die Fälle, die keine Mail erzeugen kann (z. B. fiktive VNR, leerer Absender)'], size=7.5, bullets=True, space_after=2, color=GRAUD)

# ================================================================== Herleitung
HL = K.herleitung()
EIGEN = [lambda t: t['gruppe'] in ('VP', 'VM', 'VT') or t['id'] in ('TF-KU-01', 'TF-KU-02', 'TF-KU-03', 'TF-KU-04'),
         lambda t: t['gruppe'] == 'BH',
         lambda t: t['gruppe'] in ('GL', 'EM'),
         lambda t: False,
         lambda t: t['id'] == 'TF-KU-05',
         lambda t: t['gruppe'] == 'TE']
for h, f_ in zip(HL, EIGEN):
    h['eigen'] = [t['id'] for t in K.TESTFAELLE if f_(t)]
    h['mit'] = [x for x in h['testfaelle'] if x not in h['eigen']]
assert sum(len(h['eigen']) for h in HL) == TF_N, [len(h['eigen']) for h in HL]
nBE = len(K.BE_LISTE) - 1; nPN = len(K.NOTIZ_LISTE)
KAP_BE = {'VP': ['Keine Bestandsübertragung möglich: Courtagefortzahler', 'Keine Bestandsübertragung möglich: Kontaktgeber', 'Agenturnummer nicht vorhanden',
                 'BÜ-Wunsch nicht vorhanden', 'Betreuungswunsch nicht auf MFA ausgestellt', 'Unterschrift VN fehlt'],
          'I': ['Vertrag zur VNR nicht gefunden', 'Kunde in IS011 nicht gefunden', 'Kunde ist nicht Versicherungsnehmer', 'Vertrag gehört nicht zum Kunden'],
          'II': [], 'III': ['Agenturnummer in OB726 unbekannt', 'Keine Zusammenarbeit'], 'IV': ['Vertrag nicht aktuell', 'KR Flottenvertrag']}
KAP_PN = {'VP': ['Unterlagen nicht vollständig'], 'I': ['Geburtsdatum abweichend'], 'II': ['Bestandsinhaber nicht ermittelbar', 'Anbindung Bestandsinhaber nicht aktiv'],
          'III': ['Vermittlertyp abweichend', 'E-Mail-Adresse des Vermittlers fehlt', 'Absender ist eine interne ERGO-Adresse'], 'IV': []}
assert sum(len(v) for v in KAP_BE.values()) == nBE and sorted(x for v in KAP_BE.values() for x in v) == sorted(K.BE_LISTE[:-1])
assert sorted(x for v in KAP_PN.values() for x in v) == sorted(K.NOTIZ_LISTE)
KAPS = [('VP', 'Vorprüfung', 'KI-Deckblatt'), ('I', 'I. Kunde', 'IS011, Scout'), ('II', 'II. Bestandsinh.', 'Bestandsinhaber: VA230, OB726, GH040'),
        ('III', 'III. Vermittler', 'OB726, GH040, OB729'), ('IV', 'IV. Vertrag', 'VA230/VAF230'), ('V', 'V. Fehlerliste', 'gesammelte Prüfnotizen')]
s = neue_folie('Only Title', 'Die PDD prüft in einer Vorprüfung und sieben Kapiteln auf %d harte Business Exceptions und %d Prüfnotizen – daraus folgt die Testlogik'
               % (nBE, nPN), 'HERLEITUNG | PDD UND TESTLOGIK', tsize=16)
W_ = 1.72
for i, (key, name, sub) in enumerate(KAPS):
    x = 0.56 + i * (W_ + 0.02)
    c_ = chevron(s, x, 1.45, W_ + 0.1, 0.5, '', name, TEALD if key != 'V' else LILA, tcol=WEISS, first=(i == 0))
    for r in c_.text_frame.paragraphs[0].runs: r.font.size = Pt(8)
    text(s, x + 0.12, 2.0, W_ - 0.1, 0.2, sub, size=6.8, color=GRAU, italic=True)
    if key == 'V':
        rect(s, x + 0.05, 2.3, W_ - 0.1, 2.35, LILAL, None)
        text(s, x + 0.15, 2.36, W_ - 0.3, 2.2, [[('Fehlerliste gefüllt → BE „Nachprüfung erforderlich“', True)],
             [('Alle Prüfnotizen aus Vorprüfung bis IV werden gesammelt und erst hier zur BE.', False)]], size=7, color=SW, space_after=4)
        continue
    be_, pn_ = KAP_BE[key], KAP_PN[key]
    rect(s, x + 0.05, 2.3, W_ - 0.1, 0.34, ROT if be_ else GRAUL, None)
    text(s, x + 0.12, 2.3, W_ - 0.2, 0.34, [[('%d  ' % len(be_), True), ('harte BE', False)]], size=9, color=WEISS if be_ else GRAU, anchor=MSO_ANCHOR.MIDDLE)
    text(s, x + 0.1, 2.68, W_ - 0.15, 1.05, [x_.replace('Keine Bestandsübertragung möglich: ', 'Keine BÜ: ') for x_ in be_] or ['–'], size=6.3, color=SW, space_after=1,
         bullets=bool(be_))
    y2 = 3.72
    rect(s, x + 0.05, y2, W_ - 0.1, 0.34, LILA if pn_ else GRAUL, None)
    text(s, x + 0.12, y2, W_ - 0.2, 0.34, [[('%d  ' % len(pn_), True), ('Prüfnotiz' + ('en' if len(pn_) != 1 else ''), False)]], size=9,
         color=WEISS if pn_ else GRAU, anchor=MSO_ANCHOR.MIDDLE)
    text(s, x + 0.1, y2 + 0.38, W_ - 0.15, 0.6, pn_ or ['–'], size=6.3, color=SW, space_after=1, bullets=bool(pn_))
# Abschluss VI und VII rechts
xa = 0.56 + 6 * (W_ + 0.02) + 0.12
box(s, xa, 1.45, 12.77 - xa, 0.5, 'VI. ohne Befund', 'Notiz BOT2011 / 1515 → HSB4 K 72', fill=TEALT, tcol=TEALD, scol=SW, tsize=8, ssize=6.3)
box(s, xa, 2.05, 12.77 - xa, 0.5, 'VII. mit Befund', 'Bearbeitungshinweis → MV, KO oder ODPP1 D', fill=ROTL, tcol=ROT, scol=SW, tsize=8, ssize=6.3)
text(s, xa, 2.65, 12.77 - xa, 2.0, ['Notiz: %d Varianten und Rückfallregeln' % len(K.GLATT_MERKMALE), 'Routing: 4 Zielpostkörbe', 'KV nach MV, Komposit/Leben nach Vertriebskanal des Bestandsinhabers'],
     size=6.5, color=GRAUD, bullets=True, space_after=2)
# Testlogik
yl = 4.85
text(s, 0.56, yl, 8, 0.28, 'Daraus folgt die Testlogik', size=11, bold=True, color=SW)
HLd = {h['name'][:12]: h for h in K.herleitung()}
logik = [(ROT, 'Harte BE beendet den Vorgang', 'je harte BE ein eigener Vorgang', '%d BE → %d Testfälle' % (nBE, len([t for t in K.TESTFAELLE if t['gruppe'] in ('VP', 'KU', 'VM', 'VT') and t['id'] != 'TF-KU-05']))),
         (LILA, 'Prüfnotiz: der Bot prüft weiter', 'viele Ausprägungen in einem Vorgang sammeln', '%d Prüfnotizen → 2 Sammeltests' % nPN),
         (TEALD, 'Ohne Befund: Gegenprobe', 'je zwei Glattfälle KV und Non-KV, Notizvarianten laufen mit', '%d Glattfälle' % len([t for t in K.TESTFAELLE if t['gruppe'] == 'GL'])),
         (GRAUD, 'Start, Betrieb, Kundensuche', 'nicht über eine Mail herstellbar bzw. Sonderdaten', '%d Testfälle' % len([t for t in K.TESTFAELLE if t['gruppe'] == 'TE' or t['id'] == 'TF-KU-05']))]
for i, (farbe, k1, k2, k3) in enumerate(logik):
    x = 0.56 + i * 3.07
    rect(s, x, yl + 0.35, 2.95, 1.6, WEISS, farbe, lw=1.25)
    rect(s, x, yl + 0.35, 0.09, 1.6, farbe, None) if False else None
    text(s, x + 0.15, yl + 0.45, 2.7, 0.3, k1, size=9, bold=True, color=farbe)
    text(s, x + 0.15, yl + 0.78, 2.7, 0.45, k2, size=7.5, color=GRAUD)
    text(s, x + 0.15, yl + 1.35, 2.7, 0.45, k3, size=12, bold=True, color=SW)
text(s, 0.56, 6.88, 12.2, 0.15, 'Summe: %d Testfälle (%d Muss, %d Soll, %d Kann) – Einzelheiten auf den folgenden Folien.' % (TF_N, len(MUSS),
     sum(t['prio'] == 'Soll' for t in K.TESTFAELLE), sum(t['prio'] == 'Kann' for t in K.TESTFAELLE)), size=7, color=GRAU, italic=True)

s = neue_folie('Only Title', 'Warum %d Testfälle: Die PDD kennt %d harte Business Exceptions und %d Prüfnotizen – jede harte BE braucht einen eigenen Vorgang, alles andere wird gebündelt'
               % (TF_N, nBE, nPN), 'HERLEITUNG | WAS DIE PDD VERLANGT', tsize=16)
colw = [2.75, 0.85, 0.8, 2.75, 5.06]
rows = [['Was die PDD vorgibt', 'in der PDD', 'eigene Testfälle', 'eigene Testfälle (IDs) und mitgeprüft in', 'Warum so viele – und nicht mehr']]
hs = [0.3]
for h in HL:
    ids = [[(', '.join(kid(x) for x in h['eigen']) or 'keine eigenen', True)]] + ([[('mitgeprüft: ' + ', '.join(kid(x) for x in h['mit']), False)]] if h['mit'] else [])
    z = [h['name'], [[(str(h['anzahl']), True, 13, GRAUD)]], [[(str(len(h['eigen'])), True, 13, ROT)]], ids, h['prinzip']]
    rows.append(z); hs.append(max(0.42, hoehe([h['name'], ', '.join(h['eigen'] + h['mit']) + ' ' * 20, h['prinzip']], [colw[0], colw[3], colw[4]], 7.2)))
rows.append([[[('Summe', True)]], ' ', [[(str(TF_N), True, 13, ROT)]], [[('%d Muss · %d Soll · %d Kann' % (len(MUSS), sum(t['prio'] == 'Soll' for t in K.TESTFAELLE),
             sum(t['prio'] == 'Kann' for t in K.TESTFAELLE)), True)]], 'Jede BE, jede Prüfnotiz, jede Notizvariante und jeder Zielpostkorb mindestens einmal nachgewiesen (Folie „Abdeckung“).'])
hs.append(0.34)
tabelle(s, 0.56, 1.45, colw, rows, hs, size=7.2, fills=[None] * (len(rows) - 1) + [GRAUL])
yb = 1.45 + sum(hs) + 0.2
rect(s, 0.56, yb, 12.21, 0.95, TEALT, None)
text(s, 0.7, yb + 0.1, 11.9, 0.8, [
    [('Regel für das Bündeln  ', True), ('Ein Vorgang endet bei der ersten harten BE – deshalb je harte BE ein Vorgang. Prüfnotizen, Notizvarianten, Routing und mehrere VNR beenden '
      'nichts; sie werden in möglichst wenige Vorgänge gepackt. Getrennt wird nur, was sich ausschließt: zwei Werte desselben Felds oder zwei Zustände desselben Vertrags. '
      'Jeder Testfall ist genau ein Vorgang auf einer VNR – so, wie der Prüf-Bot startet.', False)],
    [('Preis des Bündelns  ', True), ('Schlägt ein Sammelfall fehl, zeigt die Fehlerliste bzw. die Notiz, welche Ausprägung gebrochen ist; die Akzeptanzkriterien sind je Ausprägung '
      'einzeln abhakbar. Bei Bedarf lässt sich ein Sammelfall zur Fehlersuche wieder in Einzelfälle zerlegen.', False)]], size=7.8, color=SW, space_after=4)

# ---- Fehlerliste: sieben Pruefnotizen in zwei Sammeltests
s = neue_folie('Only Title', 'Fehlerliste: Alle %d Prüfnotizen der PDD in zwei Sammeltests – zwei, weil sich je zwei Ausprägungen gegenseitig ausschließen' % nPN,
               'HERLEITUNG | FEHLERLISTE', tsize=16)
ta = next(t for t in K.TESTFAELLE if t['id'] == 'TF-BH-01'); tb = next(t for t in K.TESTFAELLE if t['id'] == 'TF-BH-02')
AUSL = {'Unterlagen nicht vollständig': 'Vollmacht ohne VNR (Mail M-14)', 'Geburtsdatum abweichend': 'Tag und Monat vertauscht (Mail M-14)',
        'Bestandsinhaber nicht ermittelbar': 'Vertrag V-07: Feld „Betreuung“ leer', 'Anbindung Bestandsinhaber nicht aktiv': 'Vertrag V-08: Bestandsinhaber in GH040 inaktiv',
        'Vermittlertyp abweichend': 'Datensatz „MFA“, OB726 nennt „Makler“ (A-02)', 'E-Mail-Adresse des Vermittlers fehlt': 'A-02 ohne OB729-Adresse, Absender geleert',
        'Absender ist eine interne ERGO-Adresse': 'A-02 ohne OB729-Adresse, Mail über @ergo weitergeleitet'}
rows = [['Prüfnotiz (Wertliste PDD)', 'ausgelöst durch', 'A: BH-01', 'B: BH-02']]
for pn_ in K.NOTIZ_LISTE:
    rows.append([pn_, AUSL[pn_], [[('●' if pn_ in ta['deckt'] else '', True)]], [[('●' if pn_ in tb['deckt'] else '', True)]]])
tabelle(s, 0.56, 1.45, [2.7, 3.2, 0.75, 0.75], rows, [0.3] + [0.36] * len(K.NOTIZ_LISTE), size=7.5)
for i in range(len(K.NOTIZ_LISTE)):
    pass
yy = 1.45 + 0.3 + 0.36 * len(K.NOTIZ_LISTE) + 0.2
kachel(s, 0.56, yy, 7.4, 1.45, 'Warum zwei und nicht einer', LILA, LILAL)
liste(s, 0.68, yy + 0.4, 7.2, ['„Bestandsinhaber nicht ermittelbar“ und „Anbindung nicht aktiv“ sind zwei Zustände des Vertrags – V-07 und V-08, also zwei Vorgänge.',
      '„E-Mail-Adresse fehlt“ und „Absender intern“ sind zwei Werte desselben Felds – nur einer pro Vorgang.',
      'Alles andere passt zusammen: Sammeltest A kommt mit echter Mail aus (Weg A), Sammeltest B braucht den Datensatz (Weg B), weil Celonis weder einen leeren Absender '
      'noch einen falschen Typ liefert.'], size=7.5)
kachel(s, 8.15, 1.45, 4.62, 4.3, 'Erwarteter Bearbeitungshinweis – Sammeltest A', TEALD, TEALT)
hb = rect(s, 8.3, 1.9, 4.32, 1.45, WEISS, GRAUM, lw=0.75)
text(s, 8.42, 1.97, 4.1, 2.0, ['BE: Nachprüfung erforderlich', 'Fehler:'] + ['  %s' % t_ for _, t_ in ta['pn']] + ['Hinweis:', 'Weitere VNR: <VNR aus dem Auftrag>'],
     size=7.5, color=SW, space_after=1)
text(s, 8.3, 3.5, 4.32, 2.2, [[('Reihenfolge  ', True), ('so, wie die Prüfnotizen entstehen: Vorprüfung, I. Kunde, II. Bestandsinhaber, III. E-Mail-Adresse', False)],
     [('Durchlauf  ', True), ('der Bot prüft trotz der ersten Prüfnotiz alle Kapitel bis IV zu Ende; erst der Test auf Fehlerliste setzt die BE', False)],
     [('Ziel  ', True), (PK_MV + ' (KV)', False)],
     [('Sammeltest B  ', True), ('Fehler: Bestandsinhaber nicht ermittelbar, Vermittlertyp abweichend, E-Mail-Adresse des Vermittlers fehlt', False)]], size=7.3, color=SW, space_after=4)

# ---- Glattfaelle: Notizvarianten gebuendelt
gl = [t for t in K.TESTFAELLE if t['gruppe'] in ('GL', 'EM')]
s = neue_folie('Only Title', 'Glattfälle: %d Notizvarianten und Rückfallregeln in %d Vorgängen – getrennt nur, wo ein Feld nur einen Wert tragen kann'
               % (len(K.GLATT_MERKMALE), len(gl)), 'HERLEITUNG | GLATTFÄLLE', tsize=16)
colw = [3.3] + [0.62] * len(gl) + [3.6]
rows = [['Notizvariante bzw. Regel'] + [kid(t['id']) for t in gl] + ['warum nicht kombinierbar mit …']]
GRUND = {'Vermittlertyp MFA': 'Typ ist ein Feld: Makler, MFA, Fremd-VU oder leer', 'Vermittlertyp Fremdversicherungsunternehmen': 'dito',
         'Vermittlertyp leer': 'dito', 'Bearbeitung nach: Untervollmacht fehlt': 'ein Wert je Notiz („Mit BÜ-Wunsch“ oder „Untervollmacht fehlt“)',
         'E-Mail aus Sonderliste TOP-Makler': 'eine Adressquelle je Vorgang: Sonderliste, OB729 oder Absender', 'E-Mail = Absender': 'dito',
         'PNR aus OB726': 'eine PNR-Quelle je Vorgang', 'Sparte Leben (GeVo 108, Freitext Leben)': 'eigener Vertrag nötig (optional V-09)',
         'Juristische Person ohne Geburtsdatum': 'Firma als VN: eigener Kunde K-03',
         'OB729 mit interner Adresse übergangen': 'eigene Agentur nötig (optional A-09); Untermakler in GL-03 ist A-02'}
for m_ in K.GLATT_MERKMALE:
    rows.append([m_] + [[[('●' if m_ in t['deckt'] else '', True)]] for t in gl] + [GRUND.get(m_, '')])
hh = [0.28] + [0.215] * len(K.GLATT_MERKMALE)
tabelle(s, 0.56, 1.45, colw, rows, hh, size=6.8, mv=0.02)
yy = 1.45 + sum(hh) + 0.12
text(s, 0.56, yy, 12.2, 6.85 - yy, ', '.join('%s: %s' % (kid(t['id']), t['titel']) for t in gl), size=6.8, color=GRAUD)

# ================================================================== Folie 2: Einschaetzung Testdatenbedarf
s = neue_folie('Only Title', 'Für alle %d Muss-Testfälle reichen %d Verträge bei %d Kunden und %d Agenturen – der Rest entsteht über Mail, Vollmacht und Datensatz'
               % (len(MUSS), len(PV), len(B['kunden_p']), len(PA)), 'TESTDATEN | EINSCHÄTZUNG', tsize=16)
kpis = [(str(len(PV)), 'Verträge (VNR)', 'Pflicht, dazu %d optional' % len(OV), ROT),
        (str(len(B['kunden_p'])), 'Kunden', 'je Kunde nur die Verträge, die er braucht', ROT),
        (str(len(PA)), 'Agenturen mit EMMA-Eintrag', 'Pflicht, dazu %d optional' % len(OA), ROT),
        (str(len(V01A01)), 'Testfälle auf V-01 + A-01', 'Mail, Vollmacht oder Datensatz variieren', TEALD),
        (str(len(B['weg_b'])), 'Testfälle nur über Weg B', 'Datensatz vor EMWS anpassen', TEALD),
        (str(TF_N), 'Testfälle gesamt', '%d Muss · %d Soll · %d Kann' % (len(MUSS), sum(t['prio'] == 'Soll' for t in K.TESTFAELLE),
                                                     sum(t['prio'] == 'Kann' for t in K.TESTFAELLE)), GRAUD)]
for i, (z, k, u, f) in enumerate(kpis):
    x = 0.56 + i * 2.05
    rect(s, x, 1.5, 1.9, 1.25, GRAUL, None)
    text(s, x + 0.12, 1.55, 1.7, 0.55, z, size=30, bold=True, color=f)
    text(s, x + 0.12, 2.12, 1.7, 0.25, k, size=8.5, bold=True, color=SW)
    text(s, x + 0.12, 2.36, 1.7, 0.35, u, size=7, color=GRAUD)
kachel(s, 0.56, 3.0, 4.0, 2.85, 'Warum so wenige Testdaten reichen')
liste(s, 0.68, 3.4, 3.78, [
    'Der Prüf-Bot liest den Host nur. Er schreibt Telefonnotiz, Bearbeitungshinweis und Weiterleitung, ändert aber weder Kunde noch Vertrag noch Vermittler. '
    'Ein vorbereiteter Vertrag trägt deshalb beliebig viele Testfälle.',
    'Was der Makler schreibt, kommt über Celonis ins KI-Deckblatt. Mail und Maklervollmacht bestimmen also Typ, Unterschrift, Vollständigkeit, '
    'Kundendaten, Pool und Umfang, ohne dass ein Hostdatum geändert wird.',
    'Eine eigene VNR braucht nur, was im Host stehen muss: Vertragsstatus, Flotte, Bestandsinhaber und Vertriebskanal, juristische Person.',
    'Eine eigene Agentur braucht nur, was OB726, GH040, OB729 oder EMMA liefern müssen: Klassifizierung, „INAKTIV“, fehlende Adresse, Sonderliste, Typ im EMMA-Abzug.',
    'Was Celonis aus echten Mails nicht erzeugt (leere Felder, fiktive Nummern), wird im Weg B im Datensatz vor der Übergabe an EMWS gesetzt.'], size=7.3)
kachel(s, 4.7, 3.0, 4.0, 2.85, 'Was ich vorbereiten muss', ROT, ROTL)
_kunden = []
for v in PV:
    if v[3] not in _kunden: _kunden.append(v[3])
text(s, 4.82, 3.4, 3.78, 3.4, [
    [('Kunde %s  ' % kd, True), (', '.join('%s %s' % (v[0], v[4]) for v in PV if v[3] == kd), False)] for kd in _kunden] + [
    [('Agenturen (Pflicht)  ', True), (', '.join('%s %s' % (a[0], a[2]) for a in PA), False)],
    [('Absender  ', True), (', '.join(p_[1] for p_ in K.ABSENDER), False)],
    [('Optional (Soll/Kann)  ', True), ('%s; ohne sie fehlen nur Soll- und Kann-Fälle' % ', '.join(x[0] for x in OV + OA), False)]],
    size=7.3, color=SW, space_after=3)
kachel(s, 8.85, 3.0, 3.92, 2.85, 'Annahmen, mit Celonis und Robotics zu bestätigen', LILA, LILAL)
liste(s, 8.97, 3.4, 3.7, K.ANNAHMEN[1:], size=7.3)
rect(s, 0.56, 6.0, 12.21, 0.82, GRAUL, None)
wb = [t for t in K.TESTFAELLE if t['weg'].startswith('B')]
text(s, 0.68, 6.06, 12.0, 0.72, [[('Nur über Weg B (%d):  ' % len(wb), True), (', '.join(kid(t['id']) for t in wb), False)],
     [('Warum  ', True), ('Celonis liest aus einer echten Mail keine leeren Pflichtfelder, keine fiktiven Nummern und keine unbekannten VNR; Datenpool-Fehler, '
      'Doppelverarbeitung und Fehlermasken entstehen nicht über eine Mail. Diese Fälle laufen über einen Standardvorgang, dessen Datensatz vor der Übergabe an EMWS angepasst wird.', False)],
     [('Weg A oder B  ', True), (', '.join(kid(t['id']) for t in K.TESTFAELLE if t['weg'] == 'A oder B') + ' – echte Mail bevorzugt, Weg B als Rückfall', False)]],
     size=7.3, color=SW, space_after=2)

# ================================================================== Folie 3/4: Testagenturen mit Vertraegen und Testfaellen
def konstellationen():
    zeilen = []
    for a in K.AGENTUREN + [('keine', True, 'ohne Agentur', '', '')]:  # 'keine': Absender ohne EMMA-Treffer
        tfs = [t for t in K.TESTFAELLE if t['agentur'] == a[0]]
        if not tfs: continue
        vs = []
        for t in tfs:
            for v in t['vnr'].split('+'):
                if v not in vs: vs.append(v)
        vs.sort()
        zeilen.append((a, [(v, [t for t in tfs if v in t['vnr'].split('+')]) for v in vs]))
    return zeilen


KONST = konstellationen()


def konst_folie(auswahl, titel, kick):
    s = neue_folie('Only Title', titel, kick, tsize=16)
    colw = [2.5, 3.05, 5.95, 0.7]
    rows = [['Testagentur', 'Vertrag', 'Testfälle (Mail oder Weg B unterscheidet sie)', 'Anzahl']]
    hs = [0.28]; merges = []; fills = [None]
    for a, vs in auswahl:
        start = len(rows)
        for i, (v, tfs) in enumerate(vs):
            vv = K.VERTRAG[v]
            if a[0] == 'keine':
                ag = [[('ohne Agentur', True)], [('unbekannter Absender P-04, kein EMMA-Treffer', False)]]
            else:
                ag = [[(a[0] + '  ' + a[2], True)], [('Pflicht' if a[1] else 'optional', False)]] if i == 0 else ' '
            ids = ', '.join(kid(t['id']) + ('*' if t['weg'].startswith('B') else '') for t in tfs)
            zeile = [ag, [[(v + '  ', True), (vv[4], False)], [('%s · Kunde %s · %s' % ('KV' if vv[2] == 'KV' else 'Komposit/Leben', vv[3], 'Pflicht' if vv[1] else 'optional'), False)]],
                     ids, [[(str(len(tfs)), True)]]]
            rows.append(zeile)
            hs.append(max(0.31, hoehe([ids, vv[4] + ' ' * 10], colw[2:3] + [colw[1]], 6.8)))
            fills.append(GRAUL if a[0] == 'A-01' and v == 'V-01' else None)
        if len(vs) > 1:
            merges.append((start, 0, len(rows) - 1, 0))
    merge_tabelle(s, 0.56, 1.45, colw, rows, hs, size=6.8, merges=merges, fills=fills)
    text(s, 0.56, 6.78, 12.2, 0.2, '* nur über Weg B (Datensatz vor der Übergabe an EMWS anpassen). Hellgrau: die Hauptkonstellation – ein KV-Vertrag und ein Standardmakler tragen %d Testfälle.'
         % len(V01A01), size=6.8, color=GRAU, italic=True)
    return s


teil1 = [k for k in KONST if k[0][0] == 'A-01']
teil2 = [k for k in KONST if k[0][0] != 'A-01']
konst_folie(teil1, 'Testagentur A-01 (Standardmakler) trägt %d von %d Testfällen – V-01 allein %d'
            % (len([t for t in K.TESTFAELLE if t['agentur'] == 'A-01']), TF_N, len(V01A01)),
            'TESTDATEN | MEINE TESTAGENTUREN (1/2)')
s = konst_folie(teil2, 'Die übrigen Testagenturen liefern je eine Eigenschaft des übernehmenden Vermittlers: Typ, E-Mail-Adresse, PNR oder Zusammenarbeitsstatus',
            'TESTDATEN | MEINE TESTAGENTUREN (2/2)')
rows = [['ID', 'Absender der Testmails', 'Anforderung', 'Testfälle']]
for p in K.ABSENDER:
    n_ = K.verwendet_in(p[0])
    rows.append([p[0], p[1], p[2], nutzung(p[0]) if len(n_) < 10 else '%d: alle übrigen Testfälle mit Mail' % len(n_)])
text(s, 0.56, 5.2, 8, 0.25, 'Dazu vier Absender-Postfächer', size=9, bold=True, color=ROT)
tabelle(s, 0.56, 5.48, [0.5, 2.0, 7.0, 2.71], rows, [0.26] + [0.26] * len(K.ABSENDER), size=6.8, header_fill=TEALD)

# ================================================================== Folie 5/6: Vertraege im Detail
def vertrag_folie(liste_, titel, kick):
    s = neue_folie('Only Title', titel, kick, tsize=16)
    colw = [0.5, 0.55, 1.8, 4.66, 2.3, 2.4]
    rows = [['ID', 'Kunde', 'Vertrag', 'Anforderung im Host (IMSI nach PTU-Abzug)', 'Bereitstellung', 'Testfälle']]
    hs = [0.28]
    for v in liste_:
        z = [v[0], v[3], [[(v[4], True)], [('KV' if v[2] == 'KV' else 'Komposit/Leben', False)]], ['• ' + x for x in v[5]], v[6], nutzung(v[0])]
        rows.append(z); hs.append(max(0.3, hoehe(z, colw, 6.6)))
    tabelle(s, 0.56, 1.45, colw, rows, hs, size=6.6, fills=[None] + [None if v[1] else GRAUL for v in liste_])
    return s


vertrag_folie(K.VERTRAEGE[:5], '%d Pflichtverträge bei %d Kunden: Jeder Vertrag steht für einen Hostzustand, den keine Mail erzeugen kann; %d optionale für Soll-Fälle'
              % (len(PV), len(B['kunden_p']), len(OV)), 'TESTDATEN | VERTRÄGE (1/2)')
vertrag_folie(K.VERTRAEGE[5:], 'Verträge V-06 bis V-%02d: Flotte, Direktbestand, verwaister Bestand und die optionalen Verträge (grau)' % len(K.VERTRAEGE),
              'TESTDATEN | VERTRÄGE (2/2)')

# ================================================================== Folie 7: Agenturen im Detail
s = neue_folie('Only Title', '%s Pflichtagenturen: Jede liefert eine Eigenschaft aus OB726, GH040, OB729 oder dem EMMA-Abzug, die der Bot prüft' % ZAHLWORT[len(PA)],
               'TESTDATEN | AGENTUREN UND EMMA-EINTRAG', tsize=16)
colw = [0.5, 1.95, 4.95, 2.36, 2.45]
rows = [['ID', 'Agentur', 'Anforderung im Host (OB726, GH040, OB729)', 'EMMA-Abzug der Abnahme', 'Testfälle']]
hs = [0.28]; fills = [None]
for a in K.AGENTUREN:
    z = [a[0], [[(a[2], True)], [('Pflicht' if a[1] else 'optional', False)]], ['• ' + x for x in a[3]], a[4], nutzung(a[0])]
    rows.append(z); hs.append(max(0.32, hoehe(z, colw, 6.8))); fills.append(None if a[1] else GRAUL)
f = min(1.0, (5.3 - 0.28) / sum(hs[1:])); hs = [hs[0]] + [h * f for h in hs[1:]]
tabelle(s, 0.56, 1.45, colw, rows, hs, size=6.8, fills=fills)
text(s, 0.56, 6.85, 12.2, 0.2, 'Grau hinterlegt: optional. A-01 steht für den übernehmenden Makler in fast allen Fällen; Celonis findet ihn über Signatur, Vollmachtnehmer '
     'und Agenturnummer im Mailtext – die Testmail muss diese Angaben passend zur gewählten Agentur tragen.', size=6.8, color=GRAU, italic=True)

# ================================================================== Folie 8: Mail und Vollmacht
s = neue_folie('Only Title', 'Die Mail ist der Hebel: Zwei Standardmails als Checkliste, jede Variante erzeugt gezielt die Merkmale ihres Testfalls – ohne Änderung im Host',
               'TESTDATEN | MAIL UND MAKLERVOLLMACHT', tsize=16)
m1 = K.MAIL['M-01']; m2 = K.MAIL['M-02']
kachel(s, 0.56, 1.45, 3.85, 5.4, 'M-01 Standardmail Makler', ROT, ROTL)
spalte(s, 0.68, 1.83, 3.62, 4.95, groessen=(8.5, 8, 7.5, 7, 6.5), absaetze=[
    absatz([('Absender  ', True, None, False), (m1[2], False, None, False)]),
    absatz([('Betreff  ', True, None, False), (m1[3], False, None, False)]),
    absatz([('Text  ', True, None, False), (m1[4], False, GRAUD, True)]),
    absatz([('Anhang  ', True, None, False), (m1[5], False, None, False)], space=5),
    absatz([('Die Maklervollmacht muss enthalten', True, ROT, False)], kopf=True)] +
    [absatz([(x, False, None, False)], bullet=True, space=1) for x in m1[6]] +
    [absatz([('Dann liefert das KI-Deckblatt', True, ROT, False)], kopf=True, space=2),
     absatz([('Typ „Makler“, Agentur-Nr. und PNR, Absender als E-Mail, Kundendaten wie Vollmacht, Umfang „Einzel“, Unterschrift Kunde „ja“, '
              'Prüfung Unterlagen „Vollständig“, Pool leer, Eingangsdatum der Mail', False, GRAUD, False)])])
kachel(s, 4.55, 1.45, 3.1, 5.4, 'M-02 Standardmail Mehrfachagent', TEALD, TEALT)
spalte(s, 4.67, 1.83, 2.88, 4.95, groessen=(8.5, 8, 7.5, 7, 6.5), absaetze=[
    absatz([('Absender  ', True, None, False), (m2[2], False, None, False)]),
    absatz([('Betreff  ', True, None, False), (m2[3], False, None, False)]),
    absatz([('Text  ', True, None, False), (m2[4], False, GRAUD, True)]),
    absatz([('Anhang  ', True, None, False), (m2[5], False, None, False)], space=5),
    absatz([('Der Betreuungswunsch muss enthalten', True, TEALD, False)], kopf=True)] +
    [absatz([(x, False, None, False)], bullet=True, space=1) for x in m2[6]] +
    [absatz([('Dann liefert das KI-Deckblatt', True, TEALD, False)], kopf=True, space=2),
     absatz([('Typ „MFA“, BÜ-Wunsch „ja“, Betreuungswunsch auf den MFA „ja“, Unterschrift Kunde nicht geprüft, Prüfung Unterlagen leer', False, GRAUD, False)])])
var = [['Mail', 'Variante: was ändert sich', 'Testfälle']]
for m in K.MAILS[2:]:
    ids = K.verwendet_in(m[0])
    var.append([m[0], [[(m[1], True)], [(m[7], False)]], ', '.join(kid(i) for i in ids)])
colw = [0.45, 2.62, 1.9]
hv = [0.26] + [max(0.24, hoehe(r_, colw, 6.2)) for r_ in var[1:]]
_f = min(1.0, (5.15 - 0.26) / sum(hv[1:])); hv = [hv[0]] + [h_ * _f for h_ in hv[1:]]
tabelle(s, 7.8, 1.45, colw, var, hv, size=6.2, head_size=7, mv=0.015)

# ================================================================== Folie 9: Ueberblick Testfaelle
s = neue_folie('Only Title', '%d Testfälle in %d Gruppen weisen jede Business Exception, jede Prüfnotiz und jede Notizvariante der PDD v11 nach – je Testfall ein Onepager' % (TF_N, len(K.GRUPPEN)),
               'TESTFÄLLE | ÜBERBLICK', tsize=16)
rows = [['Gruppe', 'Worum es geht', 'Muss', 'Soll', 'Kann', 'Σ']]
hs = [0.32]
for g, n, bes in K.GRUPPEN:
    tfs = [t for t in K.TESTFAELLE if t['gruppe'] == g]
    rows.append([g + ' – ' + n, bes] + [str(sum(1 for t in tfs if t['prio'] == p)) for p in ('Muss', 'Soll', 'Kann')] + [str(len(tfs))]); hs.append(0.42)
rows.append([[[('Summe', True)]], ' '] + [[[(str(sum(1 for t in K.TESTFAELLE if t['prio'] == p)), True)]] for p in ('Muss', 'Soll', 'Kann')] + [[[(str(TF_N), True)]]])
hs.append(0.3)
tabelle(s, 0.56, 1.5, [2.55, 3.55, 0.45, 0.45, 0.45, 0.45], rows, hs, size=7.5, fills=[None] * (len(rows) - 1) + [GRAUL])
kachel(s, 8.35, 1.5, 4.42, 5.25, 'So ist jeder Onepager aufgebaut')
anat = [('Kopf', 'Ziel des Testfalls, erwartetes Ergebnis, Priorität, Weg (A echte Mail, B Datensatz), Sparte, PDD-Kapitel'),
        ('Das muss vorliegen', 'Vertrag mit Hostanforderung, Agentur mit EMMA-Eintrag, Mail mit Absender, Betreff, Text, Anhang und Inhalt der Vollmacht; bei Weg B die Anpassung'),
        ('Soll-Werte KI-Deckblatt', 'alle 21 Felder, die der Prüf-Bot liest; rot hinterlegt ist, was vom Standard abweicht'),
        ('Erwarteter Ablauf', 'je Kapitel der PDD: ohne Befund, Prüfnotiz, harte BE oder nicht durchlaufen'),
        ('Akzeptanzkriterien', 'nummeriert und einzeln abhakbar; Texte wörtlich aus den Wertelisten der PDD'),
        ('Durchführung', 'fünf Schritte; Nachweis (Tester, Datum, Vorgang-Lfd-Nr, Status) in der Excel-Mappe')]
for i, (k, v) in enumerate(anat):
    y = 1.95 + i * 0.78
    nummer(s, 8.5, y + 0.02, i + 1, TEALD)
    text(s, 8.9, y, 3.75, 0.25, k, size=9, bold=True, color=SW)
    text(s, 8.9, y + 0.24, 3.75, 0.5, v, size=7.5, color=GRAUD)

# ================================================================== Folie 10: Abdeckung
s = neue_folie('Only Title', 'Jede Business Exception und jede Prüfnotiz der PDD hat mindestens einen Testfall; Routing und Notizvarianten sind eigens nachgewiesen',
               'TESTFÄLLE | ABDECKUNG', tsize=16)
def abdeckung(liste_, kopf):
    rows = [[kopf, 'Testfälle']]
    for x in liste_:
        rows.append([x, ', '.join(kid(t['id']) for t in K.TESTFAELLE if x in t['deckt'])])
    return rows
r1 = abdeckung(K.BE_LISTE, 'Business Exception')
tabelle(s, 0.56, 1.5, [2.75, 1.45], r1, [0.3] * len(r1), size=7)
r2 = abdeckung(K.NOTIZ_LISTE, 'Prüfnotiz (→ „Nachprüfung erforderlich“)')
tabelle(s, 4.6, 1.5, [2.6, 1.35], r2, [0.3] * len(r2), size=7, header_fill=LILA)
wahl = ['Routing HSB4 K 72', 'Routing HSB4 K MV', 'Routing HSB4 K KO', 'Routing ODPP1 D', 'Notiz BOT2011 (KV)', 'Notiz 1515 (Komposit/Leben)',
        'Bearbeitung nach: Mit BÜ-Wunsch', 'Bearbeitung nach: Untervollmacht fehlt', 'Folgearbeit für Komposit gesetzt', 'Umfang Gesamt',
        'Mehrere VNR (ein Vorgang je VNR)', 'E-Mail aus Sonderliste TOP-Makler', 'Vermittlertyp MFA', 'Kein Datensatz im Datenpool']
r3 = abdeckung(wahl, 'Routing, Notiz und Sonderfälle')
tabelle(s, 8.8, 1.5, [2.6, 1.37], r3, [0.3] * len(r3), size=7, header_fill=TEALD)
text(s, 4.6, 4.2, 3.95, 1.2, ['Prüfnotizen sind kein Abbruch: Der Bot merkt sie in der Fehlerliste, prüft weiter und setzt erst im Test auf Fehlerliste die BE '
     '„Nachprüfung erforderlich“. Jeder Prüfnotiz-Testfall prüft deshalb auch, dass die Kapitel danach durchlaufen wurden.',
     'Kürzel: ' + ', '.join('%s %s' % (g, n.split(' – ')[0].split(' (')[0]) for g, n, _ in K.GRUPPEN) + '.'],
     size=7.5, color=GRAUD, space_after=4)

# ================================================================== Onepager je Testfall
PRIOF = {'Muss': ROT, 'Soll': TEALD, 'Kann': GRAUM}
STATF = {'ok': TEALD, 'pn': LILA, 'be': ROT, 'aus': GRAUM}
STATT = {'ok': 'ohne Befund', 'pn': 'Prüfnotiz', 'be': 'Befund', 'aus': 'nicht durchlaufen'}
GNAME = {g: n for g, n, _ in K.GRUPPEN}


def emma_klasse(a):
    return a[4].replace('Typ ', 'Klassifikation ', 1) if a[4].startswith('Typ ') else a[4]


def vorliegen(t, stufe=0):
    """Vorbereitung als nummerierte Schritte: Vertrag (IMSI), Agentur (Testumgebung), EMMA-Liste, Testmail, ggf. Weg B.
    stufe 0 ausfuehrlich … 6 kompakt (Vollmacht als Fliesstext, ohne Bereitstellung, Standardtext verwiesen, Stichpunkte zusammengezogen)."""
    A = []; nr = [0]
    def schritt(titel):
        nr[0] += 1
        A.append(absatz([('%d  ' % nr[0], True, ROT, False), (titel, True, ROT, False)], kopf=True, space=1))
    def punkt(label, txt, farbe=None, it=False):
        A.append(absatz(([(label + ': ', True, None, False)] if label else []) + [(txt, False, farbe, it)], bullet=True, space=0))
    def ende():
        A[-1]['space'] = 4
    rel = K.relevanz(t)
    for v in t['vnr'].split('+'):
        vv = K.VERTRAG[v]
        sp = 'KV' if vv[2] == 'KV' else 'Komposit'
        if not rel['vertrag']:
            schritt('Vertrag: beliebige gültige %s-VNR aus IMSI' % sp)
            punkt('', 'z. B. %s; Vertragsstand, Kunde und Bestandsinhaber werden nicht geprüft – der Bot steigt vor dem ersten Hostzugriff aus' % v, GRAUD)
        else:
            schritt('Vertrag %s in IMSI bereitstellen: %s' % (v, vv[4]))
            if stufe < 6:
                for x in vv[5]:
                    punkt('', x)
            else:
                punkt('', ' · '.join(vv[5]))
            if stufe < 2:
                punkt('Bereitstellung', vv[6], GRAUD)
        ende()
    if t['gruppe'] == 'TE':
        schritt('Agentur und EMMA-Eintrag: ohne Belang')
        punkt('', 'jede Agentur-Nr. aus der Testumgebung, z. B. %s – der Testfall prüft Start und Betrieb, nicht den Vermittler' % t['agentur'], GRAUD)
        ende()
    elif t['agentur'] == 'keine':
        schritt('Agentur: keine')
        punkt('', 'Absender ohne EMMA-Treffer (P-04); die Mail nennt keine Agenturnummer')
        ende()
    else:
        aa = K.AGENTUR[t['agentur']]
        schritt('Agentur %s in der Testumgebung wählen: %s' % (aa[0], aa[2]))
        if rel['agentur_host']:
            if stufe < 6:
                for x in aa[3]:
                    punkt('', x)
            else:
                punkt('', ' · '.join(aa[3]))
        else:
            punkt('', 'beliebige Agentur-Nr. aus der Testumgebung (IMSI)')
            punkt('', 'OB726, GH040 und OB729 werden nicht abgefragt – der Bot steigt vorher aus', GRAUD)
        ende()
        schritt('EMMA-Liste der Abnahme pflegen')
        punkt('', 'Agentur-Nr. von %s in den EMMA-Abzug aufnehmen' % aa[0])
        punkt('', emma_klasse(aa))
        if not rel['agentur_host']:
            punkt('', 'Testeintrag genügt – allein dieser Eintrag steuert den Testfall', GRAUD)
        ende()
    mids = [m for m in t['mail'].replace('+', ' ').split() if m in K.MAIL]
    if not mids:
        schritt('Keine Mail: Vorgang direkt im Startpostkorb eröffnen')
        ende()
    for n, m in enumerate(mids):
        mm = K.MAIL[m]
        if t['weg'].startswith('B'):
            schritt('Standardmail %s einsteuern (liefert Vorgang und Datensatz)' % m)
        else:
            schritt('Testmail %s an das Abnahme-Postfach senden: %s' % (m, mm[1]))
        if n > 0 and stufe >= 3:
            punkt('Änderung gegenüber %s' % mids[0], mm[7])
            punkt('Vollmacht', ' · '.join(x for x in mm[6] if x not in K.MV_STANDARD))
            ende(); continue
        punkt('Absender', mm[2]); punkt('Betreff', mm[3])
        if stufe >= 5:
            punkt('Text', 'Standardtext mit Änderung: ' + mm[7] + ' (Wortlaut im Blatt „Mail-Vorlagen“)', GRAUD, True)
        elif stufe >= 4 and mm[4] == K.TEXT_MAKLER:
            punkt('Text', 'Standardtext Makler: Kunde mit Name, Anschrift, Geburtsdatum; Bitte um Übertragung der VNR; Agenturnummer; Signatur wie EMMA', GRAUD, True)
        else:
            punkt('Text', mm[4], GRAUD, True)
        punkt('Anhang', mm[5])
        if stufe >= 5:
            abw = [x for x in mm[6] if x not in K.MV_STANDARD]
            punkt('Vollmacht', 'wie Standard (Folie „Mail und Maklervollmacht“)' + ('; abweichend: ' + ' · '.join(abw) if abw else ''))
        elif stufe == 0:
            A.append(absatz([('Inhalt %s:' % ('des Betreuungswunsches' if 'Betreuungswunsch' in mm[5] else 'der Maklervollmacht'), True, None, False)], space=0))
            for x in mm[6]:
                punkt('', x)
        else:
            punkt('Inhalt %s' % ('des Betreuungswunsches' if 'Betreuungswunsch' in mm[5] else 'der Maklervollmacht'), ' · '.join(mm[6]))
        ende()
    if t.get('mail_extra'):
        A.append(absatz([('Besonderheit: ', True, ROT, False), (t['mail_extra'], False, None, False)], space=3))
    if t['weg_b'] or t['weg'].startswith('B'):
        wb = t['weg_b'] or ('Standardmail; im Datensatz setzen: ' + '; '.join('%s = %s' % (f, w) for _, f, w, h in t['dp_soll'] if h))
        schritt(('Vorgang bereitstellen (Weg B)' if t['gruppe'] == 'TE' else 'Datensatz setzen (Weg B)') if t['weg'].startswith('B') else 'Alternativ: Datensatz direkt setzen (Weg B)')
        punkt('', wb)
        ende()
    if t['hinweis']:
        A.append(absatz([('Hinweis: ', True, GRAUD, False), (t['hinweis'], False, GRAUD, False)], space=3))
    return A


def vorliegen_passend(t, w, h, mindest=6.5):
    for st in range(7):
        A = vorliegen(t, st)
        if hoehe_spalte(A, w, mindest) <= h:
            return A, st
    return A, st


def deckblatt(slide, t, x, y, w, hmax):
    colw = [1.78, w - 1.78]
    rows = [['Feld im KI-Deckblatt', 'Soll-Wert']]
    fills = [None]
    gruppe = None; band = False
    for g, f, wert, hv in t['dp_soll']:
        if g != gruppe:
            gruppe = g; band = not band
        rows.append([[[(f, hv)]], [[(wert, hv)]]])
        fills.append(ROTL if hv else (GRAUL if band else WEISS))
    for size in (6.5, 6.2, 6, 5.8, 5.5, 5.2):
        hs = [0.22] + [max(size * 1.2 / 72 + 0.035, hoehe([f, wert], colw, size) - 0.035) for _, f, wert, _ in t['dp_soll']]
        if sum(hs) <= hmax: break
    tabelle(slide, x, y, colw, rows, hs, size=size, head_size=7, header_fill=TEALD, fills=fills, mv=0.012)
    return sum(hs)


def ablauf_akzeptanz(t):
    A = [absatz([('Erwarteter Ablauf', True, TEALD, False)], kopf=True, space=2)]
    for kap, txt, st in t['ablauf']:
        A.append(absatz([('■ ', True, STATF[st], False), (kap + ': ', True, None, False), (txt, False, GRAUM if st == 'aus' else None, False)], space=1))
    A[-1]['space'] = 6
    A.append(absatz([('Akzeptanzkriterien', True, TEALD, False)], kopf=True, space=2))
    for i, a in enumerate(t['akzeptanz']):
        A.append(absatz([(a, False, None, False)], nummer_=str(i + 1), space=1.5))
    return A


def onepager(t):
    g = t['gruppe']
    s = neue_folie('Only Title', '%s · %s' % (t['id'], t['titel']), 'TESTFALL %s | %s' % (kid(t['id']), GNAME[g].upper()), tsize=18)
    # Kopfband: Ziel und Ergebnis
    befund = bool(t['be'] or t['pn']) or any(st == 'be' for _, _, st in t['ablauf'])
    rect(s, 0.56, 1.42, 8.6, 0.72, GRAUL, None)
    spalte(s, 0.66, 1.46, 8.4, 0.66, [
        absatz([('Ziel  ', True, TEALD, False), (t['ziel_text'], False, None, False)], space=2),
        absatz([('Erwartetes Ergebnis  ', True, ROT if befund else TEALD, False), (t['ergebnis'], True, None, False)])], groessen=(8, 7.5, 7, 6.5))
    chip(s, 9.3, 1.42, 1.1, 'Prio', t['prio'], PRIOF[t['prio']])
    chip(s, 10.47, 1.42, 1.1, 'Weg', t['weg'].split(' ')[0] if len(t['weg']) > 8 else t['weg'], GRAUD)
    chip(s, 11.64, 1.42, 1.13, 'Sparte', t['sparte'], GRAUD)
    rect(s, 9.3, 1.73, 3.47, 0.41, WEISS, GRAUM, lw=0.5)
    text(s, 9.37, 1.75, 3.35, 0.38, [[('PDD-Kapitel  ', True), (t['kapitel'], False)], [('Weg  ', True), ({'A': 'A: Datensatz über Testmail (Celonis)', 'B': 'B: Datensatz direkt gesetzt'}.get(t['weg'], t['weg']), False)]],
         size=6.5, color=GRAUD, space_after=0)
    # Spalten
    Y0, H = 2.25, 4.08
    rect(s, 0.56, Y0, 3.9, H + 0.02, ROTT, None)
    kopfzeile(s, 0.56, Y0, 3.9, 'Das muss vorliegen', ROT)
    A_, st_ = vorliegen_passend(t, 3.7, H - 0.4)
    STUFEN[t['id']] = st_
    spalte(s, 0.66, Y0 + 0.33, 3.7, H - 0.4, A_)
    kopfzeile(s, 4.58, Y0, 4.12, 'Eingabe: Datensatz im Datenpool (KI-Deckblatt)', TEALD)
    if t['id'] == 'TF-TE-01':
        rect(s, 4.58, Y0 + 0.3, 4.12, 1.0, GRAUL, None)
        text(s, 4.68, Y0 + 0.38, 3.92, 0.85, ['Kein Datensatz im Datenpool.', 'Zur Vorgang-Lfd-Nr des Postkorbvorgangs existiert kein KI-Deckblatt; '
             'der Bot darf deshalb kein Feld lesen und keinen Hostzugriff ausführen.'], size=7.5, color=SW, space_after=3)
        hd = 0.94
    else:
        hd = deckblatt(s, t, 4.58, Y0 + 0.3, 4.12, H - 0.52)
    text(s, 4.58, Y0 + 0.36 + hd, 4.12, 0.18, 'rot = weicht vom Standard ab und macht den Testfall aus; im Weg B genau so setzen', size=6, color=GRAU, italic=True)
    rect(s, 8.82, Y0, 3.95, H + 0.02, TEALT, None)
    kopfzeile(s, 8.82, Y0, 3.95, 'Erwarteter Ablauf und Akzeptanzkriterien', TEALD)
    spalte(s, 8.92, Y0 + 0.33, 3.75, H - 0.38, ablauf_akzeptanz(t))
    # Durchfuehrung
    mids = [m for m in t['mail'].replace('+', ' ').split() if m in K.MAIL]
    mtxt = ('Mail ' + ' + '.join(mids)) if mids else 'Vorgang eröffnen'
    if t['id'] in SCHRITT2:
        s2 = SCHRITT2[t['id']]
    elif t['weg'].startswith('B'):
        s2 = 'Weg B: Datensatz anpassen'
    elif 'B' in t['weg']:
        s2 = mtxt + ' senden (oder Weg B)'
    else:
        s2 = mtxt + ' senden'
    ag = '' if t['agentur'] == 'keine' else ' + ' + t['agentur']
    schr = ['Testdaten ' + t['vnr'].replace('+', ', ') + ag, s2, 'Datensatz prüfen (Vorbedingung)', 'Bot-Lauf, Vorgang-Lfd-Nr notieren', 'Akzeptanz prüfen, Nachweis ablegen']
    for i, x in enumerate(schr):
        c_ = chevron(s, 0.56 + i * 2.44, 6.47, 2.46, 0.36, i + 1, x, ROTL if i < 2 else TEALL, first=(i == 0))
        c_.text_frame.word_wrap = True
        for r in c_.text_frame.paragraphs[0].runs: r.font.size = Pt(7.5)
    return s


STUFEN = {}
SCHRITT2 = {'TF-TE-01': 'Vorgang ohne Datensatz eröffnen', 'TF-TE-02': 'Vorgang erneut einsteuern', 'TF-TE-03': 'Fehlermaske provozieren (Robotics)'}
for t in K.TESTFAELLE:
    onepager(t)
print('Detailstufen Spalte 1:', {k: v for k, v in STUFEN.items() if v})

# ================================================================== Abnahme
s = neue_folie('Only Title', 'Abnahme: alle Muss-Testfälle bestanden, keine Durchrutscher, jede BE und jede Prüfnotiz nachgewiesen (Vorschlag zur Abstimmung)',
               'TESTFÄLLE | ABNAHMEKRITERIEN', tsize=16)
rows = [['Kriterium', 'Anforderung']] + [[k, v] for k, v in K.ABNAHME]
tabelle(s, 0.56, 1.5, [1.45, 5.75], rows, [0.3] + [max(0.34, hoehe([k, v], [1.45, 5.75], 7)) for k, v in K.ABNAHME], size=7)
rows = [['Fehlerklasse', 'Beispiele', 'Wirkung']] + [list(x) for x in K.FEHLERKLASSEN]
tabelle(s, 7.95, 1.5, [0.95, 2.6, 1.27], rows, [0.3] + [max(0.4, hoehe(x, [0.95, 2.6, 1.27], 7)) for x in K.FEHLERKLASSEN], size=7, header_fill=TEALD)
text(s, 7.95, 4.35, 4.8, 0.25, 'Durchführung', size=9, bold=True, color=TEALD)
for i, (k, v) in enumerate(K.DURCHFUEHRUNG):
    nummer(s, 7.95, 4.68 + i * 0.7, i + 1, TEALD)
    text(s, 8.32, 4.66 + i * 0.7, 4.45, 0.25, k, size=8, bold=True, color=SW)
    text(s, 8.32, 4.88 + i * 0.7, 4.45, 0.45, v, size=7, color=GRAUD)

def _finde(kick):
    for i, sl in enumerate(prs.slides):
        for ph in sl.placeholders:
            if ph.placeholder_format.idx == 12 and ph.text_frame.text.startswith(kick):
                return i + 1
    return None
def _kick(sl):
    for ph in sl.placeholders:
        if ph.placeholder_format.idx == 12:
            return ph.text_frame.text
    return ''
RANG = [('EINLEITUNG', 0), ('HERLEITUNG', 1), ('TESTSCHEMA', 2), ('TESTDATEN', 3), ('TESTFÄLLE | ÜBERBLICK', 4), ('TESTFÄLLE | ABDECKUNG', 4),
        ('TESTFALL ', 5), ('TESTFÄLLE | ABNAHME', 6)]
def _rang(sl):
    k_ = _kick(sl)
    return next((r for p_, r in RANG if k_.startswith(p_)), 9)
_ids = list(prs.slides._sldIdLst)
_sl = list(prs.slides)
def _schluessel(i, sl):
    if sl.slide_id in SONDER:
        return SONDER[sl.slide_id] + (i,)
    return (_rang(sl), 1, i)
_neu = [_ids[0]] + [x for _, x in sorted((_schluessel(i, sl), _ids[i]) for i, sl in enumerate(_sl) if i > 0)]
for x in _ids: prs.slides._sldIdLst.remove(x)
for x in _neu: prs.slides._sldIdLst.append(x)
_trenner = sorted((SONDER[sl.slide_id][0], i + 1) for i, sl in enumerate(prs.slides) if sl.slide_id in SONDER and SONDER[sl.slide_id][0] > 0)
for ph_, (_, seite) in zip(AGENDA_SEITEN, _trenner):
    ph_.text_frame.paragraphs[0].runs[0].text = str(seite)
prs.save(OUT); print('ok', OUT, '| Folien:', len(prs.slides))
