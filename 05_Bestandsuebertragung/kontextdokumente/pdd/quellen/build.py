# -*- coding: utf-8 -*-
"""Arbeitet die PDD-Inhalte in das vorgegebene Word-Template ein."""
import copy, sys, os
from docx import Document
from docx.shared import Cm, Pt
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.table import Table
from docx.text.paragraph import Paragraph
from docx.enum.text import WD_ALIGN_PARAGRAPH

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import content_meta as M
import content_design as D
from content_steps import steps
from content_steps2 import steps2

# Formatvorlage "WENN DANN" (Intense Quote, tuerkis 00B0F0, fett, Arial 12pt,
# Abstand davor automatisch / danach 3 pt, Einzug links 113 dxa) laut Kapitel
# "Vorgegebene Formatierung" des Templates.
KEYS_WENNDANN = {'WENN', 'DANN', 'SONST', 'Ende WENN',
                 'Schleifenstart', 'Schleifenende'}


# --------------------------------------------------------------------- Bausteine
TBLPR_ORDER = ['tblStyle', 'tblpPr', 'tblOverlap', 'bidiVisual', 'tblStyleRowBandSize',
               'tblStyleColBandSize', 'tblW', 'jc', 'tblCellSpacing', 'tblInd', 'tblBorders',
               'shd', 'tblLayout', 'tblCellMar', 'tblLook', 'tblCaption', 'tblDescription']

SETTINGS_ORDER = ['writeProtection', 'view', 'zoom', 'removePersonalInformation', 'removeDateAndTime',
                  'doNotDisplayPageBoundaries', 'displayBackgroundShape', 'printPostScriptOverText',
                  'printFractionalCharacterWidth', 'printFormsData', 'embedTrueTypeFonts',
                  'embedSystemFonts', 'saveSubsetFonts', 'saveFormsData', 'mirrorMargins',
                  'alignBordersAndEdges', 'bordersDoNotSurroundHeader', 'bordersDoNotSurroundFooter',
                  'gutterAtTop', 'hideSpellingErrors', 'hideGrammaticalErrors', 'activeWritingStyle',
                  'proofState', 'formsDesign', 'attachedTemplate', 'linkStyles', 'stylePaneFormatFilter',
                  'stylePaneSortMethod', 'documentType', 'mailMerge', 'revisionView', 'trackChanges',
                  'doNotTrackMoves', 'doNotTrackFormatting', 'documentProtection', 'autoFormatOverride',
                  'styleLockTheme', 'styleLockQFSet', 'defaultTabStop', 'autoHyphenation',
                  'consecutiveHyphenLimit', 'hyphenationZone', 'doNotHyphenateCaps', 'showEnvelope',
                  'summaryLength', 'clickAndTypeStyle', 'defaultTableStyle', 'evenAndOddHeaders',
                  'bookFoldRevPrinting', 'bookFoldPrinting', 'bookFoldPrintingSheets',
                  'drawingGridHorizontalSpacing', 'drawingGridVerticalSpacing',
                  'displayHorizontalDrawingGridEvery', 'displayVerticalDrawingGridEvery',
                  'doNotUseMarginsForDrawingGridOrigin', 'drawingGridHorizontalOrigin',
                  'drawingGridVerticalOrigin', 'doNotShadeFormData', 'noPunctuationKerning',
                  'characterSpacingControl', 'printTwoOnOne', 'strictFirstAndLastChars',
                  'noLineBreaksAfter', 'noLineBreaksBefore', 'savePreviewPicture',
                  'doNotValidateAgainstSchema', 'saveInvalidXml', 'ignoreMixedContent',
                  'alwaysShowPlaceholderText', 'doNotDemarcateInvalidXml', 'saveXmlDataOnly',
                  'useXSLTWhenSaving', 'saveThroughXslt', 'showXMLTags', 'alwaysMergeEmptyNamespace',
                  'updateFields', 'hdrShapeDefaults', 'footnotePr', 'endnotePr', 'compat', 'docVars',
                  'rsids', 'mathPr', 'themeFontLang', 'clrSchemeMapping', 'shapeDefaults',
                  'decimalSymbol', 'listSeparator', 'docId', 'chartTrackingRefBased']


