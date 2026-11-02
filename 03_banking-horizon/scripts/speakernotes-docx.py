#!/usr/bin/env python3
"""Setzt die Speakernotes (Markdown) als DOCX für den Vortrag.

Aufruf: python3 scripts/speakernotes-docx.py [quelle.md] [ziel.docx]
Braucht python-docx (pip install python-docx). Gleiche Gliederung wie das PDF
aus scripts/speakernotes-pdf.mjs: Seite 1 mit Rahmen, Ablauf und Vorbereitung,
dann der Sprechtext mit Zeitmarken, Regieanweisungen und Kundenbeispielen,
zuletzt der Anhang „Zahlen für Rückfragen“.
"""
import datetime
import pathlib
import re
import sys

from docx import Document
from docx.enum.text import WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

WURZEL = pathlib.Path(__file__).resolve().parent.parent
QUELLE = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else WURZEL / 'docs' / 'speakernotes-vortrag-markt-vertrieb.md'
ZIEL = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else QUELLE.with_suffix('.docx')

INK = RGBColor(0x1C, 0x1A, 0x17)
INK2 = RGBColor(0x4A, 0x46, 0x40)
INK3 = RGBColor(0x7A, 0x74, 0x6B)
AKZENT = RGBColor(0x04, 0x6A, 0x38)
LINIE = 'D9D5CD'
TINT = 'F3F1EC'
SCHRIFT = 'Aptos'
MONO = 'Consolas'
TEXTBREITE = Cm(17)
ZAHL = r'\d[\d.]*(?: bis \d[\d.]*)? (?:Prozent|Euro|Bankkunden)'

# Reihenfolge der Kinder von w:pPr bzw. w:tcPr laut Schema, damit Word die
# Datei nicht als beschädigt meldet.
NACH_PBDR = ('w:shd', 'w:tabs', 'w:suppressAutoHyphens', 'w:kinsoku', 'w:wordWrap', 'w:overflowPunct',
             'w:topLinePunct', 'w:autoSpaceDE', 'w:autoSpaceDN', 'w:bidi', 'w:adjustRightInd', 'w:snapToGrid',
             'w:spacing', 'w:ind', 'w:contextualSpacing', 'w:mirrorIndents', 'w:suppressOverlap', 'w:jc',
             'w:textDirection', 'w:textAlignment', 'w:textboxTightWrap', 'w:outlineLvl', 'w:divId',
             'w:cnfStyle', 'w:rPr', 'w:sectPr', 'w:pPrChange')
NACH_SHD = NACH_PBDR[1:]
NACH_TCBORDERS = ('w:shd', 'w:noWrap', 'w:tcMar', 'w:textDirection', 'w:tcFitText', 'w:vAlign', 'w:hideMark')


# Sätze trennen für die Stichpunkt-Darstellung (gleiche Regeln wie in
# scripts/speakernotes-pdf.mjs und src/notizen/parse.ts).
ZWEITEILIG = ['z. B.', 'u. a.', 'd. h.', 'o. Ä.', 'i. d. R.']
ABKUERZUNG = re.compile(r'(?:\bbzw|\bca|\bDr|\bProf|\bNr|\bMio|\bMrd|\bTsd|\bvs|\betc|\binkl|\bggf|\bevtl|\bsog|\busw|z\.\u00a0B|u\.\u00a0a|d\.\u00a0h|o\.\u00a0Ä|i\.\u00a0d\.\u00a0R)\.$')
SATZENDE = re.compile(r'[.!?][“”"’)]?\s+(?=[„"“(\[A-ZÄÖÜ0-9])')


