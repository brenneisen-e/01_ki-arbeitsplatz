# -*- coding: utf-8 -*-
"""Entscheidungsvorlage Workflow-Plattform, Neubewertung, als Word-Dokument (gleicher Inhalt wie die PPTX, aus inhalt_v3.json).

Minto-Aufbau: Kernaussage zuerst, jedes Kapitel beginnt mit seiner Kernbotschaft (Überschrift = Aussage),
danach Begründung und Belege. Deloitte-Stil wie doc_build.py (Aptos, Fußzeile „Copyright © Deloitte 2026“),
Vergleichstabelle im Querformat mit Beleg-Spalte, Quellenverzeichnis mit Links.
"""
import json, os, re, sys
from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor

HIER = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HIER, 'inhalt_v3.json'), encoding='utf-8'))
O1, O2 = D['option_kurz']['o1'], D['option_kurz']['o2']
AT = D['action_titles']
AUS = os.path.join(HIER, '..', '20261016_Decision_Paper_Workflow_Platform_Strategy.docx')

F = 'Aptos'
SW = RGBColor(0, 0, 0)
WEISS = RGBColor(0xFF, 0xFF, 0xFF)
GRAU = RGBColor(0x53, 0x56, 0x5A)
GRUEN = RGBColor(0x86, 0xBC, 0x25)
GRUEND = RGBColor(0x26, 0x89, 0x0D)
SKALA = {'++': ('26890D', 'FFFFFF'), '+': ('E3F0CB', '26890D'), '0': ('D0D0CE', '53565A'),
         '-': ('FCE8CC', 'A85F00'), '--': ('F8D7D4', 'DA291C')}
NB = ' '

doc = Document()
st = doc.styles['Normal']
st.font.name = F; st.font.size = Pt(10.5)
st.element.rPr.rFonts.set(qn('w:eastAsia'), F)
st.paragraph_format.space_after = Pt(6)
st.paragraph_format.line_spacing = 1.15
for name, size in [('Title', 24), ('Heading 1', 15), ('Heading 2', 12)]:
    h = doc.styles[name]
    h.font.name = F; h.font.size = Pt(size); h.font.bold = True; h.font.color.rgb = SW
    rf = h.element.rPr.find(qn('w:rFonts'))
    if rf is None:
        rf = OxmlElement('w:rFonts'); h.element.rPr.append(rf)
    for a in ('w:ascii', 'w:hAnsi', 'w:eastAsia', 'w:cs'):
        rf.set(qn(a), F)
    for a in ('w:asciiTheme', 'w:hAnsiTheme', 'w:eastAsiaTheme', 'w:cstheme'):
        if rf.get(qn(a)) is not None:
            del rf.attrib[qn(a)]
    h.paragraph_format.space_before = Pt(14 if name != 'Title' else 0)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True

sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.left_margin = sec.right_margin = Cm(2.2)
sec.top_margin, sec.bottom_margin = Cm(2.2), Cm(2.0)


def kopf_fuss(sec):
    sec.header.is_linked_to_previous = False
    sec.footer.is_linked_to_previous = False
    hp = sec.header.paragraphs[0]
    hp.text = ''
    r = hp.add_run('Deloitte'); r.bold = True; r.font.size = Pt(14); r.font.name = F
    r = hp.add_run('.'); r.bold = True; r.font.size = Pt(14); r.font.color.rgb = GRUEN; r.font.name = F
    fp = sec.footer.paragraphs[0]
    fp.text = ''
    r = fp.add_run('Copyright © Deloitte 2026  |  Decision paper: workflow-platform strategy  |  Draft for discussion  |  Page ')
    r.font.size = Pt(8); r.font.color.rgb = GRAU; r.font.name = F
    for t, txt in (('begin', None), (None, 'PAGE'), ('end', None)):
        rr = fp.add_run(); rr.font.size = Pt(8); rr.font.color.rgb = GRAU
        if t:
            e = OxmlElement('w:fldChar'); e.set(qn('w:fldCharType'), t); rr._r.append(e)
        else:
            e = OxmlElement('w:instrText'); e.set(qn('xml:space'), 'preserve'); e.text = txt; rr._r.append(e)


