# -*- coding: utf-8 -*-
"""Entscheidungsvorlage Workflow-Plattform als Word-Dokument (gleicher Inhalt wie die PPTX, aus inhalt.json).

Deloitte-Stil: Aptos, Schwarz mit Deloitte-Grün als Akzent, Fußzeile „Copyright © Deloitte 2026“,
Vergleichstabelle im Querformat, Bewertungen als farbige Zellen mit Zeichen (nicht nur Farbe).
"""
import json, os, sys
from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor

HIER = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HIER, 'inhalt.json'), encoding='utf-8'))
O1, O2 = D['option_kurz']['o1'], D['option_kurz']['o2']
AUS = os.path.join(HIER, '..', '20261015_Entscheidungsvorlage_Workflow-Plattform.docx')

F = 'Aptos'
SW = RGBColor(0, 0, 0)
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
for name, size, color in [('Title', 24, SW), ('Heading 1', 16, SW), ('Heading 2', 12.5, SW)]:
    h = doc.styles[name]
    h.font.name = F; h.font.size = Pt(size); h.font.bold = True; h.font.color.rgb = color
    h.element.rPr.rFonts.set(qn('w:asciiTheme'), '') if False else None
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
    r = fp.add_run('Copyright © Deloitte 2026  |  Entscheidungsvorlage Workflow-Plattform  |  Entwurf zur Diskussion  |  Seite ')
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
    e = OxmlElement('w:tblHeader'); e.set(qn('w:val'), 'true'); trPr.append(e)
    e = OxmlElement('w:cantSplit'); e.set(qn('w:val'), 'true'); trPr.append(e)


def nicht_teilen(zeile):
    trPr = zeile._tr.get_or_add_trPr()
    e = OxmlElement('w:cantSplit'); e.set(qn('w:val'), 'true'); trPr.append(e)


def zelltext(zelle, text, bold=False, size=9, color=None, align=None):
    p = zelle.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    if align: p.alignment = align
    r = p.add_run(text); r.bold = bold; r.font.size = Pt(size); r.font.name = F
    if color: r.font.color.rgb = color
    zelle.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
    return r


def absatz(text, bold_vor_doppelpunkt=False, style=None, color=None, size=None):
    p = doc.add_paragraph(style=style)
    if bold_vor_doppelpunkt and ': ' in text[:60]:
        k, rest = text.split(': ', 1)
        r = p.add_run(k + ': '); r.bold = True
        r = p.add_run(rest)
    else:
        r = p.add_run(text)
    if color: r.font.color.rgb = color
    if size: r.font.size = Pt(size)
    return p


def liste(items, bold_vor_doppelpunkt=False):
    for t in items:
        p = absatz(t, bold_vor_doppelpunkt, style='List Bullet')
        p.paragraph_format.space_after = Pt(3)


def h1(t): doc.add_heading(t, level=1)
def h2(t): doc.add_heading(t, level=2)


# ---------------------------------------------------------------- Titel
p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(60)
r = p.add_run('ENTSCHEIDUNGSVORLAGE FÜR DEN VORSTAND'); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = GRUEND
doc.add_paragraph(D['titel'], style='Title')
absatz(D['untertitel'], color=GRAU, size=13)
absatz('Entwurf zur Diskussion  |  15.10.2026', color=GRAU, size=10)
p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(18)
r = p.add_run('Gegenstand'); r.bold = True
liste(['Option 1: Weiterbetrieb und bedarfsgerechte Weiterentwicklung des produktiven, eigenentwickelten '
       'Open-Source-Workflowsystems (u.' + NB + 'a. Camunda und MuleSoft)',
       'Option 2: Ablösung bzw. schrittweise Migration auf ServiceNow'], True)

# Kernaussage-Kasten
t = doc.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER
c = t.cell(0, 0); schattierung(c, 'E3F0CB')
zelltext(c, 'Kernaussage', bold=True, size=10, color=GRUEND)
p = c.add_paragraph(); p.paragraph_format.space_after = Pt(4)
r = p.add_run(D['kernaussage']); r.bold = True; r.font.size = Pt(11)
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

