# -*- coding: utf-8 -*-
"""Kurzanleitung fuer die Kollegen: Rohdaten aus MIS-O Einzel herunterladen und ins BUE-Reporting laden.

Aufruf (aus bue_reporting/quellen):  python3 anleitung_rohdaten_pdf.py
Ergebnis: ../Dokumentation/Anleitung_Rohdaten_Beladung.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HIER = os.path.dirname(os.path.abspath(__file__))
AUS = os.path.join(HIER, '..', 'Dokumentation', 'Anleitung_Rohdaten_Beladung.pdf')
STAND = '13.10.2026'

F = '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('DS', F + 'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DSB', F + 'DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DM', F + 'DejaVuSansMono.ttf'))
from reportlab.lib.fonts import addMapping
addMapping('DS', 0, 0, 'DS'); addMapping('DS', 1, 0, 'DSB'); addMapping('DS', 0, 1, 'DS'); addMapping('DS', 1, 1, 'DSB')

ROT, ROTD, TEAL, SW, GRAU, GRAUL, GRAUXL = (HexColor(c) for c in ('#C41230', '#8E0F1E', '#0F94A7', '#1A1A1A', '#6B6B6B', '#D0D5DA', '#F3F4F6'))

titel = ParagraphStyle('t', fontName='DSB', fontSize=20, leading=24, textColor=SW, spaceAfter=2)
unter = ParagraphStyle('u', fontName='DS', fontSize=10, leading=14, textColor=GRAU, spaceAfter=14)
h2 = ParagraphStyle('h2', fontName='DSB', fontSize=12.5, leading=16, textColor=ROT, spaceBefore=12, spaceAfter=6)
text = ParagraphStyle('b', fontName='DS', fontSize=10, leading=14.5, textColor=SW, spaceAfter=6)
schritt_t = ParagraphStyle('st', fontName='DSB', fontSize=11, leading=14.5, textColor=SW, spaceAfter=3)
schritt_b = ParagraphStyle('sb', fontName='DS', fontSize=9.8, leading=14, textColor=SW, spaceAfter=3)
klein = ParagraphStyle('k', fontName='DS', fontSize=8.5, leading=12, textColor=GRAU)
mono = ParagraphStyle('m', fontName='DM', fontSize=8.8, leading=13, textColor=SW)
hinweis = ParagraphStyle('h', fontName='DS', fontSize=9.8, leading=14, textColor=SW)


def schritt(nr, kopf, zeilen):
    nummer = Table([[Paragraph('<font color="#FFFFFF"><b>%d</b></font>' % nr,
                               ParagraphStyle('n', fontName='DSB', fontSize=14, leading=16, alignment=1))]],
                   colWidths=[10 * mm], rowHeights=[10 * mm])
    nummer.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), TEAL), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                                ('ROUNDEDCORNERS', [5, 5, 5, 5])]))
    inhalt = [Paragraph(kopf, schritt_t)] + [z if not isinstance(z, str) else Paragraph(z, schritt_b) for z in zeilen]
    t = Table([[nummer, inhalt]], colWidths=[14 * mm, 156 * mm])
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 8)]))
    return KeepTogether(t)


def kasten(inhalt, farbe=GRAUXL, rand=GRAUL):
    t = Table([[inhalt]], colWidths=[170 * mm])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), farbe), ('BOX', (0, 0), (-1, -1), 0.8, rand),
                           ('LEFTPADDING', (0, 0), (-1, -1), 9), ('RIGHTPADDING', (0, 0), (-1, -1), 9),
                           ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7)]))
    return t


def dateiliste():
    zeilen = [['Downloads (Beispiel, Namen je nach MIS-O-Bericht)', ''],
              ['Rueckstand_Verbund.xlsx', 'erster Bericht'],
              ['Rueckstand_Verbund (1).xlsx', 'zweiter Bericht, gleicher Tag'],
              ['Rueckstand_Verbund (2).xlsx', 'dritter Bericht, gleicher Tag'],
              ['Rueckstand_OPAG.xlsx', ''],
              ['Rueckstand_OPAG (1).xlsx', '']]
    t = Table([[Paragraph(a, mono if i else ParagraphStyle('dk', fontName='DSB', fontSize=9, textColor=GRAU)),
                Paragraph(b, klein)] for i, (a, b) in enumerate(zeilen)], colWidths=[75 * mm, 70 * mm])
    t.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, 0), 0.6, GRAUL), ('LEFTPADDING', (0, 0), (-1, -1), 4),
                           ('TOPPADDING', (0, 0), (-1, -1), 1.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5)]))
    return t


def fuss(c, d):
    c.saveState()
    c.setFont('DS', 7.5)
    c.setFillColor(GRAU)
    c.drawString(20 * mm, 12 * mm, 'BÜ-Reporting · Anleitung Rohdaten-Beladung · Stand %s' % STAND)
    c.drawRightString(190 * mm, 12 * mm, 'Seite %d' % d.page)
    c.setFillColor(ROT)
    c.rect(20 * mm, 285 * mm, 12 * mm, 1.6 * mm, stroke=0, fill=1)
    c.restoreState()


s = []
s.append(Paragraph('Rohdaten laden – so geht’s', titel))
s.append(Paragraph('BÜ-Reporting: Berichte aus MIS-O Einzel herunterladen und ins Excel-Tool übernehmen', unter))

s.append(kasten(Paragraph('<b>Kurz gesagt:</b> Erst <b>alle</b> verfügbaren Berichte einzeln herunterladen, dann <b>alle zusammen</b> '
                          'aus „Downloads“ in den Rohdaten-Ordner verschieben – und <b>erst danach</b> im Excel „Neue Daten laden“ klicken.', hinweis),
                  farbe=HexColor('#E6F4F6'), rand=TEAL))
s.append(Spacer(1, 10))

s.append(Paragraph('Schritt für Schritt', h2))
s.append(schritt(1, 'Alle verfügbaren Berichte aus MIS-O Einzel herunterladen',
                 ['In MIS-O Einzel jeden verfügbaren Rückstandsbericht <b>einzeln</b> herunterladen – für <b>Verbund und OPAG</b> und '
                  'für alle Einheiten bzw. alle angebotenen Berichte, nicht nur einen.',
                  'Die Dateien landen im Ordner <b>Downloads</b>.']))
s.append(schritt(2, 'Nicht wundern: gleiche Namen mit (1), (2) …',
                 ['MIS-O gibt allen Berichten eines Tages denselben Dateinamen; unterschieden wird nur zwischen OPAG und Verbund. '
                  'Windows hängt deshalb automatisch <b>(1)</b>, <b>(2)</b> usw. an. Das ist so gewollt und richtig:',
                  dateiliste(),
                  '<b>Dateien nicht umbenennen und nicht öffnen.</b> Das Tool erkennt Stichtag, Quelle und Einheit selbst aus dem '
                  'Inhalt jeder Datei.']))
s.append(schritt(3, 'Erst wenn alle Dateien da sind: ausschneiden und in den Rohdaten-Ordner verschieben',
                 ['In <b>Downloads</b> alle heruntergeladenen Berichte markieren, <b>Ausschneiden</b> (Strg + X), im Ordner '
                  '<b>Rohdaten</b> <b>Einfügen</b> (Strg + V).',
                  'Ausschneiden statt kopieren: So ist „Downloads“ danach leer, und beim nächsten Mal zählt Windows wieder ohne (1), (2) … – '
                  'alte Dateien können nicht versehentlich noch einmal geladen werden.']))
s.append(schritt(4, 'Jetzt erst im Excel „Neue Daten laden“ klicken',
                 ['Das BÜ-Reporting öffnen und im Cockpit <b>„Neue Daten laden“</b> klicken. Das Tool liest alle neuen Dateien, '
                  'benennt sie einheitlich (z. B. <font name="DM">20261013_BUe_Verbund_ODPB.xlsx</font>) und legt sie in '
                  '<font name="DM">Rohdaten\\JJJJ\\MM_Monat</font> ab.',
                  'Danach Anwesenheit prüfen und – falls gewünscht – die PowerPoint-Folie erzeugen, wie gewohnt im Tagesablauf.']))

s.append(Paragraph('Warum erst alles sammeln?', h2))
s.append(Paragraph('Das Tool verarbeitet je Quelle und Einheit die Stände in zeitlicher Reihenfolge und vergleicht jeden Tag mit dem vorherigen '
                   '(Eingänge und Abgänge). Liegen beim Laden schon alle Berichte im Ordner, sortiert es sie selbst richtig. Wird dagegen '
                   'zwischendurch geladen, fehlen am betreffenden Tag Einheiten im Rückstand, bis der Rest nachgeladen ist.', text))

s.append(Paragraph('Gut zu wissen', h2))
for t_ in ['<b>Nachzügler:</b> Kommt der Bericht einer Einheit für einen Tag erst später (z. B. ODPB vom 13.10. ein paar Tage danach), '
           'wird er einfach dazugeladen. Er muss aber vor späteren Tagen <b>derselben</b> Einheit geladen werden – ist dort schon ein '
           'späterer Tag drin, wird er übersprungen (steht dann so im Ladeprotokoll).',
           '<b>Aufteilung egal:</b> Ob ein Bericht eine Einheit oder mehrere enthält und ob sich das von Tag zu Tag ändert, '
           'spielt keine Rolle – das Tool vergleicht jede Einheit mit ihrem eigenen Vortag.',
           '<b>Bericht doppelt heruntergeladen?</b> Kein Problem: Für einen Stand, der schon geladen ist, fragt das Tool, ob der '
           'neue Abzug übernommen werden soll.',
           '<b>Jemand lädt gerade?</b> Dann zeigt das Cockpit oben rechts eine orange Box „Beladung läuft“. Bitte warten, bis sie verschwindet.']:
    s.append(Paragraph('•&nbsp;&nbsp;' + t_, ParagraphStyle('li', parent=text, leftIndent=10, firstLineIndent=-10)))

os.makedirs(os.path.dirname(AUS), exist_ok=True)
doc = SimpleDocTemplate(AUS, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm,
                        title='Anleitung Rohdaten-Beladung BÜ-Reporting', author='BÜ-Reporting')
doc.build(s, onFirstPage=fuss, onLaterPages=fuss)
print('geschrieben', os.path.abspath(AUS))
