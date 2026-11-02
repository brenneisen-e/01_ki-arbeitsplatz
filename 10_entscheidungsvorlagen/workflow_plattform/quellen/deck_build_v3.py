# -*- coding: utf-8 -*-
"""Entscheidungsvorlage Workflow-Plattform (Prompt vom 16.10.2026, Minto-Aufbau, englisch).

Gleicher Deloitte-Stil wie deck_build.py (schwarzer einzeiliger Titel, grauer Action Title,
graue Spalte nur wo sinnvoll, keine Schatten). Inhalt aus inhalt_v3.json: Bewertungen mit
Beleg/Annahme je Kriterium, Kostenvergleich auf gleicher Basis, Prozess-Archetypen,
Entscheidungstore, Rückfallkriterien und Quellenverzeichnis.

Aufruf: python3 deck_build_v3.py [inhalt_v3.json] [ausgabe.pptx]
"""
import json, math, os, sys
from PIL import ImageFont
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

HIER = os.path.dirname(os.path.abspath(__file__))
INHALT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HIER, 'inhalt_v3.json')
AUS = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HIER, '..', '20261016_Decision_Paper_Workflow_Platform_Strategy.pptx')
D = json.load(open(INHALT, encoding='utf-8'))
AT = D['action_titles']
O1, O2 = D['option_kurz']['o1'], D['option_kurz']['o2']
for _k in D['kriterien']:
    for _a, _b in []:
        _k['kriterium'] = _k['kriterium'].replace(_a, _b)

F = 'Arial'
SW = RGBColor(0x00, 0x00, 0x00)
TEXT = RGBColor(0x1A, 0x1A, 0x1A)
GRAU = RGBColor(0x53, 0x56, 0x5A)        # Deloitte Cool Gray 11
GRAUM = RGBColor(0x97, 0x99, 0x9B)       # Cool Gray 7
GRAUL = RGBColor(0xD0, 0xD0, 0xCE)       # Cool Gray 2
PANEL = RGBColor(0xEE, 0xEE, 0xEC)       # Spalte rechts
WEISS = RGBColor(0xFF, 0xFF, 0xFF)
GRUEN = RGBColor(0x86, 0xBC, 0x25)       # Deloitte Green
GRUEND = RGBColor(0x26, 0x89, 0x0D)      # Green 6
GRUENL = RGBColor(0xE3, 0xF0, 0xCB)
ROT = RGBColor(0xDA, 0x29, 0x1C)
ROTL = RGBColor(0xF8, 0xD7, 0xD4)
ORANGE = RGBColor(0xED, 0x8B, 0x00)
ORANGEL = RGBColor(0xFC, 0xE8, 0xCC)

W, H = 13.333, 7.5
BOT = 6.5            # Unterkante Inhalt; Fußnote bei FUSS, Fußzeile ab 7,0
FUSS = 6.68
PX = 9.55            # Beginn graue Spalte
LX = 0.55            # linker Rand
LW = PX - LX - 0.4   # Breite Arbeitsfläche

_fonts = {}
def font(size, bold=False):
    k = (round(size * 4), bold)
    if k not in _fonts:
        n = 'LiberationSans-Bold.ttf' if bold else 'LiberationSans-Regular.ttf'
        _fonts[k] = ImageFont.truetype('/usr/share/fonts/truetype/liberation/' + n, int(size * 4 * 10))
    return _fonts[k]

def breite(t, size, bold=False):
    # Zoll; Font in 40-facher Punktgröße geladen
    return font(size, bold).getlength(t) / 40 / 72

import re
NB = ' '
_SCHUTZ = [
    (r'\b(z|u|d|o)\. (B|a|h|Ä)\.', lambda m: m.group(1) + '.' + NB + m.group(2) + '.'),
    (r'\b(Nr\.|Option|Opt\.|Phase|Entscheidungspunkt|Entscheidungspunkte|Punkt|Punkte|Folie|Version|Camunda|Kriterium|Prio) (\d)', lambda m: m.group(1) + NB + m.group(2)),
    (r'\b(No\.|Gate|Gates|Art\.|Annex|archetype|archetypes|Archetype|criterion|criteria|Criterion|question|questions|ratings|step|Step|Mule|Java|ISO|SOC|Type|v|Q\d+,?) (\d)', lambda m: m.group(1) + NB + m.group(2)),
    (r'(\d) (months|years|weeks|days|employees|criteria|of)\b', lambda m: m.group(1) + NB + m.group(2)),
    (r'\b(A\d) (bis|und) (A\d)\b', lambda m: m.group(1) + NB + m.group(2) + NB + m.group(3)),
    (r'\b(ca\.|rund|bis|ab) (\d)', lambda m: m.group(1) + NB + m.group(2)),
    (r'(\d) (Monate|Monaten|Mitarbeitende|Mitarbeitenden|Kriterien|von)\b', lambda m: m.group(1) + NB + m.group(2)),
    (r' (–|-) ', lambda m: NB + m.group(1) + ' '),
    (r' (\*)', lambda m: NB + m.group(1)),
    (r'\((Nr\.|A\d)', lambda m: '(' + m.group(1)),
]
def schuetzen(t):
    t = str(t)
    for muster, f in _SCHUTZ:
        t = re.sub(muster, f, t)
    return t

def zeilen(t, size, w, bold=False):
    n = 0
    t = schuetzen(t)
    for absatz in str(t).split('\n'):
        woerter, z = absatz.replace('-', '- ').replace('/', '/ ').split(' '), ''
        n += 1
        for wort in woerter:
            probe = (z + ' ' + wort).strip()
            if breite(probe, size, bold) <= w * 0.97 or not z:
                z = probe
            else:
                n += 1
                z = wort
    return n

def hoehe(t, size, w, bold=False, ls=1.26):
    return zeilen(t, size, w, bold) * size * ls / 72

prs = Presentation()
prs.slide_width, prs.slide_height = Inches(W), Inches(H)
LEER = prs.slide_layouts[6]

def rect(s, x, y, w, h, fill, line=None, shape=MSO_SHAPE.RECTANGLE):
    r = s.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    r.fill.solid(); r.fill.fore_color.rgb = fill
    if line is None:
        r.line.fill.background()
    else:
        r.line.color.rgb = line; r.line.width = Pt(0.75)
    st = r._element.find('{http://schemas.openxmlformats.org/presentationml/2006/main}style')
    if st is not None:
        r._element.remove(st)
    return r