kopf_fuss(sec)


def schattierung(zelle, farbe):
    tcPr = zelle._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd'); shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), farbe)
    tcPr.append(shd)


def rahmen(tabelle, farbe='D0D0CE'):
    tblPr = tabelle._tbl.tblPr
    b = OxmlElement('w:tblBorders')
    for k in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        e = OxmlElement('w:' + k)
        if k in ('top', 'bottom', 'insideH'):
            e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), '4'); e.set(qn('w:color'), farbe)
        else:
            e.set(qn('w:val'), 'nil')
        b.append(e)
    nach = None
    for tag in ('w:shd', 'w:tblLayout', 'w:tblCellMar', 'w:tblLook', 'w:tblCaption', 'w:tblDescription'):
        nach = tblPr.find(qn(tag))
        if nach is not None:
            break
    if nach is not None:
        nach.addprevious(b)
    else:
        tblPr.append(b)


def kopfzeile_wiederholen(zeile):
    trPr = zeile._tr.get_or_add_trPr()
    e = OxmlElement('w:cantSplit'); e.set(qn('w:val'), 'true'); trPr.append(e)
    e = OxmlElement('w:tblHeader'); e.set(qn('w:val'), 'true'); trPr.append(e)


def nicht_teilen(zeile):
    trPr = zeile._tr.get_or_add_trPr()
    e = OxmlElement('w:cantSplit'); e.set(qn('w:val'), 'true'); trPr.append(e)


def zelltext(zelle, text, bold=False, size=9, color=None, align=None, neu=False):
    p = zelle.paragraphs[0] if not neu else zelle.add_paragraph()
    p.paragraph_format.space_after = Pt(0 if not neu else 0)
    p.paragraph_format.space_before = Pt(0 if not neu else 3)
    p.paragraph_format.line_spacing = 1.05
    if align: p.alignment = align
    r = p.add_run(text); r.bold = bold; r.font.size = Pt(size); r.font.name = F
    if color: r.font.color.rgb = color
    zelle.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
    return p


def absatz(text, bold_vor_doppelpunkt=False, style=None, color=None, size=None, bold=False):
    p = doc.add_paragraph(style=style)
    if bold_vor_doppelpunkt and ': ' in text[:70]:
        k, rest = text.split(': ', 1)
        r = p.add_run(k + ': '); r.bold = True
        r = p.add_run(rest)
    else:
        r = p.add_run(text); r.bold = bold
    if color: r.font.color.rgb = color
    if size: r.font.size = Pt(size)
    return p


def liste(items, bold_vor_doppelpunkt=True, style='List Bullet'):
    for t in items:
        p = absatz(t, bold_vor_doppelpunkt, style=style)
        p.paragraph_format.space_after = Pt(3)


def h1(t): doc.add_heading(t, level=1)
def h2(t): doc.add_heading(t, level=2)


def botschaft(t):
    """Kernbotschaft unter der Kapitelüberschrift (Minto: Antwort zuerst)."""
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run(t); r.bold = True; r.font.size = Pt(11); r.font.color.rgb = GRUEND
    return p


def tabelle(kopf, breiten, zeilen, size=9, fett=(0,)):
    t = doc.add_table(rows=1, cols=len(kopf)); t.autofit = False
    rahmen(t)
    for i, txt in enumerate(kopf):
        c = t.cell(0, i); schattierung(c, '000000')
        zelltext(c, txt, bold=True, size=size, color=WEISS)
    kopfzeile_wiederholen(t.rows[0])
    for z in zeilen:
        row = t.add_row(); nicht_teilen(row)
        for i, v in enumerate(z):
            zelltext(row.cells[i], v, bold=i in fett, size=size)
    for row in t.rows:
        for i, w in enumerate(breiten):
            row.cells[i].width = Cm(w)
    return t


def bewertungszelle(c, v):
    f, col = SKALA[v]; schattierung(c, f)
    zelltext(c, v.replace('-', '–'), bold=True, size=11, color=RGBColor.from_string(col), align=WD_ALIGN_PARAGRAPH.CENTER)
    c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


