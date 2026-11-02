# -*- coding: utf-8 -*-
"""Decision Paper Workflow-Plattform auf dem Deloitte-Master (Vorlage aus „Banking Strategy 2030“).

Aufbau nach Minto: Cover, Executive Summary (Antwort zuerst), Agenda mit Beschlussvorschlag, Zweck und Zeit je
Kapitel, danach die Kapitel. Gestaltung: Platzhalter des Masters für Titel (Kapitelzeile) und Untertitel
(Action Title), Theme-Schrift Aptos, Deloitte-Grün, Karten statt freier Textfelder, Lucide-Icons einfarbig,
Herstellerlogos (ServiceNow, Camunda, MuleSoft) als Orientierung.

Inhalt aus inhalt_v3.json (inhalt_v3_build.py), Bilder aus bilder/png (svg2png.py), Vorlage aus vorlage_prep.py.
Aufruf: python3 deck_build_v4.py
"""
import copy, json, math, os, re, sys
from lxml import etree
from pptx.oxml import parse_xml
from PIL import ImageFont, Image
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

HIER = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HIER, 'inhalt_v3.json'), encoding='utf-8'))
AUS = os.path.join(HIER, '..', '20261016_Decision_Paper_Workflow_Platform_Strategy.pptx')
PNG = os.path.join(HIER, 'bilder', 'png')
AT = D['action_titles']
O1, O2 = D['option_kurz']['o1'], D['option_kurz']['o2']

# ---------------------------------------------------------------- Farben (Deloitte-Theme) und Raster
def rgb(h): return RGBColor.from_string(h)
SW = rgb('000000')
TEXT = rgb('222222')
GRAU = rgb('75787B')
GRAUD = rgb('53565A')
GRAUL = rgb('D0D0CE')
KARTE = rgb('F2F2F2')
WEISS = rgb('FFFFFF')
GRUEN = rgb('86BC25')      # Deloitte Green
G6 = rgb('26890D')         # Green 6
DG = rgb('046A38')         # Deep Green
PALE = rgb('F1F6E4')
ORANGE = rgb('ED8B00'); ORANGEL = rgb('FCE8CC'); ORANGED = rgb('A85F00')
ROT = rgb('DA291C'); ROTL = rgb('F8D7D4')

W, H = 13.333, 7.5
LX, RX = 0.5, 12.83
BW = RX - LX
Y0 = 1.62          # Beginn Inhalt unter Titel und Action Title
BOT = 6.6          # Unterkante Inhalt
FUSS = 6.78        # Fußnote (Quellen); Master-Fußzeile ab 7,13

# ---------------------------------------------------------------- Textmaß (Liberation Sans ≈ Arial; Aptos in PowerPoint etwas schmaler)
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
    (r'\b(No\.|Gate|Gates|Art\.|Annex|Option|Phase|Q\d+,?|v|Camunda|Mule|Java) (\d)', lambda m: m.group(1) + NB + m.group(2)),
    (r'(\d) (months|years|min|employees|criteria|of)\b', lambda m: m.group(1) + NB + m.group(2)),
    (r' (–|-) ', lambda m: NB + m.group(1) + ' '),
]
def schuetzen(t):
    for muster, f in _SCHUTZ:
        t = re.sub(muster, f, str(t))
    return t

def zeilen(t, size, w, bold=False):
    n = 0
    for absatz in schuetzen(t).split('\n'):
        woerter, z = absatz.replace('-', '- ').replace('/', '/ ').split(' '), ''
        n += 1
        for wort in woerter:
            probe = (z + ' ' + wort).strip()
            if breite(probe, size, bold) <= w * 0.95 or not z:
                z = probe
            else:
                n += 1
                z = wort
    return n

def hoehe(t, size, w, bold=False, ls=1.2):
    return zeilen(t, size, w, bold) * size * ls * 1.08 / 72

# ---------------------------------------------------------------- Formen
prs = Presentation(os.path.join(HIER, 'deloitte_vorlage.pptx'))
LAY = {l.name: l for l in prs.slide_layouts}

def _ohne_stil(sh):
    st = sh._element.find('{http://schemas.openxmlformats.org/presentationml/2006/main}style')
    if st is not None:
        sh._element.remove(st)
    return sh

def rect(s, x, y, w, h, fill=None, line=None, shape=MSO_SHAPE.RECTANGLE, lw=0.75, radius=None):
    r = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    _ohne_stil(r)
    if fill is None:
        r.fill.background()
    else:
        r.fill.solid(); r.fill.fore_color.rgb = fill
    if line is None:
        r.line.fill.background()
    else:
        r.line.color.rgb = line; r.line.width = Pt(lw)
    if radius is not None and shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        r.adjustments[0] = min(0.5, radius / min(w, h))
    return r

def tb(s, x, y, w, h, absaetze, size=11, color=TEXT, bold=False, align=PP_ALIGN.LEFT,
       anchor=MSO_ANCHOR.TOP, space=3, ls=None, caps=False):
    """absaetze: str | Liste aus str | Liste von Listen [(text, bold, farbe)]."""
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
        if ls: p.line_spacing = ls
        teile = a if isinstance(a, list) else [(a, bold, color)]
        for txt, b, c in teile:
            r = p.add_run(); r.text = schuetzen(txt.upper() if caps else txt)
            r.font.size = Pt(size); r.font.bold = b; r.font.color.rgb = c
    return t

def bild(s, name, x, y, w=None, h=None):
    pfad = os.path.join(PNG, name + '.png') if not os.path.isabs(name) else name
    if w is not None and h is not None:
        bw, bh = Image.open(pfad).size
        if bw / bh > w / h:
            h2 = w * bh / bw; y += (h - h2) / 2; h = h2
        else:
            w2 = h * bw / bh; x += (w - w2) / 2; w = w2
    return s.shapes.add_picture(pfad, Inches(x), Inches(y), Inches(w) if w else None, Inches(h) if h else None)

def icon(s, name, x, y, d=0.36, farbe='weiss', kreis=G6, inner=0.55):
    """Icon in Kreis (kreis=None: freies Icon)."""
    if kreis is not None:
        rect(s, x, y, d, d, kreis, shape=MSO_SHAPE.OVAL)
    g = d * inner if kreis is not None else d
    bild(s, 'icon_%s_%s' % (name, farbe), x + (d - g) / 2, y + (d - g) / 2, g, g)

LOGO = {'sn': 'servicenow_logo', 'cam': 'camunda_logo', 'mule': 'mulesoft_logo'}

def logos(s, keys, x, y, w, h, gap=0.15):
    """Mehrere Logos nebeneinander in einem Rahmen x, y, w, h (zentriert)."""
    n = len(keys)
    bw = (w - gap * (n - 1)) / n
    for i, k in enumerate(keys):
        bild(s, LOGO[k], x + i * (bw + gap), y, bw, h)

def punkte(s, x, y, w, items, size=10.5, color=TEXT, gap=0.08, marker=G6, fett=True, icon_name=None, icon_farbe=None):
    """Aufzählung mit Quadrat oder Icon; Text vor ': ' fett. Gibt neue y-Position zurück."""
    einzug = 0.26 if icon_name is None else 0.3
    for it in items:
        h = hoehe(it, size, w - einzug)
        if icon_name:
            bild(s, 'icon_%s_%s' % (icon_name, icon_farbe or 'gruen'), x, y + 0.01, 0.17, 0.17)
        else:
            rect(s, x, y + size / 72 * 0.42, 0.07, 0.07, marker)
        if fett and ': ' in it[:70]:
            k, r = it.split(': ', 1)
            tb(s, x + einzug, y, w - einzug, h, [[(k + ': ', True, color), (r, False, color)]], size=size)
        else:
            tb(s, x + einzug, y, w - einzug, h, it, size=size, color=color)
        y += h + gap
    return y