def tb(s, x, y, w, h, absaetze, size=12, color=TEXT, bold=False, align=PP_ALIGN.LEFT,
       anchor=MSO_ANCHOR.TOP, space=4, ls=None):
    """absaetze: str | list von str | list von list[(text, bold, color)]"""
    t = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = t.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    if isinstance(absaetze, str):
        absaetze = [absaetze]
    # Zeilen ausgleichen: schmalste Breite mit gleicher Zeilenzahl, damit die letzte Zeile nicht verwaist
    if (not bold and len(absaetze) == 1 and isinstance(absaetze[0], str) and align == PP_ALIGN.LEFT
            and '\n' not in absaetze[0] and len(absaetze[0]) > 50):
        n = zeilen(absaetze[0], size, w, bold)
        if n >= 2:
            lo, hi = w * 0.78, w
            for _ in range(12):
                mid = (lo + hi) / 2
                if zeilen(absaetze[0], size, mid, bold) == n:
                    hi = mid
                else:
                    lo = mid
            t.width = Inches(min(w, hi + 0.04))
    for i, a in enumerate(absaetze):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(space)
        if ls: p.line_spacing = ls
        teile = a if isinstance(a, list) else [(a, bold, color)]
        for txt, b, c in teile:
            r = p.add_run(); r.text = schuetzen(txt)
            r.font.name = F; r.font.size = Pt(size); r.font.bold = b; r.font.color.rgb = c
    return t

def punkte(s, x, y, w, items, size=12, color=TEXT, gap=0.09, marker=GRUEN, fett_bis_doppelpunkt=False):
    """Aufzählung mit kleinem Quadrat; gibt neue y-Position zurück."""
    for it in items:
        rect(s, x, y + size / 72 * 0.42, 0.07, 0.07, marker)
        h = hoehe(it, size, w - 0.22)
        if fett_bis_doppelpunkt and ': ' in it[:60]:
            k, r = it.split(': ', 1)
            tb(s, x + 0.22, y, w - 0.22, h, [[(k + ': ', True, color), (r, False, color)]], size=size)
        else:
            tb(s, x + 0.22, y, w - 0.22, h, it, size=size, color=color)
        y += h + gap
    return y

seite = [0]
def folie(titel, unter=None, panel=True, panel_x=PX):
    s = prs.slides.add_slide(LEER)
    seite[0] += 1
    if panel:
        rect(s, panel_x, 0, W - panel_x, H, PANEL)
    tw = (panel_x if panel else W) - LX - 0.4
    assert zeilen(titel, 24, tw, True) == 1, titel
    th = 24 * 1.2 / 72
    tb(s, LX, 0.42, tw, th, titel, size=24, bold=True, color=SW, ls=1.0)
    y = 0.42 + th + 0.1
    if unter:
        uh = hoehe(unter, 16, tw)
        tb(s, LX, y, tw, uh, unter, size=16, color=GRAU)
        y += uh
    # Fußzeile
    tb(s, LX, 7.02, 1.2, 0.25, [[('Deloitte', True, SW), ('.', True, GRUEN)]], size=13)
    tb(s, LX + 1.15, 7.07, 5.5, 0.2, '© 2026 Deloitte Consulting GmbH  |  Decision paper: workflow-platform strategy  |  Draft for discussion',
       size=7.5, color=GRAUM)
    tb(s, (panel_x if panel else W) - 0.9, 7.07, 0.5, 0.2, str(seite[0]), size=8, color=GRAUM, align=PP_ALIGN.RIGHT)
    return s, y + 0.3

def panel_text(s, titel, blocks, x=PX, y0=0.55, size=11.5):
    """Graue Spalte: Überschrift + Blöcke [(label|None, [punkte])]."""
    w = W - x - 0.5
    x += 0.35
    tb(s, x, y0, w, 0.3, titel.upper(), size=10, bold=True, color=GRAU)
    rect(s, x, y0 + 0.32, 0.5, 0.04, GRUEN)
    y = y0 + 0.55
    for label, items in blocks:
        if label:
            h = hoehe(label, size, w, True)
            tb(s, x, y, w, h, label, size=size, bold=True, color=SW)
            y += h + 0.06
        if isinstance(items, str):
            h = hoehe(items, size, w)
            tb(s, x, y, w, h, items, size=size, color=TEXT)
            y += h + 0.2
        else:
            y = punkte(s, x, y, w, items, size=size, marker=GRAU) + 0.12
    return y

def passend(items, w, hmax, start=12.0, minimum=9.0, gap=0.09):
    """größte Schrift, bei der die Aufzählung in hmax passt."""
    size = start
    while size > minimum:
        if sum(hoehe(i, size, w - 0.22) + gap for i in items) <= hmax:
            return size
        size -= 0.5
    return minimum

# ---------------------------------------------------------------- Bewertung
SKALA = {'++': (GRUEND, WEISS), '+': (GRUENL, GRUEND), '0': (GRAUL, GRAU), '-': (ORANGEL, RGBColor(0xA8, 0x5F, 0x00)), '--': (ROTL, ROT)}
WORT = {'++': 'very advantageous', '+': 'advantageous', '0': 'neutral or unclear', '-': 'disadvantageous', '--': 'very disadvantageous'}