def saetze(text):
    s = text
    for a in ZWEITEILIG:
        s = s.replace(a, a.replace(' ', '\u00a0'))
    roh, pos = [], 0
    for m in SATZENDE.finditer(s):
        ende = m.start() + 1 + (1 if m.group(0)[1] in '“”"’)' else 0)
        roh.append(s[pos:ende].strip())
        pos = m.end()
    roh.append(s[pos:].strip())
    out = []
    for x in roh:
        if out and ABKUERZUNG.search(out[-1]):
            out[-1] = out[-1] + ' ' + x
        else:
            out.append(x)
    res = []
    for x in out:
        if res and len(x.split()) < 4:
            res[-1] = res[-1] + ' ' + x
        else:
            res.append(x)
    return [x.replace('\u00a0', ' ') for x in res if x]


def stichpunkte(doc, text, schattiert=False):
    for satz in saetze(text):
        a = doc.add_paragraph(style='List Bullet')
        a.paragraph_format.space_after = Pt(9)
        a.paragraph_format.line_spacing = 1.25
        a.paragraph_format.keep_together = True
        if schattiert:
            schattierung(a, TINT)
        runs(a, satz, zahlen=True, groesse=12)


def in_bloecke(text):
    z = text.split('\n')
    out = []
    i = 0
    while i < len(z):
        l = z[i]
        if not l.strip():
            i += 1
            continue
        if l.startswith('# '):
            out.append(('h1', l[2:].strip()))
            i += 1
            continue
        if l.startswith('## '):
            out.append(('h2', l[3:].strip()))
            i += 1
            continue
        if l.strip() == '---':
            out.append(('hr', None))
            i += 1
            continue
        if l.startswith('|'):
            zeilen = []
            while i < len(z) and z[i].startswith('|'):
                if not re.match(r'^\|\s*-', z[i]):
                    zeilen.append([c.strip() for c in z[i].strip().strip('|').split('|')])
                i += 1
            out.append(('tabelle', zeilen))
            continue
        if l.startswith('- '):
            punkte = []
            while i < len(z) and (z[i].startswith('- ') or z[i].startswith('  ')):
                if z[i].startswith('- '):
                    punkte.append(z[i][2:].strip())
                else:
                    punkte[-1] += ' ' + z[i].strip()
                i += 1
            out.append(('liste', punkte))
            continue
        teile = []
        while i < len(z) and z[i].strip() and not re.match(r'^(#{1,2} |\||- |---$)', z[i]):
            teile.append(z[i].strip())
            i += 1
        out.append(('p', ' '.join(teile)))
    return out


def setze_schrift(run, name):
    run.font.name = name
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn('w:rFonts'))
    if rfonts is None:
        rfonts = OxmlElement('w:rFonts')
        rpr.insert(0, rfonts)
    for k in ('w:ascii', 'w:hAnsi', 'w:eastAsia', 'w:cs'):
        rfonts.set(qn(k), name)


def runs(absatz, text, zahlen=False, groesse=None, farbe=None, fett=False):
    muster = r'(`[^`]+`|\*\*[^*]+\*\*' + (r'|' + ZAHL if zahlen else '') + r'|https?://[^\s)]+)'
    for teil in re.split(muster, text):
        if not teil:
            continue
        if teil.startswith('http'):
            hyperlink(absatz, teil, groesse)
            continue
        r = absatz.add_run()
        if teil.startswith('`'):
            r.text = teil[1:-1]
            setze_schrift(r, MONO)
        elif teil.startswith('**'):
            r.text = teil[2:-2]
            r.bold = True
        elif zahlen and re.fullmatch(ZAHL, teil):
            r.text = teil
            r.bold = True
        else:
            r.text = teil
        if groesse:
            r.font.size = Pt(groesse)
        if farbe is not None:
            r.font.color.rgb = farbe
        if fett:
            r.bold = True
    return absatz