def liste_hoehe(items, w, size, gap=0.08, einzug=0.26):
    return sum(hoehe(i, size, w - einzug) + gap for i in items)

def passend(items, w, hmax, start=11.0, minimum=8.0, gap=0.08, einzug=0.26):
    size = start
    while size > minimum:
        if liste_hoehe(items, w, size, gap, einzug) <= hmax:
            return size
        size -= 0.5
    return minimum

def label(s, x, y, w, t, color=DG, size=9.5):
    tb(s, x, y, w, 0.2, t.upper(), size=size, bold=True, color=color)
    return y + 0.28

SKALA = {'++': (DG, WEISS), '+': (rgb('E3F0CB'), G6), '0': (rgb('E6E6E6'), GRAUD), '-': (ORANGEL, ORANGED), '--': (ROTL, ROT)}
WORT = {'++': 'very advantageous', '+': 'advantageous', '0': 'neutral or unclear', '-': 'disadvantageous', '--': 'very disadvantageous'}

def chip(s, x, y, wert, w=0.5, h=0.28, size=10.5):
    f, c = SKALA[wert]
    r = rect(s, x, y, w, h, f, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.06)
    tf = r.text_frame; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    run = p.add_run(); run.text = wert.replace('-', '–'); run.font.size = Pt(size); run.font.bold = True
    run.font.color.rgb = c

def legende(s, x, y, w):
    y = label(s, x, y, w, 'Rating scale')
    for k in ['++', '+', '0', '-', '--']:
        chip(s, x, y, k, w=0.45, h=0.25, size=9.5)
        tb(s, x + 0.58, y + 0.03, w - 0.6, 0.22, WORT[k], size=9.5, color=TEXT)
        y += 0.32
    return y

def karte(s, x, y, w, h, fill=KARTE, oben=G6):
    rect(s, x, y, w, h, fill)
    if oben is not None:
        rect(s, x, y, w, 0.05, oben)

# ---------------------------------------------------------------- Folienrahmen
seite = [0]
SEITE = {}

def folie(titel, unter, key=None, quellen=None, fuss=None, layout='Title, subtitle'):
    s = prs.slides.add_slide(LAY[layout])
    seite[0] += 1
    if key:
        SEITE[key] = seite[0]
    for ph in s.placeholders:
        i = ph.placeholder_format.idx
        if i == 0:
            ph.text_frame.text = titel
        elif i == 13:
            ph.text_frame.text = schuetzen(unter)
    teile = []
    if fuss:
        teile.append(fuss)
    if quellen:
        teile.append('Sources: ' + ', '.join(sorted(set(quellen), key=lambda q: int(q[1:]))) + ' (see list of sources)')
    if teile:
        tb(s, LX, FUSS, BW, 0.2, '   |   '.join(teile), size=8, color=GRAU)
    return s

def seitenkarte(s, titel, x=9.45, y=Y0, w=None, h=None):
    """Graue Seitenkarte rechts (statt freier Textspalte)."""
    w = w or RX - x
    h = h or BOT - y
    karte(s, x, y, w, h, KARTE, G6)
    ht = hoehe(titel.upper(), 9.5, w - 0.5, True)
    tb(s, x + 0.25, y + 0.2, w - 0.5, ht, titel.upper(), size=9.5, bold=True, color=DG)
    return x + 0.25, y + 0.35 + max(ht, 0.2), w - 0.5

ms = D['summary']
emp = D['empfehlung']
krit = D['kriterien']

# ================================================================ 1 Cover
s = prs.slides.add_slide(LAY['Title slide - Dark Green with tagline logo lockup'])
seite[0] += 1
for ph in s.placeholders:
    i = ph.placeholder_format.idx
    if i == 0:
        tf = ph.text_frame
        tf.text = 'Workflow-platform strategy'
        p = tf.add_paragraph(); r = p.add_run(); r.text = 'Decision paper for the Management Board'
        r.font.size = Pt(16)
    elif i == 10:
        ph.text_frame.text = 'Confidential  |  16 October 2026'
    elif i == 11:
        ph.insert_picture(os.path.join(HIER, 'bilder', 'cover_glow.png'))

# ================================================================ 2 Executive summary
s = folie('Executive summary', AT['management_summary'], key='summary', quellen=ms.get('quellen'))
he = hoehe(D['kernaussage'], 13, BW - 0.9, True)
rect(s, LX, Y0, BW, he + 0.3, PALE)
rect(s, LX, Y0, 0.07, he + 0.3, G6)
icon(s, 'target', LX + 0.2, Y0 + (he + 0.3 - 0.38) / 2, 0.38)
tb(s, LX + 0.75, Y0, BW - 0.9, he + 0.3, D['kernaussage'], size=13, bold=True, color=SW, anchor=MSO_ANCHOR.MIDDLE)
y = Y0 + he + 0.3 + 0.25
cl, cr = 5.75, BW - 5.75 - 0.4
xr = LX + cl + 0.4
# links: Problem (Icons) und Optionen (Karten mit Logos)
yl = label(s, LX, y, cl, 'Problem')
PICON = ['scale', 'calendar-clock', 'triangle-alert']
size_l = 9.5
for size_l in [10, 9.5, 9, 8.5]:
    if liste_hoehe(ms['problem'], cl, size_l, 0.08, 0.42) + 0.28 + 1.35 <= BOT - yl:
        break
for it, ic in zip(ms['problem'], PICON):
    k, r_ = it.split(': ', 1)
    h = hoehe(it, size_l, cl - 0.42)
    icon(s, ic, LX, yl, 0.28, 'weiss', G6, 0.6)
    tb(s, LX + 0.42, yl, cl - 0.42, h, [[(k + ': ', True, TEXT), (r_, False, TEXT)]], size=size_l)
    yl += max(h, 0.3) + 0.08
yl = label(s, LX, max(yl + 0.05, BOT - 1.12 - 0.3), cl, 'Options')
ow = (cl - 0.3) / 3
OPT = [(['cam', 'mule'], 'Option 1', 'Enhance Camunda/MuleSoft'), (['sn'], 'Option 2', 'Migrate to ServiceNow'),
       (['sn', 'cam'], 'Staged', 'Coexistence by archetype')]
for i, (lg, a, b) in enumerate(OPT):
    x = LX + i * (ow + 0.15)
    karte(s, x, yl, ow, 1.12, WEISS if i < 2 else PALE, G6 if i == 2 else GRAUL)
    if i < 2:
        rect(s, x, yl, ow, 1.12, None, GRAUL)
    logos(s, lg, x + 0.15, yl + 0.15, ow - 0.3, 0.36)
    tb(s, x + 0.1, yl + 0.6, ow - 0.2, 0.2, a, size=9.5, bold=True, color=DG, align=PP_ALIGN.CENTER)
    tb(s, x + 0.1, yl + 0.8, ow - 0.2, 0.3, b, size=9, color=TEXT, align=PP_ALIGN.CENTER)
# rechts: entscheidende Befunde, nummeriert
yr = label(s, xr, y, cr, 'Assessment: decisive findings')
avail = BOT - yr - 1.25
for size_r in [10, 9.5, 9, 8.5]:
    if liste_hoehe(ms['bewertung'], cr, size_r, 0.1, 0.45) <= avail:
        break