emp = D['empfehlung']
ms = D['summary']

# ---------------------------------------------------------------- Titel
p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(60)
r = p.add_run('DECISION PAPER FOR THE MANAGEMENT BOARD'); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = GRUEND
doc.add_paragraph(D['titel'], style='Title')
absatz(D['untertitel'], color=GRAU, size=13)
absatz('Draft for discussion  |  ' + D['datum'], color=GRAU, size=10)
p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(18)
r = p.add_run('Subject'); r.bold = True
liste(['%s: %s' % (lab, txt) for lab, txt in D['gegenstand']])
t = doc.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER
c = t.cell(0, 0); schattierung(c, 'E3F0CB')
zelltext(c, 'Governing answer', bold=True, size=10, color=GRUEND)
p = c.add_paragraph(); p.paragraph_format.space_after = Pt(4)
r = p.add_run(D['kernaussage']); r.bold = True; r.font.size = Pt(11)
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

# ---------------------------------------------------------------- 1 Management Summary
h1('1  ' + AT['management_summary'])
botschaft(D['kernaussage'])
h2('Problem')
liste(ms['problem'])
h2('Options')
liste(ms['optionen'])
h2('Assessment: the decisive findings')
liste(ms['bewertung'], style='List Number')
h2('Comparison and answer')
liste(ms['antwort'])
h2('Proposed resolution')
liste(D['beschluss'])

# ---------------------------------------------------------------- 2 Entscheidungsfrage und Faktenbasis
a = D['ausgangslage']
h1('2  ' + AT['ausgangslage'])
botschaft(a['entscheidung'])
h2('Why now')
liste(a['warum_jetzt'])
h2('Consequences of delay')
liste(a['folgen_verzoegerung'])
h2('Options compared')
liste(['%s: %s' % (lab, txt) for lab, txt in a['optionen']])
h2('Starting position as briefed')
liste(a['fakten_auftrag'])
fb = D['faktenbasis']
h2(AT['faktenbasis'])
for lab, key in [('Verified facts', 'fakten'), ('Evidence-based inferences', 'schluesse'),
                 ('Assumptions (to be confirmed)', 'annahmen'), ('Open questions that could change ratings', 'offen')]:
    p = absatz(lab, bold=True); p.paragraph_format.space_before = Pt(6); p.paragraph_format.keep_with_next = True
    liste(fb[key])

# ---------------------------------------------------------------- 4 Vergleichstabelle (quer)
quer = doc.add_section()
quer.orientation = WD_ORIENT.LANDSCAPE
quer.page_width, quer.page_height = Cm(29.7), Cm(21)
quer.left_margin = quer.right_margin = Cm(1.6)
kopf_fuss(quer)
h1('3  ' + AT['vergleich'])
botschaft(D['vergleich_botschaft'])
absatz(f'Option 1: {O1}  |  Option 2: {O2}  |  * mandatory criterion  |  Source references (Qn): see section 11', color=GRAU, size=9)
SP = [('No.', 0.8), ('Criterion', 2.6), ('Definition', 3.3), ('Option 1 rating', 1.5), ('Option 1 rationale', 5.0),
      ('Option 2 rating', 1.5), ('Option 2 rationale', 5.0), ('Evidence, assumption or open point', 6.8)]
tab = doc.add_table(rows=1, cols=len(SP)); tab.autofit = False
rahmen(tab)
for i, (name, w) in enumerate(SP):
    c = tab.rows[0].cells[i]; c.width = Cm(w); schattierung(c, '000000')
    zelltext(c, name, bold=True, size=8, color=WEISS)
