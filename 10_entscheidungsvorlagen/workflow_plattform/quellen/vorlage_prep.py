# -*- coding: utf-8 -*-
"""Bereitet die Deloitte-Vorlage für das Decision Paper vor (einmalig, Ergebnis liegt in quellen/).

Quelle des Masters: „Banking Strategy 2030 V7“ (Commit 6ae5d25c, Deloitte-Master mit Aptos und Deloitte-Grün).
Quelle der Agenda-Optik: Inhaltsverzeichnis aus dem Deloitte-Angebot „Makler meets KI“ (Commit 891e4fbd^).
Ergebnis: deloitte_vorlage.pptx ohne Folien und nur mit den benötigten Layouts, Cover-Bild, Agenda-Foto,
Overlay-Formen (XML) und weißes Deloitte-Logo.

Aufruf: python3 vorlage_prep.py <banking_strategy_v7.pptx> <angebot.pptx>
"""
import copy, io, os, sys
from lxml import etree
from PIL import Image
from pptx import Presentation

HIER = os.path.dirname(os.path.abspath(__file__))
BILD = os.path.join(HIER, 'bilder')
os.makedirs(BILD, exist_ok=True)
QUELLE, ANGEBOT = sys.argv[1], sys.argv[2]
FUSS = 'Workflow-platform strategy · internal · confidential'
BEHALTEN = {'Title slide - Dark Green with tagline logo lockup', 'Title, subtitle', 'Title Only', 'End slide'}

prs = Presentation(QUELLE)
# Cover-Bild (Glow) aus der Titelfolie sichern
for sh in prs.slides[0].placeholders:
    if sh.placeholder_format.idx == 11:
        open(os.path.join(BILD, 'cover_glow.png'), 'wb').write(sh.image.blob)
# alle Folien entfernen
lst = prs.slides._sldIdLst
for sid in list(lst):
    prs.part.drop_rel(sid.rId)
    lst.remove(sid)
# ungenutzte Layouts entfernen
for layout in list(prs.slide_layouts):
    if layout.name not in BEHALTEN:
        prs.slide_layouts.remove(layout)
# Fußzeilen-Text in Master und Layouts
def fuss(shapes):
    for sh in shapes:
        if sh.has_text_frame and sh.name == 'CaseCode':
            runs = [r for p in sh.text_frame.paragraphs for r in p.runs]
            if runs:
                runs[0].text = FUSS
                for r in runs[1:]:
                    r.text = ''
fuss(prs.slide_master.shapes)
for l in prs.slide_layouts:
    fuss(l.shapes)
prs.core_properties.title = 'Decision paper workflow-platform strategy'
prs.core_properties.author = 'Deloitte'
prs.core_properties.subject = ''
prs.core_properties.keywords = ''
prs.core_properties.comments = ''
prs.save(os.path.join(HIER, 'deloitte_vorlage.pptx'))

# Agenda-Optik aus dem Angebot: Foto, Overlay-Formen, weißes Logo
ang = Presentation(ANGEBOT)
s = ang.slides[2]
ov = []
for sh in s.shapes:
    if sh.name == 'Picture 15':
        img = Image.open(io.BytesIO(sh.image.blob)).convert('RGB')
        w, h = img.size
        l, t, r, b = sh.crop_left, sh.crop_top, sh.crop_right, sh.crop_bottom
        img = img.crop((int(l * w), int(t * h), int(w - r * w), int(h - b * h)))
        img.thumbnail((1000, 1600))
        img.save(os.path.join(BILD, 'agenda_foto.jpg'), quality=85)
    elif sh.name == 'Picture 10':
        open(os.path.join(BILD, 'deloitte_logo_weiss.png'), 'wb').write(sh.image.blob)
    elif sh.shape_type == 5:
        ov.append(etree.tostring(sh._element).decode())
open(os.path.join(HIER, 'agenda_overlay.xml'), 'w', encoding='utf-8').write('\n<!--SPLIT-->\n'.join(ov))
print('fertig:', os.path.getsize(os.path.join(HIER, 'deloitte_vorlage.pptx')) // 1024, 'KB Vorlage,', len(ov), 'Overlay-Formen')
