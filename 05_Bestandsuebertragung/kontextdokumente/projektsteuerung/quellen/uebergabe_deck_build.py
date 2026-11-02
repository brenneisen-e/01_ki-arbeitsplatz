# -*- coding: utf-8 -*-
"""Übergabedeck „Makler BÜ meets KI“ im neuen Layout.

Grundlage ist das Originaldeck (uebergabe_vorlage.pptx): Master, Layouts, Titel, Kicker,
Logo und Titelfolie bleiben erhalten, alle übrigen Folieninhalte werden im festen Raster
neu gezeichnet (ERGO-Palette, keine Schatten, Status als Ringe, Gantt mit Heute-Linie).

Aufruf: python3 uebergabe_deck_build.py [ausgabe.pptx]
"""
import os, re, sys
from PIL import ImageFont
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.dml import MSO_LINE_DASH_STYLE
from pptx.oxml.ns import qn
from lxml import etree

HIER = os.path.dirname(os.path.abspath(__file__))
VORLAGE = os.path.join(HIER, 'uebergabe_vorlage.pptx')
AUS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HIER, '..', '20261016_Uebergabe_Makler_BUE_meets_KI.pptx')

# ---------------------------------------------------------------- Gestaltung
F = 'Arial'
def rgb(h): return RGBColor.from_string(h)
INK = rgb('1F1E1A')       # Fließtext
SEK = rgb('545241')       # ERGO Dunkelgrau
MUT = rgb('807E6F')       # gedämpft
HAAR = rgb('D9D5C7')      # Haarlinie
FEIN = rgb('ECE9E1')      # Wochenraster
FLAECHE = rgb('F6F4EF')   # Karten
SPUR = rgb('E6E2D8')      # Ringspur
TEAL = rgb('0E8496')      # Fortschritt, Balken
TEALL = rgb('CCEBED')
TEALD = rgb('0B6474')
ROT = rgb('BF1528')       # ERGO Rot, sparsam
WEISS = rgb('FFFFFF')

L, R = 0.56, 12.77
B = R - L
Y0 = 1.55
BOT = 6.92
HEUTE = 42 + 4 / 7        # Freitag, 16.10.2026
MONATE = [('Sep.', 36.0, 40 + 3 / 7), ('Okt.', 40 + 3 / 7, 44 + 6 / 7), ('Nov.', 44 + 6 / 7, 49 + 1 / 7), ('Dez.', 49 + 1 / 7, 53 + 4 / 7)]

# ---------------------------------------------------------------- Textmaß (Liberation Sans = Arial)
_fonts = {}
def font(size, bold=False):
    k = (round(size * 4), bold)
    if k not in _fonts:
        n = 'LiberationSans-Bold.ttf' if bold else 'LiberationSans-Regular.ttf'
        _fonts[k] = ImageFont.truetype('/usr/share/fonts/truetype/liberation/' + n, int(size * 40))
    return _fonts[k]

def breite(t, size, bold=False):
    return font(size, bold).getlength(t) / 40 / 72

NB = ' '
_SCHUTZ = [
    (r'\b(z|u|d)\. (B|a|h)\.', lambda m: m.group(1) + '.' + NB + m.group(2) + '.'),
    (r'\b(KW|Nr\.|Version|Stufe) (\d)', lambda m: m.group(1) + NB + m.group(2)),
    (r'(\d) (Business|Prüfnotizen|Datenpoolfeldern|Kapitel)\b', lambda m: m.group(1) + NB + m.group(2)),
    (r' (–|-|/|\|) ', lambda m: NB + m.group(1) + ' '),
    (r'\b(Jedes) (10\.)', lambda m: m.group(1) + NB + m.group(2)),
]
def schuetzen(t):
    for muster, f in _SCHUTZ:
        t = re.sub(muster, f, t)
    return t

def zeilen(t, size, w, bold=False):
    n = 0
    for absatz in schuetzen(t).split('\n'):
        n += 1
        z = ''
        for wort in absatz.replace('-', '- ').replace('- ', '-\u0001').replace('\u0001', ' ').split(' '):
            if not wort:
                continue
            probe = (z + ('' if z.endswith('-') else ' ') + wort).strip() if z else wort
            if breite(probe, size, bold) <= w * 0.97 or not z:
                z = probe
            else:
                n += 1
                z = wort
    return n

def hoehe(t, size, w, bold=False, ls=1.2):
    # Arial: Zeilenhöhe = 1,15 × Schriftgrad × Zeilenabstand
    return zeilen(t, size, w, bold) * size * ls * 1.15 / 72

# ---------------------------------------------------------------- Formen
def _ohne_stil(sh):
    st = sh._element.find(qn('p:style'))
    if st is not None:
        sh._element.remove(st)
    return sh

def form(s, x, y, w, h, fill=None, line=None, lw=0.75, shape=MSO_SHAPE.RECTANGLE, radius=None):
    sh = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    _ohne_stil(sh)
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line; sh.line.width = Pt(lw)
    if radius is not None and shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        sh.adjustments[0] = min(0.5, radius / min(w, h))
    if sh.has_text_frame:
        sh.text_frame.text = ''
    return sh

def linie(s, x1, y1, x2, y2, farbe=HAAR, lw=0.75, strich=None):
    c = s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    _ohne_stil(c)
    c.line.color.rgb = farbe; c.line.width = Pt(lw)
    if strich:
        c.line.dash_style = strich
    return c

def text(s, x, y, w, h, absaetze, size=10, color=INK, bold=False, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, space=0, ls=1.2, spc=None, caps=False):
    """absaetze: str | Liste aus str oder Liste von (text, bold, farbe)."""
    t = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = t.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    tf.auto_size = None
    if isinstance(absaetze, str):
        absaetze = [absaetze]
    for i, a in enumerate(absaetze):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(space)
        p.line_spacing = ls
        teile = a if isinstance(a, list) else [(a, bold, color)]
        for txt, b, c in teile:
            r = p.add_run(); r.text = schuetzen(txt.upper() if caps else txt)
            r.font.name = F; r.font.size = Pt(size); r.font.bold = b; r.font.color.rgb = c
            if spc:
                r._r.get_or_add_rPr().set('spc', str(spc))
    return t

def etikett(s, x, y, t, farbe=MUT, w=3.0, size=8):
    """Abschnittsmarke: Versalien, gesperrt."""
    text(s, x, y, w, 0.16, t, size=size, color=farbe, bold=True, spc=120, caps=True)

def haken(s, x, y, d, farbe=TEAL):
    """Gefüllter Kreis mit weißem Haken (erledigt)."""
    form(s, x, y, d, d, fill=farbe, shape=MSO_SHAPE.OVAL)
    E = Inches(1)
    fb = s.shapes.build_freeform(int((x + 0.27 * d) * E), int((y + 0.53 * d) * E), scale=1.0)
    fb.add_line_segments([(int((x + 0.44 * d) * E), int((y + 0.69 * d) * E)),
                          (int((x + 0.74 * d) * E), int((y + 0.34 * d) * E))], close=False)
    h = fb.convert_to_shape()
    _ohne_stil(h)
    h.fill.background(); h.line.color.rgb = WEISS; h.line.width = Pt(max(0.9, d * 9))
    ln = h.line._get_or_add_ln()
    ln.set('cap', 'rnd')
    ln.append(etree.SubElement(ln, qn('a:round')))

def offen(s, x, y, d, farbe=ROT):
    """Leerer Kreis (offen)."""
    form(s, x, y, d, d, fill=WEISS, line=farbe, lw=1.1, shape=MSO_SHAPE.OVAL)

def _av(sh, werte):
    av = sh._element.spPr.find(qn('a:prstGeom')).find(qn('a:avLst'))
    for k in list(av):
        av.remove(k)
    for n, v in werte:
        g = etree.SubElement(av, qn('a:gd')); g.set('name', n); g.set('fmla', 'val %d' % v)

def ring(s, x, y, d, grad, dicke=0.16):
    """Fortschrittsring: Spur + Bogen im Uhrzeigersinn ab 12 Uhr."""
    sp = form(s, x, y, d, d, fill=SPUR, shape=MSO_SHAPE.DONUT)
    _av(sp, [('adj', int(dicke * 100000))])
    if grad >= 357:
        v = form(s, x, y, d, d, fill=TEAL, shape=MSO_SHAPE.DONUT)
        _av(v, [('adj', int(dicke * 100000))])
    elif grad > 2:
        b = form(s, x, y, d, d, fill=TEAL, shape=MSO_SHAPE.BLOCK_ARC)
        _av(b, [('adj1', 16200000), ('adj2', int(((270 + grad) % 360) * 60000)), ('adj3', int(dicke * 100000))])