def insert_ordered(parent, el, order):
    """Fügt el schemakonform an der richtigen Position in parent ein."""
    name = el.tag.split('}')[1]
    idx = order.index(name)
    for child in parent:
        cn = child.tag.split('}')[1]
        if cn in order and order.index(cn) > idx:
            child.addprevious(el)
            return el
    parent.append(el)
    return el


def drop_paras(doc, texts, exact=False):
    """Entfernt Absaetze anhand ihres Textes."""
    n = 0
    for el, kind, obj in body_items(doc):
        if kind != 'p':
            continue
        t = obj.text.strip()
        hit = (t in texts) if exact else any(x in t for x in texts if x)
        if hit and t:
            el.getparent().remove(el)
            n += 1
    return n


def drop_range(doc, start_text, stop_text, style='Heading 1'):
    """Entfernt alles ab dem Absatz start_text bis vor stop_text (nur Ueberschriften)."""
    items = body_items(doc)
    a = b = None
    def is_h(obj):
        return obj.style and obj.style.name == style
    for i, (el, kind, obj) in enumerate(items):
        if kind == 'p' and a is None and start_text in obj.text and is_h(obj):
            a = i
        elif kind == 'p' and a is not None and stop_text in obj.text and is_h(obj):
            b = i
            break
    if a is None or b is None:
        return 0
    for el, kind, obj in items[a:b]:
        el.getparent().remove(el)
    return b - a


def add_page_footer(doc):
    """Fusszeile mit Seitenzahl: Seite X von Y."""
    for section in doc.sections:
        footer = section.footer
        footer.is_linked_to_previous = False
        para = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
        for r in list(para._p):
            para._p.remove(r)
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        para.add_run('Seite ')
        for instr in ('PAGE', 'NUMPAGES'):
            r = para.add_run()._r
            f1 = OxmlElement('w:fldChar'); f1.set(qn('w:fldCharType'), 'begin'); r.append(f1)
            it = OxmlElement('w:instrText'); it.set(qn('xml:space'), 'preserve'); it.text = f' {instr} '
            r.append(it)
            f2 = OxmlElement('w:fldChar'); f2.set(qn('w:fldCharType'), 'end'); r.append(f2)
            if instr == 'PAGE':
                para.add_run(' von ')


def body_items(doc):
    """[(element, kind, obj)] in Dokumentreihenfolge."""
    out = []
    for ch in doc.element.body.iterchildren():
        if ch.tag == qn('w:p'):
            out.append((ch, 'p', Paragraph(ch, doc)))
        elif ch.tag == qn('w:tbl'):
            out.append((ch, 'tbl', Table(ch, doc)))
    return out


def find_p(doc, text, style=None):
    for el, kind, obj in body_items(doc):
        if kind != 'p':
            continue
        if text.lower() in obj.text.strip().lower():
            if style is None or (obj.style and obj.style.name == style):
                return el, obj
    raise KeyError('Absatz nicht gefunden: ' + text)


def table_after(doc, text, n=1, style=None):
    items = body_items(doc)
    start = None
    for i, (el, kind, obj) in enumerate(items):
        if kind == 'p' and text.lower() in obj.text.strip().lower():
            if style is None or (obj.style and obj.style.name == style):
                start = i
                break
    if start is None:
        raise KeyError('Anker nicht gefunden: ' + text)
    seen = 0
    for el, kind, obj in items[start + 1:]:
        if kind == 'tbl':
            seen += 1
            if seen == n:
                return obj
    raise KeyError('Tabelle nicht gefunden nach: ' + text)


def clear_cell(cell):
    tc = cell._tc
    for p in tc.findall(qn('w:p')):
        tc.remove(p)
    for t in tc.findall(qn('w:tbl')):
        tc.remove(t)
    tc.append(OxmlElement('w:p'))


def _fill_paragraph(p, line):
    """Formatiert eine Zeile gemaess den Vorgaben des Templates."""
    txt = line.strip()
    if not txt:
        return
    if txt in KEYS_WENNDANN:
        p.style = 'Intense Quote'          # Formatvorlage "WENN DANN"
        p.add_run(txt)
        return
    if txt.startswith('- '):
        p.style = 'List Paragraph'
        p.add_run(txt[2:])
        return
    if txt.startswith('BE ') or txt.startswith('Aussteuerung und Verarbeitung beenden'):
        r = p.add_run(txt)
        r.style = 'Business Exception'     # gelbe Markierung: Aussteuerung / Abbruch / BE
        return
    r = p.add_run(txt)
    if txt.startswith('Offener Punkt') or txt.startswith('Format') or txt.startswith('Prüfnotiz'):
        r.style = 'Emphasis'               # Formatvorlage "Fachliche Hinweise" 