def hyperlink(absatz, url, groesse=None):
    teil = absatz.part
    r_id = teil.relate_to(url, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink', is_external=True)
    h = OxmlElement('w:hyperlink')
    h.set(qn('r:id'), r_id)
    r = OxmlElement('w:r')
    rpr = OxmlElement('w:rPr')
    farbe = OxmlElement('w:color')
    farbe.set(qn('w:val'), '7A746B')
    rpr.append(farbe)
    if groesse:
        sz = OxmlElement('w:sz')
        sz.set(qn('w:val'), str(int(groesse * 2)))
        rpr.append(sz)
    u = OxmlElement('w:u')
    u.set(qn('w:val'), 'single')
    rpr.append(u)
    r.append(rpr)
    t = OxmlElement('w:t')
    t.text = url
    t.set(qn('xml:space'), 'preserve')
    r.append(t)
    h.append(r)
    absatz._p.append(h)


def schattierung(absatz, farbe):
    ppr = absatz._p.get_or_add_pPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), farbe)
    ppr.insert_element_before(shd, *NACH_SHD)


def rand(absatz, seiten, farbe=LINIE, breite=12, art='single', abstand=8):
    ppr = absatz._p.get_or_add_pPr()
    pbdr = OxmlElement('w:pBdr')
    for seite in seiten:
        b = OxmlElement(f'w:{seite}')
        b.set(qn('w:val'), art)
        b.set(qn('w:sz'), str(breite))
        b.set(qn('w:space'), str(abstand))
        b.set(qn('w:color'), farbe)
        pbdr.append(b)
    ppr.insert_element_before(pbdr, *NACH_PBDR)


def zellrand_unten(zelle, farbe=LINIE, breite=4):
    tcpr = zelle._tc.get_or_add_tcPr()
    borders = OxmlElement('w:tcBorders')
    b = OxmlElement('w:bottom')
    b.set(qn('w:val'), 'single')
    b.set(qn('w:sz'), str(breite))
    b.set(qn('w:space'), '0')
    b.set(qn('w:color'), farbe)
    borders.append(b)
    tcpr.insert_element_before(borders, *NACH_TCBORDERS)


def zellabsatz(zelle, text, groesse=10.5, farbe=INK2, fett=False, mono=False, rechts=False, zahlen=False):
    a = zelle.paragraphs[0]
    a.paragraph_format.space_before = Pt(3)
    a.paragraph_format.space_after = Pt(3)
    if rechts:
        a.alignment = 2
    runs(a, text, zahlen=zahlen, groesse=groesse, farbe=farbe, fett=fett)
    if mono:
        for r in a.runs:
            setze_schrift(r, MONO)
    return a


def seitenzahl(absatz):
    for art in ('begin', 'instr', 'end'):
        r = absatz.add_run()
        r.font.size = Pt(8)
        r.font.color.rgb = INK3
        if art == 'instr':
            it = OxmlElement('w:instrText')
            it.set(qn('xml:space'), 'preserve')
            it.text = ' PAGE '
            r._r.append(it)
        else:
            fc = OxmlElement('w:fldChar')
            fc.set(qn('w:fldCharType'), art)
            r._r.append(fc)


def etikett(doc, text):
    a = doc.add_paragraph()
    a.paragraph_format.space_before = Pt(12)
    a.paragraph_format.space_after = Pt(2)
    a.paragraph_format.keep_with_next = True
    r = a.add_run(text.upper())
    r.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = INK3
    return a


# ---------- Quelle lesen ----------
md = QUELLE.read_text(encoding='utf-8')
if '—' in md:
    raise SystemExit('Em-Dash im Quelltext')
teile = [[]]
for b in in_bloecke(md):
    if b[0] == 'hr':
        teile.append([])
    else:
        teile[-1].append(b)
if len(teile) < 3:
    raise SystemExit('Erwartet werden zwei Trennlinien (---) im Quelltext')
vorspann, rede, anhang = teile[:3]
titel = next((t for typ, t in vorspann if typ == 'h1'), 'Speakernotes')
MARKE = re.compile(r'^(\d+:\d\d)\s+(.+?)\s+\((.+)\)$')
ablauf = [m.groups() for typ, t in rede if typ == 'h2' for m in [MARKE.match(t)] if m]