# ---------------------------------------------------------------- 1 Management Summary
h1('1  Management Summary')
liste(D['management_summary'], True)
emp = D['empfehlung']
h2('Empfehlung')
absatz(emp['empfehlung'])
h2('Zielbild')
absatz(emp['zielbild'])

# ---------------------------------------------------------------- 2 Ausgangslage
h1('2  Ausgangslage, Entscheidungsrahmen und Annahmen')
h2('Fakten laut Auftrag')
liste(['Unternehmen: Multichannel- und Multibrand-Bank mit ca.' + NB + '2.000 Mitarbeitenden',
       'Option 1: Weiterbetrieb und bedarfsgerechte Weiterentwicklung des eigenentwickelten Open-Source-Workflowsystems (u.' + NB + 'a. Camunda und MuleSoft), bereits produktiv',
       'Option 2: Ablösung bzw. schrittweise Migration auf ServiceNow',
       'Konzernkontext: ServiceNow ist in anderen Konzerneinheiten etabliert, im Betrieb und als strategische Lösung für den Gesamtkonzern positioniert',
       'Entscheidungsfokus: strategisch, wirtschaftlich (Run-the-Bank und Change-the-Bank getrennt), operativ, regulatorisch, technologisch (Schnittstellen nach außen und innerhalb des Workflows), Zukunftsfähigkeit einschließlich KI-Einbindung für eine Customer-Intent-Prozessierung',
       'Bewertung: relativ zur Ausgangslage, nicht als abstrakter Produktvergleich; Skala von – – (sehr nachteilig) über 0 (neutral oder unklar) bis ++ (sehr vorteilhaft)'], True)
h2('Annahmen dieser Vorlage')
liste(D['annahmen'], True)

# ---------------------------------------------------------------- 3 Vergleichstabelle (quer)
quer = doc.add_section()
quer.orientation = WD_ORIENT.LANDSCAPE
quer.page_width, quer.page_height = Cm(29.7), Cm(21)
quer.left_margin = quer.right_margin = Cm(1.8)
kopf_fuss(quer)
h1('3  Vergleich der Optionen')
absatz(f'Option 1: {O1}  |  Option 2: {O2}  |  * verbindliches Kriterium laut Auftrag', color=GRAU, size=9)
SP = [('Nr.', 1.0), ('Kriterium', 3.4), ('Beschreibung', 4.4), ('Option 1 – Bewertung', 1.7), ('Option 1 – Begründung', 6.0),
      ('Option 2 – Bewertung', 1.7), ('Option 2 – Begründung', 6.0)]
tab = doc.add_table(rows=1, cols=len(SP)); tab.autofit = False
rahmen(tab)
for i, (name, w) in enumerate(SP):
    c = tab.rows[0].cells[i]; c.width = Cm(w); schattierung(c, '000000')
    zelltext(c, name, bold=True, size=8.5, color=RGBColor(0xFF, 0xFF, 0xFF))
kopfzeile_wiederholen(tab.rows[0])
for k in D['kriterien']:
    row = tab.add_row(); nicht_teilen(row)
    werte = [str(k['nr']), k['kriterium'] + (NB + '*' if k['verbindlich'] else ''), k['beschreibung'],
             k['o1_bewertung'], k['o1_begruendung'], k['o2_bewertung'], k['o2_begruendung']]
    for i, (v, (name, w)) in enumerate(zip(werte, SP)):
        c = row.cells[i]; c.width = Cm(w)
        if i in (3, 5):
            f, col = SKALA[v]; schattierung(c, f)
            zelltext(c, v.replace('-', '–'), bold=True, size=11, color=RGBColor.from_string(col), align=WD_ALIGN_PARAGRAPH.CENTER)
            c.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        else:
            zelltext(c, v, bold=i in (0, 1), size=8.5, color=GRAU if i == 2 else None)
p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(6)
r = p.add_run('Skala: ++ sehr vorteilhaft  |  + vorteilhaft  |  0 neutral oder unklar  |  – nachteilig  |  – – sehr nachteilig. '
              'Die Kriterien sind nicht gleich gewichtet; entscheidend ist die Begründung je Kriterium.')
r.font.size = Pt(8.5); r.font.color.rgb = GRAU