def set_cell(cell, text, style=None):
    clear_cell(cell)
    tc = cell._tc
    p = Paragraph(tc.findall(qn('w:p'))[0], cell)
    first = True
    for ln in (text.split('\n') if text else ['']):
        if not first:
            np = OxmlElement('w:p')
            tc.append(np)
            p = Paragraph(np, cell)
        first = False
        _fill_paragraph(p, ln)
        if style and p.style and p.style.name == 'Normal':
            p.style = style


def set_cell_style(cell, text, style):
    clear_cell(cell)
    tc = cell._tc
    p = Paragraph(tc.findall(qn('w:p'))[0], cell)
    first = True
    for ln in (text.split('\n') if text else ['']):
        if not first:
            np = OxmlElement('w:p')
            tc.append(np)
            p = Paragraph(np, cell)
        first = False
        p.style = style
        if ln.strip():
            p.add_run(ln.strip())


def ensure_rows(table, n_data, proto_idx=1):
    """Sorgt für genau n_data Datenzeilen (Kopfzeile bleibt)."""
    proto = copy.deepcopy(table.rows[proto_idx]._tr)
    while len(table.rows) - 1 < n_data:
        table._tbl.append(copy.deepcopy(proto))
    while len(table.rows) - 1 > n_data:
        table._tbl.remove(table.rows[-1]._tr)
    for r in table.rows[1:]:
        for c in r.cells:
            clear_cell(c)


def fill_table(table, rows, start_row=1):
    for i, vals in enumerate(rows):
        row = table.rows[start_row + i]
        cells = row.cells
        for j, v in enumerate(vals):
            if v is None or j >= len(cells):
                continue
            set_cell(cells[j], v)


def insert_after(anchor_el, new_el):
    anchor_el.addnext(new_el)
    return new_el


def new_para(doc, style=None, text=None, italic=False):
    p = doc.add_paragraph()
    if style:
        p.style = style
    if text:
        r = p.add_run(text)
        r.italic = italic
    return p


def make_step_table(doc, nrows):
    t = doc.add_table(rows=nrows, cols=3, style='Table Grid')
    t.autofit = False
    tbl = t._tbl
    tblPr = tbl.tblPr
    for tag in ('w:tblW', 'w:tblLayout'):
        for e in tblPr.findall(qn(tag)):
            tblPr.remove(e)
    w = OxmlElement('w:tblW'); w.set(qn('w:w'), '21683'); w.set(qn('w:type'), 'dxa')
    insert_ordered(tblPr, w, TBLPR_ORDER)
    lay = OxmlElement('w:tblLayout'); lay.set(qn('w:type'), 'fixed')
    insert_ordered(tblPr, lay, TBLPR_ORDER)
    widths = [7211, 7504, 6968]
    grid = tbl.find(qn('w:tblGrid'))
    for gc, wv in zip(grid.findall(qn('w:gridCol')), widths):
        gc.set(qn('w:w'), str(wv))
    for row in t.rows:
        for c, wv in zip(row.cells, widths):
            tcPr = c._tc.get_or_add_tcPr()
            for e in tcPr.findall(qn('w:tcW')):
                tcPr.remove(e)
            tw = OxmlElement('w:tcW'); tw.set(qn('w:w'), str(wv)); tw.set(qn('w:type'), 'dxa')
            tcPr.append(tw)
    return t


def set_num(par, num_id, ilvl=0):
    """Weist dem Absatz eine bestimmte Listeninstanz zu."""
    pPr = par._p.get_or_add_pPr()
    for e in pPr.findall(qn('w:numPr')):
        pPr.remove(e)
    numPr = OxmlElement('w:numPr')
    il = OxmlElement('w:ilvl'); il.set(qn('w:val'), str(ilvl)); numPr.append(il)
    ni = OxmlElement('w:numId'); ni.set(qn('w:val'), str(num_id)); numPr.append(ni)
    pStyle = pPr.find(qn('w:pStyle'))
    if pStyle is not None:
        pStyle.addnext(numPr)
    else:
        pPr.insert(0, numPr)
    return par