# ---------- Dokument ----------
doc = Document()
doc.core_properties.title = titel
doc.core_properties.author = 'Eike Brenneisen'
doc.core_properties.language = 'de-DE'
abschnitt = doc.sections[0]
abschnitt.page_width, abschnitt.page_height = Cm(21), Cm(29.7)
abschnitt.left_margin = abschnitt.right_margin = Cm(2)
abschnitt.top_margin, abschnitt.bottom_margin = Cm(1.8), Cm(2)

normal = doc.styles['Normal']
normal.font.name = SCHRIFT
normal.font.size = Pt(11.5)
normal.font.color.rgb = INK
normal.element.rPr.rFonts.set(qn('w:eastAsia'), SCHRIFT)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.25
for name, groesse, farbe in (('Heading 1', 14, INK), ('Heading 2', 9.5, INK3)):
    st = doc.styles[name]
    st.font.name = SCHRIFT
    st.font.size = Pt(groesse)
    st.font.bold = True
    st.font.color.rgb = farbe
    st.element.rPr.rFonts.set(qn('w:eastAsia'), SCHRIFT)
    st.paragraph_format.keep_with_next = True
doc.styles['Heading 1'].paragraph_format.space_before = Pt(18)
doc.styles['Heading 1'].paragraph_format.space_after = Pt(6)
doc.styles['Heading 2'].font.all_caps = True
doc.styles['Heading 2'].paragraph_format.space_before = Pt(12)
doc.styles['Heading 2'].paragraph_format.space_after = Pt(2)

fuss = abschnitt.footer.paragraphs[0]
fuss.paragraph_format.tab_stops.add_tab_stop(TEXTBREITE, WD_TAB_ALIGNMENT.RIGHT)
r = fuss.add_run('Banking Horizon · Speakernotes Markt & Vertrieb\t')
r.font.size = Pt(8)
r.font.color.rgb = INK3
seitenzahl(fuss)

# Seite 1: Titel, Rahmen, Ablauf, Vorbereitung
a = doc.add_paragraph()
a.paragraph_format.space_after = Pt(2)
r = a.add_run(titel)
r.bold = True
r.font.size = Pt(20)
a = doc.add_paragraph()
stand = datetime.date.today().strftime('%d.%m.%Y')
runs(a, f'Vortragsfassung, Stand {stand}', groesse=10.5, farbe=INK3)

ablauf_gesetzt = False


def ablauf_tabelle():
    if not ablauf:
        return
    doc.add_heading('Ablauf', level=2)
    t = doc.add_table(rows=0, cols=3)
    t.autofit = False
    for marke, tit, dauer in ablauf:
        zeile = t.add_row().cells
        zeile[0].width, zeile[1].width, zeile[2].width = Cm(1.6), Cm(12.4), Cm(3)
        zellabsatz(zeile[0], marke, farbe=AKZENT, fett=True, mono=True)
        zellabsatz(zeile[1], tit)
        zellabsatz(zeile[2], dauer, farbe=INK3, rechts=True)
        for z in zeile:
            zellrand_unten(z)


for typ, inhalt in vorspann:
    if typ == 'h1':
        continue
    if typ == 'p' and inhalt.startswith('Rahmen: '):
        doc.add_heading('Rahmen', level=2)
        runs(doc.add_paragraph(), inhalt[8:], groesse=10.5, farbe=INK2)
        continue
    if typ == 'p' and inhalt == 'Vorbereitung:':
        if not ablauf_gesetzt:
            ablauf_tabelle()
            ablauf_gesetzt = True
        doc.add_heading('Vorbereitung', level=2)
        continue
    if typ == 'liste':
        for p in inhalt:
            a = doc.add_paragraph(style='List Bullet')
            a.paragraph_format.space_after = Pt(2)
            runs(a, p, groesse=10.5, farbe=INK2)
        continue
    if typ == 'p':
        runs(doc.add_paragraph(), inhalt, groesse=10.5, farbe=INK2)
