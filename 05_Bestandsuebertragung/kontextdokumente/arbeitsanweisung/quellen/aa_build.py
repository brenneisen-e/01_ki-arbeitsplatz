# -*- coding: utf-8 -*-
"""Korrigierte Arbeitsanweisung „Bestandsübertragung an Makler Komposit_LV“ als Word-Entwurf.

Grundlage ist die bestehende AAW nach ZAV (Vorlage `vorlage_aaw.docx`): Titel, Kopftabelle,
Formatvorlagen, Seitenränder und Aufzählungszeichen bleiben erhalten, der Inhalt kommt aus
`inhalt_v1.json` bzw. `inhalt_v2.json` (Ergebnis des Entwurfs- und Prüf-Workflows).
Neue und geänderte Kapitel tragen eine farbige Kennzeichnung, dazu Änderungsübersicht und
offene Punkte am Ende.

Aufruf: python3 aa_build.py 1|2
"""
import copy, json, os, sys
import docx
from docx.enum.text import WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor, Cm

HIER = os.path.dirname(os.path.abspath(__file__))
VERSION = sys.argv[1] if len(sys.argv) > 1 else '1'
D = json.load(open(os.path.join(HIER, f'inhalt_v{VERSION}.json'), encoding='utf-8'))
NAMEN = {'1': 'AAW_BUE_Makler_Komposit_LV_V1_KI-Deckblatt_Entwurf.docx',
         '2': 'AAW_BUE_Makler_Komposit_LV_V2_Pruef-Bot_Entwurf.docx'}
AUS = os.path.join(HIER, '..', NAMEN[VERSION])

ROT = RGBColor(0xC4, 0x12, 0x30)
GRAU = RGBColor(0x59, 0x59, 0x59)
MARKE = {'neu': ('NEU', 'C41230'), 'geaendert': ('GEÄNDERT', 'B26B00')}

doc = docx.Document(os.path.join(HIER, 'vorlage_aaw.docx'))
body = doc.element.body
kinder = list(body.iterchildren())
titel_p, kopf_tbl, sect = kinder[0], kinder[1], kinder[-1]
for el in kinder[2:-1]:
    body.remove(el)

# --- Titel und Kopftabelle ---------------------------------------------------------------
tp = docx.text.paragraph.Paragraph(titel_p, doc)
for r in tp.runs[1:]:
    r._r.getparent().remove(r._r)
tp.runs[0].text = 'Bestandsübertragung an Makler Komposit_LV'
tab = doc.tables[0]


def zelle_setzen(zelle, text):
    p = zelle.paragraphs[0]
    for r in p.runs[1:]:
        r._r.getparent().remove(r._r)
    if p.runs:
        p.runs[0].text = text
    else:
        p.add_run(text)
    for extra in zelle.paragraphs[1:]:
        extra._p.getparent().remove(extra._p)


for row in tab.rows:
    zellen = row.cells
    for i, c in enumerate(zellen):
        if c.text.strip() == 'Status:' and i + 1 < len(zellen):
            zelle_setzen(zellen[i + 1], 'Entwurf')
        if c.text.startswith('Weitere'):
            zelle_setzen(zellen[i + 1], 'Projekt Makler BÜ meets KI')


# --- Bausteine -------------------------------------------------------------------------------
def neu_absatz(stil='Normal'):
    p = OxmlElement('w:p')
    sect.addprevious(p)
    par = docx.text.paragraph.Paragraph(p, doc)
    par.style = doc.styles[stil]
    return par


def lauf(par, text, bold=False, color=None, size=None, italic=False):
    r = par.add_run(text)
    r.bold = bold
    r.italic = italic
    if color is not None:
        r.font.color.rgb = color
    if size:
        r.font.size = Pt(size)
    return r


def aufzaehlung(par, ebene=0):
    pPr = par._p.get_or_add_pPr()
    numPr = OxmlElement('w:numPr')
    il = OxmlElement('w:ilvl'); il.set(qn('w:val'), str(ebene))
    ni = OxmlElement('w:numId'); ni.set(qn('w:val'), '12')     # Punkt, zweite Ebene „o“ (wie in der Vorlage)
    numPr.append(il); numPr.append(ni)
    pPr.append(numPr)