def enable_update_fields(doc):
    st = doc.settings.element
    for e in st.findall(qn('w:updateFields')):
        st.remove(e)
    uf = OxmlElement('w:updateFields'); uf.set(qn('w:val'), 'true')
    insert_ordered(st, uf, SETTINGS_ORDER)


# --------------------------------------------------------------------- Build
def build(variant, template, out, diagram):
    meta = M.V[variant]
    fmt = lambda s: s.format(**meta)
    doc = Document(template)

    # ---------- Titel + Untertitel
    el, p = find_p(doc, 'Process Definition Document', style='Title')
    sub = doc.add_paragraph()
    sub.style = 'Subtitle'
    sub.add_run(meta['titel'])
    insert_after(el, sub._p)
    sub2 = doc.add_paragraph()
    r = sub2.add_run('Fachprozess: Vorprüfung eingehender Bestandsübertragungen. '
                     'Sparten im Bearbeitungsumfang: ' + meta['sparten'] + '.')
    r.italic = True
    insert_after(sub._p, sub2._p)

    # ---------- Versionierung
    t = table_after(doc, 'Versionierung', style='Heading 1')
    ensure_rows(t, 2)
    fill_table(t, [
        ['<Name Process Owner>', '24.08.2026', 'PDD – Version zum Go-Live',
         'Im Rahmen der Erstellung müssen hier keine Versionen hinterlegt werden'],
        ['', '', '', ''],
    ])

    # ---------- Verwendete Systeme
    t = table_after(doc, 'Im manuellen Prozess werden folgende Systeme verwendet')
    sysrows = [[fmt(a), fmt(b)] for a, b in M.SYSTEME]
    ensure_rows(t, len(sysrows))
    fill_table(t, sysrows)

    # ---------- Geschäftsbereiche
    t = table_after(doc, 'Welche Arbeitsgruppe führt welche Tätigkeit im bestehenden manuellen Prozess')
    rows = [[fmt(x) for x in r] for r in M.GB_MANUELL]
    ensure_rows(t, len(rows)); fill_table(t, rows)

    t = table_after(doc, 'Welche Arbeitsgruppe führt welche Tätigkeit im automatisierten Prozess')
    rows = [[fmt(x) for x in r] for r in M.GB_AUTOMATISIERT]
    ensure_rows(t, len(rows)); fill_table(t, rows)

    # ---------- Ziel
    el, p = find_p(doc, 'Welchen Druckpunkt soll der Bot lösen')
    anchor = el
    for ln in fmt(M.ZIEL).split('\n'):
        np = doc.add_paragraph()
        if ln.strip():
            np.add_run(ln.strip())
        anchor = insert_after(anchor, np._p)

    # ---------- Kurze Prozessbeschreibung
    el, p = find_p(doc, 'Kurze Prozessbeschreibung um einen Überblick', style='Heading 2')
    anchor = el
    for ln in fmt(M.KURZBESCHREIBUNG).split('\n'):
        np = doc.add_paragraph()
        if ln.strip():
            np.add_run(ln.strip())
        anchor = insert_after(anchor, np._p)

    # ---------- SIPOC: wird direkt in die SmartArt-Grafik eingearbeitet
    #             (siehe sipoc_smartart.py, laeuft nach dem Speichern)

    # ---------- Prozessdiagramm
    el, p = find_p(doc, 'Prozessdiagramm / Ablaufdiagramm', style='Heading 2')
    items = body_items(doc)
    idx = [i for i, (e, k, o) in enumerate(items) if e is el][0]
    anchor = items[idx + 1][0]  # Absatz "Wird mit dem Business Analysten..."
    pic = doc.add_paragraph()
    pic.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pic.add_run().add_picture(diagram, width=Cm(35))
    anchor = insert_after(anchor, pic._p)
    note = doc.add_paragraph()
    nr = note.add_run('Die Detaillierung der einzelnen Schritte erfolgt im Kapitel '
                      '„Schritt für Schritt-Beschreibung“.')
    nr.italic = True
    insert_after(anchor, note._p)

    # ---------- Datensicherheit
    t = table_after(doc, 'Welche datenschutzrechtlichen Rahmenbedigungen gelten')
    for i, ans in enumerate(M.DATENSICHERHEIT[variant]):
        set_cell(t.rows[i].cells[1], ans, style='Linke Spalte Tabelle')

    # ---------- Ansprechpartner
    t = table_after(doc, 'Fachliche Ansprechpartner im Betrieb', style='Heading 2')
    for i, (_, name, abt) in enumerate(M.ANSPRECHPARTNER):
        set_cell(t.rows[i + 1].cells[1], fmt(name), style='Linke Spalte Tabelle')
        set_cell(t.rows[i + 1].cells[2], fmt(abt), style='Linke Spalte Tabelle')

    # ---------- Fallback
    el, p = find_p(doc, 'An dieser Stelle wird beschrieben, was passiert, wenn der Roboter ausfällt')
    parent = el.getparent(); parent.remove(el)
    el2, p2 = find_p(doc, 'Die Roboter können nach Absprache während der allgemeinen ITERGO Systemzeiten')
    anchor = el2
    anchor = insert_after(anchor, doc.add_paragraph()._p)
    for ln in fmt(M.FALLBACK).split('\n'):
        np = doc.add_paragraph()
        if ln.strip():
            np.add_run(ln.strip())
        anchor = insert_after(anchor, np._p)

    # ---------- Reporting
    el, p = find_p(doc, 'Welche Reports generiert werden, wird spätestens nach dem Go-Live')
    anchor = el
    for ln in fmt(M.REPORTING).split('\n'):
        np = doc.add_paragraph()
        t_ = ln.strip()
        if t_.startswith('- '):
            np.style = 'List Paragraph'
            np.add_run(t_[2:])
        elif t_:
            np.add_run(t_)
        anchor = insert_after(anchor, np._p)

    # ---------- Inhalt der Reports
    el, p = find_p(doc, 'Im Report werden zu jedem Ordnungsbegriff')
    generic = {'Ordnungsbegriff', 'Status',
               'Tags (generische Zusatzinformation zu dem Fall / Ausstiegspunkte, verarbeitete Schritte)'}
    for e, k, o in body_items(doc):
        if k == 'p' and o.text.strip() in generic and o.style and o.style.name == 'List Paragraph':
            e.getparent().remove(e)
    anchor = el
    for ln in M.REPORTINHALT:
        np = doc.add_paragraph()
        np.style = 'List Paragraph'
        np.add_run(fmt(ln))
        anchor = insert_after(anchor, np._p)

    # ---------- Eingangskanal
    el, p = find_p(doc, 'Wählen sie dann ihren Eingangskanal')
    anchor = el
    for ln in fmt(M.EINGANGSKANAL).split('\n'):
        np = doc.add_paragraph()
        t_ = ln.strip()
        if t_.startswith('- '):
            np.style = 'List Paragraph'
            np.add_run(t_[2:])
        elif t_:
            r = np.add_run(t_)
            if t_.startswith('Gewählter Eingangskanal'):
                r.bold = True
        anchor = insert_after(anchor, np._p)

    # ---------- Design-Tabellen
    t = table_after(doc, 'Definition des zu bearbeitenden Elements', style='Heading 2')
    for i, (de, _en) in enumerate(D.ELEMENT):
        set_cell(t.rows[i + 1].cells[1], fmt(de), style='Linke Spalte Tabelle')

    t = table_after(doc, 'Regelmäßigkeit der Lieferung', style='Heading 2')
    for i, (de, _en) in enumerate(D.LIEFERUNG):
        set_cell(t.rows[i + 1].cells[1], fmt(de), style='Linke Spalte Tabelle')

    t = table_after(doc, 'Synchronität des Prozesses')
    for i, (de, _en) in enumerate(D.SYNCHRONITAET):
        set_cell(t.rows[i + 1].cells[1], fmt(de), style='Linke Spalte Tabelle')

    t = table_after(doc, 'Housekeeping / Aufräumen', style='Heading 2')
    for i, pair in enumerate(D.HOUSEKEEPING):
        if pair is None:
            continue
        de, _en = pair
        set_cell(t.rows[i + 1].cells[1], fmt(de), style='Linke Spalte Tabelle')

    # ---------- Variablentabelle
    el, _p = find_p(doc, 'Damit im Verlauf der Beschreibung für Daten aus den Eingangskanälen')
    hint = doc.add_paragraph()
    hr = hint.add_run('Die Variablen sind mit den abgestimmten Datenpoolvariablen abzugleichen und fachlich '
                      'validieren zu lassen.')
    hr.style = 'Emphasis'
    insert_after(el, hint._p)
    t = table_after(doc, 'Damit im Verlauf der Beschreibung für Daten aus den Eingangskanälen')
    extra = D.VARIABLEN_KV_ZUSATZ if variant == 'KV' else D.VARIABLEN_KL_ZUSATZ
    varrows = [list(r) for r in D.VARIABLEN] + [list(r) for r in extra]
    ensure_rows(t, len(varrows))
    fill_table(t, varrows)

    # ---------- Schritt für Schritt-Beschreibung
    el, p = find_p(doc, 'Schritt für Schritt-Beschreibung', style='Heading 1')
    body = doc.element.body
    sect = body.find(qn('w:sectPr'))
    remove = []
    hit = False
    for ch in list(body.iterchildren()):
        if ch is el:
            hit = True
            continue
        if hit and ch is not sect:
            remove.append(ch)
    for ch in remove:
        body.remove(ch)

    intro = doc.add_paragraph()
    ir = intro.add_run(
        'Die Schritte sind nach dem zu bedienenden System bzw. nach dem fachlichen Block gegliedert '
        '(Formatvorlage „System“). Innerhalb eines Systems fasst die Formatvorlage „fachlicher Kontext“ die '
        'Schritte eines fachlichen Zwecks zusammen. Die linke Spalte nimmt den Screenshot auf, die mittlere '
        'Spalte die deutsche Beschreibung. Die rechte Spalte bleibt zunächst leer; die englische Übersetzung '
        'wird durch den Process Owner ergänzt.')
    ir.italic = True
    anchor = insert_after(el, intro._p)

    blocks = steps(variant) + steps2(variant)
    for kind, payload in blocks:
        if kind == 'S':
            np = doc.add_paragraph()
            np.style = 'Heading 2'
            np.add_run(payload)
            anchor = insert_after(anchor, np._p)
        elif kind == 'K':
            np = doc.add_paragraph()
            np.style = 'fachlicher Kontext'
            np.add_run(payload)
            set_num(np, 8)      # eigene Listeninstanz -> Zaehlung startet wieder bei 1
            anchor = insert_after(anchor, np._p)
        else:
            rows = payload
            t = make_step_table(doc, len(rows))
            for i, (shot, de, _en) in enumerate(rows):
                cells = t.rows[i].cells
                if shot:
                    set_cell_style(cells[0], shot, 'Linke Spalte Tabelle')
                set_cell(cells[1], de)
            anchor = insert_after(anchor, t._tbl)
            sp = doc.add_paragraph()
            anchor = insert_after(anchor, sp._p)

    # ---------- Vorlagenreste entfernen (Review M. Jeglorz)
    drop_range(doc, 'Anleitung für die Schritt-für-Schritt-Beschreibung',
               'Tabelle der genutzten Variablen')
    drop_paras(doc, [
        'Welchen Druckpunkt soll der Bot lösen',
        'Wird mit dem Business Analysten zusammen erarbeitet',
        'Wählen sie eines aus drei Startereignissen',
        'Klicken Sie zur Auswahl auf den grünen Text',
        'Wählen sie dann ihren Eingangskanal',
        'Im Kapitel „Eingangskanal“ können Sie aus drei Start-Vorgängen',
        'Postkorberöffnung',
        'Maileingang',
        'Datei / SharePoint',
    ])
    add_page_footer(doc)
    enable_update_fields(doc)
    doc.save(out)
    from sipoc_smartart import fill as fill_sipoc
    fill_sipoc(out, variant)
    return out


if __name__ == '__main__':
    base = os.path.dirname(os.path.abspath(__file__))
    for v, name in (('KV', 'PDD_Vorpruefung_BUE_Gesundheit_KV.docx'),
                    ('KL', 'PDD_Vorpruefung_BUE_Komposit_Leben.docx')):
        out = build(v, os.path.join(base, 'template.docx'),
                    os.path.join(base, name), os.path.join(base, f'diag_{v}.png'))
        print('OK', out, os.path.getsize(out))