kopfzeile_wiederholen(tab.rows[0])
for k in D['kriterien']:
    row = tab.add_row(); nicht_teilen(row)
    werte = [str(k['nr']), k['kriterium'] + (NB + '*' if k.get('verbindlich') else ''), k['definition'],
             k['o1'], k['o1_begr'], k['o2'], k['o2_begr'], k['beleg']]
    for i, (v, (name, w)) in enumerate(zip(werte, SP)):
        c = row.cells[i]; c.width = Cm(w)
        if i in (3, 5):
            bewertungszelle(c, v)
        else:
            zelltext(c, v, bold=i in (0, 1), size=8, color=GRAU if i in (2, 7) else None)
    if k.get('bestaetigung'):
        p = zelltext(row.cells[7], '', size=8, neu=True)
        r = p.add_run('To confirm: '); r.bold = True; r.font.size = Pt(8)
        r = p.add_run(k['bestaetigung']); r.font.size = Pt(8); r.font.color.rgb = GRAU
p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(6)
r = p.add_run('Scale: ++ very advantageous  |  + advantageous  |  0 neutral or unclear  |  – disadvantageous  |  – – very disadvantageous. '
              'Criteria are not equally weighted; the rationale per criterion is decisive, not the count.')
r.font.size = Pt(8.5); r.font.color.rgb = GRAU

# ---------------------------------------------------------------- zurück hochkant
hoch = doc.add_section()
hoch.orientation = WD_ORIENT.PORTRAIT
hoch.page_width, hoch.page_height = Cm(21), Cm(29.7)
hoch.left_margin = hoch.right_margin = Cm(2.2)
kopf_fuss(hoch)

# 5 Kosten
ko = D['kosten']
h1('4  ' + AT['kosten'])
botschaft(ko['treiber'])
for titel, rows in (('Change-the-Bank (one-off, same time horizon)', ko['ctb']), ('Run-the-Bank (annual, steady state)', ko['rtb'])):
    h2(titel)
    tabelle(['Cost category', 'Option 1 – ' + O1, 'Option 2 – ' + O2], [3.4, 6.6, 6.6],
            [[z['kategorie'], z['o1'], z['o2']] for z in rows], size=9)
h2('Calculation method and required inputs')
liste(ko['methode'])

# 6 Gesamtbild
g = D['gesamtbild']
h1('5  ' + AT['gesamtbild'])
botschaft(g['abwaegung'][0])
gt = doc.add_table(rows=4, cols=3); gt.autofit = False
rahmen(gt)
for i, txt in enumerate(['', 'Option 1 – ' + O1, 'Option 2 – ' + O2]):
    c = gt.cell(0, i); schattierung(c, '000000')
    zelltext(c, txt, bold=True, size=9.5, color=WEISS)
for z, (lab, k1, k2, farbe) in enumerate([('Strengths', 'o1_staerken', 'o2_staerken', GRUEND),
                                          ('Weaknesses', 'o1_schwaechen', 'o2_schwaechen', RGBColor(0xA8, 0x5F, 0x00)),
                                          ('Risks and dependencies', 'o1_risiken', 'o2_risiken', RGBColor(0xDA, 0x29, 0x1C))], 1):
    zelltext(gt.cell(z, 0), lab, bold=True, size=9.5, color=farbe)
    for sp, key in ((1, k1), (2, k2)):
        c = gt.cell(z, sp)
        for j, t_ in enumerate(g[key]):
            p = c.paragraphs[0] if j == 0 else c.add_paragraph()
            p.paragraph_format.space_after = Pt(3); p.paragraph_format.line_spacing = 1.05
            r = p.add_run('– ' + t_); r.font.size = Pt(9)
for row in gt.rows:
    for i, w in enumerate((3.0, 6.8, 6.8)):
        row.cells[i].width = Cm(w)
h2('Trade-offs and apparent contradictions')
liste(g['abwaegung'][1:])

# 7 Empfehlung und Zielarchitektur
h1('6  ' + AT['empfehlung'])
t = doc.add_table(rows=1, cols=1)
c = t.cell(0, 0); schattierung(c, 'E3F0CB')
zelltext(c, emp['empfehlung'], bold=True, size=11)
h2('Reasons')
liste(emp['begruendung'], style='List Number')
h2('End state')
absatz(emp['zielbild'])
h2('Target architecture by layer')
tabelle(['Layer', 'Components'], [3.6, 13.0],
        [[eb['ebene'], '; '.join(b['name'] + (' (' + b['zusatz'] + ')' if b.get('zusatz') else '') for b in eb['bausteine'])]
         for eb in D['zielarchitektur']['ebenen']], size=9)