for i, it in enumerate(ms['bewertung'], 1):
    k, r_ = it.split(': ', 1)
    h = hoehe(it, size_r, cr - 0.45)
    rect(s, xr, yr, 0.3, 0.3, DG, shape=MSO_SHAPE.OVAL)
    tb(s, xr, yr, 0.3, 0.3, str(i), size=10, bold=True, color=WEISS, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    tb(s, xr + 0.45, yr, cr - 0.45, h, [[(k + ': ', True, TEXT), (r_, False, TEXT)]], size=size_r)
    yr += max(h, 0.32) + 0.1
# Antwort: drei Karten (Bedingungen, Vorbehalte, Alternativen)
ya = BOT - 1.1
aw = (cr - 0.3) / 3
for i, (it, ic) in enumerate(zip(ms['antwort'], ['clipboard-check', 'triangle-alert', 'split'])):
    k, r_ = it.split(': ', 1)
    x = xr + i * (aw + 0.15)
    karte(s, x, ya, aw, 1.1, KARTE, G6)
    icon(s, ic, x + 0.1, ya + 0.14, 0.22, 'gruen', None)
    tb(s, x + 0.4, ya + 0.13, aw - 0.45, 0.22, k, size=9.5, bold=True, color=DG)
    sz = 8.5 if hoehe(r_, 8.5, aw - 0.2) <= 0.7 else 8
    tb(s, x + 0.1, ya + 0.4, aw - 0.2, 0.68, r_, size=sz, color=TEXT)

# ================================================================ 3 Agenda (Inhalt nach dem Bau, wenn die Seitenzahlen feststehen)
ag = prs.slides.add_slide(LAY['Title Only'])
seite[0] += 1
AGENDA_FOLIE = ag

# ================================================================ 4 Decision required
a = D['ausgangslage']
s = folie('Decision required', AT['ausgangslage'], key='ausgangslage', quellen=a.get('quellen'))
cw = 8.35
hf = hoehe(a['entscheidung'], 13, cw - 0.55, True)
icon(s, 'gavel', LX, Y0 + 0.02, 0.4)
tb(s, LX + 0.55, Y0, cw - 0.55, hf, a['entscheidung'], size=13, bold=True, color=SW)
y = Y0 + max(hf, 0.45) + 0.2
y = label(s, LX, y, cw, 'Why now')
WICON = ['calendar-clock', 'git-merge', 'plug', 'landmark']
gruppen = [(a['warum_jetzt'], WICON), (a['folgen_verzoegerung'], ['triangle-alert'] * 3)]
fw = (cw - 0.2) / 4
hb = max(hoehe(it.split(': ', 1)[1], 8.5, fw - 0.15) for it in a['fakten_auftrag']) + 0.5
avail = BOT - y - hb - 0.15 - 0.33
for size in [10.5, 10, 9.5, 9, 8.5]:
    if sum(max(hoehe(it, size, cw - 0.42), 0.29) + 0.08 for g, _ in gruppen for it in g) <= avail:
        break
for gi, (items, ics) in enumerate(gruppen):
    if gi == 1:
        y = label(s, LX, y + 0.05, cw, 'Consequences of delay')
    for it, ic in zip(items, ics):
        h = hoehe(it, size, cw - 0.42)
        icon(s, ic, LX, y, 0.27, 'weiss', G6 if gi == 0 else ORANGE, 0.6)
        if ': ' in it[:70]:
            k, r_ = it.split(': ', 1)
            tb(s, LX + 0.42, y, cw - 0.42, h, [[(k + ': ', True, TEXT), (r_, False, TEXT)]], size=size)
        else:
            tb(s, LX + 0.42, y, cw - 0.42, h, it, size=size)
        y += max(h, 0.29) + 0.08
# Ausgangslage als Band unten
yb = BOT - hb
rect(s, LX, yb, cw, hb, KARTE)
for i, (it, ic) in enumerate(zip(a['fakten_auftrag'], ['landmark', 'workflow', 'building-2', 'circle-help'])):
    k, r_ = it.split(': ', 1)
    x = LX + 0.1 + i * fw
    icon(s, ic, x + 0.05, yb + 0.12, 0.2, 'gruen', None)
    tb(s, x + 0.32, yb + 0.1, fw - 0.4, 0.2, k, size=9, bold=True, color=DG)
    tb(s, x + 0.05, yb + 0.38, fw - 0.15, hb - 0.42, r_, size=8.5, color=TEXT)
# Optionen als Karten mit Logos rechts
x0 = LX + cw + 0.35
ow = RX - x0
oh = (BOT - Y0 - 0.3) / 3
for i, ((lab, txt), lg) in enumerate(zip(a['optionen'], [['cam', 'mule'], ['sn'], ['sn', 'cam', 'mule']])):
    y_ = Y0 + i * (oh + 0.15)
    karte(s, x0, y_, ow, oh, PALE if i == 2 else KARTE, G6 if i == 2 else GRAUL)
    logos(s, lg, x0 + 0.2, y_ + 0.18, ow - 0.4 if len(lg) > 1 else 1.6, 0.32)
    tb(s, x0 + 0.2, y_ + 0.6, ow - 0.4, 0.22, lab, size=10.5, bold=True, color=DG)
    tb(s, x0 + 0.2, y_ + 0.85, ow - 0.4, oh - 0.9, txt, size=9, color=TEXT)

# ================================================================ 5 Evidence base
fb = D['faktenbasis']
s = folie('Evidence base', AT['faktenbasis'], key='faktenbasis', quellen=fb.get('quellen'))
qw = (BW - 0.3) / 2
QH = [(BOT - Y0 - 0.25) * 0.57, (BOT - Y0 - 0.25) * 0.43]
QUAD = [('Verified facts', fb['fakten'], 'circle-check-big', G6), ('Evidence-based inferences', fb['schluesse'], 'lightbulb', DG),
        ('Assumptions (to be confirmed)', fb['annahmen'], 'flag', ORANGE), ('Open questions that could change ratings', fb['offen'], 'circle-help', ROT)]
for i, (lab, it, ic, farbe) in enumerate(QUAD):
    x = LX + (i % 2) * (qw + 0.3)
    y_ = Y0 + (i // 2) * (QH[0] + 0.25)
    qh = QH[i // 2]
    karte(s, x, y_, qw, qh, KARTE, farbe)
    icon(s, ic, x + 0.18, y_ + 0.18, 0.34, 'weiss', farbe)
    tb(s, x + 0.65, y_ + 0.24, qw - 0.8, 0.25, lab, size=11.5, bold=True, color=SW)
    sz = passend(it, qw - 0.4, qh - 0.75, start=10, minimum=8, gap=0.06)
    punkte(s, x + 0.2, y_ + 0.65, qw - 0.4, it, size=sz, gap=0.06, marker=farbe)

# ================================================================ 6–8 Comparison tables
SPALTEN = [('No.', 0.3), ('Criterion', 1.3), ('Definition', 1.5), ('', 0.5), ('Option 1 rationale', 2.5),
           ('', 0.5), ('Option 2 rationale', 2.5), ('Evidence, assumption or open point', 2.6)]
GAP = 0.065
TBR = sum(w for _, w in SPALTEN) + GAP * (len(SPALTEN) - 1)

def tabelle(teil, nr, gesamt):
    qs = [q for k in teil for q in k.get('quellen', [])]
    s = folie('Comparison of options (%d/%d)' % (nr, gesamt), AT['vergleich_%d' % nr], key='vergleich' if nr == 1 else None, quellen=qs,
              fuss='* mandatory criterion  |  ++ very advantageous, + advantageous, 0 neutral or unclear, – disadvantageous, – – very disadvantageous')
    xs, x = [], LX
    for _, w in SPALTEN:
        xs.append(x); x += w + GAP
    # Logoband über den Optionsspalten
    y = Y0
    for (a_, b_), lg in (((3, 4), ['cam', 'mule']), ((5, 6), ['sn'])):
        bx, bw_ = xs[a_], xs[b_] + SPALTEN[b_][1] - xs[a_]
        rect(s, bx, y, bw_, 0.42, WEISS, GRAUL)
        logos(s, lg, bx + 0.25, y + 0.07, min(bw_ - 0.5, 1.15 * len(lg) + 0.2), 0.28)
    y += 0.47
    rect(s, LX - 0.05, y, TBR + 0.1, 0.36, DG)
    for (n_, w), xx in zip(SPALTEN, xs):
        tb(s, xx, y + 0.08, w, 0.25, n_, size=9, bold=True, color=WEISS)
    tb(s, xs[3], y + 0.08, 0.5, 0.25, 'Rating', size=8, bold=True, color=WEISS)
    tb(s, xs[5], y + 0.08, 0.5, 0.25, 'Rating', size=8, bold=True, color=WEISS)
    y += 0.42
    for size in [11, 10.5, 10, 9.5, 9, 8.5, 8]:
        hs = []
        for k in teil:
            beleg = k['beleg'] + ('\nTo confirm: ' + k['bestaetigung'] if k.get('bestaetigung') else '')
            h = max(hoehe(k['kriterium'] + ' *', size, SPALTEN[1][1], True), hoehe(k['definition'], size, SPALTEN[2][1]),
                    hoehe(k['o1_begr'], size, SPALTEN[4][1]), hoehe(k['o2_begr'], size, SPALTEN[6][1]),
                    hoehe(beleg, max(8, size - 1.5), SPALTEN[7][1]), 0.32)
            hs.append(h + 0.16)
        if sum(hs) <= BOT - y:
            break
    for i, (k, h) in enumerate(zip(teil, hs)):
        if i % 2 == 0:
            rect(s, LX - 0.05, y - 0.06, TBR + 0.1, h, KARTE)
        rect(s, LX - 0.05, y + h - 0.07, TBR + 0.1, 0.01, GRAUL)
        tb(s, xs[0], y, SPALTEN[0][1], h, str(k['nr']), size=size, bold=True, color=DG)
        tb(s, xs[1], y, SPALTEN[1][1], h, k['kriterium'] + (' *' if k.get('verbindlich') else ''), size=size, bold=True, color=SW)
        tb(s, xs[2], y, SPALTEN[2][1], h, k['definition'], size=size, color=GRAUD)
        chip(s, xs[3] + 0.02, y - 0.01, k['o1'], w=0.46, h=0.27, size=10)
        tb(s, xs[4], y, SPALTEN[4][1], h, k['o1_begr'], size=size, color=TEXT)
        chip(s, xs[5] + 0.02, y - 0.01, k['o2'], w=0.46, h=0.27, size=10)
        tb(s, xs[6], y, SPALTEN[6][1], h, k['o2_begr'], size=size, color=TEXT)
        par = [[(k['beleg'], False, GRAUD)]]
        if k.get('bestaetigung'):
            par.append([('To confirm: ', True, DG), (k['bestaetigung'], False, GRAUD)])
        tb(s, xs[7], y, SPALTEN[7][1], h, par, size=max(8, size - 1.5), space=3)
        y += h

i0 = 0
AUFT = D['tabellen_aufteilung']
for nr, n_ in enumerate(AUFT, 1):
    tabelle(krit[i0:i0 + n_], nr, len(AUFT))
    i0 += n_

# ================================================================ 9 Rating overview
WERTE = {'--': -2, '-': -1, '0': 0, '+': 1, '++': 2}
v1 = sum(1 for k in krit if WERTE[k['o1']] > WERTE[k['o2']])
v2 = sum(1 for k in krit if WERTE[k['o2']] > WERTE[k['o1']])
gl = len(krit) - v1 - v2
s = folie('Rating overview', AT['bewertungsuebersicht'], key='uebersicht', fuss='Bold: mandatory criteria')
cx = [LX, LX + 5.0, LX + 6.9]
for sp, lg, nm in ((1, ['cam', 'mule'], 'Option 1'), (2, ['sn'], 'Option 2')):
    rect(s, cx[sp], Y0, 1.7, 0.75, WEISS, GRAUL)
    logos(s, lg, cx[sp] + 0.12, Y0 + 0.08, 1.46, 0.36, gap=0.08)
    tb(s, cx[sp], Y0 + 0.48, 1.7, 0.22, nm, size=9.5, bold=True, color=DG, align=PP_ALIGN.CENTER)
y = Y0 + 0.9
zh = min(0.4, (BOT - y) / len(krit))
for k in krit:
    rect(s, LX, y + zh - 0.03, 8.6, 0.01, GRAUL)
    tb(s, cx[0], y + (zh - 0.24) / 2, 4.8, 0.24, [[('%d  ' % k['nr'], True, DG), (k['kriterium'], k.get('verbindlich', False), TEXT)]], size=10.5)
    chip(s, cx[1] + 0.55, y + (zh - 0.28) / 2 - 0.01, k['o1'], w=0.6, h=0.28)
    chip(s, cx[2] + 0.55, y + (zh - 0.28) / 2 - 0.01, k['o2'], w=0.6, h=0.28)
    y += zh
px, py, pw = seitenkarte(s, 'How to read', x=9.75)
py = legende(s, px, py, pw) + 0.2
# Zählung als große Zahlen
for i, (zahl, txt) in enumerate(((v1, 'Option 1 ahead'), (v2, 'Option 2 ahead'), (gl, 'level'))):
    x_ = px + i * (pw / 3)
    tb(s, x_, py, pw / 3, 0.45, str(zahl), size=24, bold=True, color=DG, align=PP_ALIGN.CENTER)
    tb(s, x_, py + 0.48, pw / 3, 0.22, txt, size=8.5, color=GRAUD, align=PP_ALIGN.CENTER)
py += 0.85
punkte(s, px, py, pw, D['uebersicht_lesart'], size=passend(D['uebersicht_lesart'], pw, BOT - py - 0.2, start=10, minimum=8), gap=0.08)

# ================================================================ 10–11 Cost comparison (Change the Bank, Run the Bank)
ko = D['kosten']
tw_ = 8.75
KSP = [('Cost category', 1.7), (O1, 3.35), (O2, 3.5)]
kx = [LX, LX + 1.8, LX + 1.8 + 3.45]

def kosten_bewertung(s, px, py, pw, k):
    """Bewertung des Kostenkriteriums mit Logos und Chips."""
    py = label(s, px, py, pw, 'Rating (No. %d)' % k['nr'], size=9)
    hw = (pw - 0.2) / 2
    for i, (lg, wert) in enumerate(((['cam', 'mule'], k['o1']), (['sn'], k['o2']))):
        x = px + i * (hw + 0.2)
        rect(s, x, py, hw, 0.95, WEISS, GRAUL)
        logos(s, lg, x + 0.1, py + 0.1, hw - 0.2, 0.3, gap=0.06)
        chip(s, x + (hw - 0.6) / 2, py + 0.55, wert, w=0.6, h=0.28)
    return py + 0.95 + 0.25

def kostentabelle(s, titel, rows, ic):
    for size in [10.5, 10, 9.5, 9, 8.5, 8]:
        hs = [max(hoehe(z['kategorie'], size, KSP[0][1] - 0.1, True), hoehe(z['o1'], size, KSP[1][1] - 0.15),
                  hoehe(z['o2'], size, KSP[2][1] - 0.15)) + 0.16 for z in rows]
        if sum(hs) + 0.42 + 0.5 <= BOT - Y0:
            break
    y = Y0
    for (n_, w), xx, lg in zip(KSP[1:], kx[1:], (['cam', 'mule'], ['sn'])):
        logos(s, lg, xx + 0.05, y, min(w - 0.1, 1.2 * len(lg)), 0.3)
    y += 0.42
    rect(s, LX - 0.05, y, tw_ + 0.05, 0.36, DG)
    icon(s, ic, LX + 0.05, y + 0.07, 0.22, 'weiss', None)
    tb(s, LX + 0.38, y + 0.08, tw_, 0.25, titel, size=10.5, bold=True, color=WEISS)
    y += 0.46
    for i, (z, h) in enumerate(zip(rows, hs)):
        if i % 2 == 1:
            rect(s, LX - 0.05, y - 0.08, tw_ + 0.05, h, KARTE)
        tb(s, kx[0], y, KSP[0][1], h, z['kategorie'], size=size, bold=True, color=SW)
        tb(s, kx[1], y, KSP[1][1], h, z['o1'], size=size, color=TEXT)
        tb(s, kx[2], y, KSP[2][1], h, z['o2'], size=size, color=TEXT)
        rect(s, LX, y + h - 0.09, tw_, 0.01, GRAUL)
        y += h

s = folie('Cost comparison: change the bank', AT['kosten_ctb'], key='kosten', quellen=ko.get('quellen'))
kostentabelle(s, 'Change-the-Bank (one-off, same time horizon)', ko['ctb'], 'hand-coins')
px, py, pw = seitenkarte(s, 'Calculation method', x=LX + tw_ + 0.3)
py = kosten_bewertung(s, px, py, pw, krit[0])
py = label(s, px, py, pw, 'Same basis for both options', size=9)
punkte(s, px, py, pw, ko['methode'], size=passend(ko['methode'], pw, BOT - py - 0.15, start=10, minimum=8, gap=0.07), gap=0.07)

s = folie('Cost comparison: run the bank', AT['kosten'], key='kosten_rtb', quellen=ko.get('quellen'))
kostentabelle(s, 'Run-the-Bank (annual, steady state)', ko['rtb'], 'repeat')
px, py, pw = seitenkarte(s, 'Swing criterion', x=LX + tw_ + 0.3)
py = kosten_bewertung(s, px, py, pw, krit[1])
ht = hoehe(ko['treiber'], 10.5, pw - 0.1, True)
rect(s, px - 0.1, py, pw + 0.2, ht + 0.55, PALE)
rect(s, px - 0.1, py, 0.05, ht + 0.55, G6)
icon(s, 'coins', px + 0.02, py + 0.1, 0.22, 'gruen', None)
tb(s, px + 0.32, py + 0.1, pw - 0.3, 0.22, 'Decisive driver', size=10, bold=True, color=DG)
tb(s, px + 0.02, py + 0.42, pw - 0.1, ht, ko['treiber'], size=10.5, bold=True, color=SW)

# ================================================================ 11 Overall picture
g = D['gesamtbild']
s = folie('Overall picture', AT['gesamtbild'], key='gesamtbild')
colw = (8.75 - 0.3) / 2
for i, (titel, keys, lg) in enumerate([('Option 1 – ' + O1, ('o1_staerken', 'o1_schwaechen', 'o1_risiken'), ['cam', 'mule']),
                                       ('Option 2 – ' + O2, ('o2_staerken', 'o2_schwaechen', 'o2_risiken'), ['sn'])]):
    x = LX + i * (colw + 0.3)
    rect(s, x, Y0, colw, 0.75, WEISS, GRAUL)
    logos(s, lg, x + 0.15, Y0 + 0.1, min(colw - 0.3, 1.25 * len(lg)), 0.32)
    tb(s, x + 0.15, Y0 + 0.47, colw - 0.3, 0.22, titel, size=10, bold=True, color=DG)
    alle_ = g[keys[0]] + g[keys[1]] + g[keys[2]]
    sz = passend(alle_, colw, BOT - Y0 - 0.95 - 3 * 0.32, start=10, minimum=8, gap=0.05, einzug=0.3)
    yy = Y0 + 0.9
    for lab, k, ic, farbe, f_ in [('Strengths', keys[0], 'circle-check-big', 'gruen', G6), ('Weaknesses', keys[1], 'circle-alert', 'orange', ORANGED),
                                  ('Risks and dependencies', keys[2], 'shield-alert', 'rot', ROT)]:
        tb(s, x, yy, colw, 0.22, lab, size=9.5, bold=True, color=f_)
        yy = punkte(s, x, yy + 0.27, colw, g[k], size=sz, gap=0.05, icon_name=ic, icon_farbe=farbe) + 0.05
px, py, pw = seitenkarte(s, 'Trade-offs and apparent contradictions', x=LX + 8.75 + 0.3)
punkte(s, px, py, pw, g['abwaegung'], size=passend(g['abwaegung'], pw, BOT - py - 0.15, start=10, minimum=8), gap=0.08)

# ================================================================ 12 Recommendation and target architecture
s = folie('Recommendation and target architecture', AT['empfehlung'], key='empfehlung',
          fuss='Logos mark the platform carrying each layer; grey boxes are existing channels and systems')
lw_ = 8.75
he = hoehe(emp['empfehlung'], 11.5, lw_ - 0.75, True)
rect(s, LX, Y0, lw_, he + 0.3, PALE)
rect(s, LX, Y0, 0.07, he + 0.3, G6)
icon(s, 'gavel', LX + 0.2, Y0 + (he + 0.3 - 0.34) / 2, 0.34)
tb(s, LX + 0.68, Y0 + 0.15, lw_ - 0.8, he, emp['empfehlung'], size=11.5, bold=True, color=SW)
y = Y0 + he + 0.3 + 0.2
ebenen = D['zielarchitektur']['ebenen']
eh = min(0.66, (BOT - y - 0.1 * (len(ebenen) - 1)) / len(ebenen))
LOGOMAP = {'ServiceNow': ['sn'], 'Camunda 8': ['cam'], 'MuleSoft system APIs': ['mule'], 'Integration Hub': ['sn']}
for i, eb in enumerate(ebenen):
    yy = y + i * (eh + 0.1)
    tb(s, LX, yy + (eh - 0.22) / 2, 1.3, 0.22, eb['ebene'], size=9.5, bold=True, color=DG)
    n_ = len(eb['bausteine'])
    bw_ = (lw_ - 1.4 - 0.12 * (n_ - 1)) / n_
    for j, bs in enumerate(eb['bausteine']):
        bx = LX + 1.4 + j * (bw_ + 0.12)
        if bs['art'] == 'neutral':
            rect(s, bx, yy, bw_, eh, rgb('E6E6E6'))
            tb(s, bx + 0.1, yy, bw_ - 0.2, eh, bs['name'], size=9.5, bold=True, color=GRAUD, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        elif bs['art'] == 'gem' and bs['name'].startswith('Customer'):
            rect(s, bx, yy, bw_, eh, DG)
            tb(s, bx + 0.1, yy + 0.06, bw_ - 0.2, eh - 0.1, [[(bs['name'], True, WEISS)], [(bs.get('zusatz', ''), False, rgb('D0E8C0'))]],
               size=9.5, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, space=0)
        else:
            rect(s, bx, yy, bw_, eh, WEISS, G6 if bs['art'] == 'cam' else (DG if bs['art'] == 'gem' else GRAUD), lw=1.25)
            lg = LOGOMAP.get(bs['name'], [])
            lh = min(0.32, eh - 0.16)
            bild(s, LOGO[lg[0]], bx + 0.12, yy + (eh - lh) / 2, 1.25, lh)
            txt = bs['name'] + (' – ' + bs['zusatz'] if bs.get('zusatz') else '')
            tb(s, bx + 1.45, yy, bw_ - 1.55, eh, txt, size=8.5, color=TEXT, anchor=MSO_ANCHOR.MIDDLE)
px, py, pw = seitenkarte(s, 'End state and scope', x=LX + lw_ + 0.3)
alle_ = [emp['zielbild']] + emp['abgrenzung'] + emp['annahmen']
sz = 10
for sz in [10, 9.5, 9, 8.5, 8]:
    need = hoehe(emp['zielbild'], sz, pw) + 0.2 + 2 * 0.3 + liste_hoehe(emp['abgrenzung'] + emp['annahmen'], pw, sz, 0.06)
    if need <= BOT - py - 0.1:
        break
h = hoehe(emp['zielbild'], sz, pw)
tb(s, px, py, pw, h, emp['zielbild'], size=sz, color=TEXT)
py += h + 0.15
py = label(s, px, py, pw, 'Scope boundaries', size=9)
py = punkte(s, px, py, pw, emp['abgrenzung'], size=sz, gap=0.06) + 0.05
py = label(s, px, py, pw, 'Assumptions', size=9)
punkte(s, px, py, pw, emp['annahmen'], size=sz, gap=0.06)

# ================================================================ 13 Archetypes
ar = D['archetypen']
s = folie('Allocation by process archetype', AT['archetypen'], key='archetypen')
ASP = [('Archetype', 2.2), ('Characteristics', 3.0), ('Decision', 2.0), ('Rationale', 2.75), ('Trigger for review', BW - 2.2 - 3.0 - 2.0 - 2.75 - 0.32)]
xs, x = [], LX
for _, w in ASP:
    xs.append(x); x += w + 0.08
y = Y0
rect(s, LX - 0.05, y, BW + 0.1, 0.36, DG)
for (n_, w), xx in zip(ASP, xs):
    tb(s, xx, y + 0.08, w, 0.25, n_, size=9.5, bold=True, color=WEISS)
y += 0.44
ENTSCH = {'Camunda': ('Retain', ['cam']), 'ServiceNow': ('Migrate', ['sn']), 'MuleSoft': ('Retain', ['mule']), 'offen': ('Review', None)}
for size in [10, 9.5, 9, 8.5, 8]:
    hs = [max(hoehe(a_['name'], size, ASP[0][1], True), hoehe(a_['merkmale'], size, ASP[1][1]), hoehe(a_['begruendung'], size, ASP[3][1]),
              hoehe(a_['ausloeser'], size, ASP[4][1]), 0.62) + 0.16 for a_ in ar]
    if sum(hs) <= BOT - y:
        break
for i, (a_, h) in enumerate(zip(ar, hs)):
    if i % 2 == 0:
        rect(s, LX - 0.05, y - 0.06, BW + 0.1, h, KARTE)
    tb(s, xs[0], y, ASP[0][1], h, a_['name'], size=size, bold=True, color=SW)
    tb(s, xs[1], y, ASP[1][1], h, a_['merkmale'], size=size, color=GRAUD)
    verb, lg = ENTSCH[a_['farbe']]
    pf = {'Retain': G6, 'Migrate': DG, 'Review': GRAU}[verb]
    r_ = rect(s, xs[2], y, 0.72, 0.26, pf, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05)
    tb(s, xs[2], y, 0.72, 0.26, verb, size=9, bold=True, color=WEISS, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    if lg:
        bild(s, LOGO[lg[0]], xs[2] + 0.82, y - 0.02, 1.15, 0.3)
    else:
        icon(s, 'circle-help', xs[2] + 0.85, y, 0.26, 'grau', None)
    zusatz = a_['plattform'].split(': ', 1)[1] if ': ' in a_['plattform'] else ''
    if zusatz:
        tb(s, xs[2], y + 0.36, ASP[2][1], h - 0.4, zusatz, size=8.5, color=GRAUD)
    elif verb == 'Review':
        tb(s, xs[2], y + 0.36, ASP[2][1], h - 0.4, a_['plattform'].replace('Review: ', ''), size=8.5, color=GRAUD)
    tb(s, xs[3], y, ASP[3][1], h, a_['begruendung'], size=size, color=TEXT)
    tb(s, xs[4], y, ASP[4][1], h, a_['ausloeser'], size=size, color=TEXT)
    y += h

# ================================================================ 14 Transition path
u = D['uebergang']
s = folie('Transition path and decision gates', AT['uebergang'], key='uebergang')
pf = u['phasen']
n = len(pf)
pw = (BW - 0.2 * (n - 1)) / n
PIC = ['list-checks', 'rocket', 'repeat', 'archive']
hp_max = max(hoehe(p['phase'], 11, pw - 0.1, True) for p in pf)
for size in [11, 10.5, 10, 9.5, 9, 8.5, 8]:
    hi_max = max(hoehe(p['inhalt'], size, pw - 0.1) for p in pf)
    ht_max = max(hoehe(p['tor'], size, pw - 0.35) for p in pf)
    if 0.55 + hp_max + 0.3 + hi_max + 0.25 + ht_max + 0.55 <= BOT - Y0:
        break
y = Y0
for i, p in enumerate(pf):
    x = LX + i * (pw + 0.2)
    rect(s, x, y, pw, 0.42, G6 if i == 0 else DG, shape=MSO_SHAPE.CHEVRON if i else MSO_SHAPE.PENTAGON)
    icon(s, PIC[i], x + (0.32 if i else 0.15), y + 0.09, 0.24, 'weiss', None)
    tb(s, x + (0.65 if i else 0.48), y + 0.02, pw - 0.9, 0.38, 'Phase %d' % (i + 1), size=11, bold=True, color=WEISS, anchor=MSO_ANCHOR.MIDDLE)
    tb(s, x, y + 0.55, pw - 0.1, hp_max, p['phase'], size=11, bold=True, color=SW)
    tb(s, x, y + 0.55 + hp_max + 0.04, pw - 0.1, 0.22, p['zeitraum'], size=10, bold=True, color=G6)
    yi = y + 0.55 + hp_max + 0.32
    tb(s, x, yi, pw - 0.1, hi_max, p['inhalt'], size=size, color=TEXT)
    yt = yi + hi_max + 0.25
    rect(s, x, yt, pw - 0.1, BOT - yt, KARTE)
    rect(s, x, yt, pw - 0.1, 0.05, DG)
    rect(s, x + 0.14, yt + 0.17, 0.2, 0.2, DG, shape=MSO_SHAPE.DIAMOND)
    tb(s, x + 0.45, yt + 0.15, pw - 0.6, 0.22, p['tor_name'], size=size, bold=True, color=DG)
    tb(s, x + 0.14, yt + 0.48, pw - 0.38, ht_max, p['tor'], size=size, color=TEXT)

# ================================================================ 15 Coexistence
s = folie('Coexistence, decommissioning and rollback', AT['koexistenz'], key='koexistenz', quellen=u.get('quellen'))
sp4 = [('Coexistence principles', u['koexistenz'], 'workflow'), ('Integration approach', u['integration'], 'network'),
       ('Decommissioning logic', u['stilllegung'], 'archive'), ('Rollback criteria', u['rueckfall'], 'undo-2')]
cw4 = (BW - 0.25 * 3) / 4
sz = min(passend(it, cw4 - 0.3, BOT - Y0 - 1.25, start=10.5, minimum=8, gap=0.08) for _, it, _ in sp4)
for i, (lab, it, ic) in enumerate(sp4):
    x = LX + i * (cw4 + 0.25)
    karte(s, x, Y0, cw4, BOT - Y0, KARTE, G6)
    icon(s, ic, x + (cw4 - 0.55) / 2, Y0 + 0.22, 0.55)
    tb(s, x + 0.1, Y0 + 0.88, cw4 - 0.2, 0.25, lab.upper(), size=10, bold=True, color=DG, align=PP_ALIGN.CENTER)
    rect(s, x + (cw4 - 0.55) / 2, Y0 + 1.18, 0.55, 0.02, G6)
    punkte(s, x + 0.15, Y0 + 1.32, cw4 - 0.3, it, size=sz, gap=0.08)

# ================================================================ 16 When another option would be preferable
s = folie('When another option would be preferable', AT['bedingungen'], key='bedingungen')
sp3 = [('Option 1 alone would be preferable if …', emp['bedingungen_o1'], ['cam', 'mule']),
       ('Full Option 2 would be preferable if …', emp['bedingungen_o2'], ['sn']),
       ('The staged model holds as long as …', emp['bedingungen_gestuft'], ['sn', 'cam'])]
cw3 = (BW - 0.3 * 2) / 3
sz = min(passend(it, cw3 - 0.4, BOT - Y0 - 1.35, start=11, minimum=8.5, gap=0.1) for _, it, _ in sp3)
for i, (lab, it, lg) in enumerate(sp3):
    x = LX + i * (cw3 + 0.3)
    karte(s, x, Y0, cw3, BOT - Y0, PALE if i == 2 else KARTE, G6 if i == 2 else GRAUL)
    logos(s, lg, x + 0.2, Y0 + 0.2, min(cw3 - 0.4, 1.4 * len(lg)), 0.4)
    tb(s, x + 0.2, Y0 + 0.75, cw3 - 0.4, 0.3, lab, size=11, bold=True, color=DG)
    rect(s, x + 0.2, Y0 + 1.12, cw3 - 0.4, 0.01, GRAUL)
    punkte(s, x + 0.2, Y0 + 1.25, cw3 - 0.4, it, size=sz, gap=0.1)

# ================================================================ 17 Implementation conditions
r = D['umsetzung']
s = folie('Implementation conditions', AT['umsetzung'], key='umsetzung', quellen=r.get('quellen'))
sp6 = [('Governance', r['governance'], 'gavel'), ('Capabilities', r['kompetenzen'], 'users'), ('Commercial prerequisites', r['kommerziell'], 'hand-coins'),
       ('Security and regulation', r['sicherheit_regulatorik'], 'shield-check'), ('Data and integration', r['daten_integration'], 'database'),
       ('Ownership', r['verantwortung'], 'flag')]
cw = (BW - 0.25 * 2) / 3
hz = (BOT - Y0 - 0.2) / 2
sz = min(passend(it, cw - 0.3, hz - 0.65, start=10, minimum=8, gap=0.06) for _, it, _ in sp6)
for i, (lab, it, ic) in enumerate(sp6):
    x = LX + (i % 3) * (cw + 0.25)
    yy = Y0 + (i // 3) * (hz + 0.2)
    karte(s, x, yy, cw, hz, KARTE, G6)
    icon(s, ic, x + 0.15, yy + 0.17, 0.34)
    tb(s, x + 0.6, yy + 0.22, cw - 0.75, 0.25, lab, size=11, bold=True, color=SW)
    punkte(s, x + 0.15, yy + 0.65, cw - 0.3, it, size=sz, gap=0.06)

# ================================================================ 18 Five actions
s = folie('Five highest-priority actions', AT['massnahmen'], key='massnahmen')
m5 = r['top5']
lw_ = 8.75
y = Y0 + 0.3
zh = (BOT - y) / len(m5)
for size in [12, 11.5, 11, 10.5, 10, 9.5]:
    if max(hoehe(m['massnahme'], size, 4.4, True) for m in m5) <= zh - 0.15 and \
       max(hoehe(m['ergebnis'], size - 1.5, 2.9) for m in m5) + 0.35 <= zh - 0.05:
        break
tb(s, LX + 0.75, Y0, 3, 0.22, 'ACTION', size=9, bold=True, color=GRAU)
tb(s, LX + 5.55, Y0, 3, 0.22, 'RESULT AND OWNER', size=9, bold=True, color=GRAU)
for i, m in enumerate(m5):
    yy = y + i * zh
    rect(s, LX, yy, 0.5, 0.5, G6 if i == 0 else DG, shape=MSO_SHAPE.OVAL)
    tb(s, LX, yy, 0.5, 0.5, str(i + 1), size=16, bold=True, color=WEISS, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    tb(s, LX + 0.75, yy + 0.03, 4.5, zh - 0.1, m['massnahme'], size=size, bold=True, color=SW)
    tb(s, LX + 5.55, yy + 0.04, 3.2, zh - 0.4, m['ergebnis'], size=size - 1.5, color=GRAUD)
    ow_ = breite(m['verantwortlich'], 8.5, True) + 0.45
    hr_ = hoehe(m['ergebnis'], size - 1.5, 3.2)
    rect(s, LX + 5.55, yy + 0.1 + hr_, ow_, 0.24, PALE, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05)
    icon(s, 'users', LX + 5.6, yy + 0.13 + hr_, 0.17, 'gruen', None)
    tb(s, LX + 5.82, yy + 0.1 + hr_, ow_ - 0.3, 0.24, m['verantwortlich'], size=8.5, bold=True, color=DG, anchor=MSO_ANCHOR.MIDDLE)
    if i < len(m5) - 1:
        rect(s, LX + 0.75, yy + zh - 0.1, lw_ - 0.75, 0.01, GRAUL)
px, py, pw = seitenkarte(s, 'Board decision required', x=LX + lw_ + 0.3)
icon(s, 'gavel', px, py, 0.4)
py += 0.6
punkte(s, px, py, pw, D['beschluss'], size=passend(D['beschluss'], pw, BOT - py - 0.15, start=11, minimum=9), gap=0.12)

# ================================================================ 19 Open questions
op = sorted(D['offene_fragen'], key=lambda o: o['prio'])
s = folie('Open questions before approval', AT['offene_fragen'], key='offene_fragen',
          fuss='If an answer to questions 1 to 4 changes the ratings listed, the recommendation must be re-tested at Gate 1')
OSP = [('Prio', 0.55), ('Question', 5.1), ('Ratings it could change', 2.4), ('Validation method', BW - 0.55 - 5.1 - 2.4 - 0.24)]
xs, x = [], LX
for _, w in OSP:
    xs.append(x); x += w + 0.08
y = Y0
rect(s, LX - 0.05, y, BW + 0.1, 0.36, DG)
for (n_, w), xx in zip(OSP, xs):
    tb(s, xx, y + 0.08, w, 0.25, n_, size=9.5, bold=True, color=WEISS)
y += 0.44
for size in [10.5, 10, 9.5, 9, 8.5, 8]:
    hs = [max(hoehe(o['frage'], size, OSP[1][1], True), hoehe(o['bewertungen'], size, OSP[2][1]), hoehe(o['methode'], size, OSP[3][1]), 0.3) + 0.12 for o in op]
    if sum(hs) <= BOT - y:
        break
for i, (o, h) in enumerate(zip(op, hs)):
    if i % 2 == 0:
        rect(s, LX - 0.05, y - 0.05, BW + 0.1, h, KARTE)
    rect(s, xs[0], y - 0.01, 0.4, 0.26, DG if o['prio'] <= 4 else GRAU, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05)
    tb(s, xs[0], y - 0.01, 0.4, 0.26, str(o['prio']), size=9.5, bold=True, color=WEISS, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    tb(s, xs[1], y, OSP[1][1], h, o['frage'], size=size, bold=True, color=SW)
    tb(s, xs[2], y, OSP[2][1], h, o['bewertungen'], size=size, color=G6)
    tb(s, xs[3], y, OSP[3][1], h, o['methode'], size=size, color=GRAUD)
    y += h

# ================================================================ 20/21 Sources
qu = D['quellen']
cw2 = (BW - 0.4) / 2
QS_ = 8

def h_q(q):
    return hoehe('%s, %s' % (q['text'], q['url']), QS_, cw2 - 0.45) + 0.06

seiten_q, akt, summe = [], [], 0
for q in qu:
    if akt and summe + h_q(q) > 2 * (BOT - Y0) - 0.4:
        seiten_q.append(akt); akt, summe = [], 0
    akt.append(q); summe += h_q(q)
seiten_q.append(akt)
for nr, teil_q in enumerate(seiten_q, 1):
    s = folie('List of sources' + (' (%d/%d)' % (nr, len(seiten_q)) if len(seiten_q) > 1 else ''), AT['quellen'],
              key='quellen' if nr == 1 else 'quellen_ende',
              fuss='Accessed October 2026; vendor statements are marked as such and must be confirmed contractually before a decision')
    ges = sum(h_q(q) for q in teil_q)
    links, summe = [], 0
    for q in teil_q:
        if summe + h_q(q) / 2 > ges / 2 and links:
            break
        links.append(q); summe += h_q(q)
    for sp, spalte_q in enumerate((links, teil_q[len(links):])):
        x = LX + sp * (cw2 + 0.4)
        yy = Y0
        for q in spalte_q:
            hq = h_q(q)
            tb(s, x, yy, 0.42, hq, q['id'], size=QS_, bold=True, color=G6)
            tb(s, x + 0.45, yy, cw2 - 0.45, hq, [[(q['text'] + ', ', False, TEXT), (q['url'], False, GRAU)]], size=QS_, space=0)
            yy += hq

# ================================================================ Schlussfolie (Standardtext aus der Deloitte-Vorlage, "proposal" -> "document")
ENDE = [
    'Deloitte refers to one or more of Deloitte Touche Tohmatsu Limited (DTTL), its global network of member firms, and their related entities '
    '(collectively, the “Deloitte organization”). DTTL (also referred to as “Deloitte Global”) and each of its member firms and related '
    'entities are legally separate and independent entities, which cannot obligate or bind each other in respect of third parties. DTTL and each '
    'DTTL member firm and related entity is liable only for its own acts and omissions, and not those of each other. DTTL does not provide '
    'services to clients. Please see www.deloitte.com/de/UeberUns to learn more.',
    'Deloitte provides industry-leading audit and assurance, tax and legal, consulting, financial advisory, and risk advisory services to nearly '
    '90% of the Fortune Global 500® and thousands of private companies; legal advisory services in Germany are provided by Deloitte Legal. Our '
    'professionals deliver measurable and lasting results that help reinforce public trust in capital markets, enable clients to transform and '
    'thrive, and lead the way toward a stronger economy, a more equitable society and a sustainable world. Building on its 175-plus year history, '
    'Deloitte spans more than 150 countries and territories. Learn how Deloitte’s approximately 457,000 people worldwide make an impact that '
    'matters at www.deloitte.com/de',
    'This document has been solely prepared for internal use. Any disclosure to third parties – in whole or in part – is subject to our '
    'prior written consent.',
]
s = prs.slides.add_slide(LAY['End slide'])
seite[0] += 1
for ph in s.placeholders:
    if ph.placeholder_format.idx == 13:
        tf = ph.text_frame
        for i, a in enumerate(ENDE):
            p_ = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            p_.add_run().text = a

# ================================================================ Agenda füllen (Foto links wie im Deloitte-Angebot, Beschluss, Kapitel mit Zweck und Zeit)
s = AGENDA_FOLIE
SEITE['agenda'] = 3
foto = s.shapes.add_picture(os.path.join(HIER, 'bilder', 'agenda_foto.jpg'), 0, 0, Inches(4.91), Inches(7.5))
spTree = s.shapes._spTree
spTree.remove(foto._element); spTree.insert(2, foto._element)
ov = open(os.path.join(HIER, 'agenda_overlay.xml'), encoding='utf-8').read().split('\n<!--SPLIT-->\n')
for k, xml in enumerate(ov):
    el = parse_xml(xml)
    el.xpath('./p:nvSpPr/p:cNvPr')[0].set('id', str(900 + k))
    spTree.insert(3 + k, el)
bild(s, os.path.join(HIER, 'bilder', 'deloitte_logo_weiss.png'), 0.12, 6.63, 3.04, 0.6)
AX = 5.28
AW = RX - AX
for ph in s.placeholders:
    if ph.placeholder_format.idx == 0:
        ph.left, ph.top, ph.width = Inches(AX), Inches(0.38), Inches(AW)
        ph.text_frame.text = 'Agenda'
tb(s, AX, 0.82, AW, 0.5, AT['agenda'], size=13, color=GRAUD)
# Beschlussvorschlag
ag_d = D['agenda']
y = 1.5
hb = sum(hoehe(b, 9.5, AW - 0.95) + 0.05 for b in D['beschluss'])
rect(s, AX, y, AW, hb + 0.5, PALE)
rect(s, AX, y, 0.06, hb + 0.5, G6)
icon(s, 'gavel', AX + 0.18, y + 0.12, 0.32)
tb(s, AX + 0.62, y + 0.12, AW - 0.8, 0.22, 'DECISION REQUESTED TODAY', size=9.5, bold=True, color=DG)
yy = y + 0.4
for b in D['beschluss']:
    h = hoehe(b, 9.5, AW - 0.95)
    rect(s, AX + 0.65, yy + 0.06, 0.06, 0.06, G6)
    tb(s, AX + 0.8, yy, AW - 0.95, h, b, size=9.5, color=TEXT)
    yy += h + 0.05
y += hb + 0.5 + 0.25
# Kopfzeile der Kapitel
KOL = [('', 0.55), ('Chapter and key message', AW - 0.55 - 0.95 - 0.6 - 0.7 - 0.3), ('Purpose', 0.95), ('Time', 0.6), ('Slides', 0.7)]
kx, x = [], AX
for _, w in KOL:
    kx.append(x); x += w + 0.075
for (n_, w), xx in zip(KOL, kx):
    tb(s, xx, y, w, 0.2, n_.upper(), size=8, bold=True, color=GRAU)
y += 0.27
rect(s, AX, y - 0.03, AW, 0.012, SW)
kap = ag_d['kapitel']
MW = KOL[1][1]
hk = [0.27 + hoehe(k['botschaft'], 9.5, MW) for k in kap]
frei = 6.62 - 0.34 - 0.12 - 0.32 - y - sum(hk)
pad = max(0.08, min(0.22, frei / len(kap)))
for k, h in zip(kap, hk):
    a_, b_ = SEITE[k['keys'][0]], SEITE[k['keys'][1]]
    y0 = y + pad / 2
    tb(s, kx[0], y0 - 0.04, 0.5, 0.4, '%d' % k['nr'], size=20, bold=True, color=G6)
    tb(s, kx[1], y0, MW, 0.24, k['titel'], size=12, bold=True, color=SW)
    tb(s, kx[1], y0 + 0.27, MW, h - 0.27, k['botschaft'], size=9.5, color=GRAUD)
    zf = {'Decide': (DG, WEISS, None), 'Discuss': (WEISS, DG, DG), 'Inform': (rgb('E6E6E6'), GRAUD, None)}[k['zweck']]
    rect(s, kx[2], y0, 0.85, 0.25, zf[0], zf[2], shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.12)
    tb(s, kx[2], y0, 0.85, 0.25, k['zweck'], size=8.5, bold=True, color=zf[1], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    tb(s, kx[3], y0 + 0.02, 0.6, 0.22, '%d min' % k['minuten'], size=9.5, color=TEXT)
    tb(s, kx[4], y0 + 0.02, 0.7, 0.22, '%d–%d' % (a_, b_), size=9.5, color=TEXT, align=PP_ALIGN.RIGHT)
    y += h + pad
    rect(s, AX, y, AW, 0.01, GRAUL)
y += 0.06
anh = ag_d['anhang']
a_, b_ = SEITE[anh['keys'][0]], SEITE.get(anh['keys'][1], SEITE[anh['keys'][0]])
tb(s, kx[1], y + 0.04, KOL[1][1], 0.24, anh['titel'], size=10, color=GRAUD)
tb(s, kx[4], y + 0.04, 0.7, 0.22, '%d–%d' % (a_, b_) if a_ != b_ else str(a_), size=9.5, color=GRAUD, align=PP_ALIGN.RIGHT)
tb(s, AX, y + 0.42, AW, 0.32, ag_d['gesamt'], size=8.5, color=GRAU)

# ================================================================ Prüfungen und Speichern
ids = {q['id'] for q in qu}
zitiert = set(re.findall(r'\bQ\d+\b', json.dumps(D, ensure_ascii=False)))
assert zitiert <= ids, sorted(zitiert - ids)
prs.save(AUS)
print('geschrieben:', os.path.abspath(AUS), '| Folien:', seite[0])