def stand(grad):
    if grad >= 350: return 'Abgeschlossen'
    if grad >= 300: return 'Weitgehend umgesetzt'
    if grad >= 150: return 'In Umsetzung'
    return 'Gestartet'

def initialen(n):
    teile = [t for t in re.split(r'[\s\-]+', n) if t and t[0].isupper()]
    return (teile[0][0] + teile[-1][0]) if len(teile) > 1 else teile[0][:2]

# ---------------------------------------------------------------- Bausteine
def zielbild(s, satz):
    """Leitsatz unter dem Titel; gibt die Unterkante zurück."""
    etikett(s, L, Y0 + 0.065, 'Zielbild', ROT)
    w = B - 1.05
    h = hoehe(satz, 13, w)
    text(s, L + 1.05, Y0, w, h, satz, size=13, color=INK)
    y = Y0 + max(h, 0.2) + 0.16
    linie(s, L, y, R, y, HAAR, 0.75)
    return y + 0.22

def punktliste(s, x, y, w, items, size=9.5, gap=0.06, d=0.13):
    """items: (text, erledigt). Gibt die neue y-Position zurück."""
    for t, ok in items:
        h = hoehe(t, size, w - d - 0.12)
        iy = y + size / 72 * 0.6 - d / 2
        (haken if ok else offen)(s, x, iy, d)
        text(s, x + d + 0.12, y, w - d - 0.12, h, t, size=size, color=INK)
        y += h + gap
    return y

def punktliste_hoehe(items, w, size=9.5, gap=0.06, d=0.13):
    return sum(hoehe(t, size, w - d - 0.12) + gap for t, _ in items)

def legende(s, x_rechts, y):
    w1 = breite('Erledigt', 8) + 0.2
    w2 = breite('Offen', 8) + 0.2
    x = x_rechts - w1 - w2 - 0.2
    haken(s, x, y + 0.01, 0.12); text(s, x + 0.18, y, w1, 0.16, 'Erledigt', size=8, color=SEK)
    x += w1 + 0.2
    offen(s, x, y + 0.01, 0.12); text(s, x + 0.18, y, w2, 0.16, 'Offen', size=8, color=SEK)