# ---------------------------------------------------------------- zurück hochkant
hoch = doc.add_section()
hoch.orientation = WD_ORIENT.PORTRAIT
hoch.page_width, hoch.page_height = Cm(21), Cm(29.7)
hoch.left_margin = hoch.right_margin = Cm(2.2)
kopf_fuss(hoch)

# 4 Gesamtbild
g = D['gesamtbild']
h1('4  Gesamtbild')
gt = doc.add_table(rows=4, cols=3); gt.autofit = False
rahmen(gt)
for i, txt in enumerate(['', 'Option 1 – ' + O1, 'Option 2 – ' + O2]):
    c = gt.cell(0, i); schattierung(c, '000000')
    zelltext(c, txt, bold=True, size=9.5, color=RGBColor(0xFF, 0xFF, 0xFF))
for z, (lab, k1, k2, farbe) in enumerate([('Stärken', 'o1_staerken', 'o2_staerken', GRUEND),
                                          ('Schwächen', 'o1_schwaechen', 'o2_schwaechen', RGBColor(0xA8, 0x5F, 0x00)),
                                          ('Risiken und Abhängigkeiten', 'o1_risiken_abhaengigkeiten', 'o2_risiken_abhaengigkeiten', RGBColor(0xDA, 0x29, 0x1C))], 1):
    zelltext(gt.cell(z, 0), lab, bold=True, size=9.5, color=farbe)
    for sp, key in ((1, k1), (2, k2)):
        c = gt.cell(z, sp)
        for j, t in enumerate(g[key]):
            p = c.paragraphs[0] if j == 0 else c.add_paragraph()
            p.paragraph_format.space_after = Pt(3); p.paragraph_format.line_spacing = 1.05
            r = p.add_run('– ' + t); r.font.size = Pt(9)
for row in gt.rows:
    for i, w in enumerate((3.0, 6.8, 6.8)):
        row.cells[i].width = Cm(w)
h2('Einordnung')
liste(emp['begruendung'])

# 5 Zielbild-Varianten
h1('5  Geprüfte Zielbild-Varianten')
vt = doc.add_table(rows=1, cols=3); vt.autofit = False
rahmen(vt)
for i, txt in enumerate(['Variante', 'Beschreibung', 'Einschätzung']):
    c = vt.cell(0, i); schattierung(c, '000000')
    zelltext(c, txt, bold=True, size=9.5, color=RGBColor(0xFF, 0xFF, 0xFF))
kopfzeile_wiederholen(vt.rows[0])
for v in D['zielbild_varianten']:
    row = vt.add_row(); nicht_teilen(row)
    zelltext(row.cells[0], v['variante'], bold=True, size=9.5)
    zelltext(row.cells[1], v['beschreibung'], size=9.5)
    zelltext(row.cells[2], v['einschaetzung'], size=9.5)
for row in vt.rows:
    for i, w in enumerate((3.6, 6.5, 6.5)):
        row.cells[i].width = Cm(w)

# 6 Gesamtempfehlung
h1('6  Gesamtempfehlung')
t = doc.add_table(rows=1, cols=1)
c = t.cell(0, 0); schattierung(c, 'E3F0CB')
zelltext(c, emp['empfehlung'], bold=True, size=11)
h2('Begründung')
liste(emp['begruendung'])
h2('Zielbild')
absatz(emp['zielbild'])
h2('Übergangspfad')
pt = doc.add_table(rows=1, cols=3); pt.autofit = False
rahmen(pt)
for i, txt in enumerate(['Phase', 'Zeitraum', 'Inhalt']):
    c = pt.cell(0, i); schattierung(c, '000000')
    zelltext(c, txt, bold=True, size=9.5, color=RGBColor(0xFF, 0xFF, 0xFF))
for ph in emp['uebergangspfad']:
    row = pt.add_row(); nicht_teilen(row)
    zelltext(row.cells[0], ph['phase'], bold=True, size=9.5)
    zelltext(row.cells[1], ph['zeitraum'], size=9.5, color=GRUEND)
    zelltext(row.cells[2], ph['inhalt'], size=9.5)
for row in pt.rows:
    for i, w in enumerate((4.2, 3.6, 8.8)):
        row.cells[i].width = Cm(w)
h2('Option 2 wäre vorzuziehen, wenn …')
liste(emp['bedingungen_option2_vorzuziehen'])
h2('Die Empfehlung trägt, solange …')
liste(emp['bedingungen_option1_vorzuziehen'])

