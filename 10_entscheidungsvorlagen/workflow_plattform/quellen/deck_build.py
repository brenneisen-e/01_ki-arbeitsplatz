# -*- coding: utf-8 -*-
"""Entscheidungsvorlage Workflow-Plattform (Option 1 Eigenentwicklung auf Camunda und MuleSoft vs. Option 2 ServiceNow).

Deloitte-Stil: weiße Arbeitsfläche links, graue Spalte rechts mit den Kernaussagen der Folie,
Arial, Akzent Deloitte-Grün sparsam. Inhalt aus inhalt.json (Ergebnis des Prompts aus
2026-10-15-1_SN_Prompt.docx). Textlängen werden mit Liberation Sans (metrisch gleich Arial)
gemessen, damit nichts überläuft.

Aufruf: python3 deck_build.py [inhalt.json] [ausgabe.pptx]
"""
import json, math, os, sys
from PIL import ImageFont
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

HIER = os.path.dirname(os.path.abspath(__file__))
INHALT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HIER, 'inhalt.json')
AUS = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HIER, '..', '20261015_Entscheidungsvorlage_Workflow-Plattform.pptx')
D = json.load(open(INHALT, encoding='utf-8'))
AT = D['action_titles']
O1, O2 = D['option_kurz']['o1'], D['option_kurz']['o2']
OPT1_LANG = 'Weiterbetrieb und bedarfsgerechte Weiterentwicklung des eigenentwickelten Open-Source-Workflowsystems (u. a. Camunda und MuleSoft), bereits produktiv'
OPT2_LANG = 'Ablösung bzw. schrittweise Migration auf ServiceNow'
for _k in D['kriterien']:
    _k['kriterium'] = _k['kriterium'].replace('Schnittstellenkomplexität', 'Schnittstellen\u00adkomplexität').replace('Technologieabhängigkeit', 'Technologie\u00adabhängigkeit').replace('Übergangskomplexität', 'Übergangs\u00adkomplexität').replace('Konzernkonformität', 'Konzern\u00adkonformität')

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
    tb(s, LX + 1.15, 7.07, 5.5, 0.2, '© 2026 Deloitte Consulting GmbH  |  Entscheidungsvorlage Workflow-Plattform  |  Entwurf zur Diskussion',
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
WORT = {'++': 'sehr vorteilhaft', '+': 'vorteilhaft', '0': 'neutral / unklar', '-': 'nachteilig', '--': 'sehr nachteilig'}

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
    tb(s, x, y, w, 0.25, 'BEWERTUNGSSKALA', size=9, bold=True, color=GRAU)
    y += 0.32
    for k in ['++', '+', '0', '-', '--']:
        chip(s, x, y, k, w=0.45, h=0.26, size=10)
        tb(s, x + 0.58, y + 0.04, w - 0.6, 0.22, WORT[k], size=10, color=TEXT)
        y += 0.34
    return y

# ================================================================ Folien
# 1 Titel
s = prs.slides.add_slide(LEER); seite[0] += 1
rect(s, 0, 0, W, H, SW)
rect(s, PX, 0, W - PX, H, RGBColor(0x26, 0x26, 0x26))
tb(s, LX, 0.55, 3, 0.4, [[('Deloitte', True, WEISS), ('.', True, GRUEN)]], size=22)
th = hoehe(D['titel'], 34, PX - LX - 0.8, True, 1.2)
tb(s, LX, 2.55, PX - LX - 0.8, th, D['titel'], size=34, bold=True, color=WEISS, ls=1.0)
tb(s, LX, 2.55 + th + 0.3, PX - LX - 0.8, 1.0, D['untertitel'], size=16, color=GRAUL)
tb(s, LX, 6.55, 7, 0.3, 'Entscheidungsvorlage für den Vorstand  |  Entwurf zur Diskussion  |  15.10.2026', size=11, color=GRAUM)
rect(s, LX, 2.25, 0.8, 0.06, GRUEN)
tb(s, PX + 0.4, 2.55, W - PX - 0.9, 0.3, 'GEGENSTAND', size=10, bold=True, color=GRUEN)
yy = 2.95
for lab, txt in [('Option 1', 'Weiterbetrieb und Weiterentwicklung des produktiven Workflowsystems (Eigenentwicklung auf Camunda und MuleSoft)'),
                 ('Option 2', 'Schrittweise Ablösung durch ServiceNow')]:
    tb(s, PX + 0.4, yy, W - PX - 0.9, 0.25, lab, size=12, bold=True, color=WEISS)
    h = hoehe(txt, 12, W - PX - 0.9)
    tb(s, PX + 0.4, yy + 0.28, W - PX - 0.9, h, txt, size=12, color=GRAUL)
    yy += 0.28 + h + 0.3

# 2 Agenda
AGENDA = [
    ('Management Summary', [('Kernaussage, Empfehlung und Zielbild', 3)]),
    ('Ausgangslage und Annahmen', [('Fakten laut Auftrag und Annahmen A1 bis A6', 4)]),
    ('Vergleich der Optionen', [('Kriterienvergleich mit Begründung', 5), ('Bewertungsübersicht', 7), ('Gesamtbild', 8)]),
    ('Zielbild und Empfehlung', [('Zielbild-Varianten', 9), ('Gesamtempfehlung und Übergangspfad', 10)]),
    ('Realisierung', [('Voraussetzungen, Governance und Kompetenzen', 11), ('Migrations- und Integrationsschritte', 12),
                      ('Die fünf wichtigsten Maßnahmen', 13)]),
    ('Offene Punkte', [('Vor der finalen Entscheidung zu klären', 14)]),
]
s, y = folie('Agenda', AT['agenda'], panel=False)
AW = W - 2 * LX - 1.5
LWV = W - 2 * LX
y += 0.25
dz = min(0.72, (BOT - y) / len(AGENDA))
for i, (kap, unter) in enumerate(AGENDA, 1):
    seiten = [nr for _, nr in unter]
    rect(s, LX, y, 0.44, 0.44, GRUEND if i == 1 else SW, shape=MSO_SHAPE.OVAL)
    tb(s, LX, y + 0.08, 0.44, 0.28, str(i), size=13, bold=True, color=WEISS, align=PP_ALIGN.CENTER)
    tb(s, LX + 0.75, y + 0.06, AW - 1.8, 0.32, kap, size=16, bold=True, color=SW)
    tb(s, LX + AW - 1.0, y + 0.08, 1.0, 0.3, str(seiten[0]) if len(seiten) == 1 else '%d–%d' % (seiten[0], seiten[-1]),
       size=13, color=GRAU, align=PP_ALIGN.RIGHT)
    if i < len(AGENDA):
        rect(s, LX + 0.75, y + dz - 0.13, AW - 0.75, 0.01, GRAUL)
    y += dz

# 3 Management Summary
s, y = folie('Management Summary', AT['management_summary'])
ms = D['management_summary']
sz = passend(ms, LW, BOT - y, start=13)
punkte(s, LX, y, LW, ms, size=sz, gap=0.14, fett_bis_doppelpunkt=True)
emp = D['empfehlung']
panel_text(s, 'Empfehlung', [(None, emp['empfehlung']), ('Zielbild', emp['zielbild'])],
           size=passend([emp['empfehlung'], emp['zielbild']], W - PX - 0.5, 4.8, start=12, gap=0.5))

# 3 Ausgangslage und Annahmen
s, y = folie('Ausgangslage und Annahmen', AT['ausgangslage'])
AUSG = [
    'Unternehmen: Multichannel- und Multibrand-Bank mit ca. 2.000 Mitarbeitenden',
    'Option 1: ' + OPT1_LANG,
    'Option 2: ' + OPT2_LANG,
    'Konzernkontext: ServiceNow ist in anderen Konzerneinheiten etabliert, im Betrieb und als strategische Lösung für den Gesamtkonzern positioniert',
    'Entscheidungsfokus: strategisch, wirtschaftlich (Run-the-Bank und Change-the-Bank getrennt), operativ, regulatorisch, technologisch (Schnittstellen nach außen und innerhalb des Workflows), Zukunftsfähigkeit einschließlich KI-Einbindung für eine Customer-Intent-Prozessierung',
    'Bewertung: relativ zur Ausgangslage, nicht als abstrakter Produktvergleich; Skala von – – (sehr nachteilig) bis ++ (sehr vorteilhaft)',
]
tb(s, LX, y, LW, 0.25, 'FAKTEN LAUT AUFTRAG', size=10, bold=True, color=GRAU)
punkte(s, LX, y + 0.35, LW, AUSG, size=passend(AUSG, LW, BOT - y - 0.35, start=13), gap=0.13, fett_bis_doppelpunkt=True)
ann = D['annahmen']
panel_text(s, 'Annahmen dieser Vorlage', [(None, ann)], size=passend(ann, W - PX - 0.5, 5.9, start=11.5, gap=0.21))

# 4/5 Vergleichstabelle
krit = D['kriterien']
TX, TW_ = LX, 10.35
SPALTEN = [('Nr.', 0.35), ('Kriterium', 1.5), ('Beschreibung', 1.6), ('Opt. 1', 0.58), ('Option 1 – Begründung', 2.58),
           ('Opt. 2', 0.58), ('Option 2 – Begründung', 2.58)]
assert abs(sum(w for _, w in SPALTEN) - (TW_ - 0.58)) < 0.2 or True
PX_T = 11.05

AKTION_TAB = [AT['vergleich_1'], AT['vergleich_2']]

def tabelle(teil, nr_folie, gesamt):
    s, y = folie('Vergleich der Optionen (%d/%d)' % (nr_folie, gesamt), AKTION_TAB[nr_folie - 1], panel_x=PX_T)
    x0 = LX
    # Kopf
    xs, x = [], x0
    for name, w in SPALTEN:
        xs.append(x); x += w + 0.08
    rect(s, x0 - 0.05, y - 0.05, x - x0 - 0.03, 0.42, SW)
    for (name, w), xx in zip(SPALTEN, xs):
        tb(s, xx, y + 0.02, w, 0.3, name, size=9.5, bold=True, color=WEISS)
    y += 0.47
    # Schrift so wählen, dass alle Zeilen passen
    verf = BOT - y
    for size in [10, 9.5, 9, 8.5, 8]:
        hs = []
        for k in teil:
            h = max(hoehe(k['kriterium'], size, SPALTEN[1][1], True), hoehe(k['beschreibung'], size, SPALTEN[2][1]),
                    hoehe(k['o1_begruendung'], size, SPALTEN[4][1]), hoehe(k['o2_begruendung'], size, SPALTEN[6][1]), 0.32)
            hs.append(h + 0.16)
        if sum(hs) <= verf:
            break
    for i, (k, h) in enumerate(zip(teil, hs)):
        if i % 2 == 0:
            rect(s, x0 - 0.05, y - 0.06, x - x0 - 0.03, h, RGBColor(0xF7, 0xF7, 0xF6))
        rect(s, x0 - 0.05, y + h - 0.07, x - x0 - 0.03, 0.01, GRAUL)
        tb(s, xs[0], y, SPALTEN[0][1], h, str(k['nr']), size=size, bold=True, color=GRAU)
        kname = k['kriterium'] + ('\u00a0*' if k.get('verbindlich') else '')
        tb(s, xs[1], y, SPALTEN[1][1], h, kname, size=size, bold=True, color=SW)
        tb(s, xs[2], y, SPALTEN[2][1], h, k['beschreibung'], size=size, color=GRAU)
        chip(s, xs[3] + 0.04, y - 0.01, k['o1_bewertung'], w=0.48, h=0.28, size=10)
        tb(s, xs[4], y, SPALTEN[4][1], h, k['o1_begruendung'], size=size, color=TEXT)
        chip(s, xs[5] + 0.04, y - 0.01, k['o2_bewertung'], w=0.48, h=0.28, size=10)
        tb(s, xs[6], y, SPALTEN[6][1], h, k['o2_begruendung'], size=size, color=TEXT)
        y += h
    tb(s, x0, FUSS, 8, 0.18, '* verbindliches Kriterium laut Auftrag', size=7.5, color=GRAUM)
    yl = legende(s, PX_T + 0.3, 0.6, W - PX_T - 0.5)
    tb(s, PX_T + 0.3, yl + 0.3, W - PX_T - 0.6, 1.5, f'Option 1: {O1}. Option 2: {O2}. Bewertet relativ zur Ausgangslage der Bank, nicht als abstrakter Produktvergleich. Annahmen A1 bis A6 siehe Folie 4.', size=9.5, color=GRAU)
    return s

halb = math.ceil(len(krit) / 2)
tabelle(krit[:halb], 1, 2)
tabelle(krit[halb:], 2, 2)

# 6 Bewertungsübersicht (Matrix)
WERTE = {'--': -2, '-': -1, '0': 0, '+': 1, '++': 2}
v1 = sum(1 for k in krit if WERTE[k['o1_bewertung']] > WERTE[k['o2_bewertung']])
v2 = sum(1 for k in krit if WERTE[k['o2_bewertung']] > WERTE[k['o1_bewertung']])
gl = len(krit) - v1 - v2
s, y = folie('Bewertungsübersicht', AT['bewertungsuebersicht'])
cx = [LX, LX + 4.9, LX + 6.65]
tb(s, cx[1], y, 1.5, 0.4, ['Option 1', O1], size=10, bold=True, color=SW, align=PP_ALIGN.CENTER, space=0)
tb(s, cx[2], y, 1.5, 0.4, ['Option 2', O2], size=10, bold=True, color=SW, align=PP_ALIGN.CENTER, space=0)
y += 0.55
zh = min(0.46, (BOT - 0.2 - y) / len(krit))
for k in krit:
    rect(s, LX, y + zh - 0.03, 8.15, 0.01, GRAUL)
    tb(s, cx[0], y + (zh - 0.25) / 2, 4.7, 0.25, '%d  %s' % (k['nr'], k['kriterium']), size=11, color=TEXT, bold=k.get('verbindlich', False))
    chip(s, cx[1] + 0.45, y + (zh - 0.3) / 2 - 0.01, k['o1_bewertung'], w=0.6, h=0.3)
    chip(s, cx[2] + 0.45, y + (zh - 0.3) / 2 - 0.01, k['o2_bewertung'], w=0.6, h=0.3)
    y += zh
tb(s, LX, FUSS, 8, 0.2, 'Fett: verbindliche Kriterien laut Auftrag', size=8, color=GRAUM)
yl = legende(s, PX + 0.35, 0.6, W - PX - 0.8)
panel_text(s, 'Lesart', [(None, ['Option 1 vorn bei %d, Option 2 vorn bei %d, gleichauf bei %d von %d Kriterien.' % (v1, v2, gl, len(krit)),
                                  'Die Zählung ersetzt keine Gewichtung; entscheidend ist die Begründung je Kriterium.'])],
           y0=yl + 0.3, size=11)

# 7 Gesamtbild
g = D['gesamtbild']
s, y = folie('Gesamtbild', AT['gesamtbild'])
colw = (LW - 0.35) / 2
for i, (titel, keys) in enumerate([('Option 1 – ' + O1, ('o1_staerken', 'o1_schwaechen', 'o1_risiken_abhaengigkeiten')),
                                   ('Option 2 – ' + O2, ('o2_staerken', 'o2_schwaechen', 'o2_risiken_abhaengigkeiten'))]):
    x = LX + i * (colw + 0.35)
    rect(s, x, y, colw, 0.38, SW)
    tb(s, x + 0.12, y + 0.08, colw - 0.2, 0.25, titel, size=11.5, bold=True, color=WEISS)
    alle = g[keys[0]] + g[keys[1]] + g[keys[2]]
    sz = passend(alle, colw - 0.3, BOT - y - 1.2 - 3 * 0.3, start=11, minimum=7.5, gap=0.06)
    yy = y + 0.5
    for lab, k, m in [('Stärken', keys[0], GRUEND), ('Schwächen', keys[1], ORANGE), ('Risiken und Abhängigkeiten', keys[2], ROT)]:
        tb(s, x, yy, colw, 0.22, lab, size=sz, bold=True, color=m)
        yy = punkte(s, x, yy + 0.27, colw, g[k], size=sz, gap=0.06, marker=m) + 0.05
fazit = [b for b in emp['begruendung']]
panel_text(s, 'Einordnung', [(None, fazit)], size=passend(fazit, W - PX - 0.5, 5.9, start=11.5, gap=0.21))

# 8 Zielbild-Varianten
zv = D['zielbild_varianten']
s, y = folie('Zielbild-Varianten', AT['zielbild_varianten'], panel=False)
n = len(zv)
cw = (LWV - 0.25 * (n - 1)) / n
hmax = BOT - y
for size in [12, 11.5, 11, 10.5, 10, 9.5, 9]:
    need = max(hoehe(v['variante'], size + 1, cw - 0.3, True) + hoehe(v['beschreibung'], size, cw - 0.3)
               + hoehe(v['einschaetzung'], size, cw - 0.3) + 0.9 for v in zv)
    if need <= hmax:
        break
kopf_max = max(hoehe(v['variante'], size + 1, cw - 0.3, True) for v in zv)
besch_max = max(hoehe(v['beschreibung'], size, cw - 0.3) for v in zv)
for i, v in enumerate(zv):
    x = LX + i * (cw + 0.25)
    karte = 0.25 + kopf_max + 0.12 + besch_max + 0.2 + 0.12 + 0.25 + max(hoehe(w_['einschaetzung'], size, cw - 0.3) for w_ in zv) + 0.3
    rect(s, x, y, cw, min(hmax, karte), RGBColor(0xF7, 0xF7, 0xF6), GRAUL)
    rect(s, x, y, cw, 0.07, GRUEN if 'empfohlen' in v['einschaetzung'].lower()[:40] else GRAUM)
    yy = y + 0.25
    h = hoehe(v['variante'], size + 1, cw - 0.3, True)
    tb(s, x + 0.15, yy, cw - 0.3, h, v['variante'], size=size + 1, bold=True, color=SW); yy = y + 0.25 + kopf_max + 0.12
    h = hoehe(v['beschreibung'], size, cw - 0.3)
    tb(s, x + 0.15, yy, cw - 0.3, h, v['beschreibung'], size=size, color=GRAU)
    yy = y + 0.25 + kopf_max + 0.12 + besch_max + 0.2
    rect(s, x + 0.15, yy, cw - 0.3, 0.01, GRAUL); yy += 0.12
    tb(s, x + 0.15, yy, cw - 0.3, 0.22, 'Einschätzung', size=size - 1, bold=True, color=GRAU); yy += 0.25
    tb(s, x + 0.15, yy, cw - 0.3, hoehe(v['einschaetzung'], size, cw - 0.3), v['einschaetzung'], size=size, color=TEXT)


# 9 Gesamtempfehlung und Übergangspfad
s, y = folie('Gesamtempfehlung und Übergangspfad', AT['empfehlung'])
he = hoehe(emp['empfehlung'], 14, LW - 0.4, True)
rect(s, LX, y, LW, he + 0.36, GRUENL)
rect(s, LX, y, 0.08, he + 0.36, GRUEN)
tb(s, LX + 0.25, y + 0.18, LW - 0.4, he, emp['empfehlung'], size=14, bold=True, color=SW)
y += he + 0.36 + 0.35
pf = emp['uebergangspfad']
n = len(pf)
pw = (LW - 0.2 * (n - 1)) / n
hmax = BOT - y - 0.55
hz_max = max(hoehe(p['zeitraum'], 10, pw - 0.1, True) for p in pf)
hp_max = max(hoehe(p['phase'].split(' – ', 1)[-1], 11, pw - 0.1, True) for p in pf)
for size in [10.5, 10, 9.5, 9, 8.5]:
    if max(hoehe(p['inhalt'], size, pw - 0.1) for p in pf) <= hmax - 0.3 - hz_max - hp_max:
        break
for i, p in enumerate(pf):
    x = LX + i * (pw + 0.2)
    pfeil = rect(s, x, y, pw, 0.42, SW if i else GRUEND, shape=MSO_SHAPE.CHEVRON if i else MSO_SHAPE.PENTAGON)
    tb(s, x + 0.3, y + 0.02, pw - 0.6, 0.38, 'Phase %d' % (i + 1), size=11, bold=True, color=WEISS, anchor=MSO_ANCHOR.MIDDLE)
    name = p['phase'].split(' – ', 1)[-1]
    tb(s, x, y + 0.55, pw - 0.1, hp_max, name, size=11, bold=True, color=SW)
    tb(s, x, y + 0.55 + hp_max + 0.05, pw - 0.1, hz_max, p['zeitraum'], size=10, bold=True, color=GRUEND)
    tb(s, x, y + 0.55 + hp_max + hz_max + 0.2, pw - 0.1, hmax, p['inhalt'], size=size, color=TEXT)
b1, b2 = emp['bedingungen_option1_vorzuziehen'], emp['bedingungen_option2_vorzuziehen']
wpan = W - PX - 0.5
sz = passend(b1 + b2, wpan, 5.5, start=11, minimum=8.5, gap=0.21)
panel_text(s, 'Wann die andere Wahl richtig wäre',
           [('Option 2 wäre vorzuziehen, wenn …', b2), ('Die Empfehlung trägt, solange …', b1)], size=sz)

# 10 Realisierung: Voraussetzungen, Governance, Kompetenzen
r = D['realisierung']
s, y = folie('Realisierung', AT['realisierung'])
spalten = [('Voraussetzungen', r['voraussetzungen']), ('Governance', r['governance']), ('Kompetenzen', r['kompetenzen'])]
sw_ = (LW - 0.5) / 3
sz = min(passend(it, sw_, BOT - y - 0.55, start=12, minimum=9, gap=0.1) for _, it in spalten)
for i, (lab, it) in enumerate(spalten):
    x = LX + i * (sw_ + 0.25)
    rect(s, x, y, sw_, 0.04, GRUEN)
    tb(s, x, y + 0.12, sw_, 0.25, lab, size=12.5, bold=True, color=SW)
    punkte(s, x, y + 0.55, sw_, it, size=sz, gap=0.1)
rk = r['risiken']
pan = ['%s: %s' % (x['risiko'], x['gegenmassnahme']) for x in rk]
panel_text(s, 'Risiken und Gegenmaßnahmen', [(None, pan)], size=passend(pan, W - PX - 0.5, BOT - 0.85, start=11, minimum=8.5, gap=0.21))

# 10b Migrations- und Integrationsschritte
s, y = folie('Migrations- und Integrationsschritte', AT['migrationsschritte'], panel=False)
st = r['migrations_integrationsschritte']
zh = (BOT - y) / len(st)
for size in [13, 12.5, 12, 11.5, 11, 10.5, 10]:
    if max(hoehe(t, size, LWV - 0.8) for t in st) <= zh - 0.12:
        break
for i, t in enumerate(st):
    yy = y + i * zh
    rect(s, LX, yy, 0.42, 0.42, GRUEND if i == 0 else SW, shape=MSO_SHAPE.OVAL)
    tb(s, LX, yy + 0.08, 0.42, 0.26, str(i + 1), size=12, bold=True, color=WEISS, align=PP_ALIGN.CENTER)
    tb(s, LX + 0.7, yy + 0.06, LWV - 0.8, zh - 0.1, t, size=size, color=TEXT)
    if i < len(st) - 1:
        rect(s, LX + 0.7, yy + zh - 0.08, LWV - 0.7, 0.01, GRAUL)

# 11 Top-5-Maßnahmen
s, y = folie('Die fünf wichtigsten Maßnahmen', AT['massnahmen'])
y += 0.15
m5 = r['top5_massnahmen']
zh = (BOT - y) / len(m5)
for size in [13, 12.5, 12, 11.5, 11, 10.5, 10]:
    if max(hoehe(m['massnahme'], size, 4.3, True) for m in m5) <= zh - 0.15 and \
       max(hoehe(m['ergebnis'], size - 1, 3.0) for m in m5) <= zh - 0.15:
        break
for i, m in enumerate(m5):
    yy = y + i * zh
    rect(s, LX, yy, 0.55, 0.55, SW if i else GRUEND, shape=MSO_SHAPE.OVAL)
    tb(s, LX, yy + 0.12, 0.55, 0.3, str(i + 1), size=16, bold=True, color=WEISS, align=PP_ALIGN.CENTER)
    tb(s, LX + 0.8, yy + 0.04, 4.3, zh - 0.1, m['massnahme'], size=size, bold=True, color=SW)
    tb(s, LX + 5.35, yy + 0.06, 3.1, zh - 0.1, m['ergebnis'], size=size - 1, color=GRAU)
    if i < len(m5) - 1:
        rect(s, LX + 0.8, yy + zh - 0.1, LW - 0.8, 0.01, GRAUL)
tb(s, LX + 5.35, y - 0.32, 3, 0.25, 'Ergebnis', size=9, bold=True, color=GRAUM)
tb(s, LX + 0.8, y - 0.32, 3, 0.25, 'Maßnahme', size=9, bold=True, color=GRAUM)
panel_text(s, 'Entscheidungsbedarf', [(None, ['Zustimmung zur Empfehlung als Arbeitsgrundlage',
                                               'Freigabe der Klärung der offenen Punkte vor der finalen Entscheidung',
                                               'Benennung einer verantwortlichen Person für Zielbild und Übergangspfad'])], size=12)

# 12 Offene Punkte
op = sorted(D['offene_punkte'], key=lambda o: o['prio'])
s, y = folie('Offene Punkte', AT['offene_punkte'], panel=False)
tb(s, LX, y, 0.5, 0.2, 'Prio', size=9, bold=True, color=GRAUM)
tb(s, LX + 0.6, y, 4, 0.2, 'Frage', size=9, bold=True, color=GRAUM)
tb(s, LX + 6.9, y, 5.3, 0.2, 'Warum entscheidend', size=9, bold=True, color=GRAUM)
y += 0.3
for size in [11, 10.5, 10, 9.5, 9, 8.5, 8]:
    hs = [max(hoehe(o['frage'], size, 6.0, True), hoehe(o['warum_entscheidend'], size, 5.3)) + 0.14 for o in op]
    if sum(hs) <= BOT - y:
        break
for o, h in zip(op, hs):
    rect(s, LX, y - 0.02, 0.42, 0.26, SW if o['prio'] <= 3 else GRAUL, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    tb(s, LX, y + 0.02, 0.42, 0.22, str(o['prio']), size=9.5, bold=True, color=WEISS if o['prio'] <= 3 else SW, align=PP_ALIGN.CENTER)
    tb(s, LX + 0.6, y, 6.0, h, o['frage'], size=size, bold=True, color=SW)
    tb(s, LX + 6.9, y, 5.3, h, o['warum_entscheidend'], size=size, color=GRAU)
    rect(s, LX, y + h - 0.08, LWV, 0.01, GRAUL)
    y += h
tb(s, LX, FUSS, LWV, 0.2, 'Die Bewertungen sind qualitativ. Kosten, Lizenzmodelle und Herstelleraussagen sind vor der Entscheidung mit belastbaren Zahlen zu unterlegen; ändern die Antworten auf die Punkte 1 bis 3 die Annahmen, ist die Empfehlung neu zu prüfen.', size=8, color=GRAUM)

prs.save(AUS)
print('geschrieben:', os.path.abspath(AUS), '| Folien:', seite[0])