def personen(s, x, y, w, gruppen, d=0.27, schritt=0.33, ga=0.1):
    """gruppen: [(rolle, [namen])]; gibt Unterkante zurück."""
    for rolle, namen in gruppen:
        text(s, x, y, w, 0.15, rolle, size=8, color=MUT)
        y += 0.19
        for n in namen:
            form(s, x, y, d, d, fill=FLAECHE, line=HAAR, lw=0.5, shape=MSO_SHAPE.OVAL)
            text(s, x, y, d, d, initialen(n), size=6.5 if d < 0.25 else 7, color=SEK, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
            text(s, x + d + 0.1, y, w - d - 0.1, d, n, size=9.5, color=INK, anchor=MSO_ANCHOR.MIDDLE)
            y += schritt
        y += ga
    return y - ga - (schritt - d)

def personen_hoehe(gruppen, d=0.27):
    return sum(0.2 + len(n) * (d + 0.06) + 0.1 for _, n in gruppen) - 0.1

def lieferungen(s, x, y, w, namen, h=0.34, gap=0.09):
    for n in namen:
        form(s, x, y, w, h, fill=WEISS, line=HAAR, lw=0.75, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.06)
        form(s, x + 0.14, y + h / 2 - 0.045, 0.09, 0.09, fill=TEAL, shape=MSO_SHAPE.OVAL)
        text(s, x + 0.32, y, w - 0.4, h, n, size=9.5, color=INK, bold=True, anchor=MSO_ANCHOR.MIDDLE)
        y += h + gap
    return y - gap

# ---------------------------------------------------------------- Gantt
BALKEN = {'haupt': (TEAL, WEISS), 'hell': (TEALL, TEALD), 'grau': (HAAR, SEK)}

def gantt(s, x, y, w, von, bis, zeilen_, lab=1.35, kopf=0.42):
    """zeilen_: [(bezeichnung, [elemente])]; Elemente:
       ('b', a, e, text, stil) Balken, ('m', pos, text, 'r'|'u') Meilenstein,
       ('w', a, e, text) Wochenrhythmus (Balken mit Montagsmarken, Text darunter)."""
    gx, gw = x + lab, w - lab
    wk = gw / (bis - von)
    X = lambda kw: gx + (kw - von) * wk
    # Zeilenhöhen
    hz = []
    for _, el in zeilen_:
        unten = any((e[0] == 'm' and e[3] == 'u') or e[0] == 'w' for e in el)
        hz.append(0.5 if unten else 0.36)
    gh = sum(hz)
    # Kopf: Monate, KW
    for name, a, e in MONATE:
        a2, e2 = max(a, von), min(e, bis)
        if e2 - a2 <= 0:
            continue
        if a > von:
            linie(s, X(a), y, X(a), y + kopf + gh, HAAR, 0.75)
        if (e2 - a2) * wk > 0.45:
            text(s, X(a2) + 0.06, y, (e2 - a2) * wk - 0.08, 0.18, name, size=9, color=INK, bold=True)
    etikett(s, x, y + 0.01, 'Zeitplan', w=lab)
    text(s, x, y + 0.22, lab - 0.1, 0.16, 'KW', size=8, color=MUT)
    for kw in range(int(von), int(bis)):
        cx = X(kw + 0.5)
        if kw == int(HEUTE):
            form(s, cx - 0.17, y + 0.195, 0.34, 0.2, fill=ROT, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1)
            text(s, cx - 0.2, y + 0.195, 0.4, 0.2, str(kw), size=8, color=WEISS, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        else:
            text(s, cx - 0.2, y + 0.22, 0.4, 0.16, str(kw), size=8, color=MUT, align=PP_ALIGN.CENTER)
        if kw > von:
            linie(s, X(kw), y + kopf, X(kw), y + kopf + gh, FEIN, 0.5)
    linie(s, x, y + kopf, x + w, y + kopf, SEK, 0.75)
    # Heute-Linie
    if von < HEUTE < bis:
        linie(s, X(HEUTE), y + kopf - 0.04, X(HEUTE), y + kopf + gh, ROT, 1.0, MSO_LINE_DASH_STYLE.DASH)
    # Zeilen
    yy = y + kopf
    for (name, el), h in zip(zeilen_, hz):
        bh = 0.19
        by = yy + (0.08 if h > 0.4 else (h - bh) / 2)
        text(s, x, by, lab - 0.12, bh, name, size=9, color=INK, anchor=MSO_ANCHOR.MIDDLE)
        for e in el:
            if e[0] == 'b':
                _, a, b_, t, stil = e
                fill, tc = BALKEN[stil]
                form(s, X(a), by, (b_ - a) * wk, bh, fill=fill, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05)
                if t:
                    tw = breite(t, 8, True)
                    if tw + 0.16 <= (b_ - a) * wk:
                        text(s, X(a) + 0.08, by, (b_ - a) * wk - 0.1, bh, t, size=8, color=tc, bold=True, anchor=MSO_ANCHOR.MIDDLE)
                    else:
                        text(s, X(b_) + 0.08, by, max(tw + 0.1, 0.5), bh, t, size=8, color=SEK, bold=True, anchor=MSO_ANCHOR.MIDDLE)
            elif e[0] == 'w':
                _, a, b_, t = e
                form(s, X(a), by, (b_ - a) * wk, bh, fill=TEALL, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05)
                for kw in range(int(a), int(b_) + 1):
                    if a <= kw < b_:
                        form(s, X(kw + 0.5) - 0.05, by + bh / 2 - 0.05, 0.1, 0.1, fill=TEAL, shape=MSO_SHAPE.DIAMOND)
                text(s, X(a), by + bh + 0.04, (b_ - a) * wk, 0.16, t, size=7.5, color=SEK)
            elif e[0] == 'm':
                _, p, t, wo = e
                d = 0.17
                form(s, X(p) - d / 2, by + bh / 2 - d / 2, d, d, fill=INK, line=WEISS, lw=0.75, shape=MSO_SHAPE.DIAMOND)
                if wo == 'r':
                    text(s, X(p) + 0.13, by, breite(t, 8, True) + 0.1, bh, t, size=8, color=INK, bold=True, anchor=MSO_ANCHOR.MIDDLE)
                else:
                    text(s, X(p) - 0.6, by + bh + 0.04, 1.8, 0.16, t, size=7.5, color=INK, bold=True)
        yy += h
        linie(s, x, yy, x + w, yy, HAAR, 0.5)
    return y + kopf + gh

def gantt_hoehe(zeilen_, kopf=0.42):
    return kopf + sum(0.5 if any((e[0] == 'm' and e[3] == 'u') or e[0] == 'w' for e in el) else 0.36 for _, el in zeilen_)

# ---------------------------------------------------------------- Folienrahmen
prs = Presentation(VORLAGE)

def leeren(s, kicker=None):
    for sh in list(s.shapes):
        if sh.is_placeholder and sh.placeholder_format.idx in (0, 12):
            continue
        sh._element.getparent().remove(sh._element)
    xml = etree.tostring(s._element).decode()
    for rId in list(s.part.rels):
        rel = s.part.rels[rId]
        if 'slideLayout' in rel.reltype or 'notesSlide' in rel.reltype:
            continue
        if ('"%s"' % rId) not in xml:
            s.part.drop_rel(rId)
    if kicker:
        for sh in s.placeholders:
            if sh.placeholder_format.idx == 12:
                r = sh.text_frame.paragraphs[0].runs
                r[0].text = kicker
                for x in r[1:]:
                    x._r.getparent().remove(x._r)

K = 'MAKLER BÜ MEETS KI  |  '
S = prs.slides

def warnung(nr, y):
    if y > BOT + 0.01:
        print('WARNUNG Folie %d: Unterkante %.2f > %.2f' % (nr, y, BOT))

# ================================================================ Folie 2: Zielprozess
s = S[1]; leeren(s, K + 'AKTUELLER STAND DES PROZESSES')
y = zielbild(s, 'Celonis strukturiert die eingegangenen Mails inklusive Anhängen, der Prüfbot setzt die PDD-Logik sauber um und prüft alle Vorgänge.')
SCHRITTE = [
    ('Original-Mail und Anhänge', 'Eingang im Gruppenpostfach', 'ok', 'mail'),
    ('Interpretation und Extraktion', 'aller relevanten Daten aus Mail und Anhängen', 'opt', 'celonis'),
    ('KI-Deckblatt', 'Strukturierte Zusammenfassung je Vorgang', 'ok', 'deckblatt'),
    ('EMWS-Schnittstelle', 'Technische Übergabe als Postkorbvorgang', 'ok', 'emws'),
    ('Postkorbvorgang je VNR', 'Mit Deckblatt und Datenpoolwerten', 'ok', 'postkorb'),
    ('Prüfbot', 'Prüft jeden Vorgang nach der PDD-Logik', 'lauf', 'blueprism'),
]
BILD = os.path.join(HIER, 'bilder')

def bild(s, datei, x, y, w, h, crop=None, rahmen=True):
    pic = s.shapes.add_picture(os.path.join(BILD, datei), Inches(x), Inches(y), Inches(w), Inches(h))
    if crop:
        pic.crop_left, pic.crop_top, pic.crop_right, pic.crop_bottom = crop
    if rahmen:
        pic.line.color.rgb = HAAR; pic.line.width = Pt(0.75)
    return pic

def postfach(s, cx, cy, g, farbe=TEAL):
    """Lucide-artiges Posteingangssymbol, Kantenlänge g (Raster 24)."""
    E = Inches(1)
    P = lambda px, py: (int((cx - g / 2 + px / 24 * g) * E), int((cy - g / 2 + py / 24 * g) * E))
    for punkte, zu in [([(2, 12), (5.45, 5.1), (18.55, 5.1), (22, 12), (22, 18), (20, 20), (4, 20), (2, 18)], True),
                       ([(2, 12), (8, 12), (10, 15), (14, 15), (16, 12), (22, 12)], False)]:
        fb = s.shapes.build_freeform(*P(*punkte[0]), scale=1.0)
        fb.add_line_segments([P(*q) for q in punkte[1:]], close=zu)
        f = fb.convert_to_shape(); _ohne_stil(f)
        f.fill.background(); f.line.color.rgb = farbe; f.line.width = Pt(2)
        ln = f.line._get_or_add_ln(); ln.set('cap', 'rnd'); etree.SubElement(ln, qn('a:round'))

def kachel(s, cx, cy, w, h):
    form(s, cx - w / 2, cy - h / 2, w, h, fill=WEISS, line=HAAR, lw=0.75, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08)

AUSGANG_W = 2.05
spalte = (B - AUSGANG_W) / len(SCHRITTE)
d = 0.52
tw = spalte - 0.22
TS, US = 11, 9
th = max(hoehe(t, TS, tw, True, 1.1) for t, _, _, _ in SCHRITTE)
uh = max(hoehe(u, US, tw, ls=1.2) for _, u, _, _ in SCHRITTE)
vy, vh = y + 0.1, 1.12                      # Bildzeile
vw = spalte - 0.2
ky = vy + vh + 0.24
cy = ky + d / 2
linie(s, L + spalte / 2, cy, R - AUSGANG_W + 0.05, cy, HAAR, 1.25)
ty = ky + d + 0.16
uy = ty + th + 0.06
sy = uy + uh + 0.14
vm = vy + vh / 2
for i, (titel, unter, art, vis) in enumerate(SCHRITTE):
    cx = L + spalte * i + spalte / 2
    # Bild
    if vis == 'mail':
        mh = vh; mw = mh * 775 / 1108
        bild(s, 'maklervollmacht.png', cx + vw / 2 - mw, vy, mw, mh)
        ew = 1.1; eh = ew / (967 * (1 - 0.0189) / 630)
        bild(s, 'mail.png', cx - vw / 2, vy + vh - eh - 0.06, ew, eh, crop=(0.0189, 0, 0, 0))
    elif vis == 'deckblatt':
        dh = vh; dw = dh * 1600 * (1 - 0.507) / 1117
        bild(s, 'ki_deckblatt.png', cx - dw / 2, vy, dw, dh, crop=(0, 0, 0.507, 0))
    elif vis in ('celonis', 'blueprism', 'emws', 'postkorb'):
        kachel(s, cx, vm, vw, 0.9)
        if vis == 'celonis':
            lw_ = 1.05; bild(s, 'celonis.jpg', cx - lw_ / 2, vm - lw_ * 562 / 1248 / 2, lw_, lw_ * 562 / 1248, rahmen=False)
        elif vis == 'blueprism':
            lw_ = 1.1; bild(s, 'blueprism.png', cx - lw_ / 2, vm - lw_ / 4, lw_, lw_ / 2, rahmen=False)
        elif vis == 'emws':
            text(s, cx - vw / 2, vm - 0.24, vw, 0.3, 'EMWS', size=17, bold=True, color=TEAL, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
            text(s, cx - vw / 2, vm + 0.07, vw, 0.2, 'Schnittstelle', size=8.5, color=MUT, align=PP_ALIGN.CENTER)
        else:
            postfach(s, cx, vm, 0.52)
    # Knoten
    if art in ('ok', 'opt'):
        form(s, cx - d / 2, ky, d, d, fill=TEAL, shape=MSO_SHAPE.OVAL)
        nc = WEISS
    elif art == 'lauf':
        form(s, cx - d / 2, ky, d, d, fill=WEISS, line=TEAL, lw=2.0, shape=MSO_SHAPE.OVAL)
        nc = TEAL
    else:
        form(s, cx - d / 2, ky, d, d, fill=FLAECHE, line=HAAR, lw=1.0, shape=MSO_SHAPE.OVAL)
        nc = SEK
    text(s, cx - d / 2, ky, d, d, '%02d' % (i + 1), size=12, color=nc, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, cx - tw / 2, ty, tw, th, titel, size=TS, bold=True, color=INK, align=PP_ALIGN.CENTER, ls=1.1)
    text(s, cx - tw / 2, uy, tw, uh, unter, size=US, color=SEK, align=PP_ALIGN.CENTER)
    if art in ('ok', 'opt', 'lauf'):
        lab = 'In Umsetzung' if art == 'lauf' else 'Umgesetzt'
        ww = breite(lab, 8.5, True) + 0.44
        if art == 'opt':
            text(s, cx - tw / 2, sy + 0.33, tw, 0.18, 'in Optimierung', size=8.5, color=TEALD, align=PP_ALIGN.CENTER)
        if art != 'lauf':
            form(s, cx - ww / 2, sy, ww, 0.28, fill=TEALL, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.14)
            haken(s, cx - ww / 2 + 0.07, sy + 0.05, 0.18)
        else:
            form(s, cx - ww / 2, sy, ww, 0.28, fill=WEISS, line=TEAL, lw=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.14)
            ring(s, cx - ww / 2 + 0.07, sy + 0.05, 0.18, 180, 0.22)
        text(s, cx - ww / 2 + 0.3, sy, ww - 0.32, 0.28, lab, size=8.5, color=TEALD, bold=True, anchor=MSO_ANCHOR.MIDDLE)
# Ausgänge
ax = R - AUSGANG_W + 0.3
aw = AUSGANG_W - 0.3
for j, (t, fill, tc, ln) in enumerate([('Dunkelverarbeitung', TEAL, WEISS, None), ('BE: HITL / Manuell', WEISS, ROT, ROT)]):
    yy = cy - 0.5 + j * 0.62
    form(s, ax, yy, aw, 0.38, fill=fill, line=ln, lw=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.19)
    text(s, ax, yy, aw, 0.38, t, size=10, color=tc, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    linie(s, R - AUSGANG_W + 0.05, cy, ax, yy + 0.19, HAAR, 1.25)
text(s, ax, cy + 0.66, aw, 0.6, 'Glattfälle laufen dunkel durch, Business Exceptions gehen an die Sachbearbeitung.', size=9, color=SEK, align=PP_ALIGN.CENTER)
# Fokuswechsel: bis zum Postkorb bisher IT, jetzt Fach; ab dem Postkorb bisher Fach, jetzt IT.
# Farben: IT = Petrol dunkel, Fach = Petrol hell; Diagonale = Wechsel von „bisher“ zu „jetzt“.
fy = sy + 0.28 + 0.5
bh, rand = 0.7, 0.06
E = Inches(1)

def fokusband(x0, x1, it_links, links, rechts, kopf):
    xm = (x0 + x1) / 2
    sch = min(0.4, (x1 - x0) * 0.1)
    etikett(s, x0, fy - 0.27, kopf, MUT, w=x1 - x0)
    form(s, x0, fy, x1 - x0, bh, fill=TEALL)
    pkt = [(x0, fy), (x1, fy), (x1, fy + rand), (xm + sch, fy + rand), (xm - sch, fy + bh - rand), (x0, fy + bh - rand)]
    if not it_links:
        pkt = [(x0 + x1 - px, py) for px, py in pkt]
    fb = s.shapes.build_freeform(int(pkt[0][0] * E), int(pkt[0][1] * E), scale=1.0)
    fb.add_line_segments([(int(px * E), int(py * E)) for px, py in pkt[1:]], close=True)
    f = fb.convert_to_shape(); _ohne_stil(f)
    f.fill.solid(); f.fill.fore_color.rgb = TEAL; f.line.fill.background()
    for (wann, was), xa, xb, dunkel in [(links, x0 + 0.18, xm - sch - 0.05, it_links), (rechts, xm + sch + 0.12, x1 - 0.12, not it_links)]:
        t = text(s, xa, fy, xb - xa, bh, [[(wann, True, TEALL if dunkel else TEALD)], [(was, True, WEISS if dunkel else INK)]],
                 size=10.5, anchor=MSO_ANCHOR.MIDDLE, ls=1.05)
        r = t.text_frame.paragraphs[0].runs[0]; r.font.size = Pt(7.5); r._r.get_or_add_rPr().set('spc', '120')

grenze = L + spalte * 5
fokusband(L, grenze - 0.1, True, ('BISHER', 'Fokus IT'), ('JETZT', 'Fokus Fach: Qualität der Extraktion erhöhen'),
          'Bis zum Postkorb')
fokusband(grenze + 0.1, R, False, ('BISHER', 'Fokus Fach'), ('JETZT', 'Fokus IT'),
          'Ab dem Postkorb')
warnung(2, fy + bh)

# ================================================================ Folie 4: Arbeitsanweisungen
s = S[3]; leeren(s, K + 'ARBEITSANWEISUNGEN KI-DECKBLATT')
y = Y0 + 0.1
H4 = 4.55
# Ausgangslage
w1 = 3.65
form(s, L, y, w1, H4, fill=FLAECHE, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08)
etikett(s, L + 0.3, y + 0.32, 'Ausgangslage', ROT)
t = 'Arbeitsanweisungen müssen angepasst werden'
text(s, L + 0.3, y + 0.62, w1 - 0.6, hoehe(t, 18, w1 - 0.6, True), t, size=18, bold=True, color=INK, ls=1.1)
text(s, L + 0.3, y + 1.85, w1 - 0.6, 2.2,
     ['Das KI-Deckblatt ergänzt die Strukturierung der Eingangsmails.',
      'Die Arbeitsanweisungen müssen deshalb den Umgang mit den Deckblättern und deren Prüfung festlegen.'],
     size=11, color=SEK, space=8, ls=1.25)
# Zwei Stufen
xs = L + w1 + 0.45
ws = (R - xs - 0.55) / 2
STUFEN = [
    ('01', 'Einführung', 'Deckblätter stichprobenartig prüfen', 'Jedes 10. KI-Deckblatt im Detail gegen MV und Mail prüfen',
     'Die Stichprobe dient dazu, die Qualität der Deckblätter zu beurteilen. Alle Vorgänge durchlaufen in dieser Phase '
     'weiterhin die vollständige manuelle BÜ-Prüfung.',
     [(ROT, '1 von 10: Deckblatt zusätzlich im Detail geprüft'), (HAAR, 'Alle 10: vollständige manuelle Prüfung wie bisher')]),
    ('02', 'Zielbild', 'Deckblatt ersetzt die Sichtprüfung', 'Keine manuelle Prüfung von MV und Mail mehr',
     'Bei ausreichender Qualität ersetzt das KI-Deckblatt die manuelle Sichtprüfung der Maklervollmacht (MV) und der Mail. '
     'Die Sachbearbeitung arbeitet mit den Angaben des Deckblatts.',
     [(TEAL, 'Alle 10: Deckblatt statt Sichtprüfung von MV und Mail')]),
]
for i, (nr, phase, titel, kern, erl, raster) in enumerate(STUFEN):
    x = xs + i * (ws + 0.55)
    text(s, x, y + 0.12, 1.2, 0.7, nr, size=40, color=TEAL if i == 0 else INK, bold=True, ls=1.0)
    etikett(s, x + 1.15, y + 0.4, phase, MUT)
    linie(s, x, y + 0.95, x + ws, y + 0.95, HAAR, 0.75)
    th = hoehe(titel, 15, ws, True, 1.12)
    text(s, x, y + 1.15, ws, th, titel, size=15, bold=True, color=INK, ls=1.12)
    yy = y + 1.15 + th + 0.12
    kh = hoehe(kern, 11, ws, True)
    text(s, x, yy, ws, kh, kern, size=11, bold=True, color=TEALD)
    yy += kh + 0.12
    eh = hoehe(erl, 10.5, ws, ls=1.25)
    text(s, x, yy, ws, eh, erl, size=10.5, color=SEK, ls=1.25)
    # Prüfraster: je 10 Vorgänge
    py = y + H4 - 1.38
    etikett(s, x, py, 'Je 10 Vorgänge', MUT, w=ws)
    q = (ws - 9 * 0.08) / 10
    for k in range(10):
        fill = raster[0][0] if (k == 0 or len(raster) == 1) else raster[1][0]
        form(s, x + k * (q + 0.08), py + 0.28, q, q * 1.15, fill=fill, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.03)
    ly = py + 0.28 + q * 1.15 + 0.12
    for farbe, t2 in raster:
        form(s, x, ly + 0.035, 0.12, 0.12, fill=farbe, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.02)
        text(s, x + 0.2, ly, ws - 0.2, 0.2, t2, size=9, color=INK)
        ly += 0.24
# Pfeil zwischen den Stufen
mx = xs + ws + 0.275
pf = form(s, mx - 0.13, y + 2.05, 0.26, 0.3, fill=HAAR, shape=MSO_SHAPE.CHEVRON)
# Leiste darunter
yb = y + H4 + 0.32
linie(s, L, yb, R, yb, HAAR, 0.75)
text(s, L, yb + 0.14, B, 0.25,
     [[('Leitgedanke  ', True, INK), ('Die Stichprobe in der Einführung belegt die Qualität der KI-Deckblätter, danach ersetzt das Deckblatt die Sichtprüfung von MV und Mail.', False, SEK)]],
     size=10.5)
warnung(4, yb + 0.4)

# ================================================================ Statusfolien (3, 5, 6)
def statusfolie(nr, kicker, ziel, karten, gruppen, liefer, gz, von=42, bis=52, personen_rechts=False):
    s = S[nr - 1]; leeren(s, kicker)
    y = zielbild(s, ziel)
    etikett(s, L, y, 'Ergebnisse je Thema')
    legende(s, R, y)
    y += 0.27
    n = len(karten)
    spalten = n + (1 if personen_rechts else 0)
    gap = 0.18
    kw_ = (B - gap * (spalten - 1)) / spalten
    pad = 0.17
    iw = kw_ - 2 * pad
    ps = 8.5 if n > 3 else 9
    ts = 10.5 if n > 3 else 11
    kopf = 0.66
    kh = max(kopf + punktliste_hoehe(items, iw, ps) for _, _, items in karten) + pad
    for i, (titel, grad, items) in enumerate(karten):
        x = L + i * (kw_ + gap)
        form(s, x, y, kw_, kh, fill=FLAECHE, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.07)
        ring(s, x + pad, y + pad, 0.38, grad)
        text(s, x + pad + 0.5, y + pad - 0.01, iw - 0.5, 0.22, titel, size=ts, bold=True, color=INK)
        text(s, x + pad + 0.5, y + pad + 0.2, iw - 0.5, 0.18, stand(grad), size=8, color=TEALD if grad >= 300 else SEK)
        punktliste(s, x + pad, y + kopf, iw, items, size=ps)
    yb = y + kh + 0.2
    if personen_rechts:
        x = L + n * (kw_ + gap) + 0.1
        etikett(s, x, y, 'Ansprechpartner')
        yp = personen(s, x, y + 0.29, kw_ - 0.1, gruppen, d=0.22, schritt=0.26, ga=0.07)
        yb = max(yb, yp + 0.2)
        lw_ = 2.3
        etikett(s, L, yb, 'Deliverables')
        lieferungen(s, L, yb + 0.3, lw_, liefer)
        ye = gantt(s, L + lw_ + 0.45, yb, B - lw_ - 0.45, von, bis, gz)
    else:
        pw, lw_ = 2.25, 2.0
        etikett(s, L, yb, 'Ansprechpartner')
        yp = personen(s, L, yb + 0.29, pw, gruppen, d=0.22, schritt=0.26, ga=0.07)
        etikett(s, L + pw + 0.2, yb, 'Deliverables')
        lieferungen(s, L + pw + 0.2, yb + 0.3, lw_, liefer)
        gx = L + pw + 0.2 + lw_ + 0.45
        ye = gantt(s, gx, yb, R - gx, von, bis, gz)
        warnung(nr, yp)
    warnung(nr, ye)

P = True; O = False
statusfolie(3, K + 'ÜBERGABE  |  WORKSTREAM 1',
    'Sichere KI-Strukturierung der Eingangsmails und technische Übergabe als Postkorbvorgang mit Deckblatt und Datenpoolwerten.',
    [('KI-Deckblatt', 333, [('Feldstruktur und BUE_*-Mapping aufgebaut', P), ('Deckblatt v1.6 bereitgestellt', P),
                             ('Klassifikationslogik für BÜ aufgebaut', P), ('Governance für Änderungen definieren', O)]),
     ('Datenpool', 333, [('Datenpool als Übergabepunkt für Robotics definiert', P), ('36 Datenpoolfelder definiert und beantragt', P),
                         ('Vollständige Feldvalidierung in Abnahme und Zuordnung im Postkorb', O)]),
     ('EMWS-Schnittstelle', 161, [('EMWS als Zielweg definiert', P), ('Technische Machbarkeit sichergestellt – Vorgänge werden erstellt', P),
                                  ('Kontrolle der kompletten Verarbeitung nach dem SIT-Update (23.10.)', O)]),
     ('Extraktionslogik', 107, [('Aufbau von Mail- und Anhangverarbeitung', P), ('Einbindung der EMMA-Liste', P), ('Multi-Agenten-Ansatz', P),
                                ('Fortführende Verbesserung von Extraktion und Interpretation (Ausbaustufe 2)', O)]),
     ('Testing', 107, [('Produktive Testläufe mit QS-Dokumentation', P), ('Qualität des KI-Deckblatts', P),
                       ('Vollständige EMWS-E2E-Tests durchführen', O), ('Kontinuierliche QS des Multi-Agenten-Ansatzes', O)])],
    [('Celonis', ['Stefan Schwarz', 'Victor Thoma']), ('Eingangsmanagement', ['Markus Schumann']), ('EMWS', ['Jan-Steffen Holthusen'])],
    ['KI-Deckblatt', 'Datenpoolfelder', 'QS-Prüfmatrix'],
    [('Entwicklung', [('b', 42, 49 + 1 / 7, 'Umsetzung Ausbaustufe 2 (Celonis)', 'haupt'), ('m', 49 + 1 / 7, 'Finalisierung des Aufbaus', 'r')]),
     ('Arbeitsanweisung', [('b', HEUTE, 44 + 3 / 7, 'QS', 'hell'), ('m', 44 + 3 / 7, 'Austausch Makler / HS', 'u'),
                           ('b', 44 + 4 / 7, 49 + 2 / 7, 'KI-Deckblatt ersetzt Sichtprüfung MV / Mail', 'haupt')]),
     ('EMWS-SST', [('m', 43 + 1 / 14, 'Anbindung EMWS', 'r')]),
     ('Testing', [('b', 42, 49 + 1 / 7, 'Kontinuierliche Fach- und Lasttests', 'grau')])])

statusfolie(5, K + 'ÜBERGABE  |  WORKSTREAM 2',
    'Übersetzung der fachlichen BÜ-Regeln in einen wartbaren Prüfbot mit klaren Prozesswegen, Business Exceptions und Betriebslogik.',
    [('PDD', 333, [('PDDs für KV und Komposit / Leben erstellt', P), ('Prüfschritte, Hostsysteme und Ergebniswege beschrieben', P),
                   ('14 Business Exceptions definiert', P), ('Finaler Versionsschnitt und fachliche Abnahme', O)]),
     ('Testing', 107, [('Testkonzept sowie technische Teststrecke definiert', P), ('BEs, Prüfnotizen und Glattfälle in Testfälle überführt', P),
                       ('Testfall-Excel mit Mailgenerator erstellt', P), ('Heraussuchen der Produktiv-VNR', O)]),
     ('Umsetzung', 107, [('Blue-Prism-Zielprozess und technische Prüfstrecke beschrieben', P), ('PDD-Stand für Entwicklungsstart ausreichend', P),
                         ('Vollständige technische Funktionalität der EMWS-Schnittstelle', O)])],
    [('PDD', ['Dirk Amend', 'Christoph Reber-Lucht']), ('Prüfbot / Robotics', ['Tanja Juraschek', 'Fabian Urs Stolz']), ('Testing', ['Pauline Fey'])],
    ['PDD KV', 'PDD Komposit / Leben', 'Prüfbot Testing'],
    [('Entwicklung', [('b', 44, 51, 'Umsetzung Prüfbots', 'haupt'), ('m', 51, 'Go-Live', 'r')]),
     ('Testing', [('b', 43, 51, 'Verträge in Produktion heraussuchen und Testing bis Go-Live', 'grau')])],
    personen_rechts=True)

statusfolie(6, K + 'ÜBERGABE  |  WORKSTREAM 3',
    'Verlässliche operative Steuerung von Rückständen, Eingängen und Abgängen sowie Übergang zu einem stabilen, regelmäßig betriebenen Reportingprozess.',
    [('Datenverfügbarkeit', 360, [('Rohdatenzugriff auf MIS-O-Einzeldaten hergestellt', P), ('OPAG- und Verbunddaten eingebunden', P),
                                  ('Tägliches Reporting für Ein- und Ausgänge', P), ('Altersstruktur der Vorgänge verfügbar', P)]),
     ('Reporting-Tool', 359, [('Excel-Reporting für Rückstände, Eingänge und Ausgänge für HS und Makler aufgebaut', P),
                              ('OPAG/Verbund, Altersstruktur, Ein- und Ausgänge in einem Reporting-Dashboard', P),
                              ('Integration in bestehendes HS-Dashboard', P)]),
     ('Ausblick Celonis', 107, [('Celonis als langfristiges E2E-Reporting-Zielbild', P), ('SharePoint als Datenübergabe vorbereitet', P),
                                ('Automatisierter Rohdatenupload', P), ('Architektur und Datenquellen finalisieren', O)])],
    [('HS', ['Dirk Amend']), ('Makler', ['Kiya Wolfgang Staudt', 'Nuria Garcia-Fernandez'])],
    ['Reporting HS', 'Reporting Makler', 'Bedienungsanleitung'],
    [('Reporting HS | Makler', [('w', 43, 52, 'Wöchentliches Reporting, immer montags')]),
     ('Entwicklung', [('b', 40, 43, 'Aufbau Excel', 'hell'), ('m', 43, 'Fertige Reportingtools für HS / Makler', 'r')]),
     ('Celonis-Entwicklung', [('b', 40, 44 + 6 / 7, 'Konzeption', 'hell'), ('b', 45, 49 + 1 / 7, 'Aufbau und Datenanbindung', 'haupt')])],
    von=40, personen_rechts=True)

# ================================================================ Detailfolien (7, 9, 10, 11)
def detailfolie(nr, kicker, ziel, erreicht, offen_, gruppen, liefer, gz, offen_kapitel=False, von=42, bis=52):
    s = S[nr - 1]; leeren(s, kicker)
    y = zielbild(s, ziel)
    pw = 2.45
    gap = 0.45
    cw = (B - pw - 2 * gap) / 2
    x1, x2, x3 = L, L + cw + gap, L + 2 * (cw + gap)
    etikett(s, x1, y, 'Erreichte Schwerpunkte  ·  %d' % len(erreicht))
    etikett(s, x2, y, ('Offene Punkte nach Kapitel  ·  %d' if offen_kapitel else 'Offene Punkte  ·  %d') % len(offen_))
    etikett(s, x3, y, 'Ansprechpartner')
    y += 0.32
    size = 9.5 if offen_kapitel else 10
    y1 = punktliste(s, x1, y, cw, [(t, True) for t in erreicht], size=size, gap=0.09)
    if offen_kapitel:
        yy = y
        for i, (k, t) in enumerate(offen_):
            text(s, x2, yy, 0.35, 0.2, '%02d' % (i + 1), size=10, bold=True, color=ROT)
            text(s, x2 + 0.42, yy, cw - 0.42, 0.2, k, size=10, bold=True, color=INK)
            h = hoehe(t, 9, cw - 0.42)
            text(s, x2 + 0.42, yy + 0.21, cw - 0.42, h, t, size=9, color=SEK)
            yy += 0.21 + h + 0.12
        y2 = yy - 0.12
    else:
        y2 = punktliste(s, x2, y, cw, [(t, False) for t in offen_], size=size, gap=0.09)
    y3 = personen(s, x3, y, pw, gruppen)
    linie(s, x2 - gap / 2, y - 0.3, x2 - gap / 2, max(y1, y2, y3) - 0.05, HAAR, 0.5)
    linie(s, x3 - gap / 2, y - 0.3, x3 - gap / 2, max(y1, y2, y3) - 0.05, HAAR, 0.5)
    yb = max(y1, y2, y3) + 0.22
    gh = gantt_hoehe(gz)
    yb = max(yb, BOT - gh - 0.0)
    linie(s, L, yb - 0.2, R, yb - 0.2, HAAR, 0.75) if yb - 0.2 > max(y1, y2, y3) + 0.05 else None
    lw_ = 2.3
    etikett(s, L, yb, 'Deliverables')
    lieferungen(s, L, yb + 0.3, lw_, liefer)
    ye = gantt(s, L + lw_ + 0.45, yb, B - lw_ - 0.45, von, bis, gz)
    warnung(nr, ye)

detailfolie(7, K + 'ÜBERGABE  |  WORKSTREAM 4',
    'Konsolidierte Single Source of Truth für Zielprozess, Architektur, Kontrollen, Governance, Testing, Betrieb und spätere Changes.',
    ['Advisory-Anforderungen in fünf Kapitel strukturiert',
     'End-to-End-Prozess und Lösungsarchitektur aus Celonis, EMWS und Bots beschrieben',
     'Prüfbot und HITL als zentrale Kontrollkomponenten dargestellt',
     'BÜ-Regelkatalog, KI-Deckblatt, Datenpool und PDDs eingeordnet',
     'BEs, Test-, Stichproben- und Eskalationsmodell als Arbeitsstand entwickelt'],
    [('Kontrollkonzept und Human in the Loop', 'Kontrollen sauber definieren, Stichprobenquoten, Reduktionskriterien und Eskalationslogik finalisieren'),
     ('Prüfkatalog und Data Governance', 'Zulieferung der finalen Extraktions- und Interpretationslogik von Celonis, Definition der Verantwortlichkeiten (RACI-Matrix)'),
     ('Business-Exception-Steuerung', 'Owner, SLA und Eskalation für die BE-Steuerung festlegen, Lieferung der Celonis-Testverfahren aus früheren Projekten (Best Practices)'),
     ('KPI-Reporting', 'Komplettes KPI-Reporting des Prüfbots von Robotics zuliefern lassen, Prozessreporting von Celonis einbauen')],
    [('Fachliche PO', ['Dirk Amend (HS)', 'Christoph Reber-Lucht (Makler)', 'Nuria Garcia-Fernandez (Makler)']), ('Celonis', ['Stefan Schwarz', 'Victor Thoma'])],
    ['Aktuelle Version Fachkonzept'],
    [('Entwicklung', [('b', 43 + 2 / 7, 49 + 2 / 7, 'Finalisierung und Übergabe an Revision', 'haupt'), ('m', 49 + 2 / 7, 'Übergabe', 'r')])],
    offen_kapitel=True)

detailfolie(9, K + 'ÜBERGABE  |  WORKSTREAM 1',
    'Sichere KI-Strukturierung der Eingangsmails und technische Übergabe als Postkorbvorgang mit Deckblatt und Datenpoolwerten.',
    ['KI-Deckblatt und BUE_*-Feldmodell fachlich vorbereitet', 'Multi-Agenten-Ansatz und Gruppenpostfach etabliert',
     'Datenpoolfelder und EMWS-Zielweg spezifiziert', 'Erste produktionsnahe Last- und Qualitätstests durchgeführt'],
    ['Funktionalität der EMWS-SST finalisieren und sicherstellen', 'Datenpoolwerte und Dokumentübertragung verifizieren',
     'Extraktions- und Interpretationslogik der Ausbaustufe 2 kontinuierlich verbessern', 'Action Flow, Prompts und Agentenarchitektur dokumentieren'],
    [('Celonis', ['Stefan Schwarz', 'Victor Thoma']), ('Eingangsmanagement', ['Markus Schumann']), ('EMWS', ['Jan-Steffen Holthusen'])],
    ['KI-Deckblatt', 'Datenpoolfelder', 'Prüf- / QS-Matrix'],
    [('Entwicklung', [('b', 42, 49 + 1 / 7, 'Umsetzung Ausbaustufe 2 (Celonis)', 'haupt'), ('m', 49 + 1 / 7, 'Finalisierung des Aufbaus', 'r')]),
     ('Arbeitsanweisung', [('b', 43, 44 + 3 / 7, 'QS', 'hell'), ('m', 44 + 3 / 7, 'Austausch Makler / HS', 'u'),
                           ('b', 44 + 4 / 7, 46 + 6 / 7, 'KI-Deckblatt ersetzt Sichtprüfung MV / Mail', 'haupt')]),
     ('EMWS-SST', [('m', 43 + 1 / 14, 'Anbindung EMWS', 'r')]),
     ('Testing', [('b', 43, 49 + 1 / 7, 'Kontinuierliche Fach- und Lasttests', 'grau')])])

detailfolie(10, K + 'ÜBERGABE  |  WORKSTREAM 2',
    'Übersetzung der fachlichen BÜ-Regeln in einen wartbaren Prüfbot mit klaren Prozesswegen, Business Exceptions und Betriebslogik.',
    ['PDDs für KV und Komposit / Leben weitgehend aufgebaut', '14 Business Exceptions und 7 Prüfnotizen strukturiert',
     'Prüfschritte, Datenquellen und Routinglogik beschrieben', 'Übergabe positiver Fälle an bestehende BÜ-Bots konzipiert',
     'Testkonzept aufbereitet'],
    ['Finalen Versionsschnitt und fachliche Abnahme herstellen', 'Screenshots, Prozessstart/-ende und Notizerstellung vervollständigen',
     'KV-, Komposit- und Leben-Logik final konsistent halten', 'Handlungsleitfaden für manuelle BE-Bearbeitung ableiten',
     'Testing-Excel vollständig befüllen', 'Alle Einzeltests durchführen und dokumentieren'],
    [('PDD', ['Dirk Amend', 'Christoph Reber-Lucht']), ('Prüfbot / Robotics', ['Tanja Juraschek', 'Fabian Urs Stolz']), ('Testing', ['Pauline Fey'])],
    ['PDD KV', 'PDD Komposit / Leben', 'Prüfbot Testing'],
    [('Entwicklung', [('b', 44, 51, 'Umsetzung Prüfbots', 'haupt'), ('m', 51, 'Go-Live', 'r')]),
     ('Testing', [('b', 43, 51, 'Verträge in Produktion heraussuchen und Testing bis Go-Live', 'grau')])])

detailfolie(11, K + 'ÜBERGABE  |  WORKSTREAM 3',
    'Verlässliche operative Steuerung von Rückständen, Eingängen und Abgängen sowie Übergang zu einem stabilen, regelmäßig betriebenen Reportingprozess.',
    ['Excel-Zwischenreporting für Rückstand, Ein- und Abgänge aufgebaut', 'OPAG-/Verbundsicht, Alter und SLA-Konfiguration vorgesehen',
     'Tägliche Rohdatenlogik für Bestandsvergleiche etabliert', 'Übergabe und Dashboard-Integration begonnen'],
    ['Abweichung zwischen Verbund und MIS-O abschließend erklären', 'Tägliche Datenbeladung, Vertretung und Montagsversand festlegen',
     'Gemeinsamen SharePoint und Berechtigungen finalisieren', 'Masterdatei, Bedienung und Abgrenzungslogik versioniert dokumentieren'],
    [('HS', ['Dirk Amend']), ('Makler', ['Kiya Wolfgang Staudt', 'Nuria Garcia-Fernandez'])],
    ['Reporting HS', 'Reporting Makler', 'Bedienungsanleitung'],
    [('Reporting HS', [('w', 43, 52, 'Wöchentliches Hochladen der MIS-O-Berichte, Reporting immer montags')]),
     ('Reporting Makler', [('w', 43, 52, 'Wöchentliches Hochladen der MIS-O-Berichte, Reporting immer montags')])])

# ================================================================ Folie 8: Meeting Cadence
s = S[7]; leeren(s, K + 'MEETING CADENCE')
y = Y0 + 0.15
lab = 1.15
sumw = 2.3
gx = L + lab
gw = B - lab - sumw - 0.4
TAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']
tw = gw / 5
for i, t in enumerate(TAGE):
    text(s, gx + i * tw + 0.1, y, tw - 0.2, 0.25, t, size=12, bold=True, color=INK)
linie(s, L, y + 0.42, gx + gw, y + 0.42, SEK, 0.75)
for i in range(1, 5):
    linie(s, gx + i * tw, y + 0.42, gx + i * tw, y + 4.75, FEIN, 0.75)
# Zeile täglich
r1 = y + 0.7
etikett(s, L, r1 + 0.2, 'Täglich')
form(s, gx + 0.1, r1, gw - 0.2, 0.72, fill=ROT, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08)
text(s, gx + 0.32, r1, gw - 0.6, 0.72, [[('Daily KI-Runde', True, WEISS), ('   Montag bis Freitag', False, rgb('F3D3D7'))]], size=13, anchor=MSO_ANCHOR.MIDDLE)
linie(s, L, r1 + 0.97, gx + gw, r1 + 0.97, HAAR, 0.5)
# Zeile wöchentlich
r2 = r1 + 1.22
etikett(s, L, r2 + 0.2, 'Wöchentlich')
TERM = {1: [('Projektteam\nCheck-In', 'Projektteam')], 2: [('Führungskräfte-\nAustausch', 'Führung'), ('Celonis\nAustauschtermin', 'Celonis')],
        3: [('Projektteam\nCheck-In', 'Projektteam')]}
ende = r2
for tag, liste in TERM.items():
    yy = r2
    for titel, kreis in liste:
        th = hoehe(titel, 10.5, tw - 0.36, True, 1.1)
        ch = 0.46 + th + 0.24
        form(s, gx + tag * tw + 0.1, yy, tw - 0.2, ch, fill=FLAECHE, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.07)
        etikett(s, gx + tag * tw + 0.22, yy + 0.17, kreis, MUT, w=tw - 0.4, size=7.5)
        text(s, gx + tag * tw + 0.22, yy + 0.4, tw - 0.36, th, titel, size=10.5, bold=True, color=INK, ls=1.1)
        yy += ch + 0.16
    ende = max(ende, yy)
# Zusammenfassung rechts
sx = R - sumw
linie(s, sx - 0.25, y, sx - 0.25, y + 4.75, HAAR, 0.75)
etikett(s, sx, y + 0.05, 'Termine pro Woche')
ZAHL = [('5', 'Daily KI-Runde', ROT), ('2', 'Projektteam Check-In', INK), ('1', 'Führungskräfte-Austausch', INK), ('1', 'Celonis Austauschtermin', INK)]
yy = y + 0.5
for z, t, c in ZAHL:
    text(s, sx, yy, 0.6, 0.6, z, size=32, bold=True, color=c, ls=1.0)
    text(s, sx + 0.62, yy + 0.08, sumw - 0.62, 0.4, t, size=10.5, color=INK, anchor=MSO_ANCHOR.MIDDLE)
    yy += 0.86
linie(s, sx, yy + 0.05, R, yy + 0.05, HAAR, 0.5)
text(s, sx, yy + 0.18, sumw, 0.3, [[('9', True, INK), (' Termine je Woche in Phase 2', False, SEK)]], size=10.5)

# ================================================================ Folie 8 (neu): Gesamtzeitplan bis Jahresende
# Termine aus den Workstream-Folien (3, 5, 6, 7), Achse in KW (KW n beginnt montags, KW 42 = 12.10.2026).
import copy
JAHRESENDE = 53 + 4 / 7                       # Ende Donnerstag, 31.12.2026

import datetime
WT = ['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.', 'So.']

def kw_tag(p):
    return datetime.date(2025, 12, 29) + datetime.timedelta(days=round((p - 1) * 7))

def kw_datum(p, wt=True):
    d = kw_tag(p)
    return (WT[d.weekday()] + ' ' if wt else '') + d.strftime('%d.%m.')

GESAMT = [
    ('WS 1', 'Strukturierung\nCelonis & EMWS', [
        ('Celonis Ausbaustufe 2', [('b', 42, 49 + 1 / 7, 'Umsetzung Ausbaustufe 2', 'haupt'), ('m', 49 + 1 / 7, 'Finalisierung des Aufbaus', 'r')]),
        ('Celonis Mailumleitung', [('b', 43 + 1 / 7, JAHRESENDE, 'Go-Live Di. 20.10.: Umleitung der Mails läuft über Celonis', 'hell'),
                                   ('m', 43 + 1 / 7, 'Go-Live', 'n')]),
        ('EMWS-Schnittstelle', [('m', 43 + 1 / 14, 'Anbindung EMWS', 'u'), ('m', 43 + 4 / 7, 'SIT-Update: Kontrolle der Verarbeitung', 'r')]),
        ('Arbeitsanweisung', [('b', HEUTE, 44 + 3 / 7, 'QS', 'hell'), ('m', 44 + 3 / 7, 'Austausch Makler / HS', 'u'),
                              ('b', 44 + 4 / 7, 49 + 2 / 7, 'KI-Deckblatt ersetzt Sichtprüfung MV / Mail', 'haupt')]),
        ('Testing Celonis', [('b', 42, 49 + 1 / 7, 'Kontinuierliche Fach- und Lasttests', 'grau')])]),
    ('WS 2', 'Prüfbot\nRobotics', [
        ('Umsetzung Prüfbot', [('b', 44, 51, 'Umsetzung Prüfbots', 'haupt'), ('m', 51, 'Go-Live', 'r')]),
        ('Testing Prüfbot', [('b', 43, 51, 'Verträge in Produktion heraussuchen und Testing bis Go-Live', 'grau')])]),
    ('WS 3', 'Reporting', [
        ('Reporting HS | Makler', [('w', 43, JAHRESENDE, 'Reportingtools fertig (19.10.), danach wöchentliches Reporting, immer montags')]),
        ('Celonis-Reporting', [('b', 42, 44 + 6 / 7, 'Konzeption', 'hell'), ('b', 45, 49 + 1 / 7, 'Aufbau und Datenanbindung', 'haupt')])]),
    ('WS 4', 'Fachkonzept', [
        ('Fachkonzept', [('b', 43 + 2 / 7, 49 + 2 / 7, 'Finalisierung und Übergabe an Revision', 'haupt'), ('m', 49 + 2 / 7, 'Übergabe', 'r')])]),
]
MEILENSTEINE = [
    (43, 'Anbindung EMWS, Reportingtools fertig'),
    (43 + 1 / 7, 'Go-Live Celonis: Umleitung der Mails'),
    (43 + 4 / 7, 'SIT-Update, Kontrolle der Verarbeitung'),
    (44 + 3 / 7, 'Arbeitsanweisung: Austausch Makler / HS'),
    (49 + 1 / 7, 'Celonis Ausbaustufe 2 finalisiert'),
    (49 + 2 / 7, 'Fachkonzept an Revision übergeben'),
    (51, 'Go-Live Prüfbot'),
]

def zeilenhoehe(el):
    return 0.42 if any((e[0] == 'm' and e[3] == 'u') or e[0] == 'w' for e in el) else 0.29

s = prs.slides.add_slide(S[7].slide_layout)
for ph in list(s.placeholders):
    ph._element.getparent().remove(ph._element)
for ph in S[7].placeholders:
    s.shapes._spTree.append(copy.deepcopy(ph._element))
for ph in s.placeholders:
    r = ph.text_frame.paragraphs[0].runs
    r[0].text = K + 'GESAMTZEITPLAN' if ph.placeholder_format.idx == 12 else 'Gesamtzeitplan bis Jahresende'
von, bis = 42, JAHRESENDE
wsw, lab = 1.3, 1.75
gx = L + wsw + lab
gw = R - gx
wk = gw / (bis - von)
X = lambda p: gx + (min(max(p, von), bis) - von) * wk
y = Y0 + 0.05
kopf = 0.74
gh = sum(zeilenhoehe(el) for _, _, z in GESAMT for _, el in z)
# Tage: Wochenenden hinterlegt, Kalendertag und Wochentag unter der KW, heute rot
tw_tag = wk / 7
heute_tag = kw_tag(HEUTE)
for i in range(round((bis - von) * 7)):
    d = kw_tag(von) + datetime.timedelta(days=i)
    xd = X(von + i / 7)
    we = d.weekday() >= 5
    if we:
        form(s, xd, y + 0.43, tw_tag, kopf - 0.43 + gh, fill=FLAECHE)
    if d == heute_tag:
        form(s, xd - 0.005, y + 0.44, tw_tag + 0.01, 0.31, fill=ROT, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.03)
    farbe = WEISS if d == heute_tag else (HAAR if we else MUT)
    text(s, xd - 0.04, y + 0.45, tw_tag + 0.08, 0.13, str(d.day), size=5.5, color=farbe, bold=d == heute_tag, align=PP_ALIGN.CENTER)
    text(s, xd - 0.04, y + 0.59, tw_tag + 0.08, 0.13, 'MDMDFSS'[d.weekday()], size=5.5, color=farbe, bold=d == heute_tag, align=PP_ALIGN.CENTER)
# Kopf: Monate und KW
for name, a, e in MONATE:
    a2, e2 = max(a, von), min(e, bis)
    if e2 - a2 <= 0:
        continue
    if a > von:
        linie(s, X(a), y, X(a), y + kopf + gh, HAAR, 0.75)
    text(s, X(a2) + 0.06, y, (e2 - a2) * wk - 0.08, 0.18, {'Okt.': 'Oktober', 'Nov.': 'November', 'Dez.': 'Dezember'}[name],
         size=9, color=INK, bold=True)
etikett(s, L, y + 0.01, 'Workstream', w=wsw)
etikett(s, L + wsw, y + 0.01, 'Thema', w=lab)
text(s, L + wsw, y + 0.23, lab - 0.1, 0.16, 'KW', size=8, color=MUT)
text(s, L + wsw, y + 0.45, lab - 0.1, 0.13, 'Tag', size=6.5, color=MUT)
text(s, L + wsw, y + 0.59, lab - 0.1, 0.13, 'Wochentag', size=6.5, color=MUT)
for kw in range(von, int(bis) + 1):
    a, e = kw, min(kw + 1, bis)
    cx = X((a + e) / 2)
    if kw == int(HEUTE):
        form(s, cx - 0.17, y + 0.205, 0.34, 0.2, fill=ROT, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1)
        text(s, cx - 0.2, y + 0.205, 0.4, 0.2, str(kw), size=8, color=WEISS, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    else:
        text(s, cx - 0.2, y + 0.23, 0.4, 0.16, str(kw), size=8, color=MUT, align=PP_ALIGN.CENTER)
    if kw > von:
        linie(s, X(kw), y + 0.43, X(kw), y + kopf + gh, HAAR, 0.5)
linie(s, L, y + kopf, R, y + kopf, SEK, 0.75)
linie(s, X(HEUTE + 1 / 14), y + kopf, X(HEUTE + 1 / 14), y + kopf + gh, ROT, 1.0, MSO_LINE_DASH_STYLE.DASH)
# Zeilen je Workstream
yy = y + kopf
for gi, (ws, wsname, zeilen_) in enumerate(GESAMT):
    hg = sum(zeilenhoehe(el) for _, el in zeilen_)
    if hg > 0.5:
        ty = yy + (hg - 0.48) / 2
        text(s, L, ty, 0.6, 0.18, ws, size=8, color=TEALD, bold=True, spc=80)
        text(s, L, ty + 0.17, wsw - 0.1, 0.32, wsname, size=9, color=INK, bold=True, ls=1.05)
    else:
        text(s, L, yy, wsw - 0.1, hg, [[(ws + '  ', True, TEALD), (wsname, True, INK)]], size=9, anchor=MSO_ANCHOR.MIDDLE)
    for zi, (name, el) in enumerate(zeilen_):
        h = zeilenhoehe(el)
        bh = 0.19
        by = yy + (0.05 if h > 0.4 else (h - bh) / 2)
        text(s, L + wsw, by, lab - 0.12, bh, name, size=9, color=INK, anchor=MSO_ANCHOR.MIDDLE)
        for e in el:
            if e[0] == 'b':
                _, a, b_, t, stil = e
                fill, tc = BALKEN[stil]
                form(s, X(a), by, X(b_) - X(a), bh, fill=fill, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05)
                tw_ = breite(t, 8, True)
                ab = 0.16 if any(f[0] == 'm' and abs(f[1] - a) < 1e-6 for f in el) else 0.08
                if tw_ + 0.16 <= X(b_) - X(a):
                    text(s, X(a) + ab, by, X(b_) - X(a) - 0.1, bh, t, size=8, color=tc, bold=True, anchor=MSO_ANCHOR.MIDDLE)
                else:
                    text(s, X(b_) + 0.08, by, tw_ + 0.1, bh, t, size=8, color=SEK, bold=True, anchor=MSO_ANCHOR.MIDDLE)
            elif e[0] == 'w':
                _, a, b_, t = e
                form(s, X(a), by, X(b_) - X(a), bh, fill=TEALL, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05)
                for kw in range(int(a), int(b_) + 1):
                    if a <= kw < b_:
                        form(s, X(kw + 1 / 14) - 0.05, by + bh / 2 - 0.05, 0.1, 0.1, fill=TEAL, shape=MSO_SHAPE.DIAMOND)
                text(s, X(a) + 0.08, by + bh + 0.02, X(b_) - X(a), 0.15, t, size=7.5, color=SEK)
            elif e[0] == 'm':
                _, p, t, wo = e
                d = 0.17
                go = t.startswith('Go-Live')
                form(s, X(p) - d / 2, by + bh / 2 - d / 2, d, d, fill=ROT if go else INK, line=WEISS, lw=0.75, shape=MSO_SHAPE.DIAMOND)
                t = t + ' ' + kw_datum(p) if t in ('Go-Live', 'Übergabe', 'Finalisierung des Aufbaus') else t
                if wo == 'n':
                    pass
                elif wo == 'r':
                    text(s, X(p) + 0.13, by, breite(t, 8, True) + 0.1, bh, t, size=8, color=ROT if go else INK, bold=True, anchor=MSO_ANCHOR.MIDDLE)
                else:
                    text(s, X(p) - 0.08, by + bh + 0.02, breite(t, 7.5, True) + 0.1, 0.15, t, size=7.5, color=INK, bold=True)
        yy += h
        if zi < len(zeilen_) - 1:
            linie(s, L + wsw, yy, R, yy, HAAR, 0.5)
    linie(s, L, yy, R, yy, SEK if gi < len(GESAMT) - 1 else HAAR, 0.75 if gi < len(GESAMT) - 1 else 0.5)
# Heute und Jahresende
text(s, X(HEUTE + 1 / 14) - 0.6, yy + 0.04, 1.2, 0.16, 'Heute, ' + kw_datum(HEUTE), size=7.5, color=ROT, bold=True, align=PP_ALIGN.CENTER)
linie(s, R, y + kopf - 0.04, R, yy, SEK, 1.0)
text(s, R - 1.5, yy + 0.04, 1.5, 0.16, 'Jahresende, Do. 31.12.', size=7.5, color=SEK, bold=True, align=PP_ALIGN.RIGHT)
# Meilensteine
my = yy + 0.28
etikett(s, L, my, 'Meilensteine bis Jahresende')
my += 0.25
n = len(MEILENSTEINE)
mg = 0.12
mw = (B - mg * (n - 1)) / n
mh = max(hoehe(t, 8.5, mw - 0.3) for _, t in MEILENSTEINE) + 0.38
for i, (p, t) in enumerate(MEILENSTEINE):
    x = L + i * (mw + mg)
    go = 'Go-Live' in t
    form(s, x, my, mw, mh, fill=ROT if go else FLAECHE, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.06)
    form(s, x + 0.15, my + 0.15, 0.13, 0.13, fill=WEISS if go else INK, shape=MSO_SHAPE.DIAMOND)
    text(s, x + 0.34, my + 0.1, mw - 0.4, 0.22, kw_datum(p) + '2026', size=10, color=WEISS if go else INK, bold=True)
    text(s, x + 0.15, my + 0.33, mw - 0.3, mh - 0.36, t, size=8.5, color=WEISS if go else SEK)
warnung(8, my + mh)
# hinter Workstream 4 (Folie 7) einsortieren
lst = prs.slides._sldIdLst
el = lst[-1]
lst.remove(el)
lst.insert(7, el)

prs.save(AUS)
print('geschrieben:', AUS)
