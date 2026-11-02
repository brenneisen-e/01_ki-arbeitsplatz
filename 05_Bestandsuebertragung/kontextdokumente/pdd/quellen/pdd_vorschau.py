# -*- coding: utf-8 -*-
"""Rendert die Schritt-fuer-Schritt-Kapitel der PDD als HTML-Vorschau.

LibreOffice laesst sich in dieser Umgebung nicht starten; die Vorschau bildet
Einzug, Abstand, Kursivsatz, Fettung und Farben der Absaetze nach, damit sich
die Formatierung ohne Word beurteilen laesst.
"""
import html, sys
from docx import Document
from docx.text.paragraph import Paragraph
from docx.table import Table
from docx.text.run import Run
from docx.oxml.ns import qn

QUELLE = sys.argv[1]
ZIEL = sys.argv[2] if len(sys.argv) > 2 else 'pdd_vorschau.html'
d = Document(QUELLE)

KOPF = """<!doctype html><html lang="de"><head><meta charset="utf-8"><title>PDD-Vorschau</title><style>
body{font-family:"Segoe UI",Arial,sans-serif;font-size:14px;color:#1a1a1a;margin:0;padding:26px 30px;background:#fff}
h2{font-size:17px;color:#C41230;margin:30px 0 10px;border-bottom:1px solid #d8dde0;padding-bottom:5px}
table{border-collapse:collapse;width:100%;margin:0 0 16px}
td{border:1px solid #c9d0d4;padding:9px 11px;vertical-align:top}
td.bild{width:120px;background:#f5f7f8;color:#8b979e;font-size:11.5px;text-align:center}
p{margin:0}
code{font-family:ui-monospace,Consolas,monospace;font-size:12.5px}
</style></head><body>"""


def absatz_html(p):
    stil = []
    pf = p.paragraph_format
    if pf.left_indent:
        stil.append('margin-left:%dpx' % int(pf.left_indent.pt * 1.34))
    if pf.space_before:
        stil.append('margin-top:%dpx' % int(pf.space_before.pt * 1.34))
    if pf.space_after:
        stil.append('margin-bottom:%dpx' % int(pf.space_after.pt * 1.34))
    if pf.first_line_indent:
        stil.append('text-indent:%dpx' % int(pf.first_line_indent.pt * 1.34))
    if p.style.name == 'Intense Quote':          # Vorlagenstil "WENN DANN"
        stil.append('color:#00B0F0;font-weight:700')
        if not pf.space_before:                  # Abstand kommt aus dem Stil (Autoabstand ~14 pt, danach 3 pt)
            stil.append('margin-top:%dpx' % int(14 * 1.34))
        if not pf.space_after:
            stil.append('margin-bottom:%dpx' % int(3 * 1.34))
    teile = []
    for element in p._element.iter(qn('w:r')):      # auch Laeufe in Querverweisen
        r = Run(element, p)
        t = html.escape(r.text).replace('\t', '&nbsp;&nbsp;&nbsp;&nbsp;').replace('\n', '<br>')
        if not t:
            continue
        s = []
        if r.bold:
            s.append('font-weight:700')
        if r.italic:
            s.append('font-style:italic')
        if r.underline:
            s.append('text-decoration:underline')
        if r.font.color and r.font.color.rgb and str(r.font.color.rgb) != 'FFFFFF':
            s.append('color:#' + str(r.font.color.rgb))
        elif r.font.color and r.font.color.rgb:
            s.append('font-weight:700')            # weisse Kopfzeilen lesbar halten
        teile.append('<span style="%s">%s</span>' % (';'.join(s), t) if s else t)
    if not teile and ('<w:drawing>' in p._element.xml or '<w:pict>' in p._element.xml):
        teile.append('<i>[Screenshot]</i>')
    return '<p style="%s">%s</p>' % (';'.join(stil), ''.join(teile) or '&nbsp;')


aus = [KOPF]
GANZ = '--alles' in sys.argv
inhalt = GANZ


def tabelle_html(tb):
    sp = d.sections[-1]
    text_w = int((sp.page_width - sp.left_margin - sp.right_margin) / 635)
    grid = [int(c.get(qn('w:w'))) for c in tb._element.find(qn('w:tblGrid'))]
    breite = min(100, round(100 * sum(grid) / text_w))
    o = ['<table style="width:%d%%;table-layout:fixed"><colgroup>%s</colgroup>' % (breite, ''.join('<col style="width:%.1f%%">' % (100 * g / sum(grid)) for g in grid))]
    for reihe in tb.rows:
        o.append('<tr>')
        gesehen = set()
        for i, zelle in enumerate(reihe.cells):
            if id(zelle._element) in gesehen:
                continue
            gesehen.add(id(zelle._element))
            hat_bild = '<w:drawing>' in zelle._element.xml or '<w:pict>' in zelle._element.xml
            klasse = ' class="bild"' if (i == 0 and hat_bild) else ''
            inner = ''.join(absatz_html(p) for p in zelle.paragraphs)
            if hat_bild and i == 0 and '[Screenshot]' not in inner:
                inner = '<p><i>[Screenshot]</i></p>' + inner
            o.append('<td%s>%s</td>' % (klasse, inner))
        o.append('</tr>')
    return ''.join(o) + '</table>'


for kind in d.element.body.iterchildren():
    if kind.tag.endswith('}p'):
        p = Paragraph(kind, d)
        if p.style.name.startswith(('Heading', 'Überschrift', 'Title', 'Subtitle')):
            if p.text.strip() == 'Schritt für Schritt-Beschreibung':
                inhalt = True
            if inhalt:
                stufe = {'Title': 'h1', 'Heading 1': 'h1', 'Subtitle': 'h3', 'Heading 3': 'h3'}.get(p.style.name, 'h2')
                aus.append('<%s>%s</%s>' % (stufe, html.escape(p.text.strip()), stufe))
        elif inhalt and p.style.name == 'fachlicher Kontext':
            aus.append('<h3 style="font-size:14.5px;color:#7a1f2b;margin:14px 0 6px">%s</h3>' % html.escape(p.text.strip()))
        elif inhalt and (p.text.strip() or 'w:drawing' in p._element.xml):
            aus.append(absatz_html(p) if p.text.strip() else '<p><i>[Zeichnung / Bild]</i></p>')
    elif kind.tag.endswith('}tbl') and inhalt:
        aus.append(tabelle_html(Table(kind, d)))
aus.append('</body></html>')
open(ZIEL, 'w', encoding='utf-8').write('\n'.join(aus))
print('Vorschau:', ZIEL)