# 7 Realisierung
r_ = D['realisierung']
h1('7  Realisierung')
for lab, key in [('Voraussetzungen', 'voraussetzungen'), ('Governance', 'governance'), ('Kompetenzen', 'kompetenzen'),
                 ('Migrations- und Integrationsschritte', 'migrations_integrationsschritte')]:
    h2(lab)
    if key == 'migrations_integrationsschritte':
        for i, t_ in enumerate(r_[key], 1):
            p = absatz(t_, style='List Number'); p.paragraph_format.space_after = Pt(3)
    else:
        liste(r_[key])
h2('Risiken und Gegenmaßnahmen')
rt = doc.add_table(rows=1, cols=2); rt.autofit = False
rahmen(rt)
for i, txt in enumerate(['Risiko', 'Gegenmaßnahme']):
    c = rt.cell(0, i); schattierung(c, '000000')
    zelltext(c, txt, bold=True, size=9.5, color=RGBColor(0xFF, 0xFF, 0xFF))
for x in r_['risiken']:
    row = rt.add_row(); nicht_teilen(row)
    zelltext(row.cells[0], x['risiko'], bold=True, size=9.5)
    zelltext(row.cells[1], x['gegenmassnahme'], size=9.5)
for row in rt.rows:
    for i, w in enumerate((6.0, 10.6)):
        row.cells[i].width = Cm(w)
h2('Die fünf wichtigsten Maßnahmen')
mt = doc.add_table(rows=1, cols=3); mt.autofit = False
rahmen(mt)
for i, txt in enumerate(['Nr.', 'Maßnahme', 'Ergebnis']):
    c = mt.cell(0, i); schattierung(c, '000000')
    zelltext(c, txt, bold=True, size=9.5, color=RGBColor(0xFF, 0xFF, 0xFF))
for i, m in enumerate(r_['top5_massnahmen'], 1):
    row = mt.add_row(); nicht_teilen(row)
    zelltext(row.cells[0], str(i), bold=True, size=10, color=GRUEND)
    zelltext(row.cells[1], m['massnahme'], bold=True, size=9.5)
    zelltext(row.cells[2], m['ergebnis'], size=9.5)
for row in mt.rows:
    for i, w in enumerate((1.2, 8.4, 7.0)):
        row.cells[i].width = Cm(w)

# 8 Offene Punkte
h1('8  Vor der finalen Entscheidung zu klären')
absatz('Priorisiert nach Einfluss auf die Empfehlung.', color=GRAU)
ot = doc.add_table(rows=1, cols=3); ot.autofit = False
rahmen(ot)
for i, txt in enumerate(['Prio', 'Frage', 'Warum entscheidend']):
    c = ot.cell(0, i); schattierung(c, '000000')
    zelltext(c, txt, bold=True, size=9.5, color=RGBColor(0xFF, 0xFF, 0xFF))
kopfzeile_wiederholen(ot.rows[0])
for o in sorted(D['offene_punkte'], key=lambda o: o['prio']):
    row = ot.add_row(); nicht_teilen(row)
    zelltext(row.cells[0], str(o['prio']), bold=True, size=10, color=GRUEND)
    zelltext(row.cells[1], o['frage'], bold=True, size=9.5)
    zelltext(row.cells[2], o['warum_entscheidend'], size=9.5)
for row in ot.rows:
    for i, w in enumerate((1.2, 8.4, 7.0)):
        row.cells[i].width = Cm(w)
h2('Hinweis zur Belastbarkeit')
liste(['Die Bewertungen sind qualitativ und beruhen auf der Ausgangslage laut Auftrag sowie den genannten Annahmen.',
       'Kosten, Lizenzmodelle und Herstelleraussagen sind vor der Entscheidung mit belastbaren Zahlen zu unterlegen.',
       'Ändern die Antworten auf die Punkte' + NB + '1 bis' + NB + '3 die Annahmen, ist die Empfehlung neu zu prüfen.'])

z = doc.settings.element.find(qn('w:zoom'))
if z is not None:
    z.set(qn('w:percent'), '100')
doc.save(AUS)
print('geschrieben:', os.path.abspath(AUS))