h2('Scope boundaries')
liste(emp['abgrenzung'])
h2('Explicit assumptions')
liste(emp['annahmen'])
h2(AT['archetypen'])
tabelle(['Archetype', 'Characteristics', 'Decision', 'Rationale', 'Trigger for review'], [2.8, 3.6, 2.4, 4.0, 3.8],
        [[a_['name'], a_['merkmale'], a_['plattform'], a_['begruendung'], a_['ausloeser']] for a_ in D['archetypen']], size=8.5, fett=(0, 2))

# 8 Übergangspfad
u = D['uebergang']
h1('7  ' + AT['uebergang'])
botschaft(u['botschaft'])
tabelle(['Phase', 'Timing', 'Content', 'Decision gate'], [3.2, 2.4, 6.0, 5.0],
        [[p_['phase'], p_['zeitraum'], p_['inhalt'], p_['tor_name'] + ': ' + p_['tor']] for p_ in u['phasen']], size=8.5)
for lab, key in [('Coexistence principles', 'koexistenz'), ('Integration approach', 'integration'),
                 ('Decommissioning logic', 'stilllegung'), ('Rollback criteria', 'rueckfall')]:
    h2(lab)
    liste(u[key])

# 9 Bedingungen
h1('8  ' + AT['bedingungen'])
botschaft(D['bedingungen_botschaft'])
for lab, key in [('Option 1 alone would be preferable if …', 'bedingungen_o1'), ('Full Option 2 would be preferable if …', 'bedingungen_o2'),
                 ('The staged model holds as long as …', 'bedingungen_gestuft')]:
    h2(lab)
    liste(emp[key], False)

# 10 Umsetzung
r_ = D['umsetzung']
h1('9  ' + AT['umsetzung'])
botschaft(r_['botschaft'])
for lab, key in [('Governance', 'governance'), ('Capabilities', 'kompetenzen'), ('Commercial prerequisites', 'kommerziell'),
                 ('Security and regulatory work', 'sicherheit_regulatorik'), ('Data and integration preparation', 'daten_integration'), ('Ownership', 'verantwortung')]:
    h2(lab)
    liste(r_[key])
h2(AT['massnahmen'])
tabelle(['No.', 'Action', 'Result', 'Owner'], [1.0, 7.0, 5.6, 3.0],
        [[str(i), m['massnahme'], m['ergebnis'], m['verantwortlich']] for i, m in enumerate(r_['top5'], 1)], size=9, fett=(0, 1))

# 11 Offene Fragen
h1('10  ' + AT['offene_fragen'])
botschaft(D['offene_botschaft'])
tabelle(['Prio', 'Question', 'Ratings it could change', 'Validation method'], [1.1, 7.2, 3.4, 4.9],
        [[str(o['prio']), o['frage'], o['bewertungen'], o['methode']] for o in sorted(D['offene_fragen'], key=lambda o: o['prio'])],
        size=9, fett=(0, 1))

# 12 Quellen
h1('11  List of sources')
absatz('Accessed October 2026. Vendor statements are marked as such and must be confirmed contractually before a decision.', color=GRAU, size=9)
for q in D['quellen']:
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Cm(1.0); p.paragraph_format.first_line_indent = Cm(-1.0)
    r = p.add_run(q['id'] + '\t'); r.bold = True; r.font.size = Pt(9); r.font.color.rgb = GRUEND
    r = p.add_run(q['text'] + ', '); r.font.size = Pt(9)
    r = p.add_run(q['url']); r.font.size = Pt(9); r.font.color.rgb = GRAU

ids = {q['id'] for q in D['quellen']}
zitiert = set(re.findall(r'\bQ\d+\b', json.dumps(D, ensure_ascii=False)))
assert zitiert <= ids, sorted(zitiert - ids)

z = doc.settings.element.find(qn('w:zoom'))
if z is not None:
    z.set(qn('w:percent'), '100')
doc.save(AUS)
print('geschrieben:', os.path.abspath(AUS))