def chip(s, x, y, wert, w=0.5, h=0.3, size=11):
    f, c = SKALA[wert]
    r = rect(s, x, y, w, h, f, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    r.adjustments[0] = 0.25
    tf = r.text_frame; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    run = p.add_run(); run.text = wert.replace('-', '–'); run.font.name = F; run.font.size = Pt(size); run.font.bold = True
    run.font.color.rgb = c

def legende(s, x, y, w):
    tb(s, x, y, w, 0.25, 'RATING SCALE', size=9, bold=True, color=GRAU)
    y += 0.32
    for k in ['++', '+', '0', '-', '--']:
        chip(s, x, y, k, w=0.45, h=0.26, size=10)
        tb(s, x + 0.58, y + 0.04, w - 0.6, 0.22, WORT[k], size=10, color=TEXT)
        y += 0.34
    return y

# ================================================================ Folien (Neubewertung)
SEITE = {}          # Kapitel-Schlüssel -> Foliennummer, für Agenda und Querverweise


def folie(titel, unter=None, panel=True, panel_x=PX, quellen=None, fuss=None, key=None):
    s = prs.slides.add_slide(LEER)
    seite[0] += 1
    if key:
        SEITE[key] = seite[0]
    if panel:
        rect(s, panel_x, 0, W - panel_x, H, PANEL)
    tw = (panel_x if panel else W) - LX - 0.4
    assert zeilen(titel, 24, tw, True) == 1, titel
    th = 24 * 1.2 / 72
    tb(s, LX, 0.42, tw, th, titel, size=24, bold=True, color=SW, ls=1.0)
    y = 0.42 + th + 0.1
    if unter:
        uh = hoehe(unter, 16, tw)
        tb(s, LX, y, tw, uh, unter, size=16, color=GRAU)
        y += uh
    # Fußnote: Quellen und Hinweise, mit Abstand zum Inhalt
    teile = []
    if fuss:
        teile.append(fuss)
    if quellen:
        teile.append('Sources: ' + ', '.join(quellen) + ' (see list of sources)')
    if teile:
        tb(s, LX, FUSS, tw, 0.2, '   |   '.join(teile), size=7.5, color=GRAUM)
    tb(s, LX, 7.02, 1.2, 0.25, [[('Deloitte', True, SW), ('.', True, GRUEN)]], size=13)
    tb(s, LX + 1.15, 7.07, 6.5, 0.2, '© 2026 Deloitte Consulting GmbH  |  Decision paper: workflow-platform strategy  |  Draft for discussion',
       size=7.5, color=GRAUM)
    tb(s, (panel_x if panel else W) - 0.9, 7.07, 0.5, 0.2, str(seite[0]), size=8, color=GRAUM, align=PP_ALIGN.RIGHT)
    return s, y + 0.3


def label(s, x, y, w, t, color=GRAU, size=10):
    tb(s, x, y, w, 0.22, t.upper(), size=size, bold=True, color=color)
    return y + 0.3


def block_hoehe(items, w, size, gap=0.09):
    return sum(hoehe(i, size, w - 0.22) + gap for i in items)


def bloecke(s, x, y, w, bloecke_, hmax, start=12.0, minimum=8.5, abstand=0.22, marker=GRUEN):
    """Mehrere beschriftete Aufzählungen untereinander mit einheitlicher, passender Schriftgröße."""
    size = start
    while size > minimum:
        need = sum(0.3 + block_hoehe(it, w, size) + abstand for _, it in bloecke_)
        if need <= hmax:
            break
        size -= 0.5
    for lab, it in bloecke_:
        y = label(s, x, y, w, lab)
        y = punkte(s, x, y, w, it, size=size, gap=0.09, marker=marker, fett_bis_doppelpunkt=True) + abstand
    return y


ANZAHL_QUELLEN = len(D['quellen'])

# ---------------------------------------------------------------- 1 Titel
s = prs.slides.add_slide(LEER); seite[0] += 1
rect(s, 0, 0, W, H, SW)
rect(s, PX, 0, W - PX, H, RGBColor(0x26, 0x26, 0x26))
tb(s, LX, 0.55, 3, 0.4, [[('Deloitte', True, WEISS), ('.', True, GRUEN)]], size=22)
th = hoehe(D['titel'], 32, PX - LX - 0.8, True, 1.2)
tb(s, LX, 2.45, PX - LX - 0.8, th, D['titel'], size=32, bold=True, color=WEISS, ls=1.0)
tb(s, LX, 2.45 + th + 0.3, PX - LX - 0.8, 1.2, D['untertitel'], size=16, color=GRAUL)
tb(s, LX, 6.55, 8, 0.3, 'Decision paper for the Management Board  |  Draft for discussion  |  ' + D['datum'], size=11, color=GRAUM)
rect(s, LX, 2.15, 0.8, 0.06, GRUEN)
tb(s, PX + 0.4, 2.45, W - PX - 0.9, 0.3, 'SUBJECT', size=10, bold=True, color=GRUEN)
yy = 2.85
for lab, txt in D['gegenstand']:
    tb(s, PX + 0.4, yy, W - PX - 0.9, 0.25, lab, size=12, bold=True, color=WEISS)
    h = hoehe(txt, 11.5, W - PX - 0.9)
    tb(s, PX + 0.4, yy + 0.28, W - PX - 0.9, h, txt, size=11.5, color=GRAUL)
    yy += 0.28 + h + 0.28

# ---------------------------------------------------------------- 2 Agenda (Inhalt am Ende, wenn die Seitenzahlen feststehen)
agenda_folie, agenda_y = folie('Agenda', AT['agenda'], panel=False)

# ---------------------------------------------------------------- 3 Executive summary (Minto: Antwort, dann Begründung)
ms = D['summary']
emp = D['empfehlung']
s, y = folie('Executive summary', AT['management_summary'], panel=False, key='summary', quellen=ms.get('quellen'))
BW = W - 2 * LX
he = hoehe(D['kernaussage'], 12.5, BW - 0.45, True)
rect(s, LX, y - 0.05, BW, he + 0.3, GRUENL)
rect(s, LX, y - 0.05, 0.07, he + 0.3, GRUEN)
tb(s, LX + 0.25, y + 0.1, BW - 0.45, he, D['kernaussage'], size=12.5, bold=True, color=SW)
y += he + 0.45
cw_ = (BW - 0.5) / 2
links = [('Problem', ms['problem']), ('Options', ms['optionen'])]
rechts = [('Assessment: decisive findings', ms['bewertung']), ('Answer: conditions, caveats, alternatives', ms['antwort'])]
size = 10.5
while size > 8.5:
    if max(sum(0.3 + block_hoehe(it, cw_, size) + 0.12 for _, it in sp) for sp in (links, rechts)) <= BOT - y:
        break
    size -= 0.5
for i, sp in enumerate((links, rechts)):
    bloecke(s, LX + i * (cw_ + 0.5), y, cw_, sp, BOT - y, start=size, minimum=size, abstand=0.12)

# ---------------------------------------------------------------- 4 Entscheidungsfrage
a = D['ausgangslage']
s, y = folie('Decision required', AT['ausgangslage'], key='ausgangslage', quellen=a.get('quellen'))
hf = hoehe(a['entscheidung'], 13, LW, True)
tb(s, LX, y, LW, hf, a['entscheidung'], size=13, bold=True, color=SW)
y += hf + 0.3
bloecke(s, LX, y, LW, [('Why now', a['warum_jetzt']), ('Consequences of delay', a['folgen_verzoegerung']),
                        ('Starting position as briefed', a['fakten_auftrag'])], BOT - y, start=12, minimum=8.5, abstand=0.14)
panel_text(s, 'Options compared', [(lab, txt) for lab, txt in a['optionen']],
           size=passend([t for _, t in a['optionen']], W - PX - 0.5, 4.9, start=11.5, minimum=9, gap=0.5))

# ---------------------------------------------------------------- 5 Faktenbasis
fb = D['faktenbasis']
s, y = folie('Evidence base', AT['faktenbasis'], panel=False, key='faktenbasis', quellen=fb.get('quellen'))
qw = (W - 2 * LX - 0.4) / 2
quad = [('Verified facts', fb['fakten'], GRUEND), ('Evidence-based inferences', fb['schluesse'], SW),
        ('Assumptions (to be confirmed)', fb['annahmen'], ORANGE), ('Open questions that could change ratings', fb['offen'], ROT)]
hz = (BOT - y - 0.25) / 2
for i, (lab, it, farbe) in enumerate(quad):
    x = LX + (i % 2) * (qw + 0.4)
    yy = y + (i // 2) * (hz + 0.25)
    rect(s, x, yy, qw, 0.04, farbe)
    tb(s, x, yy + 0.1, qw, 0.25, lab, size=12, bold=True, color=SW)
    sz = passend(it, qw, hz - 0.5, start=10.5, minimum=8, gap=0.06)
    punkte(s, x, yy + 0.45, qw, it, size=sz, gap=0.06, marker=farbe, fett_bis_doppelpunkt=True)

# ---------------------------------------------------------------- 7–9 Kriterienvergleich
krit = D['kriterien']
SPALTEN = [('No.', 0.28), ('Criterion', 1.3), ('Definition', 1.5), ('Opt. 1', 0.5), ('Option 1 rationale', 2.45),
           ('Opt. 2', 0.5), ('Option 2 rationale', 2.45), ('Evidence, assumption or open point', 2.55)]
TBR = sum(w for _, w in SPALTEN) + 0.08 * (len(SPALTEN) - 1)
TEILE = D.get('tabellen_aufteilung', [4, 3, 3])


def tabelle(teil, nr, gesamt):
    qs = sorted({q for k in teil for q in k.get('quellen', [])}, key=lambda q: int(q[1:]))
    s, y = folie('Comparison of options (%d/%d)' % (nr, gesamt), AT['vergleich_%d' % nr], panel=False,
                 key='vergleich' if nr == 1 else None, quellen=qs,
                 fuss='* mandatory criterion  |  Scale: ++ very advantageous, + advantageous, 0 neutral or unclear, – disadvantageous, – – very disadvantageous')
    xs, x = [], LX
    for _, w in SPALTEN:
        xs.append(x); x += w + 0.08
    rect(s, LX - 0.05, y - 0.05, TBR + 0.1, 0.4, SW)
    for (n_, w), xx in zip(SPALTEN, xs):
        tb(s, xx, y + 0.03, w, 0.3, n_, size=9, bold=True, color=WEISS)
    y += 0.45
    for size in [9.5, 9, 8.5, 8]:
        hs = []
        for k in teil:
            beleg = k['beleg'] + ('\nTo confirm: ' + k['bestaetigung'] if k.get('bestaetigung') else '')
            h = max(hoehe(k['kriterium'], size, SPALTEN[1][1], True), hoehe(k['definition'], size, SPALTEN[2][1]),
                    hoehe(k['o1_begr'], size, SPALTEN[4][1]), hoehe(k['o2_begr'], size, SPALTEN[6][1]),
                    hoehe(beleg, size - 0.5, SPALTEN[7][1]), 0.32)
            hs.append(h + 0.16)
        if sum(hs) <= BOT - y:
            break
    for i, (k, h) in enumerate(zip(teil, hs)):
        if i % 2 == 0:
            rect(s, LX - 0.05, y - 0.06, TBR + 0.1, h, RGBColor(0xF7, 0xF7, 0xF6))
        tb(s, xs[0], y, SPALTEN[0][1], h, str(k['nr']), size=size, bold=True, color=GRAU)
        tb(s, xs[1], y, SPALTEN[1][1], h, k['kriterium'] + (' *' if k.get('verbindlich') else ''), size=size, bold=True, color=SW)
        tb(s, xs[2], y, SPALTEN[2][1], h, k['definition'], size=size, color=GRAU)
        chip(s, xs[3] + 0.02, y - 0.01, k['o1'], w=0.46, h=0.27, size=10)
        tb(s, xs[4], y, SPALTEN[4][1], h, k['o1_begr'], size=size, color=TEXT)
        chip(s, xs[5] + 0.02, y - 0.01, k['o2'], w=0.46, h=0.27, size=10)
        tb(s, xs[6], y, SPALTEN[6][1], h, k['o2_begr'], size=size, color=TEXT)
        par = [[('', False, GRAU), (k['beleg'], False, GRAU)]]
        if k.get('bestaetigung'):
            par.append([('To confirm: ', True, SW), (k['bestaetigung'], False, GRAU)])
        tb(s, xs[7], y, SPALTEN[7][1], h, par, size=size - 0.5, space=3)
        y += h
    return s


i0 = 0
for nr, n_ in enumerate(TEILE, 1):
    tabelle(krit[i0:i0 + n_], nr, len(TEILE))
    i0 += n_
assert i0 == len(krit)

# ---------------------------------------------------------------- 10 Bewertungsübersicht
WERTE = {'--': -2, '-': -1, '0': 0, '+': 1, '++': 2}
v1 = sum(1 for k in krit if WERTE[k['o1']] > WERTE[k['o2']])
v2 = sum(1 for k in krit if WERTE[k['o2']] > WERTE[k['o1']])
gl = len(krit) - v1 - v2
s, y = folie('Rating overview', AT['bewertungsuebersicht'], key='uebersicht',
             fuss='Bold: mandatory criteria')
cx = [LX, LX + 4.6, LX + 6.55]
tb(s, cx[1], y, 1.8, 0.4, ['Option 1', O1], size=10, bold=True, color=SW, align=PP_ALIGN.CENTER, space=0)
tb(s, cx[2], y, 1.8, 0.4, ['Option 2', O2], size=10, bold=True, color=SW, align=PP_ALIGN.CENTER, space=0)
y += 0.6
zh = min(0.46, (BOT - 0.15 - y) / len(krit))
for k in krit:
    rect(s, LX, y + zh - 0.03, 8.5, 0.01, GRAUL)
    tb(s, cx[0], y + (zh - 0.25) / 2, 4.5, 0.25, '%d  %s' % (k['nr'], k['kriterium'].replace('­', '')), size=10.5, color=TEXT,
       bold=k.get('verbindlich', False))
    for sp, key in ((1, 'o1'), (2, 'o2')):
        chip(s, cx[sp] + 0.6, y + (zh - 0.3) / 2 - 0.01, k[key], w=0.6, h=0.3)
    y += zh
yl = legende(s, PX + 0.35, 0.6, W - PX - 0.8)
panel_text(s, 'How to read', [(None, ['Option 1 ahead on %d, Option 2 ahead on %d, level on %d of %d criteria.' % (v1, v2, gl, len(krit))]
                          + D['uebersicht_lesart'])], y0=yl + 0.25,
           size=passend(D['uebersicht_lesart'], W - PX - 0.5, BOT - yl - 1.2, start=11, minimum=8.5, gap=0.21))

# ---------------------------------------------------------------- 11 Kosten auf gleicher Basis
ko = D['kosten']
s, y = folie('Cost comparison on the same basis', AT['kosten'], key='kosten', quellen=ko.get('quellen'))
KSP = [('Cost category', 1.75), ('Option 1 – ' + O1, 3.1), ('Option 2 – ' + O2, 3.25)]
kx = [LX, LX + KSP[0][1] + 0.1, LX + KSP[0][1] + KSP[1][1] + 0.2]
alle = ko['ctb'] + ko['rtb']
for size in [9.5, 9, 8.5, 8, 7.5]:
    hs = [max(hoehe(z['kategorie'], size, KSP[0][1] - 0.1, True), hoehe(z['o1'], size, KSP[1][1] - 0.15), hoehe(z['o2'], size, KSP[2][1] - 0.15)) + 0.1 for z in alle]
    if sum(hs) + 2 * 0.62 <= BOT - y:
        break
idx = 0
for titel, rows in (('Change-the-Bank (one-off, same time horizon)', ko['ctb']), ('Run-the-Bank (annual, steady state)', ko['rtb'])):
    rect(s, LX - 0.05, y - 0.04, LW + 0.05, 0.32, SW)
    tb(s, LX, y, LW, 0.25, titel, size=10, bold=True, color=WEISS)
    y += 0.36
    for z in rows:
        h = hs[idx]; idx += 1
        tb(s, kx[0], y, KSP[0][1], h, z['kategorie'], size=size, bold=True, color=SW)
        tb(s, kx[1], y, KSP[1][1], h, z['o1'], size=size, color=TEXT)
        tb(s, kx[2], y, KSP[2][1], h, z['o2'], size=size, color=TEXT)
        rect(s, LX, y + h - 0.05, LW, 0.01, GRAUL)
        y += h
    y += 0.2
panel_text(s, 'Calculation method', [(None, ko['methode']), ('Decisive driver', ko['treiber'])],
           size=passend(ko['methode'] + [ko['treiber']], W - PX - 0.5, 5.6, start=11, minimum=8.5, gap=0.21))

# ---------------------------------------------------------------- 12 Gesamtbild
g = D['gesamtbild']
s, y = folie('Overall picture', AT['gesamtbild'], key='gesamtbild')
colw = (LW - 0.35) / 2
for i, (titel, keys) in enumerate([('Option 1 – ' + O1, ('o1_staerken', 'o1_schwaechen', 'o1_risiken')),
                                   ('Option 2 – ' + O2, ('o2_staerken', 'o2_schwaechen', 'o2_risiken'))]):
    x = LX + i * (colw + 0.35)
    rect(s, x, y, colw, 0.38, SW)
    tb(s, x + 0.12, y + 0.08, colw - 0.2, 0.25, titel, size=11.5, bold=True, color=WEISS)
    alle = g[keys[0]] + g[keys[1]] + g[keys[2]]
    sz = passend(alle, colw - 0.3, BOT - y - 1.2 - 3 * 0.3, start=11, minimum=7.5, gap=0.06)
    yy = y + 0.5
    for lab, k, m in [('Strengths', keys[0], GRUEND), ('Weaknesses', keys[1], ORANGE), ('Risks and dependencies', keys[2], ROT)]:
        tb(s, x, yy, colw, 0.22, lab, size=sz, bold=True, color=m)
        yy = punkte(s, x, yy + 0.27, colw, g[k], size=sz, gap=0.06, marker=m) + 0.05
panel_text(s, 'Trade-offs and apparent contradictions', [(None, g['abwaegung'])],
           size=passend(g['abwaegung'], W - PX - 0.5, 5.9, start=11, minimum=8.5, gap=0.21))

# ---------------------------------------------------------------- 13 Empfehlung und Zielarchitektur
s, y = folie('Recommendation and target architecture', AT['empfehlung'], key='empfehlung',
             fuss='Black: ServiceNow  |  green: Camunda  |  dark grey: shared by both platforms  |  light grey: existing systems and channels')
he = hoehe(emp['empfehlung'], 13, LW - 0.4, True)
rect(s, LX, y, LW, he + 0.34, GRUENL)
rect(s, LX, y, 0.08, he + 0.34, GRUEN)
tb(s, LX + 0.25, y + 0.17, LW - 0.4, he, emp['empfehlung'], size=13, bold=True, color=SW)
y += he + 0.34 + 0.3
# Zielarchitektur als Schichtenbild
ZA = D['zielarchitektur']
ebenen = ZA['ebenen']
eh = min(0.78, (BOT - y - 0.15 * (len(ebenen) - 1)) / len(ebenen))
for i, eb in enumerate(ebenen):
    yy = y + i * (eh + 0.15)
    tb(s, LX, yy + (eh - 0.42) / 2, 1.45, 0.42, eb['ebene'], size=9.5, bold=True, color=GRAU)
    n_ = len(eb['bausteine'])
    bw = (LW - 1.6 - 0.15 * (n_ - 1)) / n_
    for j, bs in enumerate(eb['bausteine']):
        bx = LX + 1.6 + j * (bw + 0.15)
        farbe = {'sn': SW, 'cam': GRUEND, 'gem': RGBColor(0x53, 0x56, 0x5A), 'neutral': GRAUL}[bs['art']]
        txtc = SW if bs['art'] == 'neutral' else WEISS
        rect(s, bx, yy, bw, eh, farbe)
        hz_ = hoehe(bs['name'], 10, bw - 0.2, True) + (hoehe(bs['zusatz'], 8.5, bw - 0.2) if bs.get('zusatz') else 0)
        tb(s, bx + 0.1, yy + max(0.05, (eh - hz_) / 2), bw - 0.2, hz_, [[(bs['name'], True, txtc)]] +
           ([[(bs['zusatz'], False, txtc if bs['art'] == 'neutral' else GRAUL)]] if bs.get('zusatz') else []),
           size=10, space=0, align=PP_ALIGN.CENTER)
        # Größe der Zusatzzeile anpassen
        sh = s.shapes[-1]
        if bs.get('zusatz'):
            for r in sh.text_frame.paragraphs[1].runs:
                r.font.size = Pt(8.5)
panel_text(s, 'End state and scope', [(None, emp['zielbild']), ('Scope boundaries', emp['abgrenzung']), ('Assumptions', emp['annahmen'])],
           size=passend([emp['zielbild']] + emp['abgrenzung'] + emp['annahmen'], W - PX - 0.5, 5.3, start=11, minimum=8, gap=0.21))

# ---------------------------------------------------------------- 14 Prozess-Archetypen
ar = D['archetypen']
s, y = folie('Allocation by process archetype', AT['archetypen'], panel=False, key='archetypen')
ASP = [('Archetype', 2.3), ('Characteristics', 3.3), ('Decision', 1.75), ('Rationale', 2.6), ('Trigger for review', W - 2 * LX - 2.3 - 3.3 - 1.75 - 2.6 - 0.32)]
xs, x = [], LX
for _, w in ASP:
    xs.append(x); x += w + 0.08
rect(s, LX - 0.05, y - 0.05, W - 2 * LX + 0.05, 0.36, SW)
for (n_, w), xx in zip(ASP, xs):
    tb(s, xx, y + 0.02, w, 0.25, n_, size=9.5, bold=True, color=WEISS)
y += 0.42
for size in [10.5, 10, 9.5, 9, 8.5, 8]:
    hs = [max(hoehe(a_['name'], size, ASP[0][1], True), hoehe(a_['merkmale'], size, ASP[1][1]), hoehe(a_['begruendung'], size, ASP[3][1]),
              hoehe(a_['ausloeser'], size, ASP[4][1]), 0.5) + 0.16 for a_ in ar]
    if sum(hs) <= BOT - y:
        break
PLF = {'ServiceNow': SW, 'Camunda': GRUEND, 'MuleSoft': RGBColor(0x53, 0x56, 0x5A), 'offen': GRAUL}
for i, (a_, h) in enumerate(zip(ar, hs)):
    if i % 2 == 0:
        rect(s, LX - 0.05, y - 0.06, W - 2 * LX + 0.05, h, RGBColor(0xF7, 0xF7, 0xF6))
    tb(s, xs[0], y, ASP[0][1], h, a_['name'], size=size, bold=True, color=SW)
    tb(s, xs[1], y, ASP[1][1], h, a_['merkmale'], size=size, color=GRAU)
    f_ = PLF.get(a_['farbe'], GRAUL)
    hp = max(0.3, hoehe(a_['plattform'], 9, ASP[2][1] - 0.1, True) + 0.1)
    r_ = rect(s, xs[2], y - 0.02, ASP[2][1], hp, f_, shape=MSO_SHAPE.ROUNDED_RECTANGLE); r_.adjustments[0] = 0.2
    tb(s, xs[2] + 0.05, y + 0.03, ASP[2][1] - 0.1, hp - 0.08, a_['plattform'], size=9, bold=True,
       color=SW if a_['farbe'] == 'offen' else WEISS, align=PP_ALIGN.CENTER)
    tb(s, xs[3], y, ASP[3][1], h, a_['begruendung'], size=size, color=TEXT)
    tb(s, xs[4], y, ASP[4][1], h, a_['ausloeser'], size=size, color=TEXT)
    y += h

# ---------------------------------------------------------------- 15 Übergangspfad mit Entscheidungstoren
u = D['uebergang']
s, y = folie('Transition path and decision gates', AT['uebergang'], panel=False, key='uebergang')
pf = u['phasen']
n = len(pf)
pw = (W - 2 * LX - 0.2 * (n - 1)) / n
hp_max = max(hoehe(p['phase'], 11, pw - 0.1, True) for p in pf)
hz_max = max(hoehe(p['zeitraum'], 10, pw - 0.1, True) for p in pf)
hmax = BOT - y - 0.55 - hp_max - hz_max - 0.25
for size in [10.5, 10, 9.5, 9, 8.5, 8]:
    need = max(hoehe(p['inhalt'], size, pw - 0.1) + 0.45 + hoehe(p['tor'], size, pw - 0.25) for p in pf)
    if need <= hmax:
        break
hi_max = max(hoehe(p['inhalt'], size, pw - 0.1) for p in pf)
for i, p in enumerate(pf):
    x = LX + i * (pw + 0.2)
    rect(s, x, y, pw, 0.42, SW if i else GRUEND, shape=MSO_SHAPE.CHEVRON if i else MSO_SHAPE.PENTAGON)
    tb(s, x + 0.3, y + 0.02, pw - 0.6, 0.38, 'Phase %d' % (i + 1), size=11, bold=True, color=WEISS, anchor=MSO_ANCHOR.MIDDLE)
    tb(s, x, y + 0.55, pw - 0.1, hp_max, p['phase'], size=11, bold=True, color=SW)
    tb(s, x, y + 0.55 + hp_max + 0.04, pw - 0.1, hz_max, p['zeitraum'], size=10, bold=True, color=GRUEND)
    yi = y + 0.55 + hp_max + hz_max + 0.2
    tb(s, x, yi, pw - 0.1, hi_max, p['inhalt'], size=size, color=TEXT)
    yt = yi + hi_max + 0.2
    ht = hoehe(p['tor'], size, pw - 0.25)
    rect(s, x, yt, pw - 0.1, ht + 0.42, RGBColor(0xF7, 0xF7, 0xF6), GRAUL)
    d_ = rect(s, x + 0.12, yt + 0.1, 0.2, 0.2, ROT, shape=MSO_SHAPE.DIAMOND)
    tb(s, x + 0.4, yt + 0.08, pw - 0.6, 0.22, p['tor_name'], size=size, bold=True, color=SW)
    tb(s, x + 0.12, yt + 0.36, pw - 0.35, ht, p['tor'], size=size, color=TEXT)

# ---------------------------------------------------------------- 16 Koexistenz, Stilllegung, Rückfall
s, y = folie('Coexistence, decommissioning and rollback', AT['koexistenz'], panel=False, key='koexistenz', quellen=u.get('quellen'))
sp4 = [('Coexistence principles', u['koexistenz']), ('Integration approach', u['integration']),
       ('Decommissioning logic', u['stilllegung']), ('Rollback criteria', u['rueckfall'])]
cw4 = (W - 2 * LX - 0.3 * 3) / 4
sz = min(passend(it, cw4, BOT - y - 0.55, start=11.5, minimum=8, gap=0.1) for _, it in sp4)
for i, (lab, it) in enumerate(sp4):
    x = LX + i * (cw4 + 0.3)
    rect(s, x, y, cw4, 0.04, GRUEN)
    tb(s, x, y + 0.12, cw4, 0.25, lab, size=12, bold=True, color=SW)
    punkte(s, x, y + 0.55, cw4, it, size=sz, gap=0.1, fett_bis_doppelpunkt=True)

# ---------------------------------------------------------------- 17 Bedingungen für andere Optionen
s, y = folie('When another option would be preferable', AT['bedingungen'], panel=False, key='bedingungen')
sp3 = [('Option 1 alone would be preferable if …', emp['bedingungen_o1'], GRUEND),
       ('Full Option 2 would be preferable if …', emp['bedingungen_o2'], SW),
       ('The staged model holds as long as …', emp['bedingungen_gestuft'], GRAU)]
cw3 = (W - 2 * LX - 0.35 * 2) / 3
sz = min(passend(it, cw3, BOT - y - 0.6, start=12, minimum=8.5, gap=0.12) for _, it, _ in sp3)
for i, (lab, it, farbe) in enumerate(sp3):
    x = LX + i * (cw3 + 0.35)
    rect(s, x, y, cw3, 0.04, farbe)
    tb(s, x, y + 0.12, cw3, 0.3, lab, size=12, bold=True, color=SW)
    punkte(s, x, y + 0.6, cw3, it, size=sz, gap=0.12, marker=farbe)

# ---------------------------------------------------------------- 18 Umsetzungsbedingungen
r = D['umsetzung']
s, y = folie('Implementation conditions', AT['umsetzung'], panel=False, key='umsetzung', quellen=r.get('quellen'))
sp6 = [('Governance', r['governance']), ('Capabilities', r['kompetenzen']), ('Commercial prerequisites', r['kommerziell']),
       ('Security and regulation', r['sicherheit_regulatorik']), ('Data and integration', r['daten_integration']), ('Ownership', r['verantwortung'])]
cw = (W - 2 * LX - 0.3 * 2) / 3
hz = (BOT - y - 0.25) / 2
sz = min(passend(it, cw, hz - 0.45, start=11, minimum=8, gap=0.07) for _, it in sp6)
for i, (lab, it) in enumerate(sp6):
    x = LX + (i % 3) * (cw + 0.3)
    yy = y + (i // 3) * (hz + 0.25)
    rect(s, x, yy, cw, 0.04, GRUEN)
    tb(s, x, yy + 0.1, cw, 0.25, lab, size=11.5, bold=True, color=SW)
    punkte(s, x, yy + 0.45, cw, it, size=sz, gap=0.07)

# ---------------------------------------------------------------- 19 Top-5-Maßnahmen
s, y = folie('Five highest-priority actions', AT['massnahmen'], key='massnahmen')
y += 0.15
m5 = r['top5']
zh = (BOT - y) / len(m5)
for size in [12.5, 12, 11.5, 11, 10.5, 10, 9.5]:
    if max(hoehe(m['massnahme'], size, 4.3, True) for m in m5) <= zh - 0.15 and \
       max(hoehe(m['ergebnis'], size - 1, 3.0) + hoehe(m['verantwortlich'], size - 1.5, 3.0) for m in m5) <= zh - 0.1:
        break
for i, m in enumerate(m5):
    yy = y + i * zh
    rect(s, LX, yy, 0.55, 0.55, SW if i else GRUEND, shape=MSO_SHAPE.OVAL)
    tb(s, LX, yy + 0.12, 0.55, 0.3, str(i + 1), size=16, bold=True, color=WEISS, align=PP_ALIGN.CENTER)
    tb(s, LX + 0.8, yy + 0.04, 4.3, zh - 0.1, m['massnahme'], size=size, bold=True, color=SW)
    tb(s, LX + 5.35, yy + 0.06, 3.1, zh - 0.1, [[(m['ergebnis'], False, GRAU)], [('Owner: ' + m['verantwortlich'], True, GRUEND)]],
       size=size - 1, space=3)
    if i < len(m5) - 1:
        rect(s, LX + 0.8, yy + zh - 0.1, LW - 0.8, 0.01, GRAUL)
tb(s, LX + 5.35, y - 0.32, 3, 0.25, 'Result', size=9, bold=True, color=GRAUM)
tb(s, LX + 0.8, y - 0.32, 3, 0.25, 'Action', size=9, bold=True, color=GRAUM)
panel_text(s, 'Board decision required', [(None, D['beschluss'])], size=passend(D['beschluss'], W - PX - 0.5, 5.6, start=12, minimum=9, gap=0.21))

# ---------------------------------------------------------------- 20 Offene Fragen
op = sorted(D['offene_fragen'], key=lambda o: o['prio'])
s, y = folie('Open questions before approval', AT['offene_fragen'], panel=False, key='offene_fragen',
             fuss='If an answer to questions 1 to 4 changes the ratings listed, the recommendation must be re-tested at Gate 1')
OSP = [('Prio', 0.45), ('Question', 5.0), ('Ratings it could change', 2.55), ('Validation method', W - 2 * LX - 0.45 - 5.0 - 2.55 - 0.24)]
xs, x = [], LX
for _, w in OSP:
    xs.append(x); x += w + 0.08
for (n_, w), xx in zip(OSP, xs):
    tb(s, xx, y, w, 0.2, n_, size=9, bold=True, color=GRAUM)
y += 0.3
for size in [10.5, 10, 9.5, 9, 8.5, 8]:
    hs = [max(hoehe(o['frage'], size, OSP[1][1], True), hoehe(o['bewertungen'], size, OSP[2][1]), hoehe(o['methode'], size, OSP[3][1])) + 0.14 for o in op]
    if sum(hs) <= BOT - y:
        break
for o, h in zip(op, hs):
    rect(s, LX, y - 0.02, 0.42, 0.26, SW if o['prio'] <= 4 else GRAUL, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tb(s, LX, y + 0.02, 0.42, 0.22, str(o['prio']), size=9.5, bold=True, color=WEISS if o['prio'] <= 4 else SW, align=PP_ALIGN.CENTER)
    tb(s, xs[1], y, OSP[1][1], h, o['frage'], size=size, bold=True, color=SW)
    tb(s, xs[2], y, OSP[2][1], h, o['bewertungen'], size=size, color=GRUEND)
    tb(s, xs[3], y, OSP[3][1], h, o['methode'], size=size, color=GRAU)
    rect(s, LX, y + h - 0.08, W - 2 * LX, 0.01, GRAUL)
    y += h

# ---------------------------------------------------------------- 21 Quellen (bei Bedarf auf mehrere Folien verteilt)
qu = D['quellen']
cw2 = (W - 2 * LX - 0.4) / 2
QS = 8


def h_q(q):
    return hoehe('%s, %s' % (q['text'], q['url']), QS, cw2 - 0.45) + 0.06


seiten_q, akt, hoehe_akt = [], [], 0
verf = 2 * (BOT - 1.55)
for q in qu:
    if akt and hoehe_akt + h_q(q) > verf - 0.4:
        seiten_q.append(akt); akt, hoehe_akt = [], 0
    akt.append(q); hoehe_akt += h_q(q)
seiten_q.append(akt)
for nr, teil_q in enumerate(seiten_q, 1):
    titel = 'List of sources' + (' (%d/%d)' % (nr, len(seiten_q)) if len(seiten_q) > 1 else '')
    s, y = folie(titel, AT['quellen'], panel=False, key='quellen' if nr == 1 else 'quellen_ende',
                 fuss='Accessed October 2026; vendor statements are marked as such and must be confirmed contractually before a decision')
    # in zwei Spalten mit ausgeglichener Höhe aufteilen
    ges = sum(h_q(q) for q in teil_q)
    links, summe = [], 0
    for q in teil_q:
        if summe + h_q(q) / 2 > ges / 2 and links:
            break
        links.append(q); summe += h_q(q)
    rechts = teil_q[len(links):]
    for sp, spalte_q in enumerate((links, rechts)):
        x = LX + sp * (cw2 + 0.4)
        yy = y
        for q in spalte_q:
            hq = h_q(q)
            tb(s, x, yy, 0.42, hq, q['id'], size=QS, bold=True, color=GRUEND)
            tb(s, x + 0.45, yy, cw2 - 0.45, hq, [[(q['text'] + ', ', False, TEXT), (q['url'], False, GRAU)]], size=QS, space=0)
            yy += hq
        assert yy <= BOT + 0.05, ('Quellenspalte zu lang', yy)

# ---------------------------------------------------------------- Agenda füllen
AGENDA = [
    ('Executive summary and decision required', 'summary', 'ausgangslage'),
    ('Evidence base', 'faktenbasis', 'faktenbasis'),
    ('Comparison of options', 'vergleich', 'gesamtbild'),
    ('Recommendation, target architecture and archetypes', 'empfehlung', 'archetypen'),
    ('Transition path, coexistence and alternative conditions', 'uebergang', 'bedingungen'),
    ('Implementation, priority actions and open questions', 'umsetzung', 'offene_fragen'),
    ('List of sources', 'quellen', 'quellen_ende'),
]
s, y = agenda_folie, agenda_y
AW = W - 2 * LX - 1.5
y += 0.15
dz = min(0.68, (BOT - y) / len(AGENDA))
for i, (kap, k1, k2) in enumerate(AGENDA, 1):
    a_, b_ = SEITE[k1], SEITE.get(k2, SEITE[k1])
    rect(s, LX, y, 0.44, 0.44, GRUEND if i == 1 else SW, shape=MSO_SHAPE.OVAL)
    tb(s, LX, y + 0.08, 0.44, 0.28, str(i), size=13, bold=True, color=WEISS, align=PP_ALIGN.CENTER)
    tb(s, LX + 0.75, y + 0.06, AW - 1.8, 0.32, kap, size=16, bold=True, color=SW)
    tb(s, LX + AW - 1.0, y + 0.08, 1.0, 0.3, str(a_) if a_ == b_ else '%d–%d' % (a_, b_), size=13, color=GRAU, align=PP_ALIGN.RIGHT)
    if i < len(AGENDA):
        rect(s, LX + 0.75, y + dz - 0.13, AW - 0.75, 0.01, GRAUL)
    y += dz

# Quellenangaben: alle zitierten Kennungen müssen im Verzeichnis stehen
import re as _re
ids = {q['id'] for q in qu}
zitiert = set(_re.findall(r'\bQ\d+\b', json.dumps(D, ensure_ascii=False)))
fehlt = zitiert - ids
assert not fehlt, 'Sources missing from list: %s' % sorted(fehlt)

prs.save(AUS)
print('geschrieben:', os.path.abspath(AUS), '| Folien:', seite[0])