def schattierung(par_oder_zelle, farbe):
    el = par_oder_zelle._p if hasattr(par_oder_zelle, '_p') else par_oder_zelle._tc
    pr = el.get_or_add_pPr() if hasattr(par_oder_zelle, '_p') else el.get_or_add_tcPr()
    shd = OxmlElement('w:shd'); shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), farbe)
    pr.append(shd)


def rand_links(par, farbe='C41230'):
    pPr = par._p.get_or_add_pPr()
    b = OxmlElement('w:pBdr')
    l = OxmlElement('w:left'); l.set(qn('w:val'), 'single'); l.set(qn('w:sz'), '18'); l.set(qn('w:space'), '6'); l.set(qn('w:color'), farbe)
    b.append(l)
    davor = None
    for tag in ('shd', 'tabs', 'suppressAutoHyphens', 'spacing', 'ind', 'jc', 'outlineLvl', 'rPr'):
        davor = pPr.find(qn('w:' + tag))
        if davor is not None:
            break
    if davor is not None:
        davor.addprevious(b)
    else:
        pPr.append(b)


def tabelle(kopf, zeilen, breiten=None):
    t = doc.add_table(rows=1, cols=len(kopf))
    sect.addprevious(t._tbl)
    tblPr = t._tbl.tblPr
    bd = OxmlElement('w:tblBorders')
    for k in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        e = OxmlElement('w:' + k); e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), '4'); e.set(qn('w:color'), 'BFBFBF')
        bd.append(e)
    davor = None
    for tag in ('shd', 'tblLayout', 'tblCellMar', 'tblLook', 'tblCaption', 'tblDescription'):
        davor = tblPr.find(qn('w:' + tag))
        if davor is not None:
            break
    if davor is not None:
        davor.addprevious(bd)
    else:
        tblPr.append(bd)
    for i, k in enumerate(kopf):
        c = t.rows[0].cells[i]
        schattierung(c, 'E7E6E6')
        c.paragraphs[0].style = doc.styles['Tabellentext']
        lauf(c.paragraphs[0], k, bold=True, size=9)
    for z in zeilen:
        cells = t.add_row().cells
        for i in range(len(kopf)):
            c = cells[i]
            c.paragraphs[0].style = doc.styles['Tabellentext']
            lauf(c.paragraphs[0], (z[i] if i < len(z) else '') or '', size=9)
    if breiten:
        for row in t.rows:
            for i, w in enumerate(breiten):
                row.cells[i].width = Cm(w)
    neu_absatz()
    return t


def text_mit_hinweis(par, text):
    # [OFFEN: …] sichtbar hervorheben
    teile = text.split('[OFFEN')
    lauf(par, teile[0])
    for t in teile[1:]:
        ende = t.find(']')
        if ende < 0:
            lauf(par, '[OFFEN' + t)
            continue
        lauf(par, '[OFFEN' + t[:ende + 1], bold=True, color=ROT)
        lauf(par, t[ende + 1:])


# --- Kopf des Entwurfs ---------------------------------------------------------------------------
p = neu_absatz()
lauf(p, D['untertitel'], bold=True, color=ROT, size=12)
p = neu_absatz()
rand_links(p)
text_mit_hinweis(p, D['geltungshinweis'])
p = neu_absatz()
lauf(p, 'Kennzeichnung: ', bold=True, size=9)
lauf(p, 'NEU', bold=True, color=ROT, size=9)
lauf(p, ' = neues Kapitel, ', size=9)
lauf(p, 'GEÄNDERT', bold=True, color=RGBColor(0xB2, 0x6B, 0x00), size=9)
lauf(p, ' = Inhalt gegenüber der AAW vom 01.06.2024 geändert, ohne Kennzeichnung = unverändert übernommen. '
        '[OFFEN: …] markiert Punkte, die vor der Veröffentlichung zu klären sind.', size=9, color=GRAU)