if not ablauf_gesetzt:
    ablauf_tabelle()

# Sprechtext
doc.add_page_break()
erster = True
for typ, inhalt in rede:
    if typ == 'h2':
        m = MARKE.match(inhalt)
        h = doc.add_heading('', level=1)
        if erster:
            h.paragraph_format.space_before = Pt(0)
            erster = False
        rand(h, ('top',), farbe='1C1A17', breite=12, abstand=6)
        if m:
            r = h.add_run(m.group(1) + '   ')
            r.font.color.rgb = AKZENT
            r.font.size = Pt(11.5)
            setze_schrift(r, MONO)
            h.add_run(m.group(2))
            r = h.add_run('   ' + m.group(3))
            r.bold = False
            r.font.size = Pt(9.5)
            r.font.color.rgb = INK3
        else:
            h.add_run(inhalt)
        continue
    if typ != 'p':
        continue
    t = inhalt
    if re.fullmatch(r'\[[^\]]*\]', t):
        a = doc.add_paragraph()
        a.paragraph_format.left_indent = Cm(0.4)
        a.paragraph_format.space_before = Pt(6)
        a.paragraph_format.keep_with_next = True
        rand(a, ('left',), breite=12, abstand=6)
        runs(a, t[1:-1], groesse=10, farbe=INK3)
        for r in a.runs:
            r.italic = True
        continue
    m = re.match(r'^\[([^\]]*)\]\s*(.+)$', t)
    if m:
        a = doc.add_paragraph()
        a.paragraph_format.space_after = Pt(2)
        a.paragraph_format.keep_with_next = True
        optional = m.group(1).startswith('Optional')
        if not optional:
            schattierung(a, TINT)
        r = a.add_run(m.group(1).rstrip('.:').upper())
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = AKZENT
        stichpunkte(doc, m.group(2), schattiert=not optional)
        continue
    if re.match(r'^Die (erste|zweite|dritte) Hypothese:', t):
        # Titelzeile einer Hypothese: betont und beim folgenden Absatz
        a = doc.add_paragraph()
        a.paragraph_format.space_after = Pt(9)
        a.paragraph_format.keep_with_next = True
        runs(a, t, zahlen=True, groesse=12, fett=True)
        continue
    stichpunkte(doc, t)

# Anhang
doc.add_page_break()
for typ, inhalt in anhang:
    if typ == 'h2':
        h = doc.add_heading(inhalt, level=1)
        h.paragraph_format.space_before = Pt(0)
        rand(h, ('top',), farbe='1C1A17', breite=12, abstand=6)
    elif typ == 'p':
        runs(doc.add_paragraph(), inhalt, groesse=10, farbe=INK2)
    elif typ == 'liste':
        for p in inhalt:
            a = doc.add_paragraph(style='List Bullet')
            a.paragraph_format.space_after = Pt(2)
            runs(a, p, groesse=10, farbe=INK2)
    elif typ == 'tabelle':
        kopf, *zeilen = inhalt
        t = doc.add_table(rows=0, cols=len(kopf))
        t.autofit = False
        breiten = [Cm(13), Cm(4)] if len(kopf) == 2 else [TEXTBREITE / len(kopf)] * len(kopf)
        z = t.add_row().cells
        for i, c in enumerate(kopf):
            z[i].width = breiten[i]
            zellabsatz(z[i], c, groesse=10, farbe=INK, fett=True, rechts=(i == len(kopf) - 1))
            zellrand_unten(z[i], farbe='1C1A17', breite=8)
        for zeile in zeilen:
            z = t.add_row().cells
            for i, c in enumerate(zeile):
                z[i].width = breiten[i]
                zellabsatz(z[i], c, groesse=10, mono=(i == len(kopf) - 1), rechts=(i == len(kopf) - 1))
                zellrand_unten(z[i])
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

doc.save(ZIEL)
print(f'DOCX geschrieben: {ZIEL}')