# Inhaltsverzeichnis als Feld (in Word mit F9 aktualisieren)
p = neu_absatz()
lauf(p, 'Inhalt', bold=True, size=12)
p = neu_absatz()
r = p.add_run()
for typ, txt in (('begin', None), (None, 'TOC \\o "1-3" \\h \\z \\u'), ('separate', None)):
    if typ:
        e = OxmlElement('w:fldChar'); e.set(qn('w:fldCharType'), typ); r._r.append(e)
    else:
        e = OxmlElement('w:instrText'); e.set(qn('xml:space'), 'preserve'); e.text = txt; r._r.append(e)
r2 = p.add_run('Inhaltsverzeichnis: in Word mit Rechtsklick > Feld aktualisieren (F9) erzeugen.')
r2.italic = True; r2.font.color.rgb = GRAU
r3 = p.add_run(); e = OxmlElement('w:fldChar'); e.set(qn('w:fldCharType'), 'end'); r3._r.append(e)

# --- Kapitel -----------------------------------------------------------------------------------------
for k in D['kapitel']:
    stil = {1: 'Heading 1', 2: 'Heading 2', 3: 'Heading 3'}[k['ebene']]
    h = neu_absatz(stil)
    lauf(h, f"{k['nummer']} {k['titel']}".strip())
    if k.get('aenderung') in MARKE:
        txt, farbe = MARKE[k['aenderung']]
        lauf(h, f'  {txt}', bold=True, color=RGBColor.from_string(farbe), size=9)
    for b in k['bloecke']:
        art = b.get('art')
        if art == 'absatz' and b.get('text'):
            text_mit_hinweis(neu_absatz(), b['text'])
        elif art in ('punkte', 'nummern'):
            if b.get('text'):
                text_mit_hinweis(neu_absatz(), b['text'])
            for i, pt in enumerate(b.get('punkte') or []):
                ebene = 1 if pt.startswith('  ') or pt.startswith('- ') else 0
                pt = pt.strip().lstrip('- ').strip()
                par = neu_absatz('List Paragraph')
                if art == 'nummern':
                    lauf(par, f'{i + 1}. ', bold=True)
                    par.paragraph_format.left_indent = Cm(0.63)
                    par.paragraph_format.first_line_indent = Cm(-0.63)
                else:
                    aufzaehlung(par, ebene)
                text_mit_hinweis(par, pt)
        elif art == 'hinweis' and b.get('text'):
            par = neu_absatz()
            schattierung(par, 'FBE9EC')
            rand_links(par)
            lauf(par, 'Hinweis: ', bold=True, color=ROT)
            text_mit_hinweis(par, b['text'])
        elif art == 'tabelle' and b.get('kopf'):
            if b.get('text'):
                text_mit_hinweis(neu_absatz(), b['text'])
            tabelle(b['kopf'], b.get('zeilen') or [])

# --- Anhang: Änderungsübersicht, offene Punkte -------------------------------------------
h = neu_absatz('Heading 1')
lauf(h, 'Anhang A – Änderungen gegenüber der AAW vom 01.06.2024')
tabelle(['Bereich', 'Bisher', 'Neu'], [[a['bereich'], a['bisher'], a['neu']] for a in D['aenderungsuebersicht']], [3.5, 6.0, 6.5])
h = neu_absatz('Heading 1')
lauf(h, 'Anhang B – Offene Punkte vor Veröffentlichung')
for i, o in enumerate(D['offene_punkte'], 1):
    par = neu_absatz('List Paragraph')
    lauf(par, f'{i}. ', bold=True)
    par.paragraph_format.left_indent = Cm(0.63)
    par.paragraph_format.first_line_indent = Cm(-0.63)
    text_mit_hinweis(par, o)

# Fußzeile mit Entwurfsvermerk
for s in doc.sections:
    fp = s.footer.paragraphs[0] if s.footer.paragraphs else s.footer.add_paragraph()
    if 'Entwurf' not in fp.text:
        r = fp.add_run(f"Entwurf {D['untertitel']} – Stand 15.10.2026")
        r.font.size = Pt(8); r.font.color.rgb = GRAU

doc.settings.element.find(qn('w:zoom')) is not None and doc.settings.element.find(qn('w:zoom')).set(qn('w:percent'), '100')
doc.save(AUS)
print('geschrieben:', os.path.abspath(AUS))
